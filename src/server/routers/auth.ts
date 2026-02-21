import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { setAuthCookies, clearAuthCookies } from "../lib/cookies";
import { checkRateLimit } from "../lib/ratelimit";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    tos: z.boolean().refine((val) => val === true, "You must accept the terms"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const authRouter = createTRPCRouter({
    register: publicProcedure
        .input(registerSchema)
        .mutation(async ({ ctx, input }) => {
            const ip = ctx.getIp();
            const rl = checkRateLimit(ip, "register", 5, 15 * 60 * 1000);
            if (!rl.success) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: `Too many attempts. Try again in ${Math.ceil(rl.msBeforeNext / 60000)}m.`,
                });
            }

            const existing = await ctx.db.user.findUnique({ where: { email: input.email } });
            if (existing) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "An account with this email already exists",
                });
            }

            const passwordHash = await bcrypt.hash(input.password, 12);

            const user = await ctx.db.user.create({
                data: {
                    email: input.email,
                    name: input.name,
                    passwordHash,
                },
            });

            const accessToken = await signAccessToken({ userId: user.id });
            const session = await ctx.db.session.create({
                data: {
                    userId: user.id,
                    tokenHash: "pending",
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    userAgent: ctx.headers.get("user-agent") || null,
                    ipAddress: ip,
                },
            });

            const refreshToken = await signRefreshToken({ userId: user.id }, session.id);

            const tokenHash = await bcrypt.hash(refreshToken, 10);
            await ctx.db.session.update({
                where: { id: session.id },
                data: { tokenHash },
            });

            await setAuthCookies({ accessToken, refreshToken });

            return { success: true };
        }),

    login: publicProcedure
        .input(loginSchema)
        .mutation(async ({ ctx, input }) => {
            const ip = ctx.getIp();
            const rl = checkRateLimit(ip, "login", 10, 15 * 60 * 1000);
            if (!rl.success) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: `Too many attempts. Try again in ${Math.ceil(rl.msBeforeNext / 60000)}m.`,
                });
            }

            const user = await ctx.db.user.findUnique({ where: { email: input.email } });
            if (!user) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                });
            }

            const valid = await bcrypt.compare(input.password, user.passwordHash);
            if (!valid) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                });
            }

            const accessToken = await signAccessToken({ userId: user.id });

            const session = await ctx.db.session.create({
                data: {
                    userId: user.id,
                    tokenHash: "pending",
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    userAgent: ctx.headers.get("user-agent") || null,
                    ipAddress: ip,
                },
            });

            const refreshToken = await signRefreshToken({ userId: user.id }, session.id);
            const tokenHash = await bcrypt.hash(refreshToken, 10);

            await ctx.db.session.update({
                where: { id: session.id },
                data: { tokenHash },
            });

            await setAuthCookies({ accessToken, refreshToken });

            return { success: true };
        }),

    logout: protectedProcedure.mutation(async ({ ctx }) => {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refresh_token")?.value;

        if (refreshToken) {
            const payload = await verifyRefreshToken(refreshToken);
            if (payload?.jti) {
                await ctx.db.session.deleteMany({ where: { id: payload.jti } });
            }
        }

        await clearAuthCookies();
        return { success: true };
    }),

    me: protectedProcedure.query(({ ctx }) => {
        return ctx.user;
    }),

    getSessions: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.session.findMany({
            where: { userId: ctx.user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                userAgent: true,
                ipAddress: true,
                createdAt: true,
                expiresAt: true,
            },
        });
    }),

    revokeSession: protectedProcedure
        .input(z.object({ sessionId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.session.deleteMany({
                where: { id: input.sessionId, userId: ctx.user.id },
            });
            return { success: true };
        }),

    updateProfile: protectedProcedure
        .input(z.object({ name: z.string().min(2, "Name must be at least 2 characters") }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.user.update({
                where: { id: ctx.user.id },
                data: { name: input.name },
            });
            return { success: true };
        }),

    changePassword: protectedProcedure
        .input(z.object({
            currentPassword: z.string().min(1),
            newPassword: z.string().min(8, "Password must be at least 8 characters"),
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({ where: { id: ctx.user.id } });
            if (!user) throw new TRPCError({ code: "NOT_FOUND" });

            const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
            if (!valid) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
            }

            const passwordHash = await bcrypt.hash(input.newPassword, 12);
            await ctx.db.user.update({ where: { id: user.id }, data: { passwordHash } });
            return { success: true };
        }),

    deleteAccount: protectedProcedure
        .input(z.object({ password: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({ where: { id: ctx.user.id } });
            if (!user) throw new TRPCError({ code: "NOT_FOUND" });

            const valid = await bcrypt.compare(input.password, user.passwordHash);
            if (!valid) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password" });
            }

            await ctx.db.session.deleteMany({ where: { userId: user.id } });
            await ctx.db.user.delete({ where: { id: user.id } });
            await clearAuthCookies();
            return { success: true };
        }),
});



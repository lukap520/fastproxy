import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { cookies } from "next/headers";
import { db } from "./db";
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from "./lib/jwt";
import * as bcrypt from "bcryptjs";

export const createTRPCContext = async (opts: { headers: Headers }) => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    let user = null;

    if (accessToken) {
        const payload = await verifyAccessToken(accessToken);
        if (payload?.userId) {
            user = await db.user.findUnique({
                where: { id: payload.userId },
                select: { id: true, email: true, name: true, balance: true },
            });
        }
    }

    if (!user && refreshToken) {
        const payload = await verifyRefreshToken(refreshToken);
        if (payload?.userId && payload?.jti) {
            const session = await db.session.findUnique({ where: { id: payload.jti } });
            if (session && session.expiresAt > new Date()) {
                const valid = await bcrypt.compare(refreshToken, session.tokenHash);
                if (valid) {
                    user = await db.user.findUnique({
                        where: { id: payload.userId },
                        select: { id: true, email: true, name: true, balance: true },
                    });

                    if (user) {
                        const newAccessToken = await signAccessToken({ userId: user.id });
                        cookieStore.set("access_token", newAccessToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "lax",
                            path: "/",
                            maxAge: 15 * 60,
                        });
                    }
                }
            }
        }
    }

    return {
        db,
        user,
        headers: opts.headers,
        getIp: () => {
            const forwarded = opts.headers.get("x-forwarded-for");
            if (forwarded) return forwarded.split(",")[0].trim();
            return opts.headers.get("x-real-ip") || "127.0.0.1";
        },
    };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to perform this action",
        });
    }

    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
        },
    });
});

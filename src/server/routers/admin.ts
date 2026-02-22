import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
    getUsers: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                balance: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { invoices: true, sessions: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    }),

    updateUserBalance: adminProcedure
        .input(z.object({
            userId: z.string(),
            amount: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({ where: { id: input.userId } });
            if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            return ctx.db.user.update({
                where: { id: input.userId },
                data: { balance: { increment: input.amount } },
                select: { id: true, balance: true }
            });
        }),

    deleteUser: adminProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({ where: { id: input.userId } });
            if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            if (user.role === "ADMIN") {
                throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete an admin" });
            }

            await ctx.db.user.delete({ where: { id: input.userId } });
            return { success: true };
        }),

    getProxies: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.proxySubuser.findMany({
            include: {
                user: {
                    select: { email: true, name: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    })
});

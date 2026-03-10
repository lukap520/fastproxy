import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "../trpc";

const FP_KEY = process.env.FLASHPROXY_API_KEY || "fp_live_2LqgxzQZCo6LosmZhls4zeeghG0jT3uPFyuPL4WX_iE";
const FP_BASE = "https://rapi.flashproxy.com/api/v1";

async function fpAdmin(path: string, opts?: RequestInit) {
    const res = await fetch(`${FP_BASE}${path}`, {
        ...opts,
        headers: {
            Authorization: `Bearer ${FP_KEY}`,
            "Content-Type": "application/json",
            ...(opts?.headers ?? {}),
        },
    });
    const text = await res.text();
    return text ? JSON.parse(text) : {};
}

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
                    select: { invoices: true, sessions: true, plans: true }
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
            if (user.role === "ADMIN") throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete an admin" });
            await ctx.db.user.delete({ where: { id: input.userId } });
            return { success: true };
        }),

    getPlans: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.plan.findMany({
            include: {
                user: { select: { id: true, email: true, name: true } }
            },
            orderBy: { createdAt: "desc" }
        });
    }),

    cancelPlanAdmin: adminProcedure
        .input(z.object({ planId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const plan = await ctx.db.plan.findUnique({ where: { id: input.planId } });
            if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found in database" });
            await fpAdmin(`/plans/${input.planId}`, { method: "DELETE" }).catch(() => { });
            await ctx.db.plan.delete({ where: { id: input.planId } }).catch(() => { });
            return { success: true };
        }),

    deletePlanFromDb: adminProcedure
        .input(z.object({ planId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.plan.delete({ where: { id: input.planId } }).catch(() => { });
            return { success: true };
        }),

    reassignPlan: adminProcedure
        .input(z.object({ planId: z.string(), newUserId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const plan = await ctx.db.plan.findUnique({ where: { id: input.planId } });
            if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });
            const user = await ctx.db.user.findUnique({ where: { id: input.newUserId } });
            if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Target user not found" });
            return ctx.db.plan.update({
                where: { id: input.planId },
                data: { userId: input.newUserId }
            });
        }),

    getProxies: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.proxySubuser.findMany({
            include: { user: { select: { email: true, name: true } } },
            orderBy: { createdAt: "desc" }
        });
    })
});

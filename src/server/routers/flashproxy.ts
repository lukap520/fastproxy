import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const FP_KEY = process.env.FLASHPROXY_API_KEY || "fp_live_2LqgxzQZCo6LosmZhls4zeeghG0jT3uPFyuPL4WX_iE";
const FP_BASE = "https://rapi.flashproxy.com/api/v1";

async function fp(path: string, opts?: RequestInit) {
    const res = await fetch(`${FP_BASE}${path}`, {
        ...opts,
        headers: {
            Authorization: `Bearer ${FP_KEY}`,
            "Content-Type": "application/json",
            ...(opts?.headers ?? {}),
        },
    });
    const data = await res.json();
    if (!data.success) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: data.error?.message || "FlashProxy API error",
        });
    }
    return data.data;
}

const PRODUCT = z.enum([
    "residential-lite",
    "residential",
    "mobile",
    "datacenter",
    "shared_isp",
    "ipv6-residential",
    "ipv6-datacenter",
    "unlimited_residential",
    "dedicated_mobile",
    "dedicated_isp",
]);

const DURATION = z.enum(["trial", "1_hour", "1_day", "7_days", "14_days", "30_days", "60_days", "90_days"]);

export const flashproxyRouter = createTRPCRouter({
    getPricing: protectedProcedure.query(async () => {
        return fp("/balance/pricing");
    }),

    getStock: protectedProcedure
        .input(z.object({ type: z.enum(["dedicated_mobile", "dedicated_isp"]).optional() }).optional())
        .query(async () => {
            const [mobile, pools] = await Promise.allSettled([
                fp("/servers/stock/dedicated-mobile"),
                fp("/proxies/pools"),
            ]);
            const mobileVal = mobile.status === "fulfilled" ? mobile.value : null;
            const poolsVal = pools.status === "fulfilled" ? pools.value : null;
            return {
                mobile: mobileVal,
                items: Array.isArray(mobileVal) ? mobileVal : (Array.isArray(mobileVal?.items) ? mobileVal.items : []),
                pools: Array.isArray(poolsVal) ? poolsVal : (Array.isArray(poolsVal?.pools) ? poolsVal.pools : []),
            };
        }),

    listPlans: protectedProcedure
        .input(z.object({
            product: PRODUCT.optional(),
            status: z.enum(["active", "expired", "cancelled", "all"]).default("all"),
            page: z.number().default(1),
        }))
        .query(async ({ input }) => {
            const params = new URLSearchParams({ status: input.status, page: String(input.page) });
            if (input.product) params.set("product", input.product);
            return fp(`/plans?${params}`);
        }),

    getPlan: protectedProcedure
        .input(z.object({ planId: z.string() }))
        .query(async ({ input }) => {
            return fp(`/plans/${input.planId}`);
        }),

    createPlan: protectedProcedure
        .input(z.object({
            product: PRODUCT,
            bandwidth_gb: z.number().min(0.1).optional(),
            duration: DURATION.optional(),
            billing_type: z.enum(["bandwidth", "time"]).optional(),
            mbps: z.number().min(10).max(10000).optional(),
            bandwidth_mbps: z.number().optional(),
            server_spec: z.enum(["8_16", "16_32", "32_64", "64_128"]).optional(),
            location: z.enum(["NL", "UK"]).optional(),
            quantity: z.number().min(1).optional(),
            pool: z.string().optional(),
            pool_id: z.string().optional(),
            country: z.string().optional(),
            operator: z.string().optional(),
            end_user_reference: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const pricing = await fp("/balance/pricing") as Record<string, { price_per_gb_cents?: number; price_per_day_cents?: number; billing?: string } & Record<string, unknown>>;
            const productPricing = pricing[input.product];

            let costUsd = 0;

            if (input.bandwidth_gb && productPricing?.price_per_gb_cents) {
                costUsd = (input.bandwidth_gb * productPricing.price_per_gb_cents) / 100;
            }

            if (ctx.user.balance < costUsd && costUsd > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Insufficient balance. Need $${costUsd.toFixed(2)}, have $${ctx.user.balance.toFixed(2)}.`,
                });
            }

            const body: Record<string, unknown> = { product: input.product };
            if (input.bandwidth_gb !== undefined) body.bandwidth_gb = input.bandwidth_gb;
            if (input.duration) body.duration = input.duration;
            if (input.billing_type) body.billing_type = input.billing_type;
            if (input.mbps !== undefined) body.mbps = input.mbps;
            if (input.bandwidth_mbps !== undefined) body.bandwidth_mbps = input.bandwidth_mbps;
            if (input.server_spec) body.server_spec = input.server_spec;
            if (input.location) body.location = input.location;
            if (input.quantity !== undefined) body.quantity = input.quantity;
            if (input.pool) body.pool = input.pool;
            if (input.pool_id) body.pool_id = input.pool_id;
            if (input.country) body.country = input.country;
            if (input.operator) body.operator = input.operator;
            if (input.end_user_reference) body.end_user_reference = input.end_user_reference;

            const plan = await fp("/plans", { method: "POST", body: JSON.stringify(body) });

            const actualCost = plan.billing?.cost_cents ? plan.billing.cost_cents / 100 : costUsd;
            if (actualCost > 0) {
                await ctx.db.user.update({
                    where: { id: ctx.user.id },
                    data: { balance: { decrement: actualCost } },
                });
            }

            return plan;
        }),

    extendPlan: protectedProcedure
        .input(z.object({
            planId: z.string(),
            add_bandwidth_gb: z.number().min(0.1).optional(),
            add_days: z.number().min(1).optional(),
            extend_30_days: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { planId, ...body } = input;

            const pricing = await fp("/balance/pricing") as Record<string, { price_per_gb_cents?: number } & Record<string, unknown>>;
            const plan = await fp(`/plans/${planId}`);
            const productPricing = pricing[plan.product as string];

            let costUsd = 0;
            if (body.add_bandwidth_gb && productPricing?.price_per_gb_cents) {
                costUsd = (body.add_bandwidth_gb * productPricing.price_per_gb_cents) / 100;
            }

            if (ctx.user.balance < costUsd && costUsd > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Insufficient balance. Need $${costUsd.toFixed(2)}, have $${ctx.user.balance.toFixed(2)}.`,
                });
            }

            const result = await fp(`/plans/${planId}/extend`, { method: "POST", body: JSON.stringify(body) });

            const actualCost = result.cost_cents ? result.cost_cents / 100 : costUsd;
            if (actualCost > 0) {
                await ctx.db.user.update({
                    where: { id: ctx.user.id },
                    data: { balance: { decrement: actualCost } },
                });
            }

            return result;
        }),

    cancelPlan: protectedProcedure
        .input(z.object({ planId: z.string() }))
        .mutation(async ({ input }) => {
            return fp(`/plans/${input.planId}`, { method: "DELETE" });
        }),

    getPlanProxies: protectedProcedure
        .input(z.object({ planId: z.string() }))
        .query(async ({ input }) => {
            return fp(`/plans/${input.planId}/proxies`);
        }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { maskify } from "../lib/maskify";

const PRICE_PER_GB = 1.60;
const MIN_GB = 1;

export const proxyRouter = createTRPCRouter({
    getMyProxy: protectedProcedure.query(async ({ ctx }) => {
        const sub = await ctx.db.proxySubuser.findUnique({
            where: { userId: ctx.user.id },
        });

        if (!sub) return null;

        try {
            const live = await maskify.getSubuser(sub.username);
            await ctx.db.proxySubuser.update({
                where: { id: sub.id },
                data: {
                    allocatedGb: live.allocated_gb,
                    gbUsed: live.gb_used,
                },
            });
            return {
                username: sub.username,
                password: sub.password,
                allocatedGb: live.allocated_gb,
                gbUsed: live.gb_used,
                createdAt: sub.createdAt,
            };
        } catch {
            return {
                username: sub.username,
                password: sub.password,
                allocatedGb: sub.allocatedGb,
                gbUsed: sub.gbUsed,
                createdAt: sub.createdAt,
            };
        }
    }),

    buyGb: protectedProcedure
        .input(z.object({ gb: z.number().min(MIN_GB).max(1000) }))
        .mutation(async ({ ctx, input }) => {
            const costUsd = input.gb * PRICE_PER_GB;

            if (ctx.user.balance < costUsd) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Insufficient balance. Need $${costUsd.toFixed(2)}, have $${ctx.user.balance.toFixed(2)}.`,
                });
            }

            const existing = await ctx.db.proxySubuser.findUnique({
                where: { userId: ctx.user.id },
            });

            if (existing) {
                await ctx.db.user.update({
                    where: { id: ctx.user.id },
                    data: { balance: { decrement: costUsd } },
                });

                const updated = await maskify.addGb(existing.username, input.gb);

                await ctx.db.proxySubuser.update({
                    where: { id: existing.id },
                    data: {
                        allocatedGb: updated.allocated_gb,
                        gbUsed: updated.gb_used,
                    },
                });

                return { username: existing.username, password: existing.password, isNew: false };
            }

            const syntheticEmail = `proxy-${ctx.user.id}@internal.fastproxy`;

            let created: { username: string; password: string; allocated_gb: number };

            try {
                created = await maskify.createSubuser(syntheticEmail, input.gb);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "";
                if (msg.toLowerCase().includes("email already exists")) {
                    const existing = await maskify.getSubuser(syntheticEmail);
                    await ctx.db.user.update({
                        where: { id: ctx.user.id },
                        data: { balance: { decrement: costUsd } },
                    });
                    const subuser = await ctx.db.proxySubuser.create({
                        data: {
                            userId: ctx.user.id,
                            username: existing.username,
                            password: "",
                            allocatedGb: existing.allocated_gb,
                            gbUsed: existing.gb_used,
                        },
                    });
                    return { username: subuser.username, password: subuser.password, isNew: false };
                }
                throw err;
            }

            await ctx.db.user.update({
                where: { id: ctx.user.id },
                data: { balance: { decrement: costUsd } },
            });

            await ctx.db.proxySubuser.create({
                data: {
                    userId: ctx.user.id,
                    username: created.username,
                    password: created.password,
                    allocatedGb: created.allocated_gb,
                    gbUsed: 0,
                },
            });

            return { username: created.username, password: created.password, isNew: true };
        }),

    getPricing: protectedProcedure.query(() => {
        return { pricePerGb: PRICE_PER_GB, minGb: MIN_GB };
    }),
});

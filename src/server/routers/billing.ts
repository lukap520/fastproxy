import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const CRYPTO_RATES: Record<string, number> = {
    btc: 95000,
    eth: 3200,
    usdt: 1,
    usdc: 1,
    ltc: 115,
    sol: 175,
    xmr: 165,
    bnb: 630,
};

const DEMO_ADDRESSES: Record<string, string> = {
    btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    eth: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    usdt: "TQd3jyVxpbkBuBvQ8SKCPQb6Gq1nCNLmox",
    usdc: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    ltc: "ltc1q8c6fshw2dlwun7ekn9qwf37cu2rn755upcp6el",
    sol: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtev",
    xmr: "4AdUndXHHZ6cfufTMvppY6JwXNouMBzSkbLYfpAV5Usx3skxNgYeYTRj5UzqtReoS44qo9mtmXCqY45DJ852K2Jd7Xd3zq",
    bnb: "bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lx8xu7hm",
};

export const billingRouter = createTRPCRouter({
    createInvoice: protectedProcedure
        .input(z.object({
            amountUsd: z.number().min(10, "Minimum deposit is $10"),
            crypto: z.enum(["btc", "eth", "usdt", "usdc", "ltc", "sol", "xmr", "bnb"]),
        }))
        .mutation(async ({ ctx, input }) => {
            const rate = CRYPTO_RATES[input.crypto];
            if (!rate) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported cryptocurrency" });

            const cryptoAmount = parseFloat((input.amountUsd / rate).toFixed(8));
            const cryptoAddress = DEMO_ADDRESSES[input.crypto];
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

            const invoice = await ctx.db.invoice.create({
                data: {
                    userId: ctx.user.id,
                    amountUsd: input.amountUsd,
                    crypto: input.crypto,
                    cryptoAddress,
                    cryptoAmount,
                    status: "pending",
                    expiresAt,
                },
            });

            return { id: invoice.id };
        }),

    getInvoice: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const invoice = await ctx.db.invoice.findUnique({
                where: { id: input.id },
                select: {
                    id: true,
                    userId: true,
                    amountUsd: true,
                    crypto: true,
                    cryptoAddress: true,
                    cryptoAmount: true,
                    status: true,
                    expiresAt: true,
                    createdAt: true,
                },
            });

            if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
            if (invoice.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

            const now = new Date();
            if (invoice.status === "pending" && invoice.expiresAt < now) {
                await ctx.db.invoice.update({ where: { id: input.id }, data: { status: "expired" } });
                invoice.status = "expired";
            }

            return invoice;
        }),

    getUserInvoices: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.invoice.findMany({
            where: { userId: ctx.user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const OXAPAY_KEY = process.env.OXAPAY_API_KEY || "KN4JHD-LEJUFF-XOTMOB-UAJYZY";
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/oxapay`
    : "https://09cd-46-217-82-240.ngrok-free.app/api/webhooks/oxapay";

export const billingRouter = createTRPCRouter({
    createInvoice: protectedProcedure
        .input(z.object({
            amountUsd: z.number().min(2, "Minimum deposit is $2"),
            crypto: z.enum(["btc", "eth", "usdt", "usdc", "ltc", "sol", "xmr", "bnb"]),
        }))
        .mutation(async ({ ctx, input }) => {
            const NETWORK_MAP: Record<string, string> = {
                btc: "Bitcoin",
                eth: "Ethereum",
                usdt: "TRON",
                usdc: "Ethereum",
                ltc: "Litecoin",
                sol: "Solana",
                xmr: "Monero",
                bnb: "BSC",
            };

            const res = await fetch("https://api.oxapay.com/v1/payment/white-label", {
                method: "POST",
                headers: {
                    "merchant_api_key": OXAPAY_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: input.amountUsd,
                    currency: "USD",
                    pay_currency: input.crypto.toUpperCase(),
                    network: NETWORK_MAP[input.crypto],
                    lifetime: 60,
                    callback_url: WEBHOOK_URL,
                    description: "FastProxy Balance Top-up",
                }),
            });
            const data = await res.json();

            if (!res.ok || data.status !== 200) {
                console.error("OxaPay Error:", data);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: data.message || "Failed to create payment" });
            }

            const payment = data.data;
            const expiresAt = payment.expired_at
                ? new Date(payment.expired_at * 1000)
                : new Date(Date.now() + 60 * 60 * 1000);

            const invoice = await ctx.db.invoice.create({
                data: {
                    userId: ctx.user.id,
                    amountUsd: input.amountUsd,
                    crypto: input.crypto,
                    cryptoAddress: payment.address,
                    cryptoAmount: payment.pay_amount,
                    oxaPayTrackId: String(payment.track_id),
                    status: "waiting",
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
                    oxaPayTrackId: true,
                },
            });

            if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
            if (invoice.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

            const now = new Date();
            let currentStatus = invoice.status;

            if (currentStatus !== "finished" && currentStatus !== "expired" && currentStatus !== "paid" && invoice.oxaPayTrackId) {
                try {
                    const res = await fetch(`https://api.oxapay.com/v1/payment/${invoice.oxaPayTrackId}`, {
                        headers: { "merchant_api_key": OXAPAY_KEY },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const remoteStatus: string = (data.data?.status ?? "").toLowerCase();
                        if (remoteStatus && remoteStatus !== currentStatus) {
                            currentStatus = remoteStatus;

                            await ctx.db.invoice.update({
                                where: { id: invoice.id },
                                data: { status: currentStatus },
                            });

                            if (currentStatus === "paid" || currentStatus === "manual_accept") {
                                await ctx.db.user.update({
                                    where: { id: invoice.userId },
                                    data: { balance: { increment: invoice.amountUsd } },
                                });
                                await ctx.db.invoice.update({
                                    where: { id: invoice.id },
                                    data: { status: "finished" },
                                });
                                currentStatus = "finished";
                            }
                        }
                    }
                } catch {
                }
            }

            if (currentStatus === "waiting" || currentStatus === "pending" || currentStatus === "new") {
                if (invoice.expiresAt < now) {
                    await ctx.db.invoice.update({ where: { id: input.id }, data: { status: "expired" } });
                    currentStatus = "expired";
                }
            }

            return { ...invoice, status: currentStatus };
        }),

    getUserInvoices: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.invoice.findMany({
            where: { userId: ctx.user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const NOWPAYMENTS_KEY = process.env.NOWPAYMENTS_API_KEY || "HBGZ01M-G0AMDQF-PD0YWGM-1DVPF8Y";
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments` : "https://09cd-46-217-82-240.ngrok-free.app/api/webhooks/nowpayments";

export const billingRouter = createTRPCRouter({
    createInvoice: protectedProcedure
        .input(z.object({
            amountUsd: z.number().min(2, "Minimum deposit is $2"),
            crypto: z.enum(["btc", "eth", "usdt", "usdc", "ltc", "sol", "xmr", "bnb"]),
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await fetch("https://api.nowpayments.io/v1/payment", {
                method: "POST",
                headers: {
                    "x-api-key": NOWPAYMENTS_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    price_amount: input.amountUsd,
                    price_currency: "usd",
                    pay_currency: input.crypto,
                    ipn_callback_url: WEBHOOK_URL,
                    order_description: "FastProxy Balance Top-up"
                })
            });
            const data = await res.json();

            if (!res.ok) {
                console.error("NowPayments Error:", data);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: data.message || "Failed to create payment" });
            }

            const expiresAt = data.expiration_estimate_date ? new Date(data.expiration_estimate_date) : new Date(Date.now() + 30 * 60 * 1000);

            const invoice = await ctx.db.invoice.create({
                data: {
                    userId: ctx.user.id,
                    amountUsd: input.amountUsd,
                    crypto: input.crypto,
                    cryptoAddress: data.pay_address,
                    cryptoAmount: data.pay_amount,
                    nowPaymentsId: String(data.payment_id),
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
                    nowPaymentsId: true,
                },
            });

            if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
            if (invoice.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

            const now = new Date();
            let currentStatus = invoice.status;

            if (currentStatus !== "finished" && currentStatus !== "expired" && invoice.nowPaymentsId) {
                try {
                    const res = await fetch(`https://api.nowpayments.io/v1/payment/${invoice.nowPaymentsId}`, {
                        headers: { "x-api-key": NOWPAYMENTS_KEY }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.payment_status && data.payment_status !== currentStatus) {
                            currentStatus = data.payment_status;

                            await ctx.db.invoice.update({
                                where: { id: invoice.id },
                                data: {
                                    status: currentStatus,
                                    actuallyPaid: data.actually_paid ? parseFloat(data.actually_paid) : null
                                }
                            });

                            if (currentStatus === "finished" || currentStatus === "confirmed") {
                                await ctx.db.user.update({
                                    where: { id: invoice.userId },
                                    data: { balance: { increment: invoice.amountUsd } }
                                });
                                await ctx.db.invoice.update({
                                    where: { id: invoice.id },
                                    data: { status: "finished" }
                                });
                                currentStatus = "finished";
                            }
                        }
                    }
                } catch (e) {
                }
            }

            if (currentStatus === "pending" || currentStatus === "waiting") {
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

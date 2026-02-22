import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

const NOWPAYMENTS_KEY = process.env.NOWPAYMENTS_API_KEY || "HBGZ01M-G0AMDQF-PD0YWGM-1DVPF8Y";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const paymentId = body.payment_id;

        if (!paymentId) {
            return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
        }

        const verifyRes = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
            headers: {
                "x-api-key": NOWPAYMENTS_KEY
            }
        });

        if (!verifyRes.ok) {
            return NextResponse.json({ error: "Failed to verify payment with NowPayments" }, { status: 400 });
        }

        const data = await verifyRes.json();
        const invoice = await db.invoice.findUnique({
            where: { nowPaymentsId: String(paymentId) }
        });

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        if (invoice.status === "finished") {
            return NextResponse.json({ ok: true });
        }

        const newStatus = data.payment_status;

        await db.invoice.update({
            where: { id: invoice.id },
            data: {
                status: newStatus,
                actuallyPaid: data.actually_paid ? parseFloat(data.actually_paid) : null,
            }
        });

        if (newStatus === "finished" || newStatus === "confirmed") {
            await db.user.update({
                where: { id: invoice.userId },
                data: { balance: { increment: invoice.amountUsd } }
            });
            await db.invoice.update({
                where: { id: invoice.id },
                data: { status: "finished" }
            });
        }

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("Webhook error:", e);
        return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
    }
}

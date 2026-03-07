import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/server/db";

const OXAPAY_KEY = process.env.OXAPAY_API_KEY || "KN4JHD-LEJUFF-XOTMOB-UAJYZY";

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const hmacHeader = req.headers.get("hmac") ?? "";

        const calculated = createHmac("sha512", OXAPAY_KEY).update(rawBody).digest("hex");
        if (calculated !== hmacHeader) {
            return new NextResponse("Invalid HMAC signature", { status: 400 });
        }

        const body = JSON.parse(rawBody);
        const trackId: string = String(body.track_id ?? "");
        const status: string = (body.status ?? "").toLowerCase();

        if (!trackId) {
            return new NextResponse("Missing track_id", { status: 400 });
        }

        const invoice = await db.invoice.findUnique({
            where: { oxaPayTrackId: trackId },
        });

        if (!invoice) {
            return new NextResponse("ok", { status: 200 });
        }

        if (invoice.status === "finished") {
            return new NextResponse("ok", { status: 200 });
        }

        if (status === "paid" || status === "manual_accept") {
            await db.invoice.update({
                where: { id: invoice.id },
                data: { status: "finished" },
            });
            await db.user.update({
                where: { id: invoice.userId },
                data: { balance: { increment: invoice.amountUsd } },
            });
        } else {
            await db.invoice.update({
                where: { id: invoice.id },
                data: { status },
            });
        }

        return new NextResponse("ok", { status: 200 });
    } catch (e: unknown) {
        console.error("OxaPay webhook error:", e);
        return new NextResponse("Webhook Error", { status: 500 });
    }
}

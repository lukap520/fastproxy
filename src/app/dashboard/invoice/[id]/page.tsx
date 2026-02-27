"use client";

import { use, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import NextImage from "next/image";
import { useWindowSize } from "@/hooks/useWindowSize";

const CRYPTO_META: Record<string, { name: string; icon: string; symbol: string; color: string }> = {
    btc: { name: "Bitcoin", symbol: "BTC", icon: "cryptocurrency-color:btc", color: "#F7931A" },
    eth: { name: "Ethereum", symbol: "ETH", icon: "cryptocurrency-color:eth", color: "#627EEA" },
    usdt: { name: "Tether", symbol: "USDT", icon: "cryptocurrency-color:usdt", color: "#26A17B" },
    usdc: { name: "USD Coin", symbol: "USDC", icon: "cryptocurrency-color:usdc", color: "#2775CA" },
    ltc: { name: "Litecoin", symbol: "LTC", icon: "cryptocurrency-color:ltc", color: "#BFBBBB" },
    sol: { name: "Solana", symbol: "SOL", icon: "cryptocurrency-color:sol", color: "#9945FF" },
    xmr: { name: "Monero", symbol: "XMR", icon: "cryptocurrency-color:xmr", color: "#FF6600" },
    bnb: { name: "BNB", symbol: "BNB", icon: "cryptocurrency-color:bnb", color: "#F3BA2F" },
};

const STATUS_CONFIG = {
    waiting: { label: "Awaiting Payment", color: "rgb(251,191,36)", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)", icon: "ph:clock" },
    pending: { label: "Awaiting Payment", color: "rgb(251,191,36)", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)", icon: "ph:clock" },
    confirming: { label: "Confirming", color: "rgb(96,165,250)", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)", icon: "ph:spinner" },
    confirmed: { label: "Confirmed", color: "rgb(52,211,153)", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", icon: "ph:check-circle" },
    sending: { label: "Processing", color: "rgb(96,165,250)", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)", icon: "ph:paper-plane-tilt" },
    partially_paid: { label: "Partially Paid", color: "rgb(249,115,22)", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", icon: "ph:warning-circle" },
    finished: { label: "Paid", color: "rgb(52,211,153)", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", icon: "ph:check-circle" },
    failed: { label: "Failed", color: "rgb(239,68,68)", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.15)", icon: "ph:x-circle" },
    refunded: { label: "Refunded", color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)", icon: "ph:arrow-u-up-left" },
    expired: { label: "Expired", color: "rgb(239,68,68)", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.15)", icon: "ph:x-circle" },
    cancelled: { label: "Cancelled", color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)", icon: "ph:minus-circle" },
};

function CopyBtn({ value, label }: { value: string; label?: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button type="button" onClick={handleCopy}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: copied ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.08)", background: copied ? "rgba(52,211,153,0.07)" : "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
            onMouseEnter={(e) => { if (!copied) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { if (!copied) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
            <Icon icon={copied ? "ph:check" : "ph:copy"} style={{ fontSize: 13, color: copied ? "rgb(52,211,153)" : "rgba(255,255,255,0.4)" }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: copied ? "rgb(52,211,153)" : "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans,system-ui)" }}>
                {copied ? "Copied!" : (label ?? "Copy")}
            </span>
        </button>
    );
}

function Countdown({ expiresAt }: { expiresAt: Date }) {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        const update = () => setRemaining(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, [expiresAt]);

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const pct = Math.max(0, (remaining / 1800) * 100);
    const urgent = remaining < 300;

    return (
        <div style={{ padding: "14px 18px", borderRadius: 12, background: urgent ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${urgent ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)"}`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle cx="20" cy="20" r="17" fill="none" stroke={urgent ? "rgb(239,68,68)" : "rgb(255,107,0)"} strokeWidth="3" strokeDasharray={`${2 * Math.PI * 17}`} strokeDashoffset={`${2 * Math.PI * 17 * (1 - pct / 100)}`} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
                </svg>
                <Icon icon="ph:timer" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 14, color: urgent ? "rgb(239,68,68)" : "rgba(255,107,0,0.7)" }} />
            </div>
            <div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 2 }}>Invoice expires in</p>
                <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.02em", color: urgent ? "rgb(239,68,68)" : "rgba(235,235,235,0.9)" }}>
                    {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
                </p>
            </div>
            {remaining === 0 && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(239,68,68)", fontWeight: 600, fontFamily: "var(--font-sans,system-ui)", marginLeft: "auto" }}>Expired</span>}
        </div>
    );
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const toast = useToast();
    const { data: invoice, isLoading, error, refetch } = trpc.billing.getInvoice.useQuery({ id }, { refetchInterval: 15000 });

    useEffect(() => {
        if (error?.data?.code === "NOT_FOUND" || error?.data?.code === "FORBIDDEN") {
            toast("error", "Invoice not found");
            router.replace("/dashboard/billing/topup");
        }
    }, [error, router, toast]);

    if (isLoading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <Icon icon="ph:spinner" style={{ fontSize: 32, color: "rgba(255,107,0,0.5)", animation: "spin 1s linear infinite" }} />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>Loading invoice…</p>
            </div>
        </div>
    );

    if (!invoice) return null;

    const meta = CRYPTO_META[invoice.crypto] ?? { name: invoice.crypto, symbol: invoice.crypto.toUpperCase(), icon: "ph:coin", color: "#fff" };
    const status = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
    const qrData = invoice.cryptoAddress;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=ffffff&bgcolor=0a0a0a&data=${encodeURIComponent(qrData)}`;

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: isSmall ? "80px 20px 40px" : "48px" }}>
            <div style={{ width: "100%", maxWidth: 860 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", flexDirection: isSmall ? "column" : "row", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <div style={{ height: 1, width: 24, background: "rgba(255,107,0,0.5)" }} />
                                <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,107,0,0.7)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.09em", textTransform: "uppercase" as const }}>Invoice</span>
                            </div>
                            <h1 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "1.7rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.03em", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                                Pay ${invoice.amountUsd.toFixed(2)} USD
                            </h1>
                            <p style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
                                #{invoice.id.slice(-12).toUpperCase()}
                            </p>
                        </div>
                        <div style={{ padding: "8px 14px", borderRadius: 10, background: status.bg, border: `1px solid ${status.border}`, display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                            <Icon icon={status.icon} style={{ fontSize: 15, color: status.color }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: status.color, fontFamily: "var(--font-sans,system-ui)", whiteSpace: "nowrap" as const }}>{status.label}</span>
                        </div>
                    </div>
                </motion.div>

                <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 280px", gap: 16, alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {(invoice.status === "pending" || invoice.status === "waiting") && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                                <Countdown expiresAt={new Date(invoice.expiresAt)} />
                            </motion.div>
                        )}

                        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                            style={{ borderRadius: 18, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden", position: "relative" }}>
                            <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "linear-gradient(90deg,transparent 5%,rgba(255,255,255,0.07) 50%,transparent 95%)", pointerEvents: "none" }} />

                            <div style={{ padding: "20px 22px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
                                <Icon icon={meta.icon} style={{ fontSize: 36, flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.02em" }}>Pay with {meta.name}</p>
                                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)", marginTop: 1 }}>Send exactly the amount shown below</p>
                                </div>
                                <div style={{ marginLeft: "auto", textAlign: "right" as const }}>
                                    <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.02em", color: "#FFFFFF" }}>
                                        {invoice.cryptoAmount.toFixed(8).replace(/\.?0+$/, "").replace(/(\.\d{4})\d+/, "$1")} {meta.symbol}
                                    </p>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans,system-ui)", marginTop: 3 }}>≈ ${invoice.amountUsd.toFixed(2)} USD</p>
                                </div>
                            </div>

                            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.09em", textTransform: "uppercase" as const, fontFamily: "var(--font-sans,system-ui)", marginBottom: 8 }}>
                                        Amount to Send
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <code style={{ flex: 1, fontSize: 15, fontFamily: "monospace", color: "rgba(235,235,235,0.9)", wordBreak: "break-all" as const, letterSpacing: "0.01em", fontWeight: 600 }}>
                                            {invoice.cryptoAmount} {meta.symbol}
                                        </code>
                                        <CopyBtn value={String(invoice.cryptoAmount)} label="Copy" />
                                    </div>
                                </div>

                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.09em", textTransform: "uppercase" as const, fontFamily: "var(--font-sans,system-ui)", marginBottom: 8 }}>
                                        Deposit Address ({meta.symbol})
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <code style={{ flex: 1, fontSize: 12.5, fontFamily: "monospace", color: "rgba(235,235,235,0.8)", wordBreak: "break-all" as const, letterSpacing: "0.02em", lineHeight: 1.5 }}>
                                            {invoice.cryptoAddress}
                                        </code>
                                        <CopyBtn value={invoice.cryptoAddress} label="Copy" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                            style={{ borderRadius: 14, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                            {[
                                { label: "Invoice ID", value: invoice.id.slice(-12).toUpperCase() },
                                { label: "Network", value: meta.name + " Network" },
                                { label: "Created", value: new Date(invoice.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                                { label: "Expires", value: new Date(invoice.expiresAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                                { label: "Amount (USD)", value: `$${invoice.amountUsd.toFixed(2)}` },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)" }}>{label}</span>
                                    <span style={{ fontSize: 12.5, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)", fontWeight: 600 }}>{value}</span>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                            style={{ display: "flex", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}>
                            <Icon icon="ph:warning" style={{ fontSize: 16, color: "rgba(251,191,36,0.7)", flexShrink: 0, marginTop: 1 }} />
                            <p style={{ fontSize: 12, color: "rgba(251,191,36,0.7)", fontFamily: "var(--font-sans,system-ui)", lineHeight: 1.6 }}>
                                Send <strong>exactly</strong> the amount shown above. Sending a different amount may result in a failed or delayed credit. Only send {meta.symbol} to this address.
                            </p>
                        </motion.div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 24 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.35 }}
                            style={{ borderRadius: 18, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden", position: "relative" }}>
                            <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: `linear-gradient(90deg,transparent 5%,${meta.color}30 50%,transparent 95%)`, pointerEvents: "none" }} />
                            <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" as const, fontFamily: "var(--font-sans,system-ui)" }}>Scan to Pay</p>
                                <div style={{ padding: 12, borderRadius: 2, background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
                                    <div style={{ position: "absolute", top: -4, left: -4, width: 16, height: 16, borderTop: `2px solid ${meta.color}`, borderLeft: `2px solid ${meta.color}`, borderRadius: "3px 0 0 0" }} />
                                    <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderTop: `2px solid ${meta.color}`, borderRight: `2px solid ${meta.color}`, borderRadius: "0 3px 0 0" }} />
                                    <div style={{ position: "absolute", bottom: -4, left: -4, width: 16, height: 16, borderBottom: `2px solid ${meta.color}`, borderLeft: `2px solid ${meta.color}`, borderRadius: "0 0 0 3px" }} />
                                    <div style={{ position: "absolute", bottom: -4, right: -4, width: 16, height: 16, borderBottom: `2px solid ${meta.color}`, borderRight: `2px solid ${meta.color}`, borderRadius: "0 0 3px 0" }} />
                                    <NextImage unoptimized src={qrUrl} alt="Payment QR code" width={170} height={170} style={{ display: "block", borderRadius: 6, imageRendering: "pixelated" }} />
                                </div>
                                <div style={{ textAlign: "center" as const }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                                        <Icon icon={meta.icon} style={{ fontSize: 16 }} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(235,235,235,0.8)", fontFamily: "var(--font-sans,system-ui)" }}>{meta.symbol}</span>
                                    </div>
                                    <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                                        {invoice.cryptoAddress.slice(0, 8)}…{invoice.cryptoAddress.slice(-6)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            style={{ borderRadius: 14, background: status.bg, border: `1px solid ${status.border}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Icon icon={status.icon} style={{ fontSize: 18, color: status.color }} />
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: status.color, fontFamily: "var(--font-sans,system-ui)" }}>{status.label}</p>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)", marginTop: 2 }}>
                                        {["pending", "waiting"].includes(invoice.status) ? "Waiting for blockchain confirmation"
                                            : ["confirming", "sending"].includes(invoice.status) ? "Transaction detected, confirming on blockchain..."
                                                : ["confirmed", "finished"].includes(invoice.status) ? "Funds successfully added to your balance"
                                                    : invoice.status === "partially_paid" ? "Transaction detected but amount was insufficient"
                                                        : "This invoice can no longer be paid"}
                                    </p>
                                </div>
                            </div>
                            {["pending", "waiting", "confirming", "sending"].includes(invoice.status) && (
                                <button type="button" onClick={() => refetch()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, fontFamily: "var(--font-sans,system-ui)", cursor: "pointer", transition: "all 0.15s" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}>
                                    <Icon icon={invoice.status === "confirming" || invoice.status === "sending" ? "ph:spinner" : "ph:arrows-clockwise"} style={{ fontSize: 14, animation: invoice.status === "confirming" || invoice.status === "sending" ? "spin 1.5s linear infinite" : "none" }} />
                                    Check Status
                                </button>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

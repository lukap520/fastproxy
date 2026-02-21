"use client";

import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Link from "next/link";

const CRYPTO_META: Record<string, { symbol: string; icon: string; color: string; network: string }> = {
    btc: { symbol: "BTC", icon: "cryptocurrency-color:btc", color: "#F7931A", network: "Bitcoin" },
    eth: { symbol: "ETH", icon: "cryptocurrency-color:eth", color: "#627EEA", network: "Ethereum" },
    usdt: { symbol: "USDT", icon: "cryptocurrency-color:usdt", color: "#26A17B", network: "Tron" },
    usdc: { symbol: "USDC", icon: "cryptocurrency-color:usdc", color: "#2775CA", network: "Ethereum" },
    ltc: { symbol: "LTC", icon: "cryptocurrency-color:ltc", color: "#BFBBBB", network: "Litecoin" },
    sol: { symbol: "SOL", icon: "cryptocurrency-color:sol", color: "#9945FF", network: "Solana" },
    xmr: { symbol: "XMR", icon: "cryptocurrency-color:xmr", color: "#FF6600", network: "Monero" },
    bnb: { symbol: "BNB", icon: "cryptocurrency-color:bnb", color: "#F3BA2F", network: "BNB Chain" },
};

const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        description: "Awaiting on-chain confirmation",
        dotColor: "rgb(251,191,36)",
        glow: "rgba(251,191,36,0.4)",
        bg: "rgba(251,191,36,0.06)",
        border: "rgba(251,191,36,0.14)",
        text: "rgb(251,191,36)",
    },
    confirmed: {
        label: "Confirmed",
        description: "Funds credited to balance",
        dotColor: "rgb(52,211,153)",
        glow: "rgba(52,211,153,0.5)",
        bg: "rgba(52,211,153,0.05)",
        border: "rgba(52,211,153,0.14)",
        text: "rgb(52,211,153)",
    },
    expired: {
        label: "Expired",
        description: "Invoice timed out",
        dotColor: "rgba(239,68,68,0.7)",
        glow: "none",
        bg: "rgba(239,68,68,0.04)",
        border: "rgba(239,68,68,0.1)",
        text: "rgba(239,68,68,0.7)",
    },
    cancelled: {
        label: "Cancelled",
        description: "Cancelled by user",
        dotColor: "rgba(255,255,255,0.2)",
        glow: "none",
        bg: "rgba(255,255,255,0.015)",
        border: "rgba(255,255,255,0.05)",
        text: "rgba(255,255,255,0.3)",
    },
};

function timeAgo(d: Date) {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function InvoicesPage() {
    const router = useRouter();
    const { data: user, isLoading: userLoading, error: userError } = trpc.auth.me.useQuery();
    const { data: invoices, isLoading } = trpc.billing.getUserInvoices.useQuery();

    useEffect(() => {
        if (!userLoading && (userError || !user)) router.replace("/login");
    }, [userLoading, userError, user, router]);

    type Invoice = NonNullable<typeof invoices>[number];
    const confirmed = invoices?.filter((i: Invoice) => i.status === "confirmed") ?? [];
    const pending = invoices?.filter((i: Invoice) => i.status === "pending") ?? [];
    const totalDeposited = confirmed.reduce((s: number, i: Invoice) => s + i.amountUsd, 0);

    if (userLoading || isLoading) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 28, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    return (
        <div style={{ flex: 1, padding: "56px 60px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ height: 1, width: 28, background: "rgba(255,107,0,0.5)" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,107,0,0.65)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>Payments</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading,'Clash Display',system-ui)", fontSize: "2rem", fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
                    Invoices
                </h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.32)", fontFamily: "var(--font-sans,system-ui)", marginTop: 6, lineHeight: 1.5 }}>
                    Manage your deposits and view payment history.
                </p>
            </motion.div>

            {(invoices?.length ?? 0) > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04, duration: 0.32 }}
                    style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
                    {[
                        { label: "Total deposited", value: `$${totalDeposited.toFixed(2)}`, icon: "ph:currency-dollar", color: "rgb(52,211,153)", dimColor: "rgba(52,211,153,0.07)", borderColor: "rgba(52,211,153,0.12)" },
                        { label: "Pending invoices", value: String(pending.length), icon: "ph:clock", color: "rgb(251,191,36)", dimColor: "rgba(251,191,36,0.06)", borderColor: "rgba(251,191,36,0.1)" },
                        { label: "Total invoices", value: String(invoices?.length ?? 0), icon: "ph:receipt", color: "rgba(255,107,0,0.8)", dimColor: "rgba(255,107,0,0.06)", borderColor: "rgba(255,107,0,0.1)" },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.04 }}
                            style={{ padding: "18px 20px", borderRadius: 14, background: s.dimColor, border: `1px solid ${s.borderColor}`, display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0,0,0,0.2)", border: `1px solid ${s.borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon icon={s.icon} style={{ fontSize: 18, color: s.color }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 20, fontWeight: 700, color: "rgba(235,235,235,0.92)", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.03em" }}>{s.value}</p>
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)", marginTop: 2 }}>{s.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {(!invoices || invoices.length === 0) && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 40px", textAlign: "center" as const }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
                        <Icon icon="ph:receipt" style={{ fontSize: 28, color: "rgba(255,107,0,0.45)" }} />
                    </div>
                    <h3 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 18, fontWeight: 700, color: "rgba(235,235,235,0.7)", letterSpacing: "-0.02em", marginBottom: 8 }}>No invoices yet</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 28, maxWidth: 280, lineHeight: 1.7 }}>
                        Make your first crypto deposit and it will show up here.
                    </p>
                    <Link href="/dashboard/billing/topup" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 11, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)", color: "rgba(255,107,0,0.85)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans,system-ui)", textDecoration: "none" }}>
                        <Icon icon="ph:plus-bold" style={{ fontSize: 13 }} />
                        Make a deposit
                    </Link>
                </motion.div>
            )}

            {invoices && invoices.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {invoices.map((inv: NonNullable<typeof invoices>[number], i) => {
                        const meta = CRYPTO_META[inv.crypto];
                        const sc = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;

                        return (
                            <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.05 + i * 0.05 }}>
                                <Link href={`/dashboard/invoice/${inv.id}`} style={{ display: "block", textDecoration: "none" }}>
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 18,
                                        padding: "16px 20px",
                                        borderRadius: 14,
                                        background: "rgba(255,255,255,0.014)",
                                        border: `1px solid rgba(255,255,255,0.05)`,
                                        transition: "all 0.15s",
                                        position: "relative",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateX(2px)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.014)"; e.currentTarget.style.transform = "translateX(0)"; }}>

                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                                            <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: meta ? `radial-gradient(circle, ${meta.color}14 0%, transparent 70%)` : "none" }} />
                                            <Icon icon={meta?.icon ?? "ph:coin"} style={{ fontSize: 24, position: "relative" }} />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                                <span style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(235,235,235,0.85)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>
                                                    {meta?.symbol ?? inv.crypto.toUpperCase()} deposit
                                                </span>
                                                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.18)", fontFamily: "monospace" }}>
                                                    #{inv.id.slice(-8).toUpperCase()}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-sans,system-ui)" }}>
                                                    {meta?.network ?? inv.crypto} network
                                                </span>
                                                <span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,0.12)", flexShrink: 0 }} />
                                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-sans,system-ui)" }}>
                                                    {timeAgo(new Date(inv.createdAt))}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                                            <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(235,235,235,0.9)", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.02em" }}>
                                                ${inv.amountUsd.toFixed(2)}
                                            </p>
                                            <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginTop: 2 }}>
                                                {inv.cryptoAmount} {meta?.symbol}
                                            </p>
                                        </div>

                                        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 8, background: sc.bg, border: `1px solid ${sc.border}` }}>
                                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dotColor, boxShadow: sc.glow !== "none" ? `0 0 6px ${sc.glow}` : "none", flexShrink: 0 }} />
                                            <span style={{ fontSize: 11, fontWeight: 600, color: sc.text, fontFamily: "var(--font-sans,system-ui)", whiteSpace: "nowrap" as const }}>
                                                {sc.label}
                                            </span>
                                        </div>

                                        <Icon icon="ph:arrow-right" style={{ fontSize: 15, color: "rgba(255,255,255,0.12)", flexShrink: 0 }} />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

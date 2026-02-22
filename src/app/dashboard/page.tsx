"use client";

import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useWindowSize } from "@/hooks/useWindowSize";

const CRYPTO_COLOR: Record<string, string> = {
    btc: "#F7931A", eth: "#627EEA", usdt: "#26A17B", usdc: "#2775CA",
    sol: "#9945FF", ltc: "#BFBBBB", bnb: "#F3BA2F", xmr: "#FF6600",
};

const STATUS_CFG: Record<string, { label: string; dot: string; bg: string; border: string }> = {
    confirmed: { label: "Confirmed", dot: "rgb(52,211,153)", bg: "rgba(52,211,153,0.05)", border: "rgba(52,211,153,0.14)" },
    pending: { label: "Pending", dot: "rgb(251,191,36)", bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.14)" },
    expired: { label: "Expired", dot: "rgba(239,68,68,0.7)", bg: "rgba(239,68,68,0.04)", border: "rgba(239,68,68,0.1)" },
    cancelled: { label: "Cancelled", dot: "rgba(255,255,255,0.2)", bg: "rgba(255,255,255,0.015)", border: "rgba(255,255,255,0.05)" },
};

function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            borderRadius: 18, overflow: "hidden", position: "relative",
            background: "rgba(255,255,255,0.012)",
            border: "1px solid rgba(255,255,255,0.055)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            ...style,
        }}>
            <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "linear-gradient(90deg,transparent 5%,rgba(255,255,255,0.07) 50%,transparent 95%)", pointerEvents: "none" }} />
            {children}
        </div>
    );
}

function timeAgo(d: Date | string) {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const { data: user, isLoading, error } = trpc.auth.me.useQuery();
    const { data: invoices } = trpc.billing.getUserInvoices.useQuery();
    const { data: proxy } = trpc.proxy.getMyProxy.useQuery();

    useEffect(() => {
        if (!isLoading && (error || !user)) router.replace("/login");
    }, [isLoading, error, user, router]);

    if (isLoading || !user) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 22, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    const confirmed = invoices?.filter((i) => i.status === "confirmed") ?? [];
    const pending = invoices?.filter((i) => i.status === "pending") ?? [];
    const totalDeposited = confirmed.reduce((s, i) => s + i.amountUsd, 0);
    const recent = invoices?.slice(0, 5) ?? [];

    const proxyPct = proxy && proxy.allocatedGb > 0
        ? Math.min((proxy.gbUsed / proxy.allocatedGb) * 100, 100) : 0;
    const proxyBarColor = proxyPct > 85 ? "rgb(239,68,68)" : proxyPct > 60 ? "rgb(251,191,36)" : "rgb(52,211,153)";

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 20px 40px" : "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 32, display: "flex", flexDirection: isSmall ? "column" : "row", alignItems: isSmall ? "flex-start" : "flex-end", gap: isSmall ? 20 : 0, justifyContent: "space-between" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                        <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(255,107,0,0.6)", fontFamily: "var(--font-sans,system-ui)" }}>Overview</span>
                    </div>
                    <h1 style={{ fontFamily: "var(--font-heading,'Clash Display',system-ui)", fontSize: "2rem", fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
                        Welcome back, {user.name.split(" ")[0]}
                    </h1>
                </div>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
                {[
                    { label: "Balance", value: `$${user.balance.toFixed(2)}`, icon: "ph:wallet", accent: "rgba(255,107,0,0.75)", bg: "rgba(255,107,0,0.06)", border: "rgba(255,107,0,0.12)" },
                    { label: "Total Deposited", value: `$${totalDeposited.toFixed(2)}`, icon: "ph:arrow-down-left", accent: "rgb(52,211,153)", bg: "rgba(52,211,153,0.05)", border: "rgba(52,211,153,0.1)" },
                    { label: "Bandwidth", value: proxy ? `${proxy.allocatedGb.toFixed(1)} GB` : "—", icon: "ph:arrows-left-right", accent: "rgba(99,126,234,0.85)", bg: "rgba(99,126,234,0.05)", border: "rgba(99,126,234,0.1)" },
                    { label: "Pending", value: String(pending.length), icon: "ph:clock", accent: pending.length > 0 ? "rgb(251,191,36)" : "rgba(255,255,255,0.22)", bg: pending.length > 0 ? "rgba(251,191,36,0.05)" : "rgba(255,255,255,0.015)", border: pending.length > 0 ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.05 + i * 0.04 }}
                        style={{ padding: "14px 18px 14px", borderRadius: 14, background: s.bg, border: `1px solid ${s.border}`, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: `linear-gradient(90deg,transparent 10%,${s.border} 50%,transparent 90%)`, pointerEvents: "none" }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)" }}>
                                {s.label}
                            </p>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,0.12)", border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Icon icon={s.icon} style={{ fontSize: 14, color: s.accent }} />
                            </div>
                        </div>
                        <p style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "1.5rem", fontWeight: 700, color: "rgba(235,235,235,0.9)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>
                            {s.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 300px", gap: 14, alignItems: "start" }}>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <GlassCard>
                        <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,107,0,0.07)", border: "1px solid rgba(255,107,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon icon="ph:receipt" style={{ fontSize: 18, color: "rgba(255,107,0,0.8)" }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.92)", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.02em" }}>Recent Invoices</h3>
                                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", marginTop: 2, fontFamily: "var(--font-sans,system-ui)" }}>{invoices?.length ?? 0} total invoices</p>
                                </div>
                            </div>
                            <Link href="/dashboard/billing/invoices" style={{ fontSize: 11, color: "rgba(255,107,0,0.6)", fontFamily: "var(--font-sans,system-ui)", textDecoration: "none", padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,107,0,0.12)", background: "rgba(255,107,0,0.05)", transition: "background 0.12s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,107,0,0.1)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,107,0,0.05)")}>
                                View all →
                            </Link>
                        </div>
                        {recent.length === 0 ? (
                            <div style={{ padding: "52px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" as const, gap: 12 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon icon="ph:clock-countdown" style={{ fontSize: 22, color: "rgba(255,255,255,0.12)" }} />
                                </div>
                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-sans,system-ui)" }}>No invoices yet</p>
                                <Link href="/dashboard/billing/topup" style={{ fontSize: 12, color: "rgba(255,107,0,0.7)", textDecoration: "none", fontFamily: "var(--font-sans,system-ui)" }}>Make your first deposit →</Link>
                            </div>
                        ) : (
                            <div>
                                {recent.map((inv, idx) => {
                                    const color = CRYPTO_COLOR[inv.crypto] ?? "rgba(255,255,255,0.25)";
                                    const sc = STATUS_CFG[inv.status] ?? STATUS_CFG.cancelled;
                                    return (
                                        <Link key={inv.id} href={`/dashboard/invoice/${inv.id}`}
                                            style={{ display: "flex", flexDirection: isSmall ? "column" : "row", alignItems: isSmall ? "flex-start" : "center", gap: isSmall ? 10 : 14, padding: isSmall ? "14px 16px" : "14px 24px", borderBottom: idx < recent.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none", textDecoration: "none", transition: "background 0.12s" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.022)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                                                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}12`, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <Icon icon={`cryptocurrency:${inv.crypto}`} style={{ fontSize: 20, color }} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(235,235,235,0.82)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>
                                                        {inv.crypto.toUpperCase()} Deposit
                                                    </p>
                                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: 2, fontFamily: "var(--font-sans,system-ui)" }}>
                                                        {timeAgo(new Date(inv.createdAt))}
                                                    </p>
                                                </div>
                                                {!isSmall && (
                                                    <p style={{ fontSize: 14.5, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.03em", flexShrink: 0, marginRight: 8 }}>
                                                        ${inv.amountUsd.toFixed(2)}
                                                    </p>
                                                )}
                                                {!isSmall && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 6, background: sc.bg, border: `1px solid ${sc.border}`, flexShrink: 0 }}>
                                                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot }} />
                                                        <span style={{ fontSize: 10, fontWeight: 600, color: sc.dot, fontFamily: "var(--font-sans,system-ui)", whiteSpace: "nowrap" as const }}>{sc.label}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isSmall && (
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingLeft: 50 }}>
                                                    <p style={{ fontSize: 14.5, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.03em" }}>
                                                        ${inv.amountUsd.toFixed(2)}
                                                    </p>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 6, background: sc.bg, border: `1px solid ${sc.border}` }}>
                                                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot }} />
                                                        <span style={{ fontSize: 10, fontWeight: 600, color: sc.dot, fontFamily: "var(--font-sans,system-ui)" }}>{sc.label}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </GlassCard>
                </motion.div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: proxy ? 0.26 : 0.22 }}>
                        <GlassCard>
                            <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.16)", fontFamily: "var(--font-sans,system-ui)" }}>
                                    Quick Actions
                                </p>
                            </div>
                            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                                {[
                                    { href: "/dashboard/billing/topup", icon: "ph:plus-circle", label: "Add Funds", sub: `$${user.balance.toFixed(2)} available`, orange: true },
                                    { href: "/dashboard/proxies/residential", icon: "ph:globe-hemisphere-west", label: proxy ? "Top Up Bandwidth" : "Buy Proxy", sub: proxy ? `${(proxy.allocatedGb - proxy.gbUsed).toFixed(2)} GB remaining` : "$1.60 / GB", orange: false },
                                    { href: "/dashboard/billing/invoices", icon: "ph:receipt", label: "Invoices", sub: `${invoices?.length ?? 0} total`, orange: false },
                                    { href: "/dashboard/settings", icon: "ph:gear-six", label: "Settings", sub: "Account & security", orange: false },
                                ].map((a) => (
                                    <Link key={a.href} href={a.href}
                                        style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 11, background: a.orange ? "rgba(255,107,0,0.06)" : "rgba(255,255,255,0.014)", border: a.orange ? "1px solid rgba(255,107,0,0.12)" : "1px solid rgba(255,255,255,0.05)", textDecoration: "none", transition: "all 0.13s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = a.orange ? "rgba(255,107,0,0.1)" : "rgba(255,255,255,0.03)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = a.orange ? "rgba(255,107,0,0.06)" : "rgba(255,255,255,0.014)")}>
                                        <div style={{ width: 32, height: 32, borderRadius: 9, background: a.orange ? "rgba(255,107,0,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${a.orange ? "rgba(255,107,0,0.15)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Icon icon={a.icon} style={{ fontSize: 15, color: a.orange ? "rgba(255,107,0,0.85)" : "rgba(255,255,255,0.28)" }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(235,235,235,0.78)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>{a.label}</p>
                                            <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)", marginTop: 1 }}>{a.sub}</p>
                                        </div>
                                        <Icon icon="ph:arrow-right" style={{ fontSize: 12, color: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
                                    </Link>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

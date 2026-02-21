"use client";

import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Link from "next/link";

const STATS = [
    { label: "Active Proxies", value: "—", icon: "ph:globe-hemisphere-west", sub: "No proxies active" },
    { label: "Bandwidth Used", value: "—", icon: "ph:arrows-left-right", sub: "This month" },
    { label: "Uptime", value: "—", icon: "ph:pulse", sub: "Last 30 days" },
    { label: "Avg. Latency", value: "—", icon: "ph:lightning", sub: "Global average" },
];

export default function DashboardPage() {
    const router = useRouter();
    const { data: user, isLoading, error } = trpc.auth.me.useQuery();

    useEffect(() => {
        if (!isLoading && (error || !user)) router.replace("/login");
    }, [isLoading, error, user, router]);

    if (isLoading) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 24, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    if (!user) return null;

    return (
        <div style={{ flex: 1, padding: "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto", position: "relative" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 44 }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.03em", marginBottom: 6 }}>
                    Welcome back
                </p>
                <h1 style={{
                    fontFamily: "var(--font-heading,'Clash Display',system-ui)",
                    fontSize: "2rem", fontWeight: 700,
                    color: "rgba(235,235,235,0.95)",
                    letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 4,
                }}>
                    {user.name}
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-sans,system-ui)" }}>
                    {user.email}
                </p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
                {STATS.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 + i * 0.05 }}
                        style={{
                            padding: "18px 20px",
                            borderRadius: 14,
                            background: "rgba(255,255,255,0.014)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "linear-gradient(90deg,transparent 10%,rgba(255,255,255,0.05) 50%,transparent 90%)", pointerEvents: "none" }} />
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)" }}>
                                {s.label}
                            </p>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,107,0,0.07)", border: "1px solid rgba(255,107,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon icon={s.icon} style={{ fontSize: 15, color: "rgba(255,107,0,0.6)" }} />
                            </div>
                        </div>
                        <p style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "1.75rem", fontWeight: 700, color: "rgba(235,235,235,0.75)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                            {s.value}
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", fontFamily: "var(--font-sans,system-ui)", marginTop: 5 }}>
                            {s.sub}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(235,235,235,0.8)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>Recent Activity</p>
                        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.18)", fontFamily: "var(--font-sans,system-ui)" }}>Last 7 days</span>
                    </div>
                    <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" as const }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon icon="ph:clock-countdown" style={{ fontSize: 20, color: "rgba(255,255,255,0.15)" }} />
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>No recent activity</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", fontFamily: "var(--font-sans,system-ui)" }}>Your proxy usage will appear here</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.16)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 2 }}>Quick Actions</p>
                    {[
                        { href: "/dashboard/billing/topup", icon: "ph:plus-circle", label: "Add funds", sub: `Balance: $${user.balance.toFixed(2)}`, orange: true },
                        { href: "/dashboard/proxies/residential", icon: "ph:globe-hemisphere-west", label: "Browse proxies", sub: "Residential, Unlimited", orange: false },
                        { href: "/dashboard/settings", icon: "ph:gear-six", label: "Account settings", sub: "Profile, security", orange: false },
                        { href: "/dashboard/billing/invoices", icon: "ph:receipt", label: "View invoices", sub: "Payment history", orange: false },
                    ].map((a) => (
                        <Link key={a.href} href={a.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: a.orange ? "rgba(255,107,0,0.06)" : "rgba(255,255,255,0.014)", border: a.orange ? "1px solid rgba(255,107,0,0.12)" : "1px solid rgba(255,255,255,0.05)", textDecoration: "none", transition: "background 0.14s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = a.orange ? "rgba(255,107,0,0.1)" : "rgba(255,255,255,0.03)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = a.orange ? "rgba(255,107,0,0.06)" : "rgba(255,255,255,0.014)")}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: a.orange ? "rgba(255,107,0,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${a.orange ? "rgba(255,107,0,0.15)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon icon={a.icon} style={{ fontSize: 16, color: a.orange ? "rgba(255,107,0,0.8)" : "rgba(255,255,255,0.3)" }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(235,235,235,0.78)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>{a.label}</p>
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-sans,system-ui)", marginTop: 1 }}>{a.sub}</p>
                            </div>
                            <Icon icon="ph:arrow-right" style={{ fontSize: 13, color: "rgba(255,255,255,0.12)", marginLeft: "auto", flexShrink: 0 }} />
                        </Link>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

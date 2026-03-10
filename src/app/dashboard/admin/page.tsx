"use client";

import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useWindowSize } from "@/hooks/useWindowSize";

const PRODUCT_COLORS: Record<string, string> = {
    "residential-lite": "rgb(52,211,153)",
    "residential": "rgb(255,107,0)",
    "mobile": "rgb(59,130,246)",
    "datacenter": "rgb(168,85,247)",
    "shared_isp": "rgb(251,191,36)",
    "dedicated_isp": "rgb(255,87,34)",
    "dedicated_mobile": "rgb(100,181,246)",
    "ipv6-residential": "rgb(20,184,166)",
    "ipv6-datacenter": "rgb(139,92,246)",
    "unlimited_residential": "rgb(245,158,11)",
};

const PRODUCT_LABELS: Record<string, string> = {
    "residential-lite": "Resi Budget",
    "residential": "Resi Premium",
    "mobile": "Mobile",
    "datacenter": "Datacenter",
    "shared_isp": "Shared ISP",
    "dedicated_isp": "Dedicated ISP",
    "dedicated_mobile": "Dedicated Mobile",
    "ipv6-residential": "IPv6 Resi",
    "ipv6-datacenter": "IPv6 DC",
    "unlimited_residential": "Unlimited Resi",
};

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: string; color: string }) {
    return (
        <div style={{ padding: "18px 20px", borderRadius: 14, background: "rgba(255,255,255,0.014)", border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 90, height: 90, background: `radial-gradient(circle at top right, ${color}14, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}14`, border: `1px solid ${color}24`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon icon={icon} style={{ fontSize: 16, color }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.32)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.05em" }}>{label}</span>
            </div>
            <p style={{ fontSize: 30, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.045em", lineHeight: 1 }}>{value}</p>
            {sub && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-sans,system-ui)", marginTop: 5 }}>{sub}</p>}
        </div>
    );
}

export default function AdminOverviewPage() {
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;

    const { data: user, isLoading: userLoading, error } = trpc.auth.me.useQuery();
    const { data: users, isLoading: usersLoading } = trpc.admin.getUsers.useQuery(undefined, { enabled: !!user && user.role === "ADMIN" });
    const { data: plans, isLoading: plansLoading } = trpc.admin.getPlans.useQuery(undefined, { enabled: !!user && user.role === "ADMIN" });

    useEffect(() => {
        if (!userLoading && (error || !user)) router.replace("/login");
        if (!userLoading && user && user.role !== "ADMIN") router.replace("/dashboard");
    }, [userLoading, error, user, router]);

    if (userLoading || usersLoading || plansLoading || !user || user.role !== "ADMIN") return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 22, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    const totalUsers = users?.length ?? 0;
    const totalBalance = users?.reduce((a, u) => a + u.balance, 0) ?? 0;
    const totalPlans = plans?.length ?? 0;
    const newUsersMonth = users?.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 86400000)).length ?? 0;

    const productCounts = (plans ?? []).reduce<Record<string, number>>((acc, p) => { acc[p.product] = (acc[p.product] ?? 0) + 1; return acc; }, {});
    const productEntries = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
    const maxCount = productEntries[0]?.[1] ?? 1;

    const recentUsers = (users ?? []).slice(0, 6);
    const recentPlans = (plans ?? []).slice(0, 5);

    const NAV_CARDS = [
        { label: "Users", sub: `${totalUsers} accounts · manage balances, roles`, icon: "ph:users-three", href: "/dashboard/admin/users", color: "rgb(52,211,153)" },
        { label: "Proxy Plans", sub: `${totalPlans} plans · cancel, reassign, remove`, icon: "ph:list-checks", href: "/dashboard/admin/proxies", color: "rgb(59,130,246)" },
    ];

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 20px 40px" : "48px 52px", maxWidth: 1120, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 20, height: 1, background: "rgba(255,107,0,0.6)" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,107,0,0.85)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.18em", textTransform: "uppercase" as const }}>Admin</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "1.85rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.1 }}>Platform Overview</h1>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)", marginTop: 5 }}>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr 1fr" : "repeat(4,1fr)", gap: 10, marginBottom: 22 }}>
                {[
                    { label: "Total Users", value: totalUsers, sub: `${users?.filter(u => u.role === "ADMIN").length ?? 0} admins`, icon: "ph:users", color: "rgb(52,211,153)" },
                    { label: "User Balances", value: `$${totalBalance.toFixed(2)}`, sub: `avg $${totalUsers ? (totalBalance / totalUsers).toFixed(2) : "0.00"}`, icon: "ph:wallet", color: "rgb(255,107,0)" },
                    { label: "Active Plans", value: totalPlans, sub: `${Object.keys(productCounts).length} products`, icon: "ph:list-checks", color: "rgb(59,130,246)" },
                    { label: "New (30d)", value: newUsersMonth, sub: "new registrations", icon: "ph:trend-up", color: "rgb(168,85,247)" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.06 }}>
                        <StatCard {...s} />
                    </motion.div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "repeat(2,1fr)", gap: 10, marginBottom: 10 }}>
                {NAV_CARDS.map(card => (
                    <button key={card.href} onClick={() => router.push(card.href)}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12, background: "rgba(255,255,255,0.014)", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", textAlign: "left" as const, transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = `${card.color}30`; e.currentTarget.style.background = `${card.color}08`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.014)"; }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${card.color}12`, border: `1px solid ${card.color}24`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon icon={card.icon} style={{ fontSize: 20, color: card.color }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>{card.label}</p>
                            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.32)", fontFamily: "var(--font-sans,system-ui)", marginTop: 2 }}>{card.sub}</p>
                        </div>
                        <Icon icon="ph:arrow-right" style={{ fontSize: 15, color: "rgba(255,255,255,0.2)", marginLeft: "auto" }} />
                    </button>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1.2fr 1fr", gap: 10, marginBottom: 10 }}>
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                    style={{ borderRadius: 14, background: "rgba(255,255,255,0.014)", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>Plans by Product</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)" }}>{totalPlans} total</span>
                    </div>
                    <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {productEntries.length === 0 ? (
                            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)" }}>No plans yet.</p>
                        ) : productEntries.map(([prod, count]) => {
                            const color = PRODUCT_COLORS[prod] ?? "rgba(255,255,255,0.3)";
                            const pct = (count / maxCount) * 100;
                            return (
                                <div key={prod}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>{PRODUCT_LABELS[prod] ?? prod}</span>
                                        <span style={{ fontSize: 12, color, fontWeight: 700, fontFamily: "var(--font-heading,system-ui)" }}>{count}</span>
                                    </div>
                                    <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.25 }}
                                            style={{ height: "100%", borderRadius: 99, background: color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
                    style={{ borderRadius: 14, background: "rgba(255,255,255,0.014)", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>Newest Users</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {recentUsers.map((u, i) => (
                            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: i < recentUsers.length - 1 ? "1px solid rgba(255,255,255,0.028)" : "none" }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: u.role === "ADMIN" ? "rgba(255,107,0,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${u.role === "ADMIN" ? "rgba(255,107,0,0.2)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon icon={u.role === "ADMIN" ? "ph:crown" : "ph:user"} style={{ fontSize: 13, color: u.role === "ADMIN" ? "rgb(255,107,0)" : "rgba(255,255,255,0.3)" }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12.5, color: "rgba(235,235,235,0.85)", fontWeight: 600, fontFamily: "var(--font-sans,system-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{u.name}</p>
                                    <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-sans,system-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{u.email}</p>
                                </div>
                                <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                                    <p style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-heading,system-ui)" }}>${u.balance.toFixed(2)}</p>
                                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)", marginTop: 1 }}>{(u._count as any).plans} plans</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ borderRadius: 14, background: "rgba(255,255,255,0.014)", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>Recent Plans</span>
                    <button onClick={() => router.push("/dashboard/admin/proxies")}
                        style={{ fontSize: 11.5, color: "rgba(255,107,0,0.8)", fontFamily: "var(--font-sans,system-ui)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        View all <Icon icon="ph:arrow-right" style={{ fontSize: 12 }} />
                    </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {recentPlans.length === 0 ? (
                        <p style={{ padding: "20px 18px", fontSize: 12.5, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)" }}>No plans yet.</p>
                    ) : recentPlans.map((p, i) => {
                        const color = PRODUCT_COLORS[p.product] ?? "rgba(255,255,255,0.4)";
                        const label = PRODUCT_LABELS[p.product] ?? p.product;
                        return (
                            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: i < recentPlans.length - 1 ? "1px solid rgba(255,255,255,0.028)" : "none" }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}66`, flexShrink: 0 }} />
                                <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.45)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{p.id}</p>
                                <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "var(--font-sans,system-ui)", flexShrink: 0 }}>{label}</span>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)", flexShrink: 0 }}>{p.user.name}</span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}

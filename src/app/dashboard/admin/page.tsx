"use client";

import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function AdminOverviewPage() {
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;

    const { data: user, isLoading: userLoading, error } = trpc.auth.me.useQuery();
    const { data: users, isLoading: usersLoading } = trpc.admin.getUsers.useQuery(undefined, {
        enabled: !!user && user.role === "ADMIN"
    });
    const { data: proxies, isLoading: proxiesLoading } = trpc.admin.getProxies.useQuery(undefined, {
        enabled: !!user && user.role === "ADMIN"
    });

    useEffect(() => {
        if (!userLoading && (error || !user)) router.replace("/login");
        if (!userLoading && user && user.role !== "ADMIN") router.replace("/dashboard");
    }, [userLoading, error, user, router]);

    if (userLoading || usersLoading || proxiesLoading || !user || user.role !== "ADMIN") return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 22, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    const totalUsers = users?.length || 0;
    const totalBalance = users?.reduce((acc, u) => acc + u.balance, 0) || 0;
    const totalProxies = proxies?.length || 0;
    const totalGbUsed = proxies?.reduce((acc, p) => acc + p.gbUsed, 0) || 0;

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 20px 40px" : "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,107,0,0.7)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        Administration
                    </span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading,'Clash Display',system-ui)", fontSize: "2.2rem", fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.04em", lineHeight: 1.15 }}>
                    Platform Overview
                </h1>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 10, marginBottom: 40 }}>
                {[
                    { label: "Total Users", value: totalUsers, icon: "ph:users", accent: "rgba(255,107,0,0.75)", bg: "rgba(255,107,0,0.06)", border: "rgba(255,107,0,0.12)" },
                    { label: "Total User Balances", value: `$${totalBalance.toFixed(2)}`, icon: "ph:wallet", accent: "rgb(52,211,153)", bg: "rgba(52,211,153,0.05)", border: "rgba(52,211,153,0.1)" },
                    { label: "Active Proxies", value: totalProxies, icon: "ph:globe", accent: "rgb(59,130,246)", bg: "rgba(59,130,246,0.05)", border: "rgba(59,130,246,0.1)" },
                    { label: "Total GB Used", value: `${totalGbUsed.toFixed(2)} GB`, icon: "ph:database", accent: "rgb(168,85,247)", bg: "rgba(168,85,247,0.05)", border: "rgba(168,85,247,0.1)" },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.1, duration: 0.35 }}>
                        <div style={{
                            padding: "20px 22px", borderRadius: 16,
                            background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.05)",
                            display: "flex", flexDirection: "column", gap: 16,
                            position: "relative", overflow: "hidden",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: stat.bg, border: `1px solid ${stat.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon icon={stat.icon} style={{ fontSize: 18, color: stat.accent }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>
                                    {stat.label}
                                </span>
                            </div>
                            <span style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 26, fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.03em" }}>
                                {stat.value}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Navigate to Users or Proxies from the sidebar to manage specific elements.</p>
        </div>
    );
}

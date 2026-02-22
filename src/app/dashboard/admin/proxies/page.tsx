"use client";

import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useState } from "react";

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

export default function AdminProxiesPage() {
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;

    const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
    const { data: proxies, isLoading: proxiesLoading } = trpc.admin.getProxies.useQuery(undefined, {
        enabled: !!user && user.role === "ADMIN"
    });

    const [searchQuery, setSearchQuery] = useState("");

    const filteredProxies = (proxies || []).filter(p => {
        const q = searchQuery.toLowerCase();
        if (q && !p.user.name.toLowerCase().includes(q) && !p.username.toLowerCase().includes(q)) return false;
        return true;
    });

    if (userLoading || proxiesLoading) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 22, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 20px 40px" : "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 32, display: "flex", flexDirection: isSmall ? "column" : "row", alignItems: isSmall ? "flex-start" : "flex-end", gap: isSmall ? 20 : 0, justifyContent: "space-between" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                        <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,107,0,0.7)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Administration</span>
                    </div>
                    <h1 style={{ fontFamily: "var(--font-heading,'Clash Display',system-ui)", fontSize: "2.2rem", fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.04em" }}>
                        Active Proxies
                    </h1>
                </div>
                <div style={{ display: "flex", gap: 10, width: isSmall ? "100%" : "300px" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Icon icon="ph:magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 16 }} />
                        <input type="text" placeholder="Search by user or proxy username..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 13, outline: "none" }} />
                    </div>
                </div>
            </motion.div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <AnimatePresence>
                    {filteredProxies?.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "60px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 16 }}>
                            <Icon icon="ph:ghost" style={{ fontSize: 40, marginBottom: 10, opacity: 0.5 }} />
                            <p>No active proxies found matching your criteria.</p>
                        </motion.div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
                        {filteredProxies?.map((p, i) => {
                            const usagePct = (p.gbUsed / p.allocatedGb) * 100;
                            const proxyBarColor = usagePct > 85 ? "rgb(239,68,68)" : usagePct > 60 ? "rgb(251,191,36)" : "rgb(52,211,153)";

                            return (
                                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }} layout>
                                    <GlassCard style={{ padding: 20 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Icon icon="ph:globe" style={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(235,235,235,0.9)", margin: 0 }}>Residential Proxy</h3>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                                                        <Icon icon="ph:user" style={{ fontSize: 12, color: "rgba(255,107,0,0.8)" }} />
                                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{p.user.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ padding: "4px 8px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 6, color: "rgb(52,211,153)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                Active
                                            </div>
                                        </div>

                                        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 12, border: "1px solid rgba(255,255,255,0.03)", marginBottom: 20 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Username</span>
                                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "monospace", fontWeight: 500 }}>{p.username}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Created</span>
                                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Data Usage</span>
                                                <span style={{ fontSize: 12, color: "rgba(235,235,235,0.9)", fontWeight: 600 }}>{p.gbUsed.toFixed(2)} / {p.allocatedGb} GB</span>
                                            </div>
                                            <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(usagePct, 100)}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    style={{ height: "100%", borderRadius: 99, background: proxyBarColor }}
                                                />
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                </AnimatePresence>
            </div>
        </div>
    );
}

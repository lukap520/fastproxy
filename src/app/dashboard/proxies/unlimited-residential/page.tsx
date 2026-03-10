"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useWindowSize } from "@/hooks/useWindowSize";

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button type="button" onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); }}
            style={{ background: "none", border: "none", padding: "4px 6px", cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", gap: 5, color: copied ? "rgb(52,211,153)" : "rgba(255,255,255,0.3)", transition: "color 0.15s", fontSize: 11, fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>
            <Icon icon={copied ? "ph:check-bold" : "ph:copy"} style={{ fontSize: 13 }} />
            {copied ? "Copied" : "Copy"}
        </button>
    );
}

function CredentialRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.016)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 12.5, color: "#FFFFFF", fontFamily: mono ? "monospace" : "var(--font-sans,system-ui)", fontWeight: 600, wordBreak: "break-all" as const }}>{value}</p>
            </div>
            <CopyButton text={value} />
        </div>
    );
}

type Plan = {
    plan_id: string;
    proxy_username: string;
    proxy_password: string;
    connection: { hostname: string; port_http: number; port_socks: number | null; format: string };
    limits: { bandwidth_mbps?: number; max_gb: number | null; bytes_used: number };
    expires_at: string | null;
    billing_type: "time";
};

const DURATIONS = [
    { id: "1_day", label: "1 Day" }, { id: "7_days", label: "7 Days" },
    { id: "30_days", label: "30 Days" }, { id: "60_days", label: "60 Days" },
];

const PRICING_TABLE = [
    { speed: 200, "1_day": 491.10, "7_days": 914.25, "30_days": 1917.53, "60_days": 3126.35 },
    { speed: 300, "1_day": 508.17, "7_days": 960.24, "30_days": 2216.46, "60_days": 3764.37 },
    { speed: 400, "1_day": 523.94, "7_days": 1053.48, "30_days": 2614.81, "60_days": 4563.10 },
    { speed: 500, "1_day": 535.46, "7_days": 1132.57, "30_days": 2953.59, "60_days": 5238.97 },
    { speed: 600, "1_day": 544.90, "7_days": 1196.03, "30_days": 3230.42, "60_days": 5808.30 },
    { speed: 700, "1_day": 554.10, "7_days": 1246.32, "30_days": 3469.17, "60_days": 6221.37 },
    { speed: 800, "1_day": 559.35, "7_days": 1282.80, "30_days": 3586.69, "60_days": 6528.49 },
    { speed: 900, "1_day": 567.54, "7_days": 1334.99, "30_days": 3838.01, "60_days": 6969.71 },
    { speed: 1000, "1_day": 573.00, "7_days": 1368.72, "30_days": 3966.02, "60_days": 7265.54 },
];

export default function UnlimitedResidentialPage() {
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const { data: user, isLoading: userLoading, error } = trpc.auth.me.useQuery();
    const { data: plans, isLoading: plansLoading, refetch } = trpc.flashproxy.listPlans.useQuery({ product: "unlimited_residential", status: "active" });
    const toast = useToast();

    const [duration, setDuration] = useState<"1_day" | "7_days" | "30_days" | "60_days">("7_days");
    const [mbps, setMbps] = useState(200);
    const [quantity, setQuantity] = useState(10);
    const [country, setCountry] = useState("any");
    const [copiedAll, setCopiedAll] = useState(false);
    const [showExtend, setShowExtend] = useState(false);
    const [addDays, setAddDays] = useState(7);

    const create = trpc.flashproxy.createPlan.useMutation({
        onSuccess: () => { toast("success", "Unlimited Residential plan created!"); refetch(); },
        onError: e => toast("error", e.message),
    });
    const extend = trpc.flashproxy.extendPlan.useMutation({
        onSuccess: () => { toast("success", "Plan extended!"); refetch(); setShowExtend(false); },
        onError: e => toast("error", e.message),
    });
    const cancel = trpc.flashproxy.cancelPlan.useMutation({
        onSuccess: () => { toast("success", "Plan cancelled."); refetch(); },
        onError: e => toast("error", e.message),
    });

    useEffect(() => { if (!userLoading && (error || !user)) router.replace("/login"); }, [userLoading, error, user, router]);

    if (userLoading || plansLoading || !user) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 24, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    const activePlans: Plan[] = plans?.items ?? [];
    const activePlan = activePlans[0] ?? null;

    const generateProxies = () => {
        if (!activePlan) return "";
        return Array.from({ length: quantity }, () => {
            let u = activePlan.proxy_username;
            if (country !== "any") u += `-country-${country}`;
            return `${u}:${activePlan.proxy_password}@${activePlan.connection.hostname}:${activePlan.connection.port_http}`;
        }).join("\n");
    };

    const COUNTRIES_SHORT = ["any", "US", "GB", "DE", "FR", "CA", "AU", "NL", "JP", "BR", "IN", "SG", "PL", "IT", "ES"];

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 20px 40px" : "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 44 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(255,107,0,0.9)", fontFamily: "var(--font-sans,system-ui)" }}>Unlimited Residential</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "2rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>Unlimited Residential Proxies</h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)" }}>
                    No bandwidth limit. <span style={{ color: "#FFFFFF", fontWeight: 600 }}>Time-based pricing</span> · Capped speed plan · Residential IPs · HTTP &amp; SOCKS5
                </p>
            </motion.div>

            {activePlan ? (
                <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 280px", gap: 18, alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                            style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden" }}>
                            <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgb(52,211,153)", boxShadow: "0 0 8px rgba(52,211,153,0.6)" }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>Active Plan</span>
                                </div>
                                <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 6, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)", color: "rgba(52,211,153,0.8)", fontWeight: 600, fontFamily: "var(--font-sans,system-ui)" }}>ONLINE</span>
                            </div>
                            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ display: "flex", gap: 24 }}>
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans,system-ui)", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 5 }}>Bandwidth</p>
                                        <p style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.02em" }}>Unlimited</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans,system-ui)", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 5 }}>Speed</p>
                                        <p style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.02em" }}>{activePlan.limits.bandwidth_mbps ?? "—"} Mbps</p>
                                    </div>
                                </div>
                                {activePlan.expires_at && (
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>
                                        Expires {new Date(activePlan.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                            style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden" }}>
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)" }}>Generator</span>
                            </div>
                            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Country</label>
                                        <select value={country} onChange={e => setCountry(e.target.value)}
                                            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none", appearance: "none", WebkitAppearance: "none" }}>
                                            {COUNTRIES_SHORT.map(c => <option key={c} value={c} style={{ background: "#0a0a0a" }}>{c === "any" ? "Any" : c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Quantity</label>
                                        <input type="number" min="1" max="10000" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none" }} />
                                    </div>
                                </div>
                                <div style={{ position: "relative" }}>
                                    <textarea readOnly value={generateProxies()} style={{ width: "100%", height: 120, padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", background: "#0a0a0a", color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "monospace", resize: "none", outline: "none" }} />
                                    <button type="button" onClick={() => { navigator.clipboard.writeText(generateProxies()).then(() => { setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000); }); }}
                                        style={{ position: "absolute", top: 8, right: 8, padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: copiedAll ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)", color: copiedAll ? "rgb(52,211,153)" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-sans,system-ui)" }}>
                                        <Icon icon={copiedAll ? "ph:check-bold" : "ph:copy"} style={{ fontSize: 12 }} />
                                        {copiedAll ? "Copied!" : "Copy all"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                            style={{ borderRadius: 14, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", padding: "16px 20px" }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 14 }}>Manage Plan</p>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button type="button" onClick={() => setShowExtend(v => !v)}
                                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,107,0,0.25)", background: "rgba(255,107,0,0.07)", color: "rgba(255,107,0,0.85)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                    <Icon icon="ph:plus-circle" style={{ fontSize: 14 }} /> Extend
                                </button>
                                <button type="button" onClick={() => { if (confirm("Cancel plan?")) cancel.mutate({ planId: activePlan.plan_id }); }} disabled={cancel.isPending}
                                    style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "rgba(239,68,68,0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)" }}>
                                    Cancel
                                </button>
                            </div>
                            <AnimatePresence>
                                {showExtend && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 12 }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7, marginBottom: 10 }}>
                                            {[1, 7, 14, 30].map(v => (
                                                <button key={v} type="button" onClick={() => setAddDays(v)}
                                                    style={{ padding: "9px", borderRadius: 9, border: addDays === v ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: addDays === v ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: addDays === v ? "rgb(255,107,0)" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                    +{v}d
                                                </button>
                                            ))}
                                        </div>
                                        <button type="button" disabled={extend.isPending} onClick={() => extend.mutate({ planId: activePlan.plan_id, add_days: addDays })}
                                            style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "hsl(24, 100%, 45%)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                                            {extend.isPending ? <><Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} />Processing…</> : `Add ${addDays} Days`}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                        style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden", position: "sticky", top: 24 }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>Plan Details</p>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans,system-ui)", lineHeight: 1.6 }}>
                                Unlimited bandwidth plan capped at a defined Mbps speed. Billed by time. No data cap — use as much as you want.
                            </p>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 420px", gap: 20, alignItems: "start" }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 14 }}>Why Unlimited?</p>
                        {[
                            { icon: "ph:infinity", label: "No data cap", sub: "Use as much bandwidth as you want within your plan's time window. Zero overage charges." },
                            { icon: "ph:house-simple", label: "Residential IPs", sub: "Real residential IPs from home networks. Trusted by all major platforms." },
                            { icon: "ph:sliders-horizontal", label: "Speed capped plans", sub: "Choose your Mbps cap to match your workload. From light scraping to heavy crawling." },
                            { icon: "ph:timer", label: "Time-based billing", sub: "Pay for duration, not usage. Set up once and run uninterrupted." },
                        ].map((f, i) => (
                            <motion.div key={f.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                                style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,107,0,0.07)", border: "1px solid rgba(255,107,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon icon={f.icon} style={{ fontSize: 16, color: "rgba(255,107,0,0.65)" }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(235,235,235,1)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 3 }}>{f.label}</p>
                                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans,system-ui)", lineHeight: 1.55 }}>{f.sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        style={{ borderRadius: 18, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "sticky", top: 24 }}>
                        <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "linear-gradient(90deg,transparent 10%,rgba(255,107,0,0.2) 50%,transparent 90%)", pointerEvents: "none" }} />
                        <div style={{ padding: "20px 22px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)", marginBottom: 3 }}>Purchase Plan</p>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)" }}>Balance: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>${user.balance.toFixed(2)}</span></p>
                        </div>
                        <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 18 }}>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 10, fontFamily: "var(--font-sans,system-ui)" }}>Duration</p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                    {DURATIONS.map(d => {
                                        const on = duration === d.id;
                                        return (
                                            <button key={d.id} type="button" onClick={() => setDuration(d.id as "1_day" | "7_days" | "30_days" | "60_days")}
                                                style={{ padding: "9px", borderRadius: 9, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                {d.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Speed (Mbps)</p>
                                <input type="number" min="200" max="1000" step="100" value={mbps} onChange={e => setMbps(Math.max(200, parseInt(e.target.value) || 200))}
                                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none" }} />
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 6, fontFamily: "var(--font-sans,system-ui)" }}>Minimum 200 Mbps · Unlimited data at this speed for the selected duration.</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Pricing Reference</p>
                                <div style={{ overflowX: "auto" as const, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 11, fontFamily: "var(--font-sans,system-ui)" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                                {["Speed", "1 Day", "7 Days", "30 Days", "60 Days"].map(h => (
                                                    <th key={h} style={{ padding: "7px 10px", textAlign: "left" as const, color: "rgba(255,255,255,0.35)", fontWeight: 600, whiteSpace: "nowrap" as const }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {PRICING_TABLE.map(row => {
                                                const isActive = mbps === row.speed;
                                                return (
                                                    <tr key={row.speed}
                                                        onClick={() => setMbps(row.speed)}
                                                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: isActive ? "rgba(255,107,0,0.07)" : "transparent", cursor: "pointer", transition: "background 0.12s" }}>
                                                        <td style={{ padding: "6px 10px", fontWeight: 700, color: isActive ? "rgb(255,107,0)" : "rgba(255,255,255,0.7)", whiteSpace: "nowrap" as const }}>{row.speed} Mbps</td>
                                                        <td style={{ padding: "6px 10px", color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", whiteSpace: "nowrap" as const }}>${row["1_day"].toFixed(2)}</td>
                                                        <td style={{ padding: "6px 10px", color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", whiteSpace: "nowrap" as const }}>${row["7_days"].toFixed(2)}</td>
                                                        <td style={{ padding: "6px 10px", color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", whiteSpace: "nowrap" as const }}>${row["30_days"].toFixed(2)}</td>
                                                        <td style={{ padding: "6px 10px", color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", whiteSpace: "nowrap" as const }}>${row["60_days"].toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)" }}>Price calculated based on speed and duration.</p>
                            <button type="button" disabled={create.isPending}
                                onClick={() => create.mutate({ product: "unlimited_residential", billing_type: "time", duration, mbps })}
                                style={{ width: "80%", alignSelf: "center", padding: "10px", borderRadius: 11, border: "none", background: "hsl(24, 100%, 45%)", color: "rgba(255,255,255,0.93)", fontSize: 13.5, fontWeight: 600, cursor: create.isPending ? "not-allowed" : "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-sans,system-ui)" }}>
                                {create.isPending ? <><Icon icon="ph:spinner" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} />Processing...</> : "Purchase Plan"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

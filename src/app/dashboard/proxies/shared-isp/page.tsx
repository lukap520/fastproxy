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
    limits: { max_gb: number | null; bytes_used: number };
    expires_at: string | null;
    billing_type: "bandwidth" | "time";
    billing: { cost_formatted: string };
};

export default function SharedIspPage() {
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const { data: user, isLoading: userLoading, error } = trpc.auth.me.useQuery();
    const { data: plans, isLoading: plansLoading, refetch } = trpc.flashproxy.listPlans.useQuery({ product: "shared_isp", status: "active" });
    const { data: pricing } = trpc.flashproxy.getPricing.useQuery();
    const toast = useToast();

    const [billingType, setBillingType] = useState<"bandwidth" | "time">("bandwidth");
    const [gb, setGb] = useState(5);
    const [duration, setDuration] = useState<"1_hour" | "1_day" | "7_days" | "30_days">("7_days");
    const [mbps, setMbps] = useState(100);
    const [quantity, setQuantity] = useState(10);
    const [copiedAll, setCopiedAll] = useState(false);
    const [showExtend, setShowExtend] = useState(false);
    const [addGb, setAddGb] = useState(5);
    const [addDays, setAddDays] = useState(7);

    const create = trpc.flashproxy.createPlan.useMutation({
        onSuccess: () => { toast("success", "Shared ISP plan created!"); refetch(); },
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
    const pricePerGb = pricing?.["shared_isp"]?.price_per_gb_cents ? pricing["shared_isp"].price_per_gb_cents / 100 : 1.50;
    const totalCost = billingType === "bandwidth" ? +(gb * pricePerGb).toFixed(2) : 0;
    const canAfford = (user.balance ?? 0) >= totalCost || billingType === "time";

    const generateProxies = () => {
        if (!activePlan) return "";
        return Array.from({ length: quantity }, () =>
            `${activePlan.proxy_username}:${activePlan.proxy_password}@${activePlan.connection.hostname}:${activePlan.connection.port_http}`
        ).join("\n");
    };

    const gbUsed = activePlan ? activePlan.limits.bytes_used / 1e9 : 0;
    const gbMax = activePlan?.limits.max_gb ?? 0;
    const pct = gbMax > 0 ? Math.min((gbUsed / gbMax) * 100, 100) : 0;

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 20px 40px" : "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 44 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(255,107,0,0.9)", fontFamily: "var(--font-sans,system-ui)" }}>Shared ISP</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "2rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>Shared ISP Proxies</h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)" }}>
                    ISP-grade IPs. <span style={{ color: "#FFFFFF", fontWeight: 600 }}>Per-GB or time-based</span> · Residential ASN · Low latency
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
                            <div style={{ padding: "18px 20px" }}>
                                {activePlan.billing_type === "bandwidth" ? (
                                    <>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans,system-ui)" }}>{gbUsed.toFixed(3)} GB used</span>
                                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans,system-ui)" }}>{gbMax} GB total</span>
                                        </div>
                                        <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} style={{ height: "100%", borderRadius: 99, background: "rgb(52,211,153)" }} />
                                        </div>
                                    </>
                                ) : activePlan.expires_at ? (
                                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans,system-ui)" }}>
                                        Expires {new Date(activePlan.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                ) : null}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden" }}>
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>Credentials</span>
                            </div>
                            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                                <CredentialRow label="Username" value={activePlan.proxy_username} mono />
                                <CredentialRow label="Password" value={activePlan.proxy_password} mono />
                                <CredentialRow label="Host (HTTP)" value={`${activePlan.connection.hostname}:${activePlan.connection.port_http}`} mono />
                                {activePlan.connection.port_socks && <CredentialRow label="Host (SOCKS5)" value={`${activePlan.connection.hostname}:${activePlan.connection.port_socks}`} mono />}
                                <CredentialRow label="Full String" value={activePlan.connection.format} mono />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                            style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden" }}>
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)" }}>Generator</span>
                            </div>
                            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                                <div>
                                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Quantity</label>
                                    <input type="number" min="1" max="10000" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none" }} />
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
                                        {activePlan.billing_type === "bandwidth" ? (
                                            <>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 10 }}>
                                                    {[1, 5, 10, 25, 50, 100].map(v => (
                                                        <button key={v} type="button" onClick={() => setAddGb(v)}
                                                            style={{ padding: "9px", borderRadius: 9, border: addGb === v ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: addGb === v ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: addGb === v ? "rgb(255,107,0)" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                            +{v} GB
                                                        </button>
                                                    ))}
                                                </div>
                                                <button type="button" disabled={extend.isPending} onClick={() => extend.mutate({ planId: activePlan.plan_id, add_bandwidth_gb: addGb })}
                                                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "hsl(24, 100%, 45%)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                                                    {extend.isPending ? <><Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} />Processing…</> : `Add ${addGb} GB`}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 10 }}>
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
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                        style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden", position: "sticky", top: 24 }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>Plan Info</p>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                            {[["Type", activePlan.billing_type === "bandwidth" ? "Bandwidth" : "Time-based"], ["Cost", activePlan.billing?.cost_formatted ?? "—"]].map(([k, v]) => (
                                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans,system-ui)" }}>{k}</span>
                                    <span style={{ fontSize: 12, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 440px", gap: 20, alignItems: "start" }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 14 }}>Why Shared ISP?</p>
                        {[
                            { icon: "ph:buildings", label: "ISP-grade IPs", sub: "Registered with ISPs — appear as real home/business connections to all major platforms." },
                            { icon: "ph:lightning-fill", label: "High speed", sub: "Faster than residential proxies with lower latency. Perfect for time-sensitive tasks." },
                            { icon: "ph:timer", label: "Flexible billing", sub: "Choose GB-based billing for occasional use, or time-based for continuous traffic." },
                            { icon: "ph:shield-check", label: "Low detection", sub: "Registered with real ISPs. Trusted by social media, e-commerce, and ticketing sites." },
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
                            <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4 }}>
                                {(["bandwidth", "time"] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setBillingType(t)}
                                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: billingType === t ? "rgba(255,255,255,0.08)" : "transparent", color: billingType === t ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                                        {t === "bandwidth" ? "Per GB" : "Per Time"}
                                    </button>
                                ))}
                            </div>
                            {billingType === "bandwidth" ? (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                                        {[1, 5, 10, 25, 50, 100].map(v => {
                                            const on = gb === v;
                                            return (
                                                <button key={v} type="button" onClick={() => setGb(v)}
                                                    style={{ padding: "10px", borderRadius: 10, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.13s" }}>
                                                    {v} GB
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.055)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                            <span style={{ fontSize: 12, color: "#fff", fontFamily: "var(--font-sans,system-ui)" }}>Rate</span>
                                            <span style={{ fontSize: 12, color: "#fff", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>${pricePerGb.toFixed(2)} / GB</span>
                                        </div>
                                        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-sans,system-ui)" }}>Total</span>
                                            <span style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: "#FFFFFF" }}>${totalCost.toFixed(2)}</span>
                                        </div>
                                        {!canAfford && <p style={{ fontSize: 11, color: "rgba(239,68,68,0.7)", marginTop: 8, fontFamily: "var(--font-sans,system-ui)" }}>Insufficient balance.</p>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                        {([["1_hour", "1 Hour"], ["1_day", "1 Day"], ["7_days", "7 Days"], ["30_days", "30 Days"]] as const).map(([id, label]) => {
                                            const on = duration === id;
                                            return (
                                                <button key={id} type="button" onClick={() => setDuration(id as "1_hour" | "1_day" | "7_days" | "30_days")}
                                                    style={{ padding: "9px", borderRadius: 9, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Speed (Mbps)</label>
                                        <input type="number" min="10" max="10000" step="10" value={mbps} onChange={e => setMbps(parseInt(e.target.value) || 100)}
                                            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none" }} />
                                    </div>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>Price calculated based on duration and speed.</p>
                                </>
                            )}

                            <button type="button" disabled={create.isPending || (billingType === "bandwidth" && !canAfford)}
                                onClick={() => create.mutate({ product: "shared_isp", billing_type: billingType, ...(billingType === "bandwidth" ? { bandwidth_gb: gb } : { duration, mbps }) })}
                                style={{ width: "80%", alignSelf: "center", padding: "10px", borderRadius: 11, border: "none", background: canAfford ? "hsl(24, 100%, 45%)" : "rgba(255,255,255,0.05)", color: canAfford ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.18)", fontSize: 13.5, fontWeight: 600, cursor: canAfford ? "pointer" : "not-allowed", boxShadow: canAfford ? "0 1px 3px rgba(0,0,0,0.4)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-sans,system-ui)" }}>
                                {create.isPending ? <><Icon icon="ph:spinner" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} />Processing...</> : billingType === "bandwidth" ? `Purchase — $${totalCost.toFixed(2)}` : "Purchase Plan"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

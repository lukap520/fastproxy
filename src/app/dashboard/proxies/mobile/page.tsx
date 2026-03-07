"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useWindowSize } from "@/hooks/useWindowSize";

const PRESETS = [1, 2, 5, 10, 25, 50];
const COUNTRIES = [
    { code: "any", name: "Any country" },
    { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" }, { code: "DE", name: "Germany" },
    { code: "FR", name: "France" }, { code: "AU", name: "Australia" },
    { code: "BR", name: "Brazil" }, { code: "IN", name: "India" },
    { code: "NL", name: "Netherlands" }, { code: "JP", name: "Japan" },
];

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
                <p style={{ fontSize: 12.5, color: "#FFFFFF", fontFamily: mono ? "monospace" : "var(--font-sans,system-ui)", letterSpacing: mono ? "0.03em" : "-0.01em", fontWeight: 600, wordBreak: "break-all" as const }}>{value}</p>
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
    billing_type: string;
};

export default function MobilePage() {
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const { data: user, isLoading: userLoading, error } = trpc.auth.me.useQuery();
    const { data: plans, isLoading: plansLoading, refetch } = trpc.flashproxy.listPlans.useQuery({ product: "mobile", status: "active" });
    const { data: pricing } = trpc.flashproxy.getPricing.useQuery();
    const toast = useToast();
    const [gb, setGb] = useState(2);
    const [country, setCountry] = useState("any");
    const [quantity, setQuantity] = useState(10);
    const [proxyType, setProxyType] = useState<"rotating" | "sticky">("rotating");
    const [copiedAll, setCopiedAll] = useState(false);
    const [showExtend, setShowExtend] = useState(false);
    const [addGb, setAddGb] = useState(2);

    const create = trpc.flashproxy.createPlan.useMutation({
        onSuccess: () => { toast("success", "Mobile plan created!"); refetch(); },
        onError: e => toast("error", e.message),
    });

    const extend = trpc.flashproxy.extendPlan.useMutation({
        onSuccess: () => { toast("success", `Added ${addGb} GB.`); refetch(); setShowExtend(false); },
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
    const pricePerGb = pricing?.["mobile"]?.price_per_gb_cents ? pricing["mobile"].price_per_gb_cents / 100 : 5.00;
    const totalCost = +(gb * pricePerGb).toFixed(2);
    const canAfford = (user.balance ?? 0) >= totalCost;

    const generateProxies = () => {
        if (!activePlan) return "";
        const lines: string[] = [];
        for (let i = 0; i < quantity; i++) {
            let u = activePlan.proxy_username;
            if (country !== "any") u += `-country-${country}`;
            if (proxyType === "sticky") u += `-session-${Math.random().toString(36).slice(2, 10)}-ttl-3600`;
            lines.push(`${u}:${activePlan.proxy_password}@${activePlan.connection.hostname}:${activePlan.connection.port_http}`);
        }
        return lines.join("\n");
    };

    const pct = activePlan ? Math.min(((activePlan.limits.bytes_used / 1e9) / (activePlan.limits.max_gb ?? 1)) * 100, 100) : 0;
    const color = pct > 85 ? "rgb(239,68,68)" : pct > 60 ? "rgb(251,191,36)" : "rgb(52,211,153)";

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 20px 40px" : "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 44 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(255,107,0,0.9)", fontFamily: "var(--font-sans,system-ui)" }}>Mobile</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "2rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>Mobile Proxies</h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)" }}>
                    Real 4G/5G IPs. <span style={{ color: "#FFFFFF", fontWeight: 600 }}>${pricePerGb.toFixed(2)} / GB</span> · 500K+ IPs · ASN targeting · HTTP &amp; SOCKS5
                </p>
            </motion.div>

            {activePlan ? (
                <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 300px", gap: 18, alignItems: "start" }}>
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
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans,system-ui)" }}>{(activePlan.limits.bytes_used / 1e9).toFixed(3)} GB used</span>
                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans,system-ui)" }}>{activePlan.limits.max_gb} GB total</span>
                                </div>
                                <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} style={{ height: "100%", borderRadius: 99, background: color }} />
                                </div>
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
                            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                                <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4 }}>
                                    {(["rotating", "sticky"] as const).map(t => (
                                        <button key={t} type="button" onClick={() => setProxyType(t)}
                                            style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: proxyType === t ? "rgba(255,255,255,0.08)" : "transparent", color: proxyType === t ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize" as const, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                            <Icon icon={t === "rotating" ? "ph:arrows-clockwise" : "ph:lock-key"} /> {t}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Country</label>
                                        <select value={country} onChange={e => setCountry(e.target.value)}
                                            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none", appearance: "none", WebkitAppearance: "none" }}>
                                            {COUNTRIES.map(c => <option key={c.code} value={c.code} style={{ background: "#0a0a0a" }}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Quantity</label>
                                        <input type="number" min="1" max="5000" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
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
                    </div>

                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                        style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden", position: "sticky", top: 24 }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>Add Bandwidth</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 2, fontFamily: "var(--font-sans,system-ui)" }}>Balance: ${user.balance.toFixed(2)}</p>
                        </div>
                        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 7 }}>
                                {PRESETS.map(v => {
                                    const on = addGb === v;
                                    return (
                                        <button key={v} type="button" onClick={() => setAddGb(v)}
                                            style={{ padding: "9px", borderRadius: 9, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.13s" }}>
                                            +{v} GB
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans,system-ui)" }}>Cost</span>
                                <span style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 17, fontWeight: 700 }}>${(addGb * pricePerGb).toFixed(2)}</span>
                            </div>
                            <button type="button" disabled={extend.isPending}
                                onClick={() => extend.mutate({ planId: activePlan.plan_id, add_bandwidth_gb: addGb })}
                                style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "hsl(24, 100%, 45%)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: extend.isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "var(--font-sans,system-ui)" }}>
                                {extend.isPending ? <><Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} />Processing…</> : <>Add {addGb} GB</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 400px", gap: 20, alignItems: "start" }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 14 }}>Why Mobile?</p>
                        {[
                            { icon: "ph:device-mobile", label: "Real 4G/5G IPs", sub: "From genuine mobile carrier networks. Best protection against detection." },
                            { icon: "ph:shield-check", label: "Ultra-low block rate", sub: "Mobile IPs are trusted by every platform. Near-zero ban rate across social media." },
                            { icon: "ph:broadcast", label: "ASN targeting", sub: "Target specific mobile carriers using ASN in the username format." },
                            { icon: "ph:globe-hemisphere-west", label: "45+ countries", sub: "500K+ mobile IPs across 45 countries." },
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
                            <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)", marginBottom: 3 }}>Purchase Bandwidth</p>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)" }}>Balance: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>${user.balance.toFixed(2)}</span></p>
                        </div>
                        <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 18 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                                {PRESETS.map(v => {
                                    const on = gb === v;
                                    return (
                                        <button key={v} type="button" onClick={() => setGb(v)}
                                            style={{ padding: "10px 6px", borderRadius: 10, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.13s" }}>
                                            {v} GB
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.055)" }}>
                                {[["Rate", `$${pricePerGb.toFixed(2)} / GB`], ["Bandwidth", `${gb} GB`]].map(([k, v]) => (
                                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                        <span style={{ fontSize: 12, color: "#fff", fontFamily: "var(--font-sans,system-ui)" }}>{k}</span>
                                        <span style={{ fontSize: 12, color: "#fff", fontWeight: 500, fontFamily: "var(--font-sans,system-ui)" }}>{v}</span>
                                    </div>
                                ))}
                                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-sans,system-ui)" }}>Total</span>
                                    <span style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: "#FFFFFF" }}>${totalCost.toFixed(2)}</span>
                                </div>
                                {!canAfford && <p style={{ fontSize: 11, color: "rgba(239,68,68,0.7)", marginTop: 8, fontFamily: "var(--font-sans,system-ui)" }}>Insufficient balance. You have ${user.balance.toFixed(2)}.</p>}
                            </div>
                            <button type="button" disabled={create.isPending || !canAfford}
                                onClick={() => create.mutate({ product: "mobile", bandwidth_gb: gb })}
                                style={{ width: "80%", alignSelf: "center", padding: "10px", borderRadius: 11, border: "none", background: canAfford ? "hsl(24, 100%, 45%)" : "rgba(255,255,255,0.05)", color: canAfford ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.18)", fontSize: 13.5, fontWeight: 600, cursor: canAfford ? "pointer" : "not-allowed", boxShadow: canAfford ? "0 1px 3px rgba(0,0,0,0.4)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-sans,system-ui)" }}>
                                {create.isPending ? <><Icon icon="ph:spinner" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} />Processing...</> : `Purchase — $${totalCost.toFixed(2)}`}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

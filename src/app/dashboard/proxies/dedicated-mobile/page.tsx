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

type DedicatedProxy = {
    ip: string;
    port_http?: number;
    port_socks?: number;
    operator: string;
    country: string;
    assigned_at: string;
};

type Plan = {
    plan_id: string;
    proxy_username: string;
    proxy_password: string;
    connection: { hostname: string; port_http: number; port_socks: number | null; format: string };
    limits: { total_ips?: number };
    expires_at: string | null;
    location?: string;
    product_details?: { operator?: string; country?: string; quantity?: number };
    dedicated_proxies?: DedicatedProxy[];
};

type MobileCountry = {
    code: string;
    available: number;
    in_stock: boolean;
};

const DURATIONS_DEDICATED = [
    { id: "7_days", label: "7 Days" }, { id: "14_days", label: "14 Days" },
    { id: "30_days", label: "30 Days" }, { id: "60_days", label: "60 Days" },
    { id: "90_days", label: "90 Days" },
];

export default function DedicatedMobilePage() {
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const { data: user, isLoading: userLoading, error } = trpc.auth.me.useQuery();
    const { data: plans, isLoading: plansLoading, refetch } = trpc.flashproxy.listPlans.useQuery({ product: "dedicated_mobile", status: "active" });
    const { data: stockData } = trpc.flashproxy.getStock.useQuery({ type: "dedicated_mobile" });
    const toast = useToast();

    const [quantity, setQuantity] = useState(1);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [duration, setDuration] = useState<"7_days" | "14_days" | "30_days" | "60_days" | "90_days">("30_days");
    const [showExtend, setShowExtend] = useState(false);
    const [addDays, setAddDays] = useState(30);
    const [copiedAll, setCopiedAll] = useState(false);

    const create = trpc.flashproxy.createPlan.useMutation({
        onSuccess: () => { toast("success", "Dedicated Mobile plan created!"); refetch(); },
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

    const mobileRaw = stockData?.mobile ?? {};
    const mobileCountries: MobileCountry[] = Object.entries(mobileRaw)
        .filter(([key]) => key !== "total_available")
        .map(([code, val]) => ({ code, ...(val as { available: number; in_stock: boolean }) }))
        .filter(c => c.in_stock);
    const selectedMobileCountry = mobileCountries.find(c => c.code === selectedCountry);

    const generateProxies = () => {
        if (!activePlan) return "";
        const proxies = activePlan.dedicated_proxies ?? [];
        return proxies.map(p => `${activePlan.proxy_username}:${activePlan.proxy_password}@${p.ip}:${p.port_http ?? activePlan.connection.port_http}`).join("\n");
    };

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 20px 40px" : "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 44 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(255,107,0,0.9)", fontFamily: "var(--font-sans,system-ui)" }}>Dedicated Mobile</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "2rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>Dedicated Mobile Proxies</h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)" }}>
                    Exclusively yours. <span style={{ color: "#FFFFFF", fontWeight: 600 }}>Fixed IPs</span> · Per-carrier targeting · No sharing · 7–90 day plans
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
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>Active Plan · {activePlan.limits.total_ips ?? 1} IP{(activePlan.limits.total_ips ?? 1) > 1 ? "s" : ""}</span>
                                </div>
                                <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 6, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)", color: "rgba(52,211,153,0.8)", fontWeight: 600, fontFamily: "var(--font-sans,system-ui)" }}>ONLINE</span>
                            </div>
                            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{ display: "flex", gap: 24 }}>
                                    {activePlan.product_details?.country && (
                                        <div>
                                            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 5, fontFamily: "var(--font-sans,system-ui)" }}>Country</p>
                                            <p style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-heading,system-ui)" }}>{activePlan.product_details.country.toUpperCase()}</p>
                                        </div>
                                    )}
                                    {activePlan.product_details?.operator && (
                                        <div>
                                            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 5, fontFamily: "var(--font-sans,system-ui)" }}>Carrier</p>
                                            <p style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-heading,system-ui)" }}>{activePlan.product_details.operator}</p>
                                        </div>
                                    )}
                                </div>
                                {activePlan.expires_at && (
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>
                                        Expires {new Date(activePlan.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                )}
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
                            </div>
                        </motion.div>

                        {(activePlan.dedicated_proxies?.length ?? 0) > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                                style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden" }}>
                                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)" }}>Proxy List</span>
                                    <button type="button" onClick={() => { navigator.clipboard.writeText(generateProxies()).then(() => { setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000); }); }}
                                        style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: copiedAll ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)", color: copiedAll ? "rgb(52,211,153)" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-sans,system-ui)" }}>
                                        <Icon icon={copiedAll ? "ph:check-bold" : "ph:copy"} style={{ fontSize: 12 }} />
                                        {copiedAll ? "Copied!" : "Copy all"}
                                    </button>
                                </div>
                                <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
                                    {activePlan.dedicated_proxies!.map((p: DedicatedProxy, i: number) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
                                            <div>
                                                <p style={{ fontSize: 12, fontFamily: "monospace", color: "#FFFFFF", fontWeight: 600 }}>{p.ip}</p>
                                                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans,system-ui)", marginTop: 2 }}>{p.operator} · {p.country}</p>
                                            </div>
                                            <CopyButton text={`${activePlan.proxy_username}:${activePlan.proxy_password}@${p.ip}:${p.port_http ?? activePlan.connection.port_http}`} />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

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
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 10 }}>
                                            {[7, 14, 30, 60, 90].map(v => (
                                                <button key={v} type="button" onClick={() => setAddDays(v)}
                                                    style={{ padding: "9px", borderRadius: 9, border: addDays === v ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: addDays === v ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: addDays === v ? "rgb(255,107,0)" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                    +{v}d
                                                </button>
                                            ))}
                                        </div>
                                        <button type="button" disabled={extend.isPending} onClick={() => extend.mutate({ planId: activePlan.plan_id, add_days: addDays })}
                                            style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "hsl(24, 100%, 45%)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                                            {extend.isPending ? <><Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} />Processing…</> : `Extend ${addDays} Days`}
                                        </button>
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
                            {[["IPs", String(activePlan.limits.total_ips ?? 1)], ...(activePlan.expires_at ? [["Expires", new Date(activePlan.expires_at).toLocaleDateString()]] : [])].map(([k, v]) => (
                                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans,system-ui)" }}>{k}</span>
                                    <span style={{ fontSize: 12, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 460px", gap: 20, alignItems: "start" }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 14 }}>Why Dedicated Mobile?</p>
                        {[
                            { icon: "ph:lock-key", label: "Exclusively yours", sub: "These IPs are dedicated to you alone. No sharing, no reputation risk from other users." },
                            { icon: "ph:device-mobile", label: "Real 4G/5G carriers", sub: "Genuine mobile IPs from real carriers. Target specific operators by name." },
                            { icon: "ph:map-pin", label: "Location targeting", sub: "Select exact country and carrier. Control which mobile network you appear on." },
                            { icon: "ph:arrows-counter-clockwise", label: "IP rotation on demand", sub: "Request IP rotations at will. Fixed IP with control, not a pool." },
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
                            <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)", marginBottom: 3 }}>Purchase Dedicated IPs</p>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)" }}>Balance: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>${user.balance.toFixed(2)}</span></p>
                        </div>
                        <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Country</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {mobileCountries.length === 0 ? (
                                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>No countries in stock</p>
                                    ) : mobileCountries.map(c => {
                                        const on = selectedCountry === c.code;
                                        return (
                                            <button key={c.code} type="button" onClick={() => setSelectedCountry(c.code)}
                                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 10, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.07)" : "rgba(255,255,255,0.018)", cursor: "pointer", transition: "all 0.13s" }}>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: on ? "rgba(255,107,0,0.9)" : "rgba(255,255,255,0.85)", fontFamily: "var(--font-sans,system-ui)" }}>{c.code}</p>
                                                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", color: "rgba(52,211,153,0.7)", fontWeight: 600, fontFamily: "var(--font-sans,system-ui)" }}>{c.available} available</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Quantity</p>
                                <input type="number" min="1" max={selectedMobileCountry?.available ?? 10} value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none" }} />
                                {selectedMobileCountry && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 5, fontFamily: "var(--font-sans,system-ui)" }}>{selectedMobileCountry.available} IPs available</p>}
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Duration</p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                                    {DURATIONS_DEDICATED.map(d => {
                                        const on = duration === d.id;
                                        return (
                                            <button key={d.id} type="button" onClick={() => setDuration(d.id as "7_days" | "14_days" | "30_days" | "60_days" | "90_days")}
                                                style={{ padding: "9px", borderRadius: 9, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                {d.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)" }}>Price calculated based on quantity and duration.</p>
                            <button type="button" disabled={create.isPending || !selectedCountry}
                                onClick={() => create.mutate({ product: "dedicated_mobile", country: selectedCountry, quantity, duration })}
                                style={{ width: "80%", alignSelf: "center", padding: "10px", borderRadius: 11, border: "none", background: selectedCountry ? "hsl(24, 100%, 45%)" : "rgba(255,255,255,0.05)", color: selectedCountry ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.18)", fontSize: 13.5, fontWeight: 600, cursor: selectedCountry ? "pointer" : "not-allowed", boxShadow: selectedCountry ? "0 1px 3px rgba(0,0,0,0.4)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-sans,system-ui)" }}>
                                {create.isPending ? <><Icon icon="ph:spinner" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} />Processing...</> : "Purchase Plan"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

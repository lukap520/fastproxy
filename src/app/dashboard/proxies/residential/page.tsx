"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useWindowSize } from "@/hooks/useWindowSize";

const PRESETS = [1, 3, 5, 10, 25, 50];

const COUNTRIES = [
    { code: "any", name: "Any country" },
    { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" }, { code: "DE", name: "Germany" },
    { code: "FR", name: "France" }, { code: "JP", name: "Japan" },
    { code: "AU", name: "Australia" }, { code: "BR", name: "Brazil" },
    { code: "IN", name: "India" }, { code: "NL", name: "Netherlands" },
    { code: "ES", name: "Spain" }, { code: "IT", name: "Italy" },
];

const FORMATS = [
    { id: "user:pass@host:port", label: "user:pass@host:port", sub: "{USER}:{PASS}@{HOST}:{PORT}" },
    { id: "host:port:user:pass", label: "host:port:user:pass", sub: "{HOST}:{PORT}:{USER}:{PASS}" },
    { id: "http", label: "http:// URL", sub: "http://{USER}:{PASS}@{HOST}:{PORT}" },
    { id: "socks5", label: "socks5:// URL", sub: "socks5://{USER}:{PASS}@{HOST}:{PORT}" },
];

type Plan = {
    plan_id: string;
    product: string;
    proxy_username: string;
    proxy_password: string;
    connection: { hostname: string; port_http: number; port_socks: number | null; format: string };
    limits: { max_gb: number | null; bytes_used: number };
    expires_at: string | null;
    status: string;
    billing: { cost_formatted: string; price_per_gb_cents?: number };
};

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

function ProxyGenerator({ plan }: { plan: Plan }) {
    const [proxyType, setProxyType] = useState<"rotating" | "sticky">("rotating");
    const [country, setCountry] = useState("any");
    const [quantity, setQuantity] = useState(10);
    const [format, setFormat] = useState("user:pass@host:port");
    const [copied, setCopied] = useState(false);

    const generate = () => {
        const lines: string[] = [];
        const host = plan.connection.hostname;
        const port = plan.connection.port_http;
        const pass = plan.proxy_password;
        for (let i = 0; i < quantity; i++) {
            let user = plan.proxy_username;
            if (country !== "any") user += `-country-${country}`;
            if (proxyType === "sticky") user += `-session-${Math.random().toString(36).slice(2, 10)}-ttl-3600`;
            let line = "";
            switch (format) {
                case "user:pass@host:port": line = `${user}:${pass}@${host}:${port}`; break;
                case "host:port:user:pass": line = `${host}:${port}:${user}:${pass}`; break;
                case "http": line = `http://${user}:${pass}@${host}:${port}`; break;
                case "socks5": line = `socks5://${user}:${pass}@${host}:${port}`; break;
                default: line = `${user}:${pass}@${host}:${port}`;
            }
            lines.push(line);
        }
        return lines.join("\n");
    };

    const output = generate();

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.01em" }}>Generator</span>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2, fontFamily: "var(--font-sans,system-ui)" }}>Configure and export your proxy list.</p>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Proxy Type</label>
                    <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4 }}>
                        {(["rotating", "sticky"] as const).map(t => (
                            <button key={t} type="button" onClick={() => setProxyType(t)}
                                style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: proxyType === t ? "rgba(255,255,255,0.08)" : "transparent", color: proxyType === t ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize" as const }}>
                                <Icon icon={t === "rotating" ? "ph:arrows-clockwise" : "ph:lock-key"} />
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Country</label>
                        <select value={country} onChange={e => setCountry(e.target.value)}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}>
                            {COUNTRIES.map(c => <option key={c.code} value={c.code} style={{ background: "#0a0a0a" }}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Quantity</label>
                        <input type="number" min="1" max="10000" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none" }} />
                    </div>
                </div>
                <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontFamily: "var(--font-sans,system-ui)" }}>Output Format</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {FORMATS.map(f => {
                            const on = format === f.id;
                            return (
                                <button key={f.id} type="button" onClick={() => setFormat(f.id)}
                                    style={{ padding: "10px", borderRadius: 8, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.05)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.02)", textAlign: "left" as const, cursor: "pointer", transition: "all 0.2s" }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: on ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)", marginBottom: 2 }}>{f.label}</div>
                                    <div style={{ fontSize: 10, color: on ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)" }}>{f.sub}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div style={{ position: "relative" }}>
                    <textarea readOnly value={output}
                        style={{ width: "100%", height: 140, padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", background: "#0a0a0a", color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "monospace", resize: "none", outline: "none" }} />
                    <button type="button" onClick={() => { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
                        style={{ position: "absolute", top: 8, right: 8, padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: copied ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)", color: copied ? "rgb(52,211,153)" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-sans,system-ui)" }}>
                        <Icon icon={copied ? "ph:check-bold" : "ph:copy"} style={{ fontSize: 12 }} />
                        {copied ? "Copied!" : "Copy all"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function ActivePlanCard({ plan, onRefetch }: { plan: Plan; onRefetch: () => void }) {
    const toast = useToast();
    const [showExtend, setShowExtend] = useState(false);
    const [addGb, setAddGb] = useState(5);

    const extend = trpc.flashproxy.extendPlan.useMutation({
        onSuccess: () => { toast("success", `Added ${addGb} GB successfully.`); onRefetch(); setShowExtend(false); },
        onError: e => toast("error", e.message),
    });
    const cancel = trpc.flashproxy.cancelPlan.useMutation({
        onSuccess: () => { toast("success", "Plan cancelled."); onRefetch(); },
        onError: e => toast("error", e.message),
    });

    const gbUsed = (plan.limits.bytes_used ?? 0) / 1e9;
    const gbMax = plan.limits.max_gb ?? 0;
    const pct = gbMax > 0 ? Math.min((gbUsed / gbMax) * 100, 100) : 0;
    const color = pct > 85 ? "rgb(239,68,68)" : pct > 60 ? "rgb(251,191,36)" : "rgb(52,211,153)";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden" }}>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgb(52,211,153)", boxShadow: "0 0 8px rgba(52,211,153,0.6)" }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>Active Plan</span>
                    </div>
                    <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 6, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)", color: "rgba(52,211,153,0.8)", fontWeight: 600, fontFamily: "var(--font-sans,system-ui)" }}>ONLINE</span>
                </div>
                <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>{gbUsed.toFixed(3)} GB used</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>{gbMax.toFixed(2)} GB total</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                            style={{ height: "100%", borderRadius: 99, background: color }} />
                    </div>
                    <div style={{ marginTop: 5, textAlign: "right" as const }}>
                        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans,system-ui)" }}>{Math.max(0, gbMax - gbUsed).toFixed(3)} GB remaining</span>
                    </div>
                    {plan.expires_at && (
                        <p style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>
                            Expires {new Date(plan.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
                    <CredentialRow label="Username" value={plan.proxy_username} mono />
                    <CredentialRow label="Password" value={plan.proxy_password} mono />
                    <CredentialRow label="Host (HTTP)" value={`${plan.connection.hostname}:${plan.connection.port_http}`} mono />
                    {plan.connection.port_socks && <CredentialRow label="Host (SOCKS5)" value={`${plan.connection.hostname}:${plan.connection.port_socks}`} mono />}
                    <CredentialRow label="Full String" value={plan.connection.format} mono />
                </div>
            </motion.div>

            <ProxyGenerator plan={plan} />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                style={{ borderRadius: 14, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", padding: "16px 20px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 14 }}>Manage Plan</p>
                <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={() => setShowExtend(v => !v)}
                        style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,107,0,0.25)", background: "rgba(255,107,0,0.07)", color: "rgba(255,107,0,0.85)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <Icon icon="ph:plus-circle" style={{ fontSize: 14 }} /> Add GB
                    </button>
                    <button type="button" onClick={() => { if (confirm("Cancel this plan? No refund will be issued.")) cancel.mutate({ planId: plan.plan_id }); }} disabled={cancel.isPending}
                        style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "rgba(239,68,68,0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)" }}>
                        {cancel.isPending ? <Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} /> : "Cancel"}
                    </button>
                </div>
                <AnimatePresence>
                    {showExtend && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 12 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 10 }}>
                                {PRESETS.map(v => {
                                    const on = addGb === v;
                                    return (
                                        <button key={v} type="button" onClick={() => setAddGb(v)}
                                            style={{ padding: "9px 6px", borderRadius: 9, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                            +{v} GB
                                        </button>
                                    );
                                })}
                            </div>
                            <button type="button" disabled={extend.isPending} onClick={() => extend.mutate({ planId: plan.plan_id, add_bandwidth_gb: addGb })}
                                style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "hsl(24, 100%, 45%)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                                {extend.isPending ? <><Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} />Processing…</> : `Add ${addGb} GB`}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function PurchasePanel({ balance, pricePerGb, product, onSuccess }: { balance: number; pricePerGb: number; product: "residential-lite" | "residential"; onSuccess: () => void }) {
    const [gb, setGb] = useState(5);
    const [custom, setCustom] = useState(false);
    const [customVal, setCustomVal] = useState("");
    const toast = useToast();

    const create = trpc.flashproxy.createPlan.useMutation({
        onSuccess: () => { toast("success", "Plan created!"); onSuccess(); },
        onError: e => toast("error", e.message),
    });

    const activeGb = custom ? (parseFloat(customVal) || 0) : gb;
    const totalCost = +(activeGb * pricePerGb).toFixed(2);
    const canAfford = balance >= totalCost;
    const valid = activeGb >= 1;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 14 }}>How much bandwidth?</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 10 }}>
                    {PRESETS.map(v => {
                        const on = !custom && gb === v;
                        return (
                            <button key={v} type="button" onClick={() => { setCustom(false); setGb(v); }}
                                style={{ padding: "10px 6px", borderRadius: 10, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.13s" }}>
                                {v} GB
                            </button>
                        );
                    })}
                </div>
                <button type="button" onClick={() => setCustom(true)}
                    style={{ fontSize: 12, color: "rgba(255,107,0,0.85)", background: "rgba(255,107,0,0.05)", border: custom ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,107,0,0.15)", borderRadius: "8px", cursor: "pointer", padding: "6px 12px", fontWeight: 600, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "var(--font-sans,system-ui)" }}>
                    <Icon icon={custom ? "ph:pencil-simple-fill" : "ph:plus-bold"} style={{ fontSize: 13 }} />
                    {custom ? "Editing custom amount" : "Enter custom amount"}
                </button>
                <AnimatePresence>
                    {custom && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <input type="number" min="1" placeholder="e.g. 20" value={customVal} onChange={e => setCustomVal(e.target.value)} autoFocus
                                    style={{ flex: 1, padding: "9px 13px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", color: "rgba(235,235,235,0.88)", fontSize: 13, outline: "none", fontFamily: "var(--font-sans,system-ui)" }} />
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>GB</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.055)" }}>
                {[["Rate", `$${pricePerGb.toFixed(2)} / GB`], ["Bandwidth", `${activeGb} GB`]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: "#fff", fontFamily: "var(--font-sans,system-ui)" }}>{k}</span>
                        <span style={{ fontSize: 12, color: "#fff", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>{v}</span>
                    </div>
                ))}
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-sans,system-ui)" }}>Total</span>
                    <span style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: valid ? "#FFFFFF" : "rgba(255,255,255,0.2)" }}>${totalCost.toFixed(2)}</span>
                </div>
                {!canAfford && valid && <p style={{ fontSize: 11, color: "rgba(239,68,68,0.7)", marginTop: 8, fontFamily: "var(--font-sans,system-ui)" }}>Insufficient balance. You have ${balance.toFixed(2)}.</p>}
            </div>

            <button type="button" disabled={create.isPending || !valid || !canAfford}
                onClick={() => create.mutate({ product, bandwidth_gb: activeGb })}
                style={{ width: "80%", alignSelf: "center", padding: "10px", borderRadius: 11, border: "none", background: valid && canAfford ? "hsl(24, 100%, 45%)" : "rgba(255,255,255,0.05)", color: valid && canAfford ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.18)", fontSize: 13.5, fontWeight: 600, cursor: valid && canAfford && !create.isPending ? "pointer" : "not-allowed", boxShadow: valid && canAfford ? "0 1px 3px rgba(0,0,0,0.4)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-sans,system-ui)" }}>
                {create.isPending ? <><Icon icon="ph:spinner" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} />Processing...</> : `Purchase — $${totalCost.toFixed(2)}`}
            </button>
        </div>
    );
}

type Tab = "budget" | "premium";

const TAB_CONFIG = {
    budget: {
        product: "residential-lite" as const,
        label: "Budget",
        tagline: "Cost-effective residential IPs",
        pricingKey: "residential-lite",
        defaultPrice: 0.50,
        icon: "ph:currency-dollar",
        accentColor: "rgb(52,211,153)",
        features: ["15M+ IPs · 195+ countries", "HTTP & SOCKS5", "Pay-as-you-go"],
    },
    premium: {
        product: "residential" as const,
        label: "Premium",
        tagline: "High-quality residential IPs",
        pricingKey: "residential",
        defaultPrice: 1.00,
        icon: "ph:star",
        accentColor: "rgb(255,107,0)",
        features: ["Premium IP pool · 195+ countries", "HTTP & SOCKS5", "Higher success rates"],
    },
};

export default function ResidentialGbPage() {
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const { data: user, isLoading: userLoading, error } = trpc.auth.me.useQuery();
    const { data: pricing } = trpc.flashproxy.getPricing.useQuery();
    const [tab, setTab] = useState<Tab>("budget");

    const cfg = TAB_CONFIG[tab];

    const { data: plans, isLoading: plansLoading, refetch } = trpc.flashproxy.listPlans.useQuery({ product: cfg.product, status: "active" });

    useEffect(() => { if (!userLoading && (error || !user)) router.replace("/login"); }, [userLoading, error, user, router]);

    if (userLoading || !user) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 24, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    const activePlans: Plan[] = plans?.items ?? [];
    const activePlan = activePlans[0] ?? null;
    const pricePerGb = pricing?.[cfg.pricingKey]?.price_per_gb_cents
        ? pricing[cfg.pricingKey].price_per_gb_cents / 100
        : cfg.defaultPrice;

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 20px 40px" : "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(255,107,0,0.9)", fontFamily: "var(--font-sans,system-ui)" }}>Residential</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "2rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>
                    Residential GB Proxies
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)" }}>
                    Pay-as-you-go · Real residential IPs · 195+ countries · HTTP &amp; SOCKS5
                </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} style={{ marginBottom: 32 }}>
                <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4, border: "1px solid rgba(255,255,255,0.06)" }}>
                    {(["budget", "premium"] as Tab[]).map(t => {
                        const on = tab === t;
                        const c = TAB_CONFIG[t];
                        return (
                            <button key={t} type="button" onClick={() => setTab(t)}
                                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, border: "none", background: on ? "rgba(255,255,255,0.07)" : "transparent", cursor: "pointer", transition: "all 0.18s", position: "relative" as const }}>
                                {on && (
                                    <motion.div layoutId="tab-pill" style={{ position: "absolute", inset: 0, borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }} transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                                )}
                                <Icon icon={c.icon} style={{ fontSize: 14, color: on ? c.accentColor : "rgba(255,255,255,0.35)", position: "relative" as const, zIndex: 1, transition: "color 0.18s" }} />
                                <span style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: on ? "#FFFFFF" : "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em", position: "relative" as const, zIndex: 1, transition: "color 0.18s" }}>{c.label}</span>
                                {t === "budget" && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(52,211,153,0.12)", color: "rgba(52,211,153,0.8)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.05em", position: "relative" as const, zIndex: 1 }}>CHEAP</span>}
                                {t === "premium" && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(255,107,0,0.12)", color: "rgba(255,107,0,0.8)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.05em", position: "relative" as const, zIndex: 1 }}>QUALITY</span>}
                            </button>
                        );
                    })}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, paddingLeft: 4 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans,system-ui)" }}>{cfg.tagline}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: cfg.accentColor, fontFamily: "var(--font-sans,system-ui)" }}>${pricePerGb.toFixed(2)}/GB</span>
                    {cfg.features.map(f => (
                        <span key={f} style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)" }}>· {f}</span>
                    ))}
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }}>
                    {plansLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                            <Icon icon="ph:spinner" style={{ fontSize: 22, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
                        </div>
                    ) : activePlan ? (
                        <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 320px", gap: 18, alignItems: "start" }}>
                            <ActivePlanCard plan={activePlan} onRefetch={refetch} />
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                                style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden", position: "sticky", top: 24 }}>
                                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <p style={{ fontSize: 13.5, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)" }}>Buy More</p>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 2, fontFamily: "var(--font-sans,system-ui)" }}>Balance: ${user.balance.toFixed(2)}</p>
                                </div>
                                <div style={{ padding: "16px 20px" }}>
                                    <PurchasePanel balance={user.balance} pricePerGb={pricePerGb} product={cfg.product} onSuccess={() => refetch()} />
                                </div>
                            </motion.div>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 440px", gap: 20, alignItems: "start" }}>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 14 }}>
                                    Why {cfg.label}?
                                </p>
                                {(tab === "budget" ? [
                                    { icon: "ph:lightning-fill", label: "Blazing fast", sub: "Optimised for high-volume scraping. Sub-second response times on most targets." },
                                    { icon: "ph:globe-hemisphere-west", label: "195+ countries", sub: "City and state-level geo-targeting. Use country codes in the username string." },
                                    { icon: "ph:arrows-clockwise", label: "Rotating & sticky sessions", sub: "Fresh IP per request or lock to the same IP for up to 60 minutes." },
                                    { icon: "ph:currency-dollar", label: "Cost-effective", sub: `At just $${pricePerGb.toFixed(2)}/GB — ideal for large-scale operations with tight budgets.` },
                                ] : [
                                    { icon: "ph:star", label: "Top-tier IP pool", sub: "Premium residential IPs with higher success rates on the hardest targets." },
                                    { icon: "ph:globe-hemisphere-west", label: "195+ countries", sub: "Same global coverage with a cleaner, higher-quality IP pool." },
                                    { icon: "ph:arrows-clockwise", label: "Rotating & sticky sessions", sub: "Fresh IP per request or hold sessions for up to 60 minutes." },
                                    { icon: "ph:shield-check", label: "Lower ban rates", sub: `Premium-grade IPs less likely to be flagged. Worth the extra $${(pricePerGb - TAB_CONFIG.budget.defaultPrice).toFixed(2)}/GB.` },
                                ]).map((f, i) => (
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
                                    <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.03em", marginBottom: 3 }}>Purchase Bandwidth</p>
                                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)" }}>Balance: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>${user.balance.toFixed(2)}</span></p>
                                </div>
                                <div style={{ padding: "22px" }}>
                                    <PurchasePanel balance={user.balance} pricePerGb={pricePerGb} product={cfg.product} onSuccess={() => refetch()} />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

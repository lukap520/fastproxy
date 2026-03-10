"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "@/hooks/useWindowSize";

const FORMATS = [
    { id: "user:pass@host:port", label: "user:pass@host:port" },
    { id: "host:port:user:pass", label: "host:port:user:pass" },
    { id: "http", label: "http:// URL" },
    { id: "socks5", label: "socks5:// URL" },
];

const PRODUCT_LABELS: Record<string, string> = {
    "residential-lite": "Residential Budget",
    "residential": "Residential Premium",
    "mobile": "Mobile",
    "datacenter": "Datacenter",
    "shared_isp": "Shared ISP",
    "ipv6-residential": "IPv6 Residential",
    "ipv6-datacenter": "IPv6 Datacenter",
    "unlimited_residential": "Unlimited Residential",
    "dedicated_mobile": "Dedicated Mobile",
    "dedicated_isp": "Dedicated ISP",
};

const PRODUCT_ICONS: Record<string, string> = {
    "residential-lite": "ph:globe-hemisphere-west",
    "residential": "ph:globe",
    "mobile": "ph:device-mobile",
    "datacenter": "ph:buildings",
    "shared_isp": "ph:broadcast",
    "ipv6-residential": "ph:network",
    "ipv6-datacenter": "ph:hard-drives",
    "unlimited_residential": "ph:wave-sine",
    "dedicated_mobile": "ph:sim-card",
    "dedicated_isp": "ph:lock-key",
};

const GEO_PRODUCTS = new Set([
    "residential-lite", "residential", "mobile",
    "datacenter", "shared_isp", "ipv6-residential", "ipv6-datacenter"
]);

type Plan = {
    plan_id: string;
    product: string;
    proxy_username: string;
    proxy_password: string;
    connection: { hostname: string; port_http: number; port_socks: number | null; format: string };
    limits: { max_gb: number | null; bytes_used: number; bandwidth_mbps?: number };
    expires_at: string | null;
    billing_type: string;
    status: string;
};

type Country = { name: string; iso_code: string };

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button type="button" onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); }}
            style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", gap: 5, color: copied ? "rgb(52,211,153)" : "rgba(255,255,255,0.35)", transition: "color 0.15s", fontSize: 11, fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>
            <Icon icon={copied ? "ph:check-bold" : "ph:copy"} style={{ fontSize: 13 }} />
            {copied ? "Copied" : "Copy"}
        </button>
    );
}

function PlanGenerator({ plan }: { plan: Plan }) {
    const [proxyType, setProxyType] = useState<"rotating" | "sticky">("rotating");
    const [country, setCountry] = useState("any");
    const [quantity, setQuantity] = useState(10);
    const [format, setFormat] = useState("user:pass@host:port");
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    const product = plan.product;
    const isIPv6 = product === "ipv6-residential" || product === "ipv6-datacenter";
    const isUnlimited = product === "unlimited_residential";
    const isDedicated = product === "dedicated_mobile" || product === "dedicated_isp";
    const supportsGeo = GEO_PRODUCTS.has(product) && !isIPv6;

    const geoProductType = product as "residential" | "residential-lite" | "mobile" | "datacenter" | "shared_isp" | "ipv6-residential" | "ipv6-datacenter";

    const { data: countriesData } = trpc.flashproxy.getCountries.useQuery(
        { product_type: geoProductType },
        { enabled: open && supportsGeo, staleTime: 10 * 60 * 1000 }
    );

    const countries: Country[] = countriesData?.countries ?? [];

    const gbUsed = (plan.limits.bytes_used ?? 0) / 1e9;
    const gbMax = plan.limits.max_gb ?? 0;
    const pct = gbMax > 0 ? Math.min((gbUsed / gbMax) * 100, 100) : 0;
    const barColor = pct > 85 ? "rgb(239,68,68)" : pct > 60 ? "rgb(251,191,36)" : "rgb(52,211,153)";

    const generate = () => {
        const host = plan.connection.hostname;
        const port = plan.connection.port_http;
        const pass = plan.proxy_password;
        const lines: string[] = [];
        for (let i = 0; i < quantity; i++) {
            let user = plan.proxy_username;
            if (supportsGeo && country !== "any") user += `-country-${country}`;
            if (supportsGeo && proxyType === "sticky") user += `-session-${Math.random().toString(36).slice(2, 10)}-ttl-3600`;
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

    const output = open ? generate() : "";

    return (
        <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden" }}>
            <button type="button" onClick={() => setOpen(v => !v)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,107,0,0.07)", border: "1px solid rgba(255,107,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon icon={PRODUCT_ICONS[plan.product] ?? "ph:globe"} style={{ fontSize: 17, color: "rgba(255,107,0,0.75)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>
                            {PRODUCT_LABELS[plan.product] ?? plan.product}
                        </span>
                        <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 5, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)", color: "rgba(52,211,153,0.8)", fontWeight: 700, letterSpacing: "0.06em" }}>ACTIVE</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{plan.proxy_username}</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>·</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans,system-ui)" }}>{plan.connection.hostname}</span>
                    </div>
                </div>
                {gbMax > 0 && (
                    <div style={{ width: 80, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: barColor, transition: "width 0.5s" }} />
                        </div>
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)", textAlign: "right" }}>{gbUsed.toFixed(2)}/{gbMax} GB</span>
                    </div>
                )}
                {isUnlimited && plan.expires_at && (
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)", flexShrink: 0 }}>
                        Exp. {new Date(plan.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                )}
                <Icon icon={open ? "ph:caret-up" : "ph:caret-down"} style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "20px", display: "flex", flexDirection: "column", gap: 18 }}>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                                {[
                                    { label: "Username", value: plan.proxy_username },
                                    { label: "Password", value: plan.proxy_password },
                                    { label: "Host (HTTP)", value: `${plan.connection.hostname}:${plan.connection.port_http}` },
                                    { label: "Full String", value: plan.connection.format },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 4 }}>{label}</p>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <p style={{ fontSize: 11, color: "#fff", fontFamily: "monospace", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, flex: 1, minWidth: 0 }}>{value}</p>
                                            <CopyButton text={value} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />

                            <div style={{ display: "grid", gridTemplateColumns: supportsGeo ? "1fr 1fr 1fr" : "1fr 1fr", gap: 12 }}>
                                {supportsGeo && (
                                    <div>
                                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 7, fontFamily: "var(--font-sans,system-ui)" }}>Type</label>
                                        <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: 9, padding: 3 }}>
                                            {(["rotating", "sticky"] as const).map(t => (
                                                <button key={t} type="button" onClick={() => setProxyType(t)}
                                                    style={{ flex: 1, padding: "7px", borderRadius: 7, border: "none", background: proxyType === t ? "rgba(255,255,255,0.08)" : "transparent", color: proxyType === t ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, textTransform: "capitalize" as const, transition: "all 0.15s" }}>
                                                    <Icon icon={t === "rotating" ? "ph:arrows-clockwise" : "ph:lock-key"} style={{ fontSize: 12 }} />
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {supportsGeo && (
                                    <div>
                                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 7, fontFamily: "var(--font-sans,system-ui)" }}>
                                            Country{countriesData?.total ? ` (${countriesData.total})` : ""}
                                        </label>
                                        <select value={country} onChange={e => setCountry(e.target.value)}
                                            style={{ width: "100%", padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 12, outline: "none", appearance: "none" as any }}>
                                            <option value="any" style={{ background: "#0a0a0a" }}>Any country</option>
                                            {countries.map(c => (
                                                <option key={c.iso_code} value={c.iso_code} style={{ background: "#0a0a0a" }}>{c.name} ({c.iso_code})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 7, fontFamily: "var(--font-sans,system-ui)" }}>Quantity</label>
                                    <input type="number" min="1" max="10000" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        style={{ width: "100%", padding: "8px 11px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 12, outline: "none" }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 7, fontFamily: "var(--font-sans,system-ui)" }}>Output Format</label>
                                <div style={{ display: "flex", gap: 6 }}>
                                    {FORMATS.map(f => {
                                        const on = format === f.id;
                                        return (
                                            <button key={f.id} type="button" onClick={() => setFormat(f.id)}
                                                style={{ flex: 1, padding: "7px 6px", borderRadius: 8, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.05)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.02)", color: on ? "rgba(255,107,0,0.9)" : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", textAlign: "center" as const, fontFamily: "var(--font-sans,system-ui)" }}>
                                                {f.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ position: "relative" }}>
                                <textarea readOnly value={output}
                                    style={{ width: "100%", height: 140, padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", background: "#050505", color: "rgba(255,255,255,0.7)", fontSize: 11.5, fontFamily: "monospace", resize: "none", outline: "none", lineHeight: 1.7 }} />
                                <button type="button" onClick={() => { navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
                                    style={{ position: "absolute", top: 8, right: 8, padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: copied ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)", color: copied ? "rgb(52,211,153)" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-sans,system-ui)" }}>
                                    <Icon icon={copied ? "ph:check-bold" : "ph:copy"} style={{ fontSize: 12 }} />
                                    {copied ? "Copied!" : "Copy all"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

const ALL_PRODUCTS = ["residential-lite", "residential", "mobile", "datacenter", "shared_isp", "ipv6-residential", "ipv6-datacenter", "unlimited_residential"];

export default function ProxyGeneratorPage() {
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const { data: user, isLoading: userLoading, error } = trpc.auth.me.useQuery();

    const queries = ALL_PRODUCTS.map(product =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        trpc.flashproxy.listPlans.useQuery({ product: product as any, status: "active" })
    );

    useEffect(() => { if (!userLoading && (error || !user)) router.replace("/login"); }, [userLoading, error, user, router]);

    const isLoading = userLoading || queries.some(q => q.isLoading);
    const allPlans: Plan[] = queries.flatMap(q => (q.data?.items ?? []) as Plan[]).filter(p => p?.plan_id);

    if (userLoading || !user) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 24, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 16px 40px" : "52px 56px", maxWidth: 1100, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(255,107,0,0.9)", fontFamily: "var(--font-sans,system-ui)" }}>Tools</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "2rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>
                    Proxy Generator
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans,system-ui)" }}>
                    Generate proxy lists from all your active plans. Click a plan to expand its generator.
                </p>
            </motion.div>

            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                    <Icon icon="ph:spinner" style={{ fontSize: 24, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
                </div>
            ) : allPlans.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", borderRadius: 20, background: "rgba(255,255,255,0.008)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                        <Icon icon="ph:wifi-slash" style={{ fontSize: 24, color: "rgba(255,107,0,0.5)" }} />
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.02em", marginBottom: 6 }}>No active plans</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans,system-ui)", maxWidth: 320, lineHeight: 1.6 }}>
                        Purchase a proxy plan from the sidebar to start generating proxies.
                    </p>
                </motion.div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 6 }}>
                        {allPlans.length} active plan{allPlans.length !== 1 ? "s" : ""} · click to expand
                    </p>
                    {allPlans.map((plan, i) => (
                        <motion.div key={plan.plan_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                            <PlanGenerator plan={plan} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

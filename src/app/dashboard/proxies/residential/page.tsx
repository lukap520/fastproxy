"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

const PRICE_PER_GB = 1.60;
const PRESETS = [1, 3, 5, 10, 25, 50];

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };
    return (
        <button type="button" onClick={copy} style={{ background: "none", border: "none", padding: "4px 6px", cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", gap: 5, color: copied ? "rgb(52,211,153)" : "rgba(255,255,255,0.3)", transition: "color 0.15s", fontSize: 11, fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>
            <Icon icon={copied ? "ph:check-bold" : "ph:copy"} style={{ fontSize: 13 }} />
            {copied ? "Copied" : "Copy"}
        </button>
    );
}

function UsageBar({ used, allocated }: { used: number; allocated: number }) {
    const pct = allocated > 0 ? Math.min((used / allocated) * 100, 100) : 0;
    const color = pct > 85 ? "rgb(239,68,68)" : pct > 60 ? "rgb(251,191,36)" : "rgb(52,211,153)";
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>
                    {used.toFixed(2)} GB used
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>
                    {allocated.toFixed(2)} GB total
                </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ height: "100%", borderRadius: 99, background: color }}
                />
            </div>
            <div style={{ marginTop: 5, textAlign: "right" as const }}>
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)" }}>
                    {(allocated - used).toFixed(2)} GB remaining
                </span>
            </div>
        </div>
    );
}

function PurchasePanel({ balance, onSuccess }: { balance: number; onSuccess: () => void }) {
    const [gb, setGb] = useState(5);
    const [custom, setCustom] = useState(false);
    const [customVal, setCustomVal] = useState("");
    const toast = useToast();

    const buy = trpc.proxy.buyGb.useMutation({
        onSuccess: () => {
            toast("success", "Proxy activated! Your credentials are ready.");
            onSuccess();
        },
        onError: (e) => toast("error", e.message),
    });

    const activeGb = custom ? (parseFloat(customVal) || 0) : gb;
    const totalCost = +(activeGb * PRICE_PER_GB).toFixed(2);
    const canAfford = balance >= totalCost;
    const valid = activeGb >= 1;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.16)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 14 }}>
                    How much bandwidth?
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 10 }}>
                    {PRESETS.map((v) => {
                        const on = !custom && gb === v;
                        return (
                            <button key={v} type="button" onClick={() => { setCustom(false); setGb(v); }}
                                style={{ padding: "10px 6px", borderRadius: 10, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-sans,system-ui)", cursor: "pointer", transition: "all 0.13s", textAlign: "center" as const }}
                                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "rgba(255,255,255,0.035)"; }}
                                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "rgba(255,255,255,0.018)"; }}>
                                {v} GB
                            </button>
                        );
                    })}
                </div>

                <button type="button" onClick={() => setCustom(true)}
                    style={{ fontSize: 11.5, color: custom ? "rgba(255,107,0,0.8)" : "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)", background: "none", border: "none", cursor: "pointer", padding: 0, letterSpacing: "-0.01em" }}>
                    {custom ? "↳ Entering custom amount" : "Enter custom amount →"}
                </button>

                <AnimatePresence>
                    {custom && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 20"
                                    value={customVal}
                                    onChange={(e) => setCustomVal(e.target.value)}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    autoFocus
                                    style={{ flex: 1, padding: "9px 13px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", color: "rgba(235,235,235,0.88)", fontSize: 13, fontFamily: "var(--font-sans,system-ui)", outline: "none" }}
                                    onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.4)"; }}
                                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                                />
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>GB</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.055)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>Rate</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>${PRICE_PER_GB.toFixed(2)} / GB</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>Bandwidth</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>{activeGb} GB</span>
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "10px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans,system-ui)" }}>Total</span>
                    <span style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: valid ? "rgba(235,235,235,0.88)" : "rgba(255,255,255,0.2)" }}>
                        ${totalCost.toFixed(2)}
                    </span>
                </div>
                {!canAfford && valid && (
                    <p style={{ fontSize: 11, color: "rgba(239,68,68,0.7)", marginTop: 8, fontFamily: "var(--font-sans,system-ui)" }}>
                        Insufficient balance. <span style={{ color: "rgba(255,255,255,0.3)" }}>You have ${balance.toFixed(2)}.</span>
                    </p>
                )}
            </div>

            <button type="button" disabled={buy.isPending || !valid || !canAfford}
                onClick={() => buy.mutate({ gb: activeGb })}
                style={{ width: "100%", padding: "14px", borderRadius: 11, border: "none", background: valid && canAfford ? "hsl(24, 100%, 45%)" : "rgba(255,255,255,0.05)", color: valid && canAfford ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.18)", fontSize: 13.5, fontWeight: 600, fontFamily: "var(--font-sans,system-ui)", cursor: valid && canAfford && !buy.isPending ? "pointer" : "not-allowed", boxShadow: valid && canAfford ? "0 1px 3px rgba(0,0,0,0.4)" : "none", transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "-0.01em" }}
                onMouseEnter={(e) => { if (valid && canAfford && !buy.isPending) e.currentTarget.style.background = "hsl(24, 100%, 39%)"; }}
                onMouseLeave={(e) => { if (valid && canAfford) e.currentTarget.style.background = "hsl(24, 100%, 45%)"; }}
                onMouseDown={(e) => { if (valid && canAfford) e.currentTarget.style.transform = "translateY(1px)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
            >
                {buy.isPending
                    ? <><Icon icon="ph:spinner" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} />Activating…</>
                    : <><Icon icon="ph:lightning-fill" style={{ fontSize: 15 }} />Activate {activeGb} GB — ${totalCost.toFixed(2)}</>
                }
            </button>
        </div>
    );
}

function TopUpPanel({ balance, onSuccess }: { proxy: { allocatedGb: number; gbUsed: number }; balance: number; onSuccess: () => void }) {
    const [gb, setGb] = useState(5);
    const toast = useToast();

    const buy = trpc.proxy.buyGb.useMutation({
        onSuccess: () => {
            toast("success", `Added ${gb} GB successfully.`);
            onSuccess();
        },
        onError: (e) => toast("error", e.message),
    });

    const totalCost = +(gb * PRICE_PER_GB).toFixed(2);
    const canAfford = balance >= totalCost;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.16)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 2 }}>
                Add bandwidth
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7 }}>
                {[1, 3, 5, 10, 25, 50].map((v) => {
                    const on = gb === v;
                    return (
                        <button key={v} type="button" onClick={() => setGb(v)}
                            style={{ padding: "9px 6px", borderRadius: 9, border: on ? "1px solid rgba(255,107,0,0.4)" : "1px solid rgba(255,255,255,0.06)", background: on ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.018)", color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-sans,system-ui)", cursor: "pointer", transition: "all 0.13s" }}
                            onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "rgba(255,255,255,0.032)"; }}
                            onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "rgba(255,255,255,0.018)"; }}>
                            +{v} GB
                        </button>
                    );
                })}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans,system-ui)" }}>Cost</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.03em", color: canAfford ? "rgba(235,235,235,0.85)" : "rgba(239,68,68,0.7)" }}>${totalCost.toFixed(2)}</span>
                    {!canAfford && <span style={{ fontSize: 10.5, color: "rgba(239,68,68,0.6)", fontFamily: "var(--font-sans,system-ui)" }}>Low balance</span>}
                </div>
            </div>
            <button type="button" disabled={buy.isPending || !canAfford}
                onClick={() => buy.mutate({ gb })}
                style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: canAfford ? "hsl(24, 100%, 45%)" : "rgba(255,255,255,0.05)", color: canAfford ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.18)", fontSize: 13, fontWeight: 600, cursor: canAfford && !buy.isPending ? "pointer" : "not-allowed", transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em", boxShadow: canAfford ? "0 1px 3px rgba(0,0,0,0.4)" : "none" }}
                onMouseEnter={(e) => { if (canAfford && !buy.isPending) e.currentTarget.style.background = "hsl(24, 100%, 39%)"; }}
                onMouseLeave={(e) => { if (canAfford) e.currentTarget.style.background = "hsl(24, 100%, 45%)"; }}
                onMouseDown={(e) => { if (canAfford) e.currentTarget.style.transform = "translateY(1px)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}>
                {buy.isPending
                    ? <><Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} />Processing…</>
                    : <><Icon icon="ph:plus-circle" style={{ fontSize: 14 }} />Add {gb} GB</>
                }
            </button>
        </div>
    );
}

function CredentialRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.016)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 12.5, color: "rgba(235,235,235,0.78)", fontFamily: mono ? "monospace" : "var(--font-sans,system-ui)", letterSpacing: mono ? "0.03em" : "-0.01em", fontWeight: 500 }}>{value}</p>
            </div>
            <CopyButton text={value} />
        </div>
    );
}

export default function ResidentialGBPage() {
    const router = useRouter();
    const { data: user, isLoading: userLoading, error } = trpc.auth.me.useQuery();
    const { data: proxy, isLoading: proxyLoading, refetch } = trpc.proxy.getMyProxy.useQuery();

    useEffect(() => {
        if (!userLoading && (error || !user)) router.replace("/login");
    }, [userLoading, error, user, router]);

    if (userLoading || proxyLoading || !user) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 24, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    const proxyHost = "gate.maskify.su:8080";

    return (
        <div style={{ flex: 1, padding: "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 44 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                    <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(255,107,0,0.6)", fontFamily: "var(--font-sans,system-ui)" }}>Residential</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "2rem", fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 6 }}>
                    Residential GB Proxies
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.24)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>
                    Pay-as-you-go. <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>${PRICE_PER_GB.toFixed(2)} / GB</span> · 150M+ IPs · 195 countries · HTTP/SOCKS5
                </p>
            </motion.div>

            {proxy ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                            style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden" }}>
                            <div style={{ position: "relative", padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgb(52,211,153)", boxShadow: "0 0 8px rgba(52,211,153,0.6)" }} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(235,235,235,0.82)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>Active Proxy</span>
                                </div>
                                <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 6, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)", color: "rgba(52,211,153,0.8)", fontWeight: 600, fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.03em" }}>ONLINE</span>
                            </div>
                            <div style={{ padding: "18px 20px" }}>
                                <UsageBar used={proxy.gbUsed} allocated={proxy.allocatedGb} />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden" }}>
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(235,235,235,0.8)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>Credentials</span>
                            </div>
                            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                                <CredentialRow label="Username" value={proxy.username} mono />
                                <CredentialRow label="Password" value={proxy.password} mono />
                                <CredentialRow label="Host / Port" value={proxyHost} mono />
                                <CredentialRow label="Full Proxy String" value={`${proxy.username}:${proxy.password}@${proxyHost}`} mono />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                            style={{ padding: "14px 18px", borderRadius: 13, background: "rgba(255,107,0,0.04)", border: "1px solid rgba(255,107,0,0.1)", display: "flex", gap: 10 }}>
                            <Icon icon="ph:info" style={{ fontSize: 15, color: "rgba(255,107,0,0.55)", flexShrink: 0, marginTop: 1 }} />
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)", lineHeight: 1.6 }}>
                                Proxies are authenticated by username and password. Configure with HTTP or SOCKS5. Session rotation is automatic on each new connection. For sticky sessions, append <code style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4 }}>-session-[id]</code> to your username.
                            </p>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                        style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", overflow: "hidden", position: "sticky", top: 24 }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(235,235,235,0.8)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>Top Up</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 2, fontFamily: "var(--font-sans,system-ui)" }}>Balance: ${user.balance.toFixed(2)}</p>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                            <TopUpPanel proxy={proxy} balance={user.balance} onSuccess={() => refetch()} />
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: 20, alignItems: "start" }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                        <div style={{ marginBottom: 24 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.16)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 14 }}>
                                Why residential?
                            </p>
                            {[
                                { icon: "ph:shield-check", label: "Real residential IPs", sub: "Sourced from real devices, not data centers. Near-zero detection rate." },
                                { icon: "ph:globe-hemisphere-west", label: "150M+ IP pool", sub: "Rotate across 195+ countries. City and state-level targeting available." },
                                { icon: "ph:arrows-clockwise", label: "Rotating & sticky", sub: "New IP per request or maintain a sticky session for up to 24 hours." },
                                { icon: "ph:lightning-fill", label: "HTTP & SOCKS5", sub: "Supports both protocols. Use with any scraping tool or browser." },
                            ].map((f, i) => (
                                <motion.div key={f.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                                    style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,107,0,0.07)", border: "1px solid rgba(255,107,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                        <Icon icon={f.icon} style={{ fontSize: 16, color: "rgba(255,107,0,0.65)" }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(235,235,235,0.78)", fontFamily: "var(--font-sans,system-ui)", marginBottom: 3, letterSpacing: "-0.01em" }}>{f.label}</p>
                                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-sans,system-ui)", lineHeight: 1.55 }}>{f.sub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        style={{ borderRadius: 18, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "sticky", top: 24 }}>
                        <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "linear-gradient(90deg,transparent 10%,rgba(255,107,0,0.2) 50%,transparent 90%)", pointerEvents: "none" }} />
                        <div style={{ padding: "20px 22px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.88)", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.03em", marginBottom: 3 }}>Purchase Bandwidth</p>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)" }}>
                                Balance: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>${user.balance.toFixed(2)}</span>
                            </p>
                        </div>
                        <div style={{ padding: "22px" }}>
                            <PurchasePanel balance={user.balance} onSuccess={() => refetch()} />
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

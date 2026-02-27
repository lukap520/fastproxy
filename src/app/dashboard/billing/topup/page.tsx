"use client";

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useWindowSize } from "@/hooks/useWindowSize";

const CRYPTOS = [
    { id: "btc", symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network", icon: "cryptocurrency:btc", accent: "#F7931A" },
    { id: "eth", symbol: "ETH", name: "Ethereum", network: "ERC-20", icon: "cryptocurrency:eth", accent: "#627EEA" },
    { id: "usdt", symbol: "USDT", name: "Tether", network: "TRC-20", icon: "cryptocurrency:usdt", accent: "#26A17B" },
    { id: "usdc", symbol: "USDC", name: "USD Coin", network: "ERC-20", icon: "cryptocurrency:usdc", accent: "#2775CA" },
    { id: "sol", symbol: "SOL", name: "Solana", network: "Solana Network", icon: "cryptocurrency:sol", accent: "#9945FF" },
    { id: "ltc", symbol: "LTC", name: "Litecoin", network: "Litecoin Network", icon: "cryptocurrency:ltc", accent: "#BFBBBB" },
    { id: "bnb", symbol: "BNB", name: "BNB", network: "BEP-20", icon: "cryptocurrency:bnb", accent: "#F3BA2F" },
    { id: "xmr", symbol: "XMR", name: "Monero", network: "Monero Network", icon: "cryptocurrency:xmr", accent: "#FF6600" },
] as const;

type CryptoId = typeof CRYPTOS[number]["id"];
const QUICK = [10, 25, 50, 100, 250, 500];

export default function TopUpPage() {
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const toast = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: user, isLoading, error } = trpc.auth.me.useQuery();
    const [amount, setAmount] = useState("50");
    const [crypto, setCrypto] = useState<CryptoId | null>(null);

    const createInvoice = trpc.billing.createInvoice.useMutation({
        onSuccess: ({ id }) => router.push(`/dashboard/invoice/${id}`),
        onError: (e) => toast("error", e.message),
    });

    useEffect(() => {
        if (!isLoading && (error || !user)) router.replace("/login");
    }, [isLoading, error, user, router]);

    const num = parseFloat(amount) || 0;
    const selected = CRYPTOS.find((c) => c.id === crypto);
    const ready = num >= 2 && crypto !== null;

    if (!user) return null;

    return (
        <div style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: isSmall ? "80px 20px 40px" : "60px 56px",
            minHeight: "100vh",
            position: "relative",
        }}>
            <div style={{ width: "100%", maxWidth: 600, position: "relative" }}>

                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ marginBottom: 44 }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                        <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                        <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
                            textTransform: "uppercase" as const,
                            color: "rgba(255,107,0,0.95)",
                            fontFamily: "var(--font-sans,system-ui)",
                            textShadow: "0 1px 2px rgba(0,0,0,0.2)"
                        }}>Add Funds</span>
                    </div>
                    <h1 style={{
                        fontFamily: "var(--font-heading,system-ui)",
                        fontSize: "1.85rem",
                        fontWeight: 700,
                        color: "#FFFFFF",
                        letterSpacing: "-0.04em",
                        lineHeight: 1.1,
                        marginBottom: 6,
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                    }}>Top up balance</h1>
                    <p style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.24)",
                        fontFamily: "var(--font-sans,system-ui)",
                        letterSpacing: "-0.01em",
                    }}>
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.06 }}
                    style={{ marginBottom: 36 }}
                >
                    <p style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.11em",
                        textTransform: "uppercase" as const,
                        color: "rgba(255,255,255,0.45)",
                        fontFamily: "var(--font-sans,system-ui)",
                        marginBottom: 12,
                    }}>Amount</p>

                    <div
                        style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20, cursor: "text" }}
                        onClick={() => inputRef.current?.focus()}
                    >
                        <span style={{
                            fontFamily: "var(--font-heading,system-ui)",
                            fontSize: 52,
                            fontWeight: 700,
                            letterSpacing: "-0.05em",
                            lineHeight: 1,
                            color: num > 0 ? "rgba(255,107,0,0.9)" : "rgba(255,255,255,0.12)",
                            transition: "color 0.18s",
                            userSelect: "none" as const,
                            textShadow: num > 0 ? "0 4px 12px rgba(255,107,0,0.25)" : "none"
                        }}>$</span>
                        <input
                            ref={inputRef}
                            type="number"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onWheel={(e) => e.currentTarget.blur()}
                            placeholder="0"
                            style={{
                                background: "none",
                                border: "none",
                                outline: "none",
                                fontFamily: "var(--font-heading,system-ui)",
                                fontSize: 52,
                                fontWeight: 700,
                                letterSpacing: "-0.05em",
                                lineHeight: 1,
                                color: "#FFFFFF",
                                width: "100%",
                                minWidth: 0,
                                MozAppearance: "textfield",
                            } as React.CSSProperties}
                        />
                    </div>

                    <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: 14 }} />

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {QUICK.map((v) => {
                            const on = amount === String(v);
                            return (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setAmount(String(v))}
                                    style={{
                                        padding: "5px 12px",
                                        borderRadius: 7,
                                        border: on ? "1px solid rgba(255,107,0,0.35)" : "1px solid rgba(255,255,255,0.06)",
                                        background: on ? "rgba(255,107,0,0.08)" : "transparent",
                                        color: on ? "rgb(255,107,0)" : "rgba(255,255,255,0.45)",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        fontFamily: "var(--font-sans,system-ui)",
                                        cursor: "pointer",
                                        transition: "all 0.14s",
                                        letterSpacing: "-0.01em",
                                    }}
                                    onMouseEnter={(e) => { if (!on) { const el = e.currentTarget; el.style.borderColor = "rgba(255,255,255,0.18)"; el.style.color = "rgba(255,255,255,0.75)"; } }}
                                    onMouseLeave={(e) => { if (!on) { const el = e.currentTarget; el.style.borderColor = "rgba(255,255,255,0.06)"; el.style.color = "rgba(255,255,255,0.45)"; } }}
                                >${v}</button>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.12 }}
                    style={{ marginBottom: 32 }}
                >
                    <p style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.11em",
                        textTransform: "uppercase" as const,
                        color: "rgba(255,255,255,0.45)",
                        fontFamily: "var(--font-sans,system-ui)",
                        marginBottom: 12,
                    }}>Currency</p>

                    <div style={{ display: "grid", gridTemplateColumns: isSmall ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 8 }}>
                        {CRYPTOS.map((c, i) => {
                            const on = crypto === c.id;
                            return (
                                <motion.button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setCrypto(on ? null : c.id)}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.24, delay: 0.18 + i * 0.025 }}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 7,
                                        padding: "14px 8px 13px",
                                        borderRadius: 12,
                                        border: on
                                            ? `1px solid ${c.accent}40`
                                            : "1px solid rgba(255,255,255,0.05)",
                                        background: on
                                            ? `${c.accent}14`
                                            : "rgba(255,255,255,0.016)",
                                        cursor: "pointer",
                                        transition: "border-color 0.14s, background 0.14s",
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                    onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                                    onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "rgba(255,255,255,0.016)"; }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {on && (
                                        <div style={{
                                            position: "absolute",
                                            inset: "0 0 auto",
                                            height: 1,
                                            background: `linear-gradient(90deg, transparent 10%, ${c.accent}50 50%, transparent 90%)`,
                                            pointerEvents: "none",
                                        }} />
                                    )}
                                    {on && (
                                        <div style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: `radial-gradient(ellipse 80% 60% at 50% 110%, ${c.accent}14 0%, transparent 70%)`,
                                            pointerEvents: "none",
                                        }} />
                                    )}
                                    <Icon icon={c.icon} style={{ fontSize: 28, position: "relative", color: c.accent }} />
                                    <div style={{ textAlign: "center" as const, position: "relative" }}>
                                        <p style={{
                                            fontSize: 11.5,
                                            fontWeight: 700,
                                            color: on ? "#FFFFFF" : "rgba(235,235,235,0.6)",
                                            fontFamily: "var(--font-sans,system-ui)",
                                            letterSpacing: "-0.01em",
                                            transition: "color 0.14s",
                                        }}>{c.symbol}</p>
                                        <p style={{
                                            fontSize: 9,
                                            color: on ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.18)",
                                            fontFamily: "var(--font-sans,system-ui)",
                                            marginTop: 1,
                                            transition: "color 0.14s",
                                        }}>{c.network}</p>
                                    </div>
                                    {on && (
                                        <div style={{
                                            position: "absolute",
                                            top: 7,
                                            right: 7,
                                            width: 13,
                                            height: 13,
                                            borderRadius: "50%",
                                            background: `${c.accent}1a`,
                                            border: `1.5px solid ${c.accent}70`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                            <Icon icon="ph:check-bold" style={{ fontSize: 7, color: c.accent }} />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                <AnimatePresence>
                    {ready && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            style={{ overflow: "hidden" }}
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "11px 14px",
                                borderRadius: 10,
                                background: "rgba(255,255,255,0.016)",
                                border: "1px solid rgba(255,255,255,0.045)",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                    <Icon icon={selected!.icon} style={{ fontSize: 18, color: selected!.accent }} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>
                                        Paying <strong>${num.toFixed(2)}</strong> via {selected!.symbol}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.22 }}
                >
                    <button
                        type="button"
                        disabled={createInvoice.isPending}
                        onClick={() => {
                            if (!crypto) { toast("error", "Select a currency"); return; }
                            if (num < 2) { toast("error", "Minimum deposit is $2"); return; }
                            createInvoice.mutate({ amountUsd: num, crypto });
                        }}
                        style={{
                            width: "100%",
                            padding: "14px 20px",
                            borderRadius: 11,
                            border: "none",
                            background: ready ? "hsl(24, 100%, 45%)" : "rgba(255,255,255,0.04)",
                            color: ready ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.16)",
                            fontSize: 13.5,
                            fontWeight: 600,
                            fontFamily: "var(--font-sans,system-ui)",
                            letterSpacing: "-0.02em",
                            cursor: ready && !createInvoice.isPending ? "pointer" : "not-allowed",
                            boxShadow: ready ? "0 1px 3px rgba(0,0,0,0.4)" : "none",
                            transition: "background 0.15s, box-shadow 0.15s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                        }}
                        onMouseEnter={(e) => { if (ready && !createInvoice.isPending) { e.currentTarget.style.background = "hsl(24, 100%, 40%)"; } }}
                        onMouseLeave={(e) => { if (ready) { e.currentTarget.style.background = "hsl(24, 100%, 45%)"; } }}
                        onMouseDown={(e) => { if (ready) { e.currentTarget.style.transform = "translateY(1px)"; e.currentTarget.style.boxShadow = "0 0 1px rgba(0,0,0,0.3)"; } }}
                        onMouseUp={(e) => { if (ready) { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.4)"; } }}
                    >
                        {createInvoice.isPending
                            ? <Icon icon="ph:spinner" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} />
                            : ready
                                ? <><Icon icon="ph:receipt" style={{ fontSize: 15 }} />Generate Invoice</>
                                : num < 2 && num > 0
                                    ? "Minimum deposit is $2"
                                    : "Select an amount & currency"
                        }
                    </button>
                </motion.div>

            </div>
        </div>
    );
}

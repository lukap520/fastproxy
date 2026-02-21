"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, string> = {
    success: "mdi:check-circle-outline",
    error: "mdi:alert-circle-outline",
    info: "mdi:information-outline",
};

const COLORS: Record<ToastType, { border: string; icon: string; glow: string }> = {
    success: {
        border: "rgba(52,211,153,0.18)",
        icon: "rgb(52,211,153)",
        glow: "rgba(52,211,153,0.08)",
    },
    error: {
        border: "rgba(239,68,68,0.2)",
        icon: "rgb(239,68,68)",
        glow: "rgba(239,68,68,0.08)",
    },
    info: {
        border: "rgba(255,107,0,0.2)",
        icon: "rgb(255,107,0)",
        glow: "rgba(255,107,0,0.08)",
    },
};

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((type: ToastType, message: string) => {
        const id = ++nextId;
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4500);
    }, []);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div
                style={{
                    position: "fixed",
                    bottom: "1.5rem",
                    right: "1.5rem",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                    alignItems: "flex-end",
                    pointerEvents: "none",
                }}
            >
                <AnimatePresence>
                    {toasts.map((t) => {
                        const c = COLORS[t.type];
                        return (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                style={{
                                    pointerEvents: "auto",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.625rem",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "14px",
                                    background: `linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(14,14,14,0.9) 100%)`,
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                    border: `1px solid ${c.border}`,
                                    boxShadow: `0 8px 32px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)`,
                                    maxWidth: "340px",
                                    minWidth: "260px",
                                    cursor: "pointer",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                                onClick={() => dismiss(t.id)}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: c.glow,
                                        borderRadius: "inherit",
                                        pointerEvents: "none",
                                    }}
                                />
                                <Icon
                                    icon={ICONS[t.type]}
                                    style={{
                                        color: c.icon,
                                        fontSize: "1rem",
                                        flexShrink: 0,
                                        marginTop: "1px",
                                        position: "relative",
                                    }}
                                />
                                <span
                                    style={{
                                        fontSize: "13px",
                                        flex: 1,
                                        color: "rgba(235,235,235,0.85)",
                                        lineHeight: 1.5,
                                        fontFamily: "var(--font-sans, system-ui, sans-serif)",
                                        position: "relative",
                                    }}
                                >
                                    {t.message}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); dismiss(t.id); }}
                                    style={{
                                        marginLeft: "0.5rem",
                                        color: "rgba(102,102,102,0.4)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        flexShrink: 0,
                                        lineHeight: 1,
                                        position: "relative",
                                        transition: "color 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(235,235,235,0.5)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(102,102,102,0.4)"; }}
                                >
                                    <Icon icon="mdi:close" style={{ fontSize: "18px", marginTop: "1px" }} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx.toast;
}

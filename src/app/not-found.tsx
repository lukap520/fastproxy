"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export default function NotFound() {
    return (
        <div style={{
            minHeight: "100vh",
            background: "#050505",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            fontFamily: "var(--font-sans, 'General Sans', system-ui)",
        }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -5%, rgba(255,107,0,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-10%", left: "20%", width: 400, height: 300, background: "radial-gradient(ellipse, rgba(255,107,0,0.03) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

            <div style={{
                position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                backgroundRepeat: "repeat", backgroundSize: "256px 256px",
            }} />

            <div style={{ position: "relative", textAlign: "center", maxWidth: 480, padding: "0 32px" }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div style={{
                        fontFamily: "var(--font-heading, 'Clash Display', system-ui)",
                        fontSize: "clamp(7rem, 18vw, 10rem)",
                        fontWeight: 700,
                        letterSpacing: "-0.06em",
                        lineHeight: 1,
                        background: "linear-gradient(180deg, rgba(235,235,235,0.12) 0%, rgba(235,235,235,0.03) 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        marginBottom: -8,
                        userSelect: "none",
                    }}>
                        404
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 }}
                >
                    <h1 style={{
                        fontFamily: "var(--font-heading, 'Clash Display', system-ui)",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "rgba(235,235,235,0.88)",
                        letterSpacing: "-0.04em",
                        marginBottom: 12,
                    }}>
                        Page not found
                    </h1>
                    <p style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.25)",
                        lineHeight: 1.7,
                        marginBottom: 36,
                        letterSpacing: "-0.01em",
                    }}>
                        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.22 }}
                    style={{ display: "flex", gap: 10, justifyContent: "center" }}
                >
                    <Link href="/dashboard" style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "10px 20px", borderRadius: 10,
                        background: "hsl(24, 100%, 45%)",
                        border: "none",
                        color: "rgba(255,255,255,0.92)",
                        fontSize: 13, fontWeight: 600,
                        textDecoration: "none", letterSpacing: "-0.01em",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        transition: "background 0.14s",
                    }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(24, 100%, 39%)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(24, 100%, 45%)")}
                    >
                        <Icon icon="ph:squares-four" style={{ fontSize: 15 }} />
                        Dashboard
                    </Link>
                    <Link href="/" style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "10px 20px", borderRadius: 10,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 13, fontWeight: 500,
                        textDecoration: "none", letterSpacing: "-0.01em",
                        transition: "all 0.14s",
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                    >
                        <Icon icon="ph:house" style={{ fontSize: 15 }} />
                        Home
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, pointerEvents: "none", zIndex: -1 }}
                >
                    {[...Array(5)].map((_, i) => (
                        <div key={i} style={{
                            position: "absolute", top: "50%", left: "50%",
                            width: 80 + i * 80, height: 80 + i * 80,
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.02)",
                            transform: "translate(-50%,-50%)",
                        }} />
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

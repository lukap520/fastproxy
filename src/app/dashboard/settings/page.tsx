"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

const I = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.025)",
    color: "rgba(235,235,235,0.9)",
    fontSize: 13.5,
    fontFamily: "var(--font-sans,system-ui)",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box" as const,
    letterSpacing: "-0.01em",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <label style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.28)", textTransform: "uppercase" as const, letterSpacing: "0.09em", fontFamily: "var(--font-sans,system-ui)" }}>
                    {label}
                </label>
                {hint && <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.18)", fontFamily: "var(--font-sans,system-ui)" }}>{hint}</span>}
            </div>
            {children}
        </div>
    );
}

function StyledInput({ type = "text", value, onChange, placeholder, readOnly, suffix }: { type?: string; value: string; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean; suffix?: React.ReactNode }) {
    return (
        <div style={{ position: "relative" }}>
            <input
                type={type}
                value={value}
                readOnly={readOnly}
                placeholder={placeholder}
                onChange={(e) => onChange?.(e.target.value)}
                style={{ ...I, ...(readOnly ? { cursor: "not-allowed", color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.01)" } : {}), ...(suffix ? { paddingRight: 42 } : {}) }}
                onFocus={(e) => { if (!readOnly) { e.target.style.borderColor = "rgba(255,107,0,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.07), inset 0 0 0 1px rgba(255,107,0,0.1)"; } }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }}
            />
            {suffix && <div style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)" }}>{suffix}</div>}
        </div>
    );
}

function Btn({ loading, children, danger, onClick, type = "submit" }: { loading?: boolean; children: React.ReactNode; danger?: boolean; onClick?: () => void; type?: "submit" | "button" }) {
    const base = danger ? "hsl(0, 84%, 50%)" : "hsl(24, 100%, 45%)";
    const hover = danger ? "hsl(0, 84%, 43%)" : "hsl(24, 100%, 39%)";
    return (
        <button
            type={type}
            disabled={loading}
            onClick={onClick}
            style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 9, border: "none",
                background: loading ? `${base}80` : base,
                color: "rgba(255,255,255,0.92)",
                fontSize: 13, fontWeight: 600,
                fontFamily: "var(--font-sans,system-ui)",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.14s",
                letterSpacing: "-0.01em",
                boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
                opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = hover; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = base; }}
            onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(1px)"; }}
            onMouseUp={(e) => { if (!loading) e.currentTarget.style.transform = ""; }}
        >
            {loading && <Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} />}
            {children}
        </button>
    );
}


function GlassCard({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
    return (
        <div style={{
            borderRadius: 18, overflow: "hidden", position: "relative",
            background: "rgba(255,255,255,0.012)",
            border: danger ? "1px solid rgba(239,68,68,0.12)" : "1px solid rgba(255,255,255,0.055)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        }}>
            <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: danger ? "linear-gradient(90deg,transparent 5%,rgba(239,68,68,0.2) 50%,transparent 95%)" : "linear-gradient(90deg,transparent 5%,rgba(255,255,255,0.07) 50%,transparent 95%)", pointerEvents: "none" }} />
            {children}
        </div>
    );
}

function CardHeader({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,107,0,0.07)", border: "1px solid rgba(255,107,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Icon icon={icon} style={{ fontSize: 18, color: "rgba(255,107,0,0.8)" }} />
            </div>
            <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "rgba(235,235,235,0.92)", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.02em" }}>{title}</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", marginTop: 2, fontFamily: "var(--font-sans,system-ui)", lineHeight: 1.5 }}>{description}</p>
            </div>
        </div>
    );
}

function ProfileSection({ user }: { user: { name: string; email: string } }) {
    const toast = useToast();
    const utils = trpc.useUtils();
    const [name, setName] = useState(user.name);
    const update = trpc.auth.updateProfile.useMutation({
        onSuccess: () => { toast("success", "Profile updated"); utils.auth.me.invalidate(); },
        onError: (e) => toast("error", e.message),
    });
    return (
        <GlassCard>
            <CardHeader icon="ph:user-circle" title="Profile" description="Update your display name and account info." />
            <form onSubmit={(e) => { e.preventDefault(); update.mutate({ name }); }} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Display Name">
                    <StyledInput value={name} onChange={setName} />
                </Field>
                <Field label="Email Address" hint="Read-only">
                    <StyledInput value={user.email} readOnly />
                </Field>
                <div><Btn loading={update.isPending}>Save Changes</Btn></div>
            </form>
        </GlassCard>
    );
}

function PasswordSection() {
    const toast = useToast();
    const [form, setForm] = useState({ cur: "", next: "", confirm: "" });
    const [show, setShow] = useState(false);
    const change = trpc.auth.changePassword.useMutation({
        onSuccess: () => { toast("success", "Password changed"); setForm({ cur: "", next: "", confirm: "" }); },
        onError: (e) => toast("error", e.message),
    });
    const strength = form.next.length >= 12 ? 3 : form.next.length >= 8 ? 2 : form.next.length >= 1 ? 1 : 0;
    const strengthLabels = ["", "Weak", "Good", "Strong"];
    const strengthColors = ["", "#ef4444", "#f97316", "#22c55e"];
    return (
        <GlassCard>
            <CardHeader icon="ph:lock-key" title="Security" description="Change your password and keep your account safe." />
            <form onSubmit={(e) => {
                e.preventDefault();
                if (form.next !== form.confirm) { toast("error", "Passwords do not match"); return; }
                change.mutate({ currentPassword: form.cur, newPassword: form.next });
            }} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Current Password">
                    <StyledInput type={show ? "text" : "password"} value={form.cur} onChange={(v) => setForm((f) => ({ ...f, cur: v }))} suffix={
                        <button type="button" onClick={() => setShow((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 0, lineHeight: 1, transition: "color 0.15s" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)")}>
                            <Icon icon={show ? "ph:eye-slash" : "ph:eye"} style={{ fontSize: 17 }} />
                        </button>
                    } />
                </Field>
                <Field label="New Password">
                    <StyledInput type="password" value={form.next} onChange={(v) => setForm((f) => ({ ...f, next: v }))} />
                    {form.next && (
                        <div style={{ marginTop: 8 }}>
                            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: strength >= i ? strengthColors[strength] : "rgba(255,255,255,0.07)", transition: "background 0.3s ease" }} />
                                ))}
                            </div>
                            <span style={{ fontSize: 11, color: strengthColors[strength] || "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500 }}>
                                {strengthLabels[strength] || "Enter a password"}
                            </span>
                        </div>
                    )}
                </Field>
                <Field label="Confirm Password">
                    <StyledInput type="password" value={form.confirm} onChange={(v) => setForm((f) => ({ ...f, confirm: v }))} />
                    {form.confirm && form.confirm !== form.next && (
                        <p style={{ fontSize: 11, color: "#ef4444", marginTop: 5, fontFamily: "var(--font-sans,system-ui)" }}>Passwords do not match</p>
                    )}
                </Field>
                <div><Btn loading={change.isPending}>Update Password</Btn></div>
            </form>
        </GlassCard>
    );
}

function formatUA(ua: string | null) {
    if (!ua) return "Unknown device";
    if (ua.includes("Chrome")) { const m = ua.match(/Chrome\/(\d+)/); return `Chrome ${m?.[1] ?? ""} · ${ua.includes("Windows") ? "Windows" : ua.includes("Mac") ? "macOS" : "Linux"}`; }
    if (ua.includes("Firefox")) return `Firefox · ${ua.includes("Windows") ? "Windows" : "Linux"}`;
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari · macOS";
    return ua.slice(0, 38) + "…";
}

function SessionsSection() {
    const toast = useToast();
    const utils = trpc.useUtils();
    const { data: sessions } = trpc.auth.getSessions.useQuery();
    const revoke = trpc.auth.revokeSession.useMutation({
        onSuccess: () => { toast("success", "Session revoked"); utils.auth.getSessions.invalidate(); },
        onError: (e) => toast("error", e.message),
    });
    return (
        <GlassCard>
            <CardHeader icon="ph:devices" title="Active Sessions" description="Devices logged into your account. Revoke any you don't recognize." />
            <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                {sessions?.map((s, i) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 11, background: i === 0 ? "rgba(255,107,0,0.04)" : "rgba(255,255,255,0.02)", border: i === 0 ? "1px solid rgba(255,107,0,0.1)" : "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon icon={s.userAgent?.includes("Mobile") ? "ph:device-mobile" : "ph:monitor"} style={{ fontSize: 17, color: i === 0 ? "rgba(255,107,0,0.6)" : "rgba(255,255,255,0.2)" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(235,235,235,0.82)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>{formatUA(s.userAgent)}</p>
                            <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)", marginTop: 2, fontFamily: "var(--font-sans,system-ui)" }}>
                                {s.ipAddress ?? "IP unknown"} · {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                        </div>
                        {i === 0 ? (
                            <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 6, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)", color: "rgb(52,211,153)", fontWeight: 600, fontFamily: "var(--font-sans,system-ui)", whiteSpace: "nowrap" }}>Current</span>
                        ) : (
                            <button onClick={() => revoke.mutate({ sessionId: s.id })} disabled={revoke.isPending} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 7, background: "transparent", border: "1px solid rgba(239,68,68,0.15)", color: "rgba(239,68,68,0.65)", cursor: "pointer", fontFamily: "var(--font-sans,system-ui)", fontWeight: 500, transition: "all 0.15s", whiteSpace: "nowrap" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.28)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)"; }}>
                                Revoke
                            </button>
                        )}
                    </div>
                ))}
                {(!sessions || sessions.length === 0) && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-sans,system-ui)" }}>No active sessions.</p>}
            </div>
        </GlassCard>
    );
}

function DeleteDialog({ onClose }: { onClose: () => void }) {
    const toast = useToast();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [typed, setTyped] = useState("");
    const PHRASE = "delete my account";
    const del = trpc.auth.deleteAccount.useMutation({
        onSuccess: () => { toast("success", "Account deleted"); router.push("/"); },
        onError: (e) => toast("error", e.message),
    });
    const canSubmit = typed === PHRASE && password.length > 0;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: "100%", maxWidth: 440, borderRadius: 22, background: "rgba(9,9,9,0.97)", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.025), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent 5%,rgba(239,68,68,0.35) 50%,transparent 95%)" }} />
                <div style={{ position: "absolute", top: "-50px", right: "-50px", width: 180, height: 180, background: "radial-gradient(circle,rgba(239,68,68,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
                <div style={{ padding: "28px 28px 0" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                        <Icon icon="ph:warning-diamond" style={{ fontSize: 22, color: "rgb(239,68,68)" }} />
                    </div>
                    <h2 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 19, fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.03em" }}>Delete Account</h2>
                    <p style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.32)", lineHeight: 1.65, fontFamily: "var(--font-sans,system-ui)" }}>
                        This will permanently erase your account, sessions, proxies, and billing history. There is no undo.
                    </p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) del.mutate({ password }); }} style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <Field label={`Type "${PHRASE}" to continue`}>
                        <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={PHRASE} autoComplete="off"
                            style={{ ...I, borderColor: typed && typed !== PHRASE ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)" }}
                            onFocus={(e) => { e.target.style.borderColor = "rgba(239,68,68,0.35)"; e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.06)"; }}
                            onBlur={(e) => { e.target.style.borderColor = typed && typed !== PHRASE ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }} />
                    </Field>
                    <Field label="Your password">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={I}
                            onFocus={(e) => { e.target.style.borderColor = "rgba(239,68,68,0.35)"; e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.06)"; }}
                            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }} />
                    </Field>
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "rgba(235,235,235,0.7)", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans,system-ui)", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}>
                            Cancel
                        </button>
                        <button type="submit" disabled={!canSubmit || del.isPending} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, border: "none", background: canSubmit ? "rgb(220,38,38)" : "rgba(220,38,38,0.25)", color: canSubmit ? "#fff" : "rgba(255,255,255,0.28)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans,system-ui)", cursor: canSubmit ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: canSubmit ? "0 4px 24px rgba(220,38,38,0.28)" : "none" }}>
                            {del.isPending && <Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} />}
                            Delete Account
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const { data: user, isLoading, error } = trpc.auth.me.useQuery();
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && (error || !user)) router.replace("/login");
    }, [isLoading, error, user, router]);

    if (isLoading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="flex h-8 w-8 animate-spin rounded-full border-2 border-accent border-r-transparent" /></div>;
    if (!user) return null;

    return (
        <>
            <AnimatePresence>{deleteOpen && <DeleteDialog onClose={() => setDeleteOpen(false)} />}</AnimatePresence>

            <div style={{ padding: "44px 48px", maxWidth: 1100, width: "100%" }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ marginBottom: 36 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ height: 1, width: 28, background: "rgba(255,107,0,0.5)" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,107,0,0.7)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Account</span>
                    </div>
                    <h1 style={{ fontFamily: "var(--font-heading,'Clash Display',system-ui)", fontSize: "2rem", fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.04em", lineHeight: 1.15 }}>
                        Settings
                    </h1>
                    <p style={{ marginTop: 6, fontSize: 13.5, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-sans,system-ui)" }}>
                        Manage your profile, security, and session data.
                    </p>
                </motion.div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.04 }}>
                            <ProfileSection user={user} />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.1 }}>
                            <PasswordSection />
                        </motion.div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.07 }}>
                            <SessionsSection />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.13 }}>
                            <GlassCard danger>
                                <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "linear-gradient(90deg,transparent 5%,rgba(239,68,68,0.2) 50%,transparent 95%)", pointerEvents: "none" }} />
                                <CardHeader icon="ph:warning-diamond" title="Danger Zone" description="Irreversible actions. Proceed with caution." />
                                <div style={{ padding: "16px 24px 20px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "14px 16px", borderRadius: 12, background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.08)" }}>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(235,235,235,0.82)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "-0.01em" }}>Delete Account</p>
                                            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.25)", marginTop: 3, fontFamily: "var(--font-sans,system-ui)", lineHeight: 1.5 }}>
                                                Removes all data, sessions, and billing permanently.
                                            </p>
                                        </div>
                                        <button onClick={() => setDeleteOpen(true)} type="button"
                                            style={{ flexShrink: 0, fontSize: 12.5, padding: "8px 16px", borderRadius: 9, background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.75)", cursor: "pointer", fontWeight: 500, fontFamily: "var(--font-sans,system-ui)", transition: "all 0.15s", whiteSpace: "nowrap" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}>
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}

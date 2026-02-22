"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useToast } from "@/components/ui/Toast";

function DeleteUserDialog({ user, onClose, onConfirm, isPending }: { user: { id: string, email: string }, onClose: () => void, onConfirm: () => void, isPending: boolean }) {
    const PHRASE = user.email;
    const [typed, setTyped] = useState("");
    const canSubmit = typed === PHRASE;
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
                    <h2 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 19, fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.03em" }}>Delete User</h2>
                    <p style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.32)", lineHeight: 1.65, fontFamily: "var(--font-sans,system-ui)" }}>
                        This will permanently erase the user <strong>{user.email}</strong>, along with their sessions, proxies, and billing history.
                    </p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) onConfirm(); }} style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Type "{PHRASE}" to confirm</label>
                        <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={PHRASE} autoComplete="off"
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", color: "white", fontSize: 14, outline: "none", transition: "all 0.2s" }}
                            onFocus={(e) => { e.target.style.borderColor = "rgba(239,68,68,0.35)"; e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.06)"; }}
                            onBlur={(e) => { e.target.style.borderColor = typed && typed !== PHRASE ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "rgba(235,235,235,0.7)", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans,system-ui)", cursor: "pointer", transition: "all 0.15s" }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={!canSubmit || isPending} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, border: "none", background: canSubmit ? "rgb(220,38,38)" : "rgba(220,38,38,0.25)", color: canSubmit ? "#fff" : "rgba(255,255,255,0.28)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans,system-ui)", cursor: canSubmit ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: canSubmit ? "0 4px 24px rgba(220,38,38,0.28)" : "none" }}>
                            {isPending && <Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} />}
                            Delete User
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

export default function AdminUsersPage() {
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const toast = useToast();

    const utils = trpc.useUtils();
    const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
    const { data: users, isLoading: usersLoading } = trpc.admin.getUsers.useQuery(undefined, {
        enabled: !!user && user.role === "ADMIN"
    });

    const updateUserBalance = trpc.admin.updateUserBalance.useMutation({
        onSuccess: () => {
            toast("success", "Balance updated successfully");
            utils.admin.getUsers.invalidate();
            setEditUser(null);
            setAmountToAdd("");
        },
        onError: (err) => toast("error", err.message)
    });

    const deleteUser = trpc.admin.deleteUser.useMutation({
        onSuccess: () => {
            toast("success", "User deleted successfully");
            utils.admin.getUsers.invalidate();
            setUserToDelete(null);
        },
        onError: (err) => toast("error", err.message)
    });

    const [editUser, setEditUser] = useState<string | null>(null);
    const [amountToAdd, setAmountToAdd] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string, email: string } | null>(null);

    const filteredUsers = (users || []).filter(u => {
        if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
        const q = searchQuery.toLowerCase();
        if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
        return true;
    });

    if (userLoading || usersLoading) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 22, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    return (
        <div style={{ flex: 1, padding: isSmall ? "80px 20px 40px" : "52px 56px", maxWidth: 1060, width: "100%", margin: "0 auto" }}>
            <AnimatePresence>
                {userToDelete && <DeleteUserDialog user={userToDelete} onClose={() => setUserToDelete(null)} onConfirm={() => deleteUser.mutate({ userId: userToDelete.id })} isPending={deleteUser.isPending} />}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} style={{ marginBottom: 32, display: "flex", flexDirection: isSmall ? "column" : "row", alignItems: isSmall ? "flex-start" : "flex-end", gap: isSmall ? 20 : 0, justifyContent: "space-between" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                        <div style={{ width: 24, height: 1, background: "rgba(255,107,0,0.5)" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,107,0,0.7)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Administration</span>
                    </div>
                    <h1 style={{ fontFamily: "var(--font-heading,'Clash Display',system-ui)", fontSize: "2.2rem", fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.04em" }}>
                        Users Management
                    </h1>
                </div>

                <div style={{ display: "flex", gap: 10, width: isSmall ? "100%" : "auto" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Icon icon="ph:magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 16 }} />
                        <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px 10px 36px", minWidth: 200, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 13, outline: "none" }} />
                    </div>

                    <div style={{ position: "relative" }}>
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 13, outline: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                            {roleFilter === "ALL" ? "All Roles" : roleFilter === "USER" ? "User" : "Admin"}
                            <Icon icon="ph:caret-down" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }} />
                        </button>
                        <AnimatePresence>
                            {dropdownOpen && (
                                <>
                                    <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setDropdownOpen(false)} />
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                                        style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 140, background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 6, zIndex: 11, boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset" }}>
                                        {[{ v: "ALL", l: "All Roles" }, { v: "USER", l: "User" }, { v: "ADMIN", l: "Admin" }].map(opt => (
                                            <button key={opt.v} onClick={() => { setRoleFilter(opt.v as any); setDropdownOpen(false); }}
                                                style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6, fontSize: 13, background: roleFilter === opt.v ? "rgba(255,255,255,0.06)" : "transparent", border: "none", color: roleFilter === opt.v ? "white" : "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                {opt.l}
                                                {roleFilter === opt.v && <Icon icon="ph:check" style={{ color: "rgb(255,107,0)" }} />}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <div style={{ borderRadius: 16, background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                {!isMobile && (
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", padding: "16px 20px", background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>User</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Email</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Role</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Balance</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", textAlign: "right" }}>Actions</span>
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {filteredUsers?.length === 0 && (
                        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                            No users found matching your filters.
                        </div>
                    )}
                    {filteredUsers?.map(u => (
                        <div key={u.id} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1.5fr 1fr 1fr 1fr", padding: isMobile ? "20px" : "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)", gap: isMobile ? 14 : 10, alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon icon="ph:user" style={{ color: "rgba(255,255,255,0.5)" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: 13, color: "rgba(235,235,235,0.9)", fontWeight: 500 }}>{u.name}</span>
                                    {isMobile && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{u.email}</span>}
                                </div>
                            </div>

                            {!isMobile && <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{u.email}</span>}

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {isMobile && <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Role:</span>}
                                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: u.role === "ADMIN" ? "rgba(255,107,0,0.1)" : "rgba(255,255,255,0.05)", color: u.role === "ADMIN" ? "rgb(255,107,0)" : "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                                    {u.role}
                                </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: isMobile ? 4 : 0 }}>
                                {isMobile && <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Balance:</span>}
                                {editUser === u.id ? (
                                    <div style={{ display: "flex", gap: 5 }}>
                                        <input
                                            type="number"
                                            value={amountToAdd}
                                            onChange={e => setAmountToAdd(e.target.value)}
                                            placeholder="+/- 0"
                                            style={{ width: "80px", padding: "4px 8px", fontSize: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, color: "white", outline: "none" }}
                                        />
                                        <button onClick={() => updateUserBalance.mutate({ userId: u.id, amount: parseFloat(amountToAdd) })} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 8px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "rgb(52,211,153)", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                                            {updateUserBalance.isPending ? <Icon icon="ph:spinner" style={{ animation: "spin 1s linear infinite" }} /> : "✓"}
                                        </button>
                                        <button onClick={() => setEditUser(null)} style={{ padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>✕</button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(235,235,235,0.9)" }}>${u.balance.toFixed(2)}</span>
                                        <button onClick={() => setEditUser(u.id)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: 4, borderRadius: 4 }}>
                                            <Icon icon="ph:pencil-simple" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end", gap: 8, marginTop: isMobile ? 8 : 0 }}>
                                {u.role !== "ADMIN" && (
                                    <button onClick={() => setUserToDelete({ id: u.id, email: u.email })}
                                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 13, borderRadius: 8, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.8)", cursor: "pointer", fontWeight: 500, transition: "background 0.2s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
                                    >
                                        <Icon icon="ph:trash" /> {isMobile ? "Delete User" : "Delete"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

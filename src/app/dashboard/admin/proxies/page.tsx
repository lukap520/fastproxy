"use client";

import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";

const PRODUCT_META: Record<string, { label: string; color: string; icon: string }> = {
    "residential-lite": { label: "Resi Budget", color: "rgb(52,211,153)", icon: "ph:house" },
    "residential": { label: "Resi Premium", color: "rgb(255,107,0)", icon: "ph:house-fill" },
    "mobile": { label: "Mobile", color: "rgb(59,130,246)", icon: "ph:device-mobile" },
    "datacenter": { label: "Datacenter", color: "rgb(168,85,247)", icon: "ph:server" },
    "shared_isp": { label: "Shared ISP", color: "rgb(251,191,36)", icon: "ph:buildings" },
    "dedicated_isp": { label: "Dedicated ISP", color: "rgb(255,107,0)", icon: "ph:building" },
    "dedicated_mobile": { label: "Dedicated Mobile", color: "rgb(59,130,246)", icon: "ph:device-mobile-fill" },
    "ipv6-residential": { label: "IPv6 Resi", color: "rgb(20,184,166)", icon: "ph:globe" },
    "ipv6-datacenter": { label: "IPv6 DC", color: "rgb(139,92,246)", icon: "ph:server" },
    "unlimited_residential": { label: "Unlimited Resi", color: "rgb(245,158,11)", icon: "ph:infinity" },
};

function ProductBadge({ product }: { product: string }) {
    const m = PRODUCT_META[product] ?? { label: product, color: "rgba(255,255,255,0.4)", icon: "ph:circle" };
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, background: `${m.color}14`, border: `1px solid ${m.color}28`, fontSize: 11, fontWeight: 700, color: m.color, fontFamily: "var(--font-sans,system-ui)", whiteSpace: "nowrap" as const }}>
            <Icon icon={m.icon} style={{ fontSize: 11 }} />
            {m.label}
        </span>
    );
}

type DbPlan = {
    id: string;
    product: string;
    createdAt: Date;
    userId: string;
    user: { id: string; email: string; name: string };
};

type ModalAction = { type: "cancel" | "remove" | "reassign"; plan: DbPlan } | null;

function ConfirmModal({ action, onClose, users }: { action: ModalAction; onClose: () => void; users: { id: string; name: string; email: string }[] }) {
    const toast = useToast();
    const utils = trpc.useUtils();
    const [reassignUserId, setReassignUserId] = useState("");
    const [reassignSearch, setReassignSearch] = useState("");

    const cancel = trpc.admin.cancelPlanAdmin.useMutation({
        onSuccess: () => { toast("success", "Plan cancelled on FlashProxy & removed from DB."); utils.admin.getPlans.invalidate(); onClose(); },
        onError: e => toast("error", e.message),
    });
    const remove = trpc.admin.deletePlanFromDb.useMutation({
        onSuccess: () => { toast("success", "Plan reference removed from DB."); utils.admin.getPlans.invalidate(); onClose(); },
        onError: e => toast("error", e.message),
    });
    const reassign = trpc.admin.reassignPlan.useMutation({
        onSuccess: () => { toast("success", "Plan reassigned."); utils.admin.getPlans.invalidate(); onClose(); },
        onError: e => toast("error", e.message),
    });

    if (!action) return null;
    const { type, plan } = action;
    const isPending = cancel.isPending || remove.isPending || reassign.isPending;

    const filteredUsers = users.filter(u =>
        u.id !== plan.userId &&
        (reassignSearch === "" || u.name.toLowerCase().includes(reassignSearch.toLowerCase()) || u.email.toLowerCase().includes(reassignSearch.toLowerCase()))
    );

    const CONFIGS = {
        cancel: {
            title: "Cancel & Delete Plan",
            desc: "This will call the FlashProxy API to cancel the plan AND remove it from our database. The user will lose access immediately.",
            icon: "ph:x-circle",
            iconColor: "rgb(239,68,68)",
            borderColor: "rgba(239,68,68,0.2)",
            confirmLabel: "Cancel Plan",
            confirmBg: "rgb(220,38,38)",
            onConfirm: () => cancel.mutate({ planId: plan.id }),
        },
        remove: {
            title: "Remove from Database",
            desc: "Removes only the DB reference — does NOT cancel the plan on FlashProxy. Use this to clean up orphaned records.",
            icon: "ph:database",
            iconColor: "rgb(251,191,36)",
            borderColor: "rgba(251,191,36,0.2)",
            confirmLabel: "Remove from DB",
            confirmBg: "rgb(202,138,4)",
            onConfirm: () => remove.mutate({ planId: plan.id }),
        },
        reassign: {
            title: "Reassign Plan",
            desc: "Transfer ownership of this plan to another user.",
            icon: "ph:arrows-left-right",
            iconColor: "rgb(59,130,246)",
            borderColor: "rgba(59,130,246,0.2)",
            confirmLabel: "Reassign",
            confirmBg: "rgb(37,99,235)",
            onConfirm: () => { if (reassignUserId) reassign.mutate({ planId: plan.id, newUserId: reassignUserId }); },
        },
    };
    const cfg = CONFIGS[type];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={e => e.stopPropagation()}
                style={{ width: "100%", maxWidth: type === "reassign" ? 500 : 440, borderRadius: 22, background: "rgba(8,8,8,0.98)", border: `1px solid ${cfg.borderColor}`, boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent 5%,${cfg.iconColor}44 50%,transparent 95%)` }} />

                <div style={{ padding: "26px 26px 0" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${cfg.iconColor}12`, border: `1px solid ${cfg.iconColor}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                        <Icon icon={cfg.icon} style={{ fontSize: 22, color: cfg.iconColor }} />
                    </div>
                    <h2 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: 18, fontWeight: 700, color: "rgba(235,235,235,0.95)", letterSpacing: "-0.03em", marginBottom: 8 }}>{cfg.title}</h2>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.65, fontFamily: "var(--font-sans,system-ui)", marginBottom: 16 }}>{cfg.desc}</p>

                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 6, fontFamily: "var(--font-sans,system-ui)" }}>Plan</p>
                        <p style={{ fontSize: 11.5, fontFamily: "monospace", color: "rgba(255,255,255,0.6)", wordBreak: "break-all" as const }}>{plan.id}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                            <ProductBadge product={plan.product} />
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans,system-ui)" }}>· {plan.user.name}</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "16px 26px 26px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {type === "reassign" && (
                        <div>
                            <div style={{ position: "relative", marginBottom: 8 }}>
                                <Icon icon="ph:magnifying-glass" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "rgba(255,255,255,0.3)" }} />
                                <input type="text" placeholder="Search users…" value={reassignSearch} onChange={e => setReassignSearch(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: 9, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.07)", color: "white", fontSize: 12.5, outline: "none", fontFamily: "var(--font-sans,system-ui)" }} />
                            </div>
                            <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                                {filteredUsers.length === 0 && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-sans,system-ui)", padding: "8px 4px" }}>No other users found.</p>}
                                {filteredUsers.map(u => (
                                    <button key={u.id} onClick={() => setReassignUserId(u.id)}
                                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8, background: reassignUserId === u.id ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)", border: reassignUserId === u.id ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.05)", cursor: "pointer", textAlign: "left" as const }}>
                                        <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Icon icon="ph:user" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 12.5, color: "rgba(235,235,235,0.85)", fontWeight: 600, fontFamily: "var(--font-sans,system-ui)" }}>{u.name}</p>
                                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)" }}>{u.email}</p>
                                        </div>
                                        {reassignUserId === u.id && <Icon icon="ph:check-circle-fill" style={{ fontSize: 16, color: "rgb(59,130,246)", marginLeft: "auto" }} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "rgba(235,235,235,0.6)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)" }}>
                            Cancel
                        </button>
                        <button
                            disabled={isPending || (type === "reassign" && !reassignUserId)}
                            onClick={cfg.onConfirm}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, border: "none", background: (type === "reassign" && !reassignUserId) ? "rgba(37,99,235,0.3)" : cfg.confirmBg, color: (type === "reassign" && !reassignUserId) ? "rgba(255,255,255,0.3)" : "#fff", fontSize: 13, fontWeight: 600, cursor: isPending || (type === "reassign" && !reassignUserId) ? "not-allowed" : "pointer", fontFamily: "var(--font-sans,system-ui)", transition: "all 0.15s" }}>
                            {isPending ? <Icon icon="ph:spinner" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} /> : cfg.confirmLabel}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function AdminProxiesPage() {
    const { isMobile } = useWindowSize();

    const { data: user } = trpc.auth.me.useQuery();
    const { data: plans, isLoading } = trpc.admin.getPlans.useQuery(undefined, { enabled: !!user && user.role === "ADMIN" });
    const { data: users } = trpc.admin.getUsers.useQuery(undefined, { enabled: !!user && user.role === "ADMIN" });

    const [search, setSearch] = useState("");
    const [productFilter, setProductFilter] = useState("all");
    const [productOpen, setProductOpen] = useState(false);
    const [modal, setModal] = useState<ModalAction>(null);

    if (isLoading) return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <Icon icon="ph:spinner" style={{ fontSize: 22, color: "rgba(255,107,0,0.4)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    const allPlans = plans ?? [];
    const allUsers = (users ?? []).map(u => ({ id: u.id, name: u.name, email: u.email }));

    const filtered = allPlans.filter(p => {
        const q = search.toLowerCase();
        if (q && !p.user.name.toLowerCase().includes(q) && !p.user.email.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q) && !p.product.toLowerCase().includes(q)) return false;
        if (productFilter !== "all" && p.product !== productFilter) return false;
        return true;
    });

    const productCounts = allPlans.reduce<Record<string, number>>((acc, p) => { acc[p.product] = (acc[p.product] ?? 0) + 1; return acc; }, {});
    const uniqueUsers = new Set(allPlans.map(p => p.userId)).size;
    const selectedMeta = productFilter !== "all" ? PRODUCT_META[productFilter] : null;

    return (
        <>
            <AnimatePresence>
                {modal && <ConfirmModal action={modal} onClose={() => setModal(null)} users={allUsers} />}
            </AnimatePresence>

            <div style={{ flex: 1, padding: isMobile ? "80px 20px 40px" : "48px 52px", maxWidth: 1120, width: "100%", margin: "0 auto" }}>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 20, height: 1, background: "rgba(255,107,0,0.6)" }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,107,0,0.85)", fontFamily: "var(--font-sans,system-ui)", letterSpacing: "0.18em", textTransform: "uppercase" as const }}>Admin · Plans</span>
                    </div>
                    <h1 style={{ fontFamily: "var(--font-heading,system-ui)", fontSize: "1.85rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.1 }}>Proxy Plan Management</h1>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)", marginTop: 5 }}>
                        View, cancel, reassign or remove all FlashProxy plans tracked in the database.
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 9, marginBottom: 22 }}>
                    {[
                        { label: "Total Plans", value: allPlans.length, icon: "ph:list-checks", color: "rgb(255,107,0)" },
                        { label: "Unique Users", value: uniqueUsers, icon: "ph:users", color: "rgb(52,211,153)" },
                        { label: "Filtered", value: filtered.length, icon: "ph:funnel", color: "rgb(59,130,246)" },
                        { label: "Products", value: Object.keys(productCounts).length, icon: "ph:package", color: "rgb(168,85,247)" },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 + 0.06 }}
                            style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.014)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${s.color}12`, border: `1px solid ${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon icon={s.icon} style={{ fontSize: 16, color: s.color }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", fontFamily: "var(--font-sans,system-ui)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{s.label}</p>
                                <p style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-heading,system-ui)", letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 1 }}>{s.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ display: "flex", gap: 9, flexWrap: "wrap" as const, alignItems: "center", marginBottom: 14 }}>
                    <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 300px" }}>
                        <Icon icon="ph:magnifying-glass" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.28)", fontSize: 14 }} />
                        <input type="text" placeholder="Search by user, email, plan ID or product…" value={search} onChange={e => setSearch(e.target.value)}
                            style={{ width: "100%", padding: "8px 13px 8px 33px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.85)", fontSize: 12.5, outline: "none", fontFamily: "var(--font-sans,system-ui)" }} />
                    </div>

                    <div style={{ position: "relative" }}>
                        <button onClick={() => setProductOpen(v => !v)}
                            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 9, background: productFilter !== "all" ? `${selectedMeta!.color}12` : "rgba(255,255,255,0.03)", border: productFilter !== "all" ? `1px solid ${selectedMeta!.color}30` : "1px solid rgba(255,255,255,0.07)", color: productFilter !== "all" ? selectedMeta!.color : "rgba(255,255,255,0.6)", fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)", whiteSpace: "nowrap" as const }}>
                            <Icon icon={productFilter !== "all" ? selectedMeta!.icon : "ph:funnel"} style={{ fontSize: 13 }} />
                            {productFilter !== "all" ? selectedMeta!.label : "All Products"}
                            <Icon icon="ph:caret-down" style={{ fontSize: 12, opacity: 0.45, marginLeft: 2 }} />
                        </button>
                        <AnimatePresence>
                            {productOpen && (
                                <>
                                    <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setProductOpen(false)} />
                                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.13 }}
                                        style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: 190, background: "rgba(8,8,8,0.97)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, padding: 5, zIndex: 11, boxShadow: "0 14px 50px rgba(0,0,0,0.65)" }}>
                                        <button onClick={() => { setProductFilter("all"); setProductOpen(false); }}
                                            style={{ width: "100%", textAlign: "left" as const, padding: "7px 10px", borderRadius: 6, fontSize: 12, background: productFilter === "all" ? "rgba(255,255,255,0.06)" : "transparent", border: "none", color: "rgba(255,255,255,0.65)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            All Products {productFilter === "all" && <Icon icon="ph:check" style={{ color: "rgb(255,107,0)", fontSize: 12 }} />}
                                        </button>
                                        {Object.entries(productCounts).sort((a, b) => b[1] - a[1]).map(([prod, cnt]) => {
                                            const m = PRODUCT_META[prod] ?? { label: prod, color: "rgba(255,255,255,0.4)", icon: "ph:circle" };
                                            return (
                                                <button key={prod} onClick={() => { setProductFilter(prod); setProductOpen(false); }}
                                                    style={{ width: "100%", textAlign: "left" as const, padding: "7px 10px", borderRadius: 6, fontSize: 12, background: productFilter === prod ? "rgba(255,255,255,0.05)" : "transparent", border: "none", color: productFilter === prod ? m.color : "rgba(255,255,255,0.55)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <Icon icon={m.icon} style={{ fontSize: 12, color: m.color }} />
                                                        {m.label}
                                                    </span>
                                                    <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.28)" }}>{cnt}</span>
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {(search || productFilter !== "all") && (
                        <button onClick={() => { setSearch(""); setProductFilter("all"); }}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 11px", borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans,system-ui)" }}>
                            <Icon icon="ph:x" style={{ fontSize: 12 }} /> Clear
                        </button>
                    )}

                    <span style={{ marginLeft: "auto", fontSize: 11.5, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-sans,system-ui)" }}>
                        {filtered.length} of {allPlans.length}
                    </span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                    style={{ borderRadius: 14, background: "rgba(255,255,255,0.014)", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    {!isMobile && (
                        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 2fr 1.4fr 1fr 120px", padding: "11px 18px", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.045)" }}>
                            {["Plan ID", "User", "Product", "Added", "Actions"].map((h, i) => (
                                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase" as const, fontFamily: "var(--font-sans,system-ui)", textAlign: i === 4 ? "right" as const : "left" as const }}>{h}</span>
                            ))}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {filtered.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ padding: "56px 20px", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>
                                <Icon icon="ph:ghost" style={{ fontSize: 36, display: "block", margin: "0 auto 10px" }} />
                                <p style={{ fontSize: 13.5, fontFamily: "var(--font-sans,system-ui)" }}>No plans match your filters.</p>
                            </motion.div>
                        ) : (
                            <motion.div key="rows" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {filtered.map((plan, i) => (
                                    <motion.div key={plan.id}
                                        initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.25) }}
                                        style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.8fr 2fr 1.4fr 1fr 120px", padding: isMobile ? "14px 18px" : "11px 18px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.028)" : "none", gap: isMobile ? 8 : 10, alignItems: "center" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.012)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

                                        <div>
                                            <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: "0.01em" }}>
                                                {plan.id.slice(0, 8)}…{plan.id.slice(-5)}
                                            </p>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <Icon icon="ph:user" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: 12.5, color: "rgba(235,235,235,0.88)", fontWeight: 600, fontFamily: "var(--font-sans,system-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{plan.user.name}</p>
                                                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans,system-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{plan.user.email}</p>
                                            </div>
                                        </div>

                                        <div><ProductBadge product={plan.product} /></div>

                                        <div>
                                            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.42)", fontFamily: "var(--font-sans,system-ui)" }}>
                                                {new Date(plan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                                            </p>
                                        </div>

                                        <div style={{ display: "flex", gap: 5, justifyContent: isMobile ? "flex-start" : "flex-end" }}>
                                            <button title="Reassign" onClick={() => setModal({ type: "reassign", plan })}
                                                style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.05)", color: "rgba(59,130,246,0.7)", cursor: "pointer" }}>
                                                <Icon icon="ph:arrows-left-right" style={{ fontSize: 14 }} />
                                            </button>
                                            <button title="Remove from DB" onClick={() => setModal({ type: "remove", plan })}
                                                style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, border: "1px solid rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.05)", color: "rgba(251,191,36,0.7)", cursor: "pointer" }}>
                                                <Icon icon="ph:database" style={{ fontSize: 14 }} />
                                            </button>
                                            <button title="Cancel plan" onClick={() => setModal({ type: "cancel", plan })}
                                                style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "rgba(239,68,68,0.7)", cursor: "pointer" }}>
                                                <Icon icon="ph:x" style={{ fontSize: 14 }} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ marginTop: 14, padding: "10px 16px", borderRadius: 9, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)", display: "flex", gap: 14, flexWrap: "wrap" as const }}>
                    {[
                        { icon: "ph:arrows-left-right", color: "rgb(59,130,246)", label: "Reassign — transfers plan ownership to another user" },
                        { icon: "ph:database", color: "rgb(251,191,36)", label: "Remove from DB — deletes our DB record only, does NOT cancel on FlashProxy" },
                        { icon: "ph:x", color: "rgb(239,68,68)", label: "Cancel — cancels on FlashProxy API AND removes from DB" },
                    ].map(leg => (
                        <span key={leg.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans,system-ui)" }}>
                            <Icon icon={leg.icon} style={{ color: leg.color, fontSize: 13 }} />
                            {leg.label}
                        </span>
                    ))}
                </motion.div>
            </div>
        </>
    );
}

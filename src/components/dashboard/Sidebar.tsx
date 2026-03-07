"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { trpc } from "@/lib/trpc";
import { useWindowSize } from "@/hooks/useWindowSize";

const NAV_GROUPS = [
    {
        label: "Main",
        items: [
            { href: "/dashboard", icon: "ph:squares-four", label: "Overview", comingSoon: false },
        ],
    },
    {
        label: "Proxies",
        items: [
            { href: "/dashboard/proxies/residential", icon: "ph:globe-hemisphere-west", label: "Residential GB", comingSoon: false },
            { href: "/dashboard/proxies/unlimited-residential", icon: "ph:wave-sine", label: "Residential Unlimited", comingSoon: false },
            { href: "/dashboard/proxies/mobile", icon: "ph:device-mobile", label: "Mobile", comingSoon: false },
            { href: "/dashboard/proxies/datacenter", icon: "ph:buildings", label: "Datacenter", comingSoon: false },
            { href: "/dashboard/proxies/shared-isp", icon: "ph:broadcast", label: "Shared ISP", comingSoon: false },
            { href: "/dashboard/proxies/ipv6-residential", icon: "ph:network", label: "IPv6 Residential", comingSoon: false },
            { href: "/dashboard/proxies/ipv6-datacenter", icon: "ph:hard-drives", label: "IPv6 Datacenter", comingSoon: false },
            { href: "/dashboard/proxies/dedicated-mobile", icon: "ph:sim-card", label: "Dedicated Mobile", comingSoon: false },
            { href: "/dashboard/proxies/dedicated-isp", icon: "ph:lock-key", label: "Dedicated ISP", comingSoon: false },
        ],
    },
    {
        label: "Payments",
        items: [
            { href: "/dashboard/billing/topup", icon: "ph:plus-circle", label: "Top Up", comingSoon: false },
            { href: "/dashboard/billing/invoices", icon: "ph:file-text", label: "Invoices", comingSoon: false },
        ],
    },
    {
        label: "Account",
        items: [
            { href: "/dashboard/settings", icon: "ph:gear-six", label: "Settings", comingSoon: false },
        ],
    },
    {
        label: "Admin",
        items: [
            { href: "/dashboard/admin", icon: "ph:shield-star", label: "Overview", comingSoon: false },
            { href: "/dashboard/admin/users", icon: "ph:users", label: "Users", comingSoon: false },
            { href: "/dashboard/admin/proxies", icon: "ph:globe", label: "Proxies", comingSoon: false },
        ],
    },
];


function Avatar({ name }: { name: string }) {
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    return (
        <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, rgba(255,107,0,0.22) 0%, rgba(255,107,0,0.06) 100%)",
            border: "1px solid rgba(255,107,0,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "rgb(255,107,0)", flexShrink: 0, letterSpacing: "0.06em",
        }}>
            {initials}
        </div>
    );
}

function ComingSoonItem({ item }: { item: { icon: string; label: string } }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "7px 10px",
            borderRadius: 8,
            cursor: "not-allowed",
            opacity: 0.45,
        }}>
            <Icon icon={item.icon} style={{ fontSize: 17, color: "rgba(255,255,255,0.22)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontFamily: "var(--font-sans,system-ui)", fontWeight: 400, color: "rgba(255,255,255,0.38)", letterSpacing: "-0.01em", flex: 1 }}>
                {item.label}
            </span>
            <span style={{
                fontSize: 8.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const,
                padding: "2px 6px", borderRadius: 5,
                background: "rgba(255,107,0,0.1)",
                border: "1px solid rgba(255,107,0,0.18)",
                color: "rgba(255,107,0,0.7)",
                fontFamily: "var(--font-sans,system-ui)",
                whiteSpace: "nowrap" as const,
            }}>Soon</span>
        </div>
    );
}

function NavItem({ item, isActive, onClick }: { item: { href: string; icon: string; label: string }; isActive: boolean; onClick?: () => void }) {
    return (
        <Link
            href={item.href}
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 10px",
                borderRadius: 8, textDecoration: "none", position: "relative",
                background: isActive ? "rgba(255,107,0,0.06)" : "transparent",
                border: isActive ? "1px solid rgba(255,107,0,0.1)" : "1px solid transparent",
                transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
        >
            {isActive && (
                <motion.div
                    layoutId="sidebar-pill"
                    style={{
                        position: "absolute",
                        left: 0, top: 0, bottom: 0,
                        margin: "auto 0",
                        width: 2.5, height: 14,
                        borderRadius: "0 3px 3px 0",
                        background: "rgb(255,107,0)",
                        boxShadow: "0 0 10px rgba(255,107,0,0.65)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
            )}
            <Icon icon={item.icon} style={{
                fontSize: 17,
                color: isActive ? "rgb(255,107,0)" : "rgba(255,255,255,0.75)",
                flexShrink: 0, transition: "color 0.15s ease",
            }} />
            <span style={{
                fontSize: 13, fontFamily: "var(--font-sans,system-ui)",
                fontWeight: isActive ? 700 : 600,
                color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.82)",
                transition: "color 0.15s ease", letterSpacing: "-0.01em",
            }}>
                {item.label}
            </span>
        </Link>
    );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: user } = trpc.auth.me.useQuery();
    const logout = trpc.auth.logout.useMutation({
        onSuccess: () => { router.push("/login"); router.refresh(); },
    });

    return (
        <>
            <div style={{ padding: "22px 18px 16px" }}>
                <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: 9,
                        background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                        <Icon icon="ph:lightning" style={{ color: "rgb(255,107,0)", fontSize: 16 }} />
                    </div>
                    <span style={{
                        fontFamily: "var(--font-heading,system-ui)", fontSize: 15, fontWeight: 700,
                        color: "#FFFFFF", letterSpacing: "-0.03em", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
                    }}>
                        FastProxy
                    </span>
                </Link>
            </div>

            <div style={{
                flex: 1, overflowY: "auto", overflowX: "hidden",
                padding: "0 9px", display: "flex", flexDirection: "column", gap: 18, paddingBottom: 16,
            }}>
                {NAV_GROUPS.filter(g => g.label !== "Admin" || user?.role === "ADMIN").map((group) => (
                    <div key={group.label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {group.label !== "Main" && (
                            <h4 style={{
                                paddingLeft: 10, marginBottom: 4,
                                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)",
                                letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-sans,system-ui)",
                                textShadow: "0 1px 2px rgba(0,0,0,0.3)"
                            }}>
                                {group.label}
                            </h4>
                        )}
                        {group.items.map((item) => (
                            item.comingSoon
                                ? <ComingSoonItem key={item.href} item={item} />
                                : <NavItem key={item.href} item={item} isActive={pathname === item.href} onClick={onNavClick} />
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ margin: "0 14px 10px", height: "1px", background: "rgba(255,255,255,0.04)" }} />

            <div style={{ padding: "0 10px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{
                    padding: "14px 14px 12px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, rgba(255,107,0,0.06) 0%, rgba(255,255,255,0.01) 100%)",
                    border: "1px solid rgba(255,107,0,0.1)",
                    position: "relative", overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute", top: "-20px", right: "-20px",
                        width: "90px", height: "90px",
                        background: "radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Icon icon="ph:wallet" style={{ fontSize: 13, color: "rgba(255,107,0,1)" }} />
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-sans,system-ui)", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                                Balance
                            </span>
                        </div>
                        <Link href="/dashboard/billing/topup" style={{
                            fontSize: 10, color: "rgb(255,107,0)", fontWeight: 600, textDecoration: "none",
                            padding: "2px 8px", borderRadius: 5,
                            background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.18)",
                            letterSpacing: "-0.01em",
                        }}>
                            + Add
                        </Link>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-sans,system-ui)", fontWeight: 600, marginBottom: 1 }}>$</span>
                        <span style={{
                            fontFamily: "var(--font-heading,system-ui)", fontSize: 26, fontWeight: 700,
                            color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1,
                            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                        }}>
                            {user?.balance !== undefined ? user.balance.toFixed(2) : "0.00"}
                        </span>
                    </div>
                </div>

                <Link href="/dashboard/settings" style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "8px 10px", borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.04)",
                    background: "rgba(255,255,255,0.01)",
                    textDecoration: "none", transition: "background 0.15s ease",
                }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.01)")}
                >
                    {user ? <Avatar name={user.name} /> : (
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.04)" }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            fontSize: 12, fontWeight: 600, color: "#FFFFFF",
                            fontFamily: "var(--font-sans,system-ui)", overflow: "hidden", textOverflow: "ellipsis",
                            whiteSpace: "nowrap", letterSpacing: "-0.01em",
                        }}>
                            {user?.name ?? "—"}
                        </p>
                        <p style={{
                            fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans,system-ui)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1,
                        }}>
                            {user?.email ?? ""}
                        </p>
                    </div>
                    <Icon icon="ph:caret-right" style={{ fontSize: 13, color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                </Link>

                <button
                    onClick={() => logout.mutate()}
                    disabled={logout.isPending}
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        padding: "8px 10px", borderRadius: 9,
                        border: "1px solid rgba(239,68,68,0.1)",
                        background: "transparent",
                        cursor: logout.isPending ? "not-allowed" : "pointer",
                        opacity: logout.isPending ? 0.5 : 1,
                        transition: "all 0.15s ease", width: "100%",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.06)";
                        e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "rgba(239,68,68,0.1)";
                    }}
                >
                    <Icon
                        icon={logout.isPending ? "ph:spinner" : "ph:sign-out"}
                        style={{ fontSize: 15, color: "rgba(239,68,68,0.6)", animation: logout.isPending ? "spin 1s linear infinite" : "none" }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(239,68,68,0.6)", fontFamily: "var(--font-sans,system-ui)" }}>
                        {logout.isPending ? "Signing out…" : "Sign out"}
                    </span>
                </button>
            </div>
        </>
    );
}

export default function Sidebar() {
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;
    const [open, setOpen] = useState(false);

    if (!isSmall) {
        return (
            <aside style={{
                width: 255, flexShrink: 0, height: "100vh", position: "fixed", top: 0, left: 0,
                display: "flex", flexDirection: "column",
                background: "rgba(7,7,7,0.9)",
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                borderRight: "1px solid rgba(255,255,255,0.04)", zIndex: 40,
            }}>
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                    background: "linear-gradient(90deg, transparent 5%, rgba(255,107,0,0.2) 50%, transparent 95%)",
                }} />
                <SidebarContent />
            </aside>
        );
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                style={{
                    position: "fixed", top: 14, left: 14, zIndex: 50,
                    width: 40, height: 40, borderRadius: 10,
                    background: "rgba(7,7,7,0.85)", backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                }}
            >
                <Icon icon="ph:list-bold" style={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }} />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setOpen(false)}
                            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50 }}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                            style={{
                                position: "fixed", top: 0, left: 0, bottom: 0, width: 280, zIndex: 51,
                                display: "flex", flexDirection: "column",
                                background: "rgba(7,7,7,0.95)",
                                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                                borderRight: "1px solid rgba(255,255,255,0.06)",
                            }}
                        >
                            <SidebarContent onNavClick={() => setOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

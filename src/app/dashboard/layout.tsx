"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isMobile, isTablet } = useWindowSize();
    const isSmall = isMobile || isTablet;

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#000000",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <Sidebar />
            <main
                style={{
                    flex: 1,
                    minWidth: 0,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div className="grid-bg opacity-70" style={{ left: isSmall ? 0 : 0 }} />
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: isSmall ? 0 : 255,
                    right: 0,
                    height: "60vh",
                    background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,107,0,0.06) 0%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 0,
                }} />
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: isSmall ? 0 : 255,
                        right: 0,
                        height: "1px",
                        background: "linear-gradient(90deg, rgba(255,107,0,0.15), transparent 80%)",
                        pointerEvents: "none",
                        zIndex: 30,
                    }}
                />
                <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", flex: 1 }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

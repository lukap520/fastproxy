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
                background: "var(--color-background, #050505)",
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
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: isSmall ? 0 : 255,
                    right: 0,
                    height: "50vh",
                    background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,107,0,0.055) 0%, transparent 100%)",
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
                        background: "linear-gradient(90deg, rgba(255,107,0,0.12), transparent 60%)",
                        pointerEvents: "none",
                        zIndex: 30,
                    }}
                />
                {children}
            </main>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";

export function useWindowSize() {
    const [size, setSize] = useState({ width: 1200, height: 800 });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        function handleResize() {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return {
        width: size.width,
        height: size.height,
        isMobile: isClient ? size.width < 768 : false,
        isTablet: isClient ? size.width >= 768 && size.width < 1024 : false,
        isDesktop: isClient ? size.width >= 1024 : true,
    };
}

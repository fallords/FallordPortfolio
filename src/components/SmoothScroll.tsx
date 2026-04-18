"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Always scroll to top on page load/refresh
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }
        window.scrollTo(0, 0);

        // Disable Lenis on touch devices, as native scroll is heavily optimized and 
        // smooth scrolling libraries often cause layout jitter on mobile browsers.
        const isTouch = window.matchMedia("(max-width: 768px)").matches || 
            (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0));
            
        if (isTouch) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}

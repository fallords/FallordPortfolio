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
        // Use "pointer: coarse" so touchscreen laptops (mouse as primary input) keep Lenis.
        const isTouch =
            window.matchMedia("(max-width: 768px)").matches ||
            window.matchMedia("(pointer: coarse)").matches;

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

        let frame = 0;
        function raf(time: number) {
            lenis.raf(time);
            frame = requestAnimationFrame(raf);
        }
        frame = requestAnimationFrame(raf);

        /*
         * Anchor links have to go through Lenis too. Left alone, the browser
         * jumps instantly to the target while Lenis is still animating its own
         * position — the page lands in the right place but the transition is a
         * hard cut, which is exactly the seam that makes a site feel unfinished.
         */
        const handleAnchorClick = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) {
                return;
            }

            const anchor = (e.target as HTMLElement)?.closest?.("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href) return;

            // Accept "#works" and "/#works" — the nav uses the absolute form so
            // the links keep working from any route.
            const hash = href.startsWith("#")
                ? href
                : href.startsWith("/#")
                  ? href.slice(1)
                  : null;
            if (!hash || hash === "#") return;

            const target = document.querySelector(hash);
            if (!target) return;

            e.preventDefault();
            lenis.scrollTo(target as HTMLElement, {
                duration: 1.4,
                easing: (t) => 1 - Math.pow(1 - t, 4),
            });
            history.replaceState(null, "", hash);
        };

        document.addEventListener("click", handleAnchorClick);

        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("click", handleAnchorClick);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { pageTopOf } from "./SceneFlow";

/**
 * The page's scroll, eased: a wheel or trackpad carries the page on with a little inertia instead of stepping it, so
 * one section flows into the next (globals.css, "One continuous scene"). Native scroll underneath, so sticky stages
 * and scroll-driven CSS keep working; links within the page glide to where their part really is; touch is left to
 * the device. Off with motion turned down.
 */
export default function SmoothScroll() {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const lenis = new Lenis({ lerp: 0.09 });
        // Links to a part of the page glide there, measured where the part really is in the page (SceneFlow draws
        // sections where they are not); focus goes with it, as a plain link would take it.
        const onClick = (e: MouseEvent) => {
            const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href*="#"]');
            const here = a && a.pathname === location.pathname && a.hash.length > 1;
            const target = here ? document.getElementById(decodeURIComponent(a.hash.slice(1))) : null;
            if (!target || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
            // Ahead of the router's own handling of "/#…" links, which would measure the drawn place.
            e.preventDefault();
            e.stopPropagation();
            lenis.scrollTo(pageTopOf(target));
            history.replaceState(null, "", a!.hash);
            target.focus({ preventScroll: true });
        };
        document.addEventListener("click", onClick, true);
        let frame = 0;
        const tick = (now: number) => {
            lenis.raf(now);
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("click", onClick, true);
            lenis.destroy();
        };
    }, []);
    return null;
}

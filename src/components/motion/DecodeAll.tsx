"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_";
const DURATION = 560;
const STEP = 45;

/**
 * Every element marked `data-decode` decodes itself the first time it
 * comes into view: its letters settle left to right out of random ones, in
 * about half a second, the way the reference's readouts come in.
 *
 * Only the values of the existing text nodes are changed, never the nodes
 * themselves, so React's hold on them is untouched; mark only short,
 * monospaced readouts whose text does not change after it is rendered.
 * With motion turned down nothing happens.
 */
export default function DecodeAll() {
    const pathname = usePathname();

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const frames = new Set<number>();
        const finish: (() => void)[] = [];

        const run = (el: Element) => {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            const nodes: Text[] = [];
            while (walker.nextNode()) nodes.push(walker.currentNode as Text);
            const texts = nodes.map((n) => n.nodeValue ?? "");
            const total = texts.reduce((sum, t) => sum + t.length, 0);
            if (!total) return;
            const restore = () => nodes.forEach((n, i) => (n.nodeValue = texts[i]));
            finish.push(restore);
            const start = performance.now();
            const tick = (now: number) => {
                const t = (now - start) / DURATION;
                if (t >= 1) return restore();
                const settled = Math.floor(t * total);
                const seed = Math.floor(now / STEP);
                let at = 0;
                nodes.forEach((n, k) => {
                    n.nodeValue = [...texts[k]]
                        .map((ch) => {
                            const i = at++;
                            return i < settled || /[\s·/:]/.test(ch) ? ch : GLYPHS[(seed * 7 + i * 13) % GLYPHS.length];
                        })
                        .join("");
                });
                const id = requestAnimationFrame(tick);
                frames.add(id);
            };
            frames.add(requestAnimationFrame(tick));
        };

        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    io.unobserve(entry.target);
                    run(entry.target);
                }
            },
            { rootMargin: "0px 0px -8% 0px" }
        );
        document.querySelectorAll("[data-decode]").forEach((el) => io.observe(el));
        return () => {
            io.disconnect();
            frames.forEach((id) => cancelAnimationFrame(id));
            finish.forEach((restore) => restore());
        };
    }, [pathname]);

    return null;
}

"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_#";
const DURATION = 520;
/* A new random letter every this many ms, not every frame: it reads as decoding, not flicker. */
const STEP = 45;

/**
 * A short readout that decodes itself the first time it comes into view:
 * its letters settle left to right out of random ones, in about half a
 * second. Only for short monospaced labels, where the width cannot jump.
 * The real text is in the HTML and read out from a hidden copy; with
 * motion turned down it is simply there.
 */
export default function Decode({ text, className }: { text: string; className?: string }) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let frame = 0;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                io.disconnect();
                const start = performance.now();
                const tick = (now: number) => {
                    const t = (now - start) / DURATION;
                    if (t >= 1) {
                        el.textContent = text;
                        return;
                    }
                    const settled = Math.floor(t * text.length);
                    const seed = Math.floor(now / STEP);
                    el.textContent = [...text]
                        .map((ch, i) => (i < settled || ch === " " || ch === "·" ? ch : GLYPHS[(seed * 7 + i * 13) % GLYPHS.length]))
                        .join("");
                    frame = requestAnimationFrame(tick);
                };
                frame = requestAnimationFrame(tick);
            },
            { rootMargin: "0px 0px -10% 0px" }
        );
        io.observe(el);
        return () => {
            io.disconnect();
            cancelAnimationFrame(frame);
            el.textContent = text;
        };
    }, [text]);

    return (
        <span className={className}>
            <span className="sr-only">{text}</span>
            <span ref={ref} aria-hidden="true">
                {text}
            </span>
        </span>
    );
}

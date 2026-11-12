"use client";

import { useEffect, useRef } from "react";

/* The page's dot grid: one dot every 20px, centred in its cell (globals.css, body and .page-main). */
const GRID = 20;
/* How far round the pointer the dots light. */
const REACH = 150;
const TRAIL_MS = 650;
const RIPPLE_MS = 1100;

/**
 * The ground comes alive under the pointer. The faint dot grid the page is
 * drawn on lights up green round the crosshair and fades behind it as a
 * short trail, and a press sends a ring out through the dots.
 *
 * It draws on one fixed canvas that sits on the page's ground and under its
 * content, on exactly the dots the CSS grid already shows (the grid scrolls
 * with the page; the canvas works out where it stands). Only the dots that
 * are lit are drawn, and nothing runs once the trail has faded: at rest
 * there is no frame loop at all.
 *
 * Only with a mouse or a trackpad, and not with motion turned down.
 */
export default function DotField() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const color = getComputedStyle(document.documentElement).getPropertyValue("--green").trim() || "#3ee07c";
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        let w = 0;
        let h = 0;
        let frame = 0;
        const trail: { x: number; y: number; t: number }[] = [];
        const rings: { x: number; y: number; t: number }[] = [];
        // The brightest any source makes each dot this frame, keyed by its cell.
        const lit = new Map<number, number>();

        const size = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = (now: number) => {
            frame = 0;
            ctx.clearRect(0, 0, w, h);
            while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
            while (rings.length && now - rings[0].t > RIPPLE_MS) rings.shift();
            if (!trail.length && !rings.length) return;

            // Where the page's grid stands on screen: its rows move up as the page scrolls.
            const top = GRID / 2 - (((window.scrollY % GRID) + GRID) % GRID);
            const left = GRID / 2;
            lit.clear();
            const mark = (i: number, j: number, a: number) => {
                if (a <= 0.02) return;
                const key = i * 4096 + j;
                if (a > (lit.get(key) ?? 0)) lit.set(key, a);
            };
            const cells = (x: number, y: number, r: number, each: (i: number, j: number, d: number) => void) => {
                const i0 = Math.max(0, Math.floor((x - r - left) / GRID));
                const i1 = Math.ceil((x + r - left) / GRID);
                const j0 = Math.max(0, Math.floor((y - r - top) / GRID));
                const j1 = Math.ceil((y + r - top) / GRID);
                for (let i = i0; i <= i1; i++) {
                    for (let j = j0; j <= j1; j++) each(i, j, Math.hypot(left + i * GRID - x, top + j * GRID - y));
                }
            };

            for (const p of trail) {
                const life = 1 - (now - p.t) / TRAIL_MS;
                const r = REACH * (0.4 + 0.6 * life);
                cells(p.x, p.y, r, (i, j, d) => mark(i, j, life * (1 - d / r) ** 2));
            }
            for (const ring of rings) {
                const t = (now - ring.t) / RIPPLE_MS;
                const r = 30 + 520 * (1 - (1 - t) ** 3);
                cells(ring.x, ring.y, r + 16, (i, j, d) => mark(i, j, (1 - t) * (1 - Math.abs(d - r) / 16)));
            }

            ctx.fillStyle = color;
            for (const [key, a] of lit) {
                const i = Math.floor(key / 4096);
                const j = key - i * 4096;
                const s = 1.5 + 2.5 * a;
                ctx.globalAlpha = Math.min(1, a * 1.15);
                ctx.fillRect(left + i * GRID - s / 2, top + j * GRID - s / 2, s, s);
            }
            ctx.globalAlpha = 1;
            frame = requestAnimationFrame(draw);
        };
        const start = () => {
            if (!frame) frame = requestAnimationFrame(draw);
        };

        const onMove = (event: PointerEvent) => {
            if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
            const last = trail.at(-1);
            // A new point only once the pointer has travelled a little: a slow hand does not pile points up.
            if (last && Math.hypot(event.clientX - last.x, event.clientY - last.y) < 14) {
                last.t = performance.now();
            } else {
                trail.push({ x: event.clientX, y: event.clientY, t: performance.now() });
                if (trail.length > 14) trail.shift();
            }
            start();
        };
        const onDown = (event: PointerEvent) => {
            rings.push({ x: event.clientX, y: event.clientY, t: performance.now() });
            if (rings.length > 4) rings.shift();
            start();
        };

        size();
        window.addEventListener("resize", size);
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onDown, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", size);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
        };
    }, []);

    return <canvas ref={ref} aria-hidden="true" className="dotfield" />;
}

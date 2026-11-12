"use client";

import { useEffect, useRef } from "react";

/* The page's dot grid: one dot every 20px, centred in its cell (globals.css, body and .page-main). */
const GRID = 20;
/* How far round the pointer the dots light. */
const REACH = 150;
const TRAIL_MS = 650;
const RIPPLE_MS = 1100;
/* The sweep: one pass down the screen this often, lighting a band that fades behind it. */
const SWEEP_MS = 11000;
const SWEEP_TAIL = 140;
/* Contacts: a dot that flashes and sends out a small ring, every so often somewhere on the screen. */
const BLIP_MS = 1800;
const BLIP_EVERY = [380, 900];
/* With nothing under the pointer the field is redrawn at most this often (about 30 frames a second). */
const IDLE_FRAME_MS = 33;

const smooth = (a: number, b: number, v: number) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
};

/**
 * The ground is always live, like the reference's screens. The faint dot
 * grid the page is drawn on carries a slow signal: waves of faint green
 * drift across it, a sweep passes down the screen every few seconds and
 * leaves a fading band, and now and then a contact flashes on one dot and
 * sends a small ring out. Under the pointer it lights up round the
 * crosshair and fades behind it as a short trail, and a press sends a ring
 * out through the dots.
 *
 * It draws on one fixed canvas on the page's ground, under its content, on
 * exactly the dots the CSS grid already shows (the grid scrolls with the
 * page; the canvas works out where it stands, and the signal moves with
 * the page as the dots do). Only the dots that are lit are drawn, at about
 * 30 frames a second while nothing moves the pointer, and not at all while
 * the tab is hidden (the browser stops the frames).
 *
 * The pointer's part only with a mouse or a trackpad; none of it with
 * motion turned down.
 */
export default function DotField() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        const color = getComputedStyle(document.documentElement).getPropertyValue("--green").trim() || "#19a352";
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        let w = 0;
        let h = 0;
        let frame = 0;
        let last = 0;
        let nextBlip = 0;
        const trail: { x: number; y: number; t: number }[] = [];
        const rings: { x: number; y: number; t: number }[] = [];
        // Contacts sit on the page, not the screen: y is measured from the top of the document.
        const blips: { x: number; y: number; t: number }[] = [];
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
            frame = requestAnimationFrame(draw);
            const pointing = trail.length > 0 || rings.length > 0;
            if (!pointing && now - last < IDLE_FRAME_MS) return;
            last = now;

            ctx.clearRect(0, 0, w, h);
            while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
            while (rings.length && now - rings[0].t > RIPPLE_MS) rings.shift();
            while (blips.length && now - blips[0].t > BLIP_MS) blips.shift();

            const scroll = window.scrollY;
            // Where the page's grid stands on screen: its rows move up as the page scrolls.
            const top = GRID / 2 - (((scroll % GRID) + GRID) % GRID);
            const left = GRID / 2;
            // The row of the page each screen row is, so the signal travels with the page.
            const row0 = Math.round((scroll + top - GRID / 2) / GRID);
            const cols = Math.ceil(w / GRID) + 1;
            const rows = Math.ceil(h / GRID) + 1;
            lit.clear();
            const mark = (i: number, j: number, a: number) => {
                if (a <= 0.02 || i < 0 || j < 0 || i > cols || j > rows) return;
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

            // The signal: three slow waves crossing; only their crests light, and faintly.
            // The sweep: a band moving down the screen, brightest at its front.
            const sweep = ((now % SWEEP_MS) / SWEEP_MS) * (h + SWEEP_TAIL * 2) - SWEEP_TAIL;
            for (let i = 0; i <= cols; i++) {
                for (let j = 0; j <= rows; j++) {
                    const r = row0 + j;
                    const v = Math.sin(i * 0.23 + now * 0.00042) + Math.sin(r * 0.19 - now * 0.00031) + Math.sin((i + r) * 0.09 + now * 0.00017);
                    let a = 0.55 * smooth(0.62, 0.95, (v + 3) / 6);
                    const behind = sweep - (top + j * GRID);
                    if (behind >= 0 && behind < SWEEP_TAIL) a = Math.max(a, 0.75 * (1 - behind / SWEEP_TAIL) ** 1.6);
                    mark(i, j, a);
                }
            }

            // Contacts: a flash on one dot, and a ring that opens round it and fades.
            if (now > nextBlip) {
                nextBlip = now + BLIP_EVERY[0] + Math.random() * (BLIP_EVERY[1] - BLIP_EVERY[0]);
                blips.push({ x: left + Math.floor(Math.random() * cols) * GRID, y: scroll + top + Math.floor(Math.random() * rows) * GRID, t: now });
            }
            for (const b of blips) {
                const t = (now - b.t) / BLIP_MS;
                const y = b.y - scroll;
                const flash = t < 0.08 ? t / 0.08 : (1 - t) ** 2;
                cells(b.x, y, 1, (i, j, d) => d < GRID / 2 && mark(i, j, flash));
                const r = 8 + 72 * (1 - (1 - t) ** 3);
                cells(b.x, y, r + 14, (i, j, d) => mark(i, j, 0.8 * (1 - t) * (1 - Math.abs(d - r) / 14)));
            }

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
        };

        const onMove = (event: PointerEvent) => {
            if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
            const end = trail.at(-1);
            // A new point only once the pointer has travelled a little: a slow hand does not pile points up.
            if (end && Math.hypot(event.clientX - end.x, event.clientY - end.y) < 14) {
                end.t = performance.now();
            } else {
                trail.push({ x: event.clientX, y: event.clientY, t: performance.now() });
                if (trail.length > 14) trail.shift();
            }
        };
        const onDown = (event: PointerEvent) => {
            rings.push({ x: event.clientX, y: event.clientY, t: performance.now() });
            if (rings.length > 4) rings.shift();
        };

        size();
        frame = requestAnimationFrame(draw);
        window.addEventListener("resize", size);
        if (fine) {
            window.addEventListener("pointermove", onMove, { passive: true });
            window.addEventListener("pointerdown", onDown, { passive: true });
        }
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", size);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
        };
    }, []);

    return <canvas ref={ref} aria-hidden="true" className="dotfield" />;
}

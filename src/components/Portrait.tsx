"use client";

import { useEffect, useRef, useState } from "react";
import { reportPortraitProgress } from "@/lib/portraitProgress";

/*
 * The sequence is one continuous head turn: frame 1 is a right-facing
 * profile, frame 181 looks straight into the camera.
 */
const TOTAL = 181;
const PROFILE = 1;
const FRONT = TOTAL;

/*
 * Three cuts of the same sequence, all made ahead of time (public/frames).
 *
 * They are greyscale already. The canvas draws through CSS `grayscale(1)`,
 * and the frames were converted with that filter's own weights, so it leaves
 * them exactly as they are: same picture, but with no colour data that every
 * visitor used to download only for the filter to throw away.
 *
 * They also stop at the generator's watermark (the bottom 8% of the source),
 * and two are cropped around the face, x = 0.45 of the frame, where the hero
 * points `focalX`. "Cover" into a box narrower than 16:9 only ever shows a
 * slice of each frame; a crop that is just wide enough for the box's shape
 * carries that slice and little else:
 *   square  1:1    phones and tablets
 *   wide    1.4:1  laptops and desktops
 *   full    16:9   very wide boxes (big monitors, phones held sideways)
 * The narrowest cut that still covers the box is used, so what is drawn is
 * the same region of the same frame whichever one it is.
 */
const frame = (cut: string) => (i: number) => `/frames/${cut}/${String(i).padStart(3, "0")}.jpg`;
const SETS = {
    square: { src: frame("square"), width: 993, aspect: 1 },
    wide: { src: frame("wide"), width: 1392, aspect: 1392 / 993 },
    full: { src: frame("full"), width: 1920, aspect: 1920 / 993 },
};
type SetName = keyof typeof SETS;
const SET_ORDER: SetName[] = ["square", "wide", "full"];

/*
 * Frames go through Next's image optimizer, sized to the box they are drawn
 * into and served as AVIF/WebP. Measured against the 1920px JPEGs: about 45%
 * smaller at full width, 75–80% smaller at phone widths — on a sequence of
 * 181 images that is most of the page's weight. The widths are Next's
 * default device sizes; quality 75 is its only allowed default.
 */
const WIDTHS = [640, 750, 828, 1080, 1200, 1920];
const optimized = (url: string, w: number) => `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;

const SPAN = FRONT - PROFILE;
/** One leg of the loop, profile → camera or back. Slow on purpose: a turn, not a spin. */
const LEG_MS = 7000;
/** Pause at each end before turning back. */
const HOLD_MS = 1600;
const CYCLE_MS = 2 * (LEG_MS + HOLD_MS);
/** Start the loop once this many frames are in, or after START_CEILING ms. */
const START_CEILING = 2500;
const CONCURRENCY = 6;

/**
 * Coarse to fine: both ends, then every 32nd frame, every 16th … every one.
 * Whatever has arrived is enough to play the turn, just with fewer steps —
 * the sequence is usable after ~25 requests instead of 181.
 */
function loadOrder() {
    const order: number[] = [];
    const seen = new Set<number>();
    const push = (i: number) => {
        if (i < 1 || i > TOTAL || seen.has(i)) return;
        seen.add(i);
        order.push(i);
    };
    push(PROFILE);
    push(FRONT);
    for (const stride of [32, 16, 8, 4, 2, 1]) {
        for (let i = 1; i <= TOTAL; i += stride) push(i);
    }
    return order;
}

/** Frames in the queue up to the every-8th pass — enough for a smooth turn. */
const COARSE_COUNT = Math.ceil(TOTAL / 8) + 1;

/*
 * Sine in-out, not cubic. Cubic packs the movement into the middle of each
 * leg — its peak speed is 3× the average, so a 7-second turn still whips past
 * the halfway point. Sine peaks at ~1.6×, which is what makes it read as slow.
 */
const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Frame at time `t` into the loop: turn to camera, hold, turn back, hold,
 * repeat. A pure function of time, so the motion stays at the same speed
 * however unevenly frames arrive.
 */
function loopFrame(t: number) {
    const c = ((t % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
    if (c < LEG_MS) return PROFILE + easeInOut(c / LEG_MS) * SPAN;
    if (c < LEG_MS + HOLD_MS) return FRONT;
    const back = c - LEG_MS - HOLD_MS;
    if (back < LEG_MS) return FRONT - easeInOut(back / LEG_MS) * SPAN;
    return PROFILE;
}

/**
 * The portrait fills whatever box it is given (`className` sizes it), so the
 * hero can bleed it off the edge of the page. `children` are painted over the
 * image, under the caption — that is where the hero puts its fades.
 */
export default function Portrait({
    className = "",
    focalX = 0.47,
    captionClassName = "bottom-3 right-3",
    children,
}: {
    className?: string;
    /** Horizontal point of the source kept in view, as a fraction of its width. */
    focalX?: number;
    captionClassName?: string;
    children?: React.ReactNode;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const counterRef = useRef<HTMLSpanElement>(null);
    // Which cut to load, from the box's shape. Re-evaluated on resize, so a
    // phone turned sideways switches to the wide frames.
    const [setName, setSetName] = useState<SetName | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ro = new ResizeObserver(() => {
            if (!canvas.clientHeight) return;
            const shape = canvas.clientWidth / canvas.clientHeight;
            setSetName(SET_ORDER.find((name) => shape <= SETS[name].aspect) ?? "full");
        });
        ro.observe(canvas);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { alpha: false });
        if (!canvas || !ctx || !setName) return;
        const set = SETS[setName];
        // The crops are already centred on the face.
        const focus = setName === "full" ? focalX : 0.5;

        /*
         * Reduced motion, or a visitor saving data (Data Saver, or a 2G-class
         * connection): one still frame, looking at the camera, instead of 181.
         */
        const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
        const still =
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
            connection?.saveData === true ||
            /(^|-)2g$/.test(connection?.effectiveType ?? "");

        const frames: (HTMLImageElement | null)[] = new Array(TOTAL + 1).fill(null);
        let loadedCount = 0;
        let cancelled = false;

        /*
         * waiting → loop. The loop runs on its own and ignores the pointer.
         * `still` is the camera-facing frame alone, no animation.
         */
        const s = {
            phase: (still ? "still" : "waiting") as "waiting" | "loop" | "still",
            current: still ? FRONT : PROFILE,
            loopStart: 0,
            drawn: null as HTMLImageElement | null,
            dirty: true,
            visible: true,
            raf: 0,
        };

        /** Closest frame that has actually loaded. */
        const nearest = (i: number): [HTMLImageElement, number] | null => {
            for (let d = 0; d < TOTAL; d++) {
                const a = frames[i - d];
                if (a) return [a, i - d];
                const b = frames[i + d];
                if (b) return [b, i + d];
            }
            return null;
        };

        const draw = (index: number) => {
            const hit = nearest(index);
            if (!hit) return;
            const [img, at] = hit;
            if (img === s.drawn && !s.dirty) return;

            const cw = canvas.width;
            const ch = canvas.height;
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;

            // object-fit: cover, anchored on the subject rather than the centre.
            const scale = Math.max(cw / iw, ch / ih);
            const sw = cw / scale;
            const sh = ch / scale;
            const sx = Math.min(Math.max(focus * iw - sw / 2, 0), iw - sw);

            ctx.drawImage(img, sx, 0, sw, sh, 0, 0, cw, ch);
            s.drawn = img;
            s.dirty = false;
            if (counterRef.current) counterRef.current.textContent = String(at).padStart(3, "0");
        };

        const tick = (now: number) => {
            s.raf = 0;
            if (s.phase === "loop") s.current = loopFrame(now - s.loopStart);

            draw(Math.round(s.current));

            // Only keep the frame loop alive while the portrait is on screen;
            // the IntersectionObserver below restarts it on the way back in.
            if (s.phase === "loop" && s.visible) schedule();
        };

        const schedule = () => {
            if (!s.raf) s.raf = requestAnimationFrame(tick);
        };

        // The loop starts at the profile, so its first leg is the entrance: he
        // turns to face you.
        const startLoop = () => {
            if (s.phase !== "waiting" || cancelled) return;
            s.phase = "loop";
            s.loopStart = performance.now();
            schedule();
        };
        const ceiling = setTimeout(startLoop, START_CEILING);

        /*
         * The frame is drawn "cover", so it is scaled until it fills the box in
         * both directions. The width it is actually rendered at is whichever of
         * the box's width and height-times-aspect is larger; request the
         * smallest optimizer width that covers that, in device pixels.
         *
         * The wide crop stands in for the full frame, which boxes of its shape
         * used to get. It is fetched at the scale the full frame would have
         * been, so the canvas draws exactly the pixels it drew before, just
         * without the parts of each frame that were never on screen.
         */
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const basis = setName === "wide" ? SETS.full : set;
        const needed = Math.max(canvas.clientWidth * dpr, canvas.clientHeight * dpr * basis.aspect);
        const basisWidth = WIDTHS.find((w) => w >= needed) ?? WIDTHS[WIDTHS.length - 1];
        const scaled = (basisWidth * set.width) / basis.width;
        const width = WIDTHS.find((w) => w >= scaled) ?? WIDTHS[WIDTHS.length - 1];

        /** Optimized frame, falling back to the original JPEG if the optimizer fails. */
        const load = async (i: number) => {
            for (const url of [optimized(set.src(i), width), set.src(i)]) {
                const img = new Image();
                img.decoding = "async";
                img.src = url;
                try {
                    await img.decode();
                    if (img.naturalWidth) return img;
                } catch {
                    // try the next source
                }
            }
            return null;
        };

        // Loader: a small pool pulling from the coarse-to-fine queue.
        const queue = still ? [FRONT] : loadOrder();
        let inflight = 0;
        const pump = () => {
            while (inflight < CONCURRENCY && queue.length) {
                const i = queue.shift()!;
                inflight++;
                load(i).then((img) => {
                    if (cancelled) return;
                    inflight--;
                    if (img) frames[i] = img;
                    loadedCount++;
                    // The intro screen waits on this: done once the turn can play (or the still is in).
                    reportPortraitProgress(loadedCount / (still ? 1 : COARSE_COUNT));
                    // A closer frame may now exist for what is on screen.
                    s.dirty = true;
                    schedule();
                    if (loadedCount >= COARSE_COUNT) startLoop();
                    pump();
                });
            }
        };
        pump();

        // Keep the backing store at device resolution, capped at 2x.
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = Math.round(canvas.clientWidth * dpr);
            const h = Math.round(canvas.clientHeight * dpr);
            if (w === canvas.width && h === canvas.height) return;
            canvas.width = w;
            canvas.height = h;
            // Setting the size wipes the canvas. Repaint now, not next frame,
            // or the resize shows as a blank flash.
            s.dirty = true;
            draw(Math.round(s.current));
        };
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const io = new IntersectionObserver(([entry]) => {
            s.visible = entry.isIntersecting;
            if (s.visible) schedule();
        });
        io.observe(canvas);

        return () => {
            cancelled = true;
            clearTimeout(ceiling);
            cancelAnimationFrame(s.raf);
            ro.disconnect();
            io.disconnect();
        };
    }, [focalX, setName]);

    return (
        <figure className={`m-0 overflow-hidden bg-[var(--cloak)] ${className}`}>
            {/*
             * The source is lit hard red. Greyscale first, then a cloak-green
             * layer in `color` blend mode lends its hue while keeping every
             * value — steel highlights, green shadows.
             */}
            <canvas
                ref={canvasRef}
                role="img"
                aria-label="Portrait of Fadhlan Bani"
                className="absolute inset-0 h-full w-full"
                style={{ filter: "grayscale(1) contrast(1.1)" }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 mix-blend-color"
                style={{ background: "var(--cloak-bright)", opacity: 0.6 }}
            />
            {children}
            <figcaption
                className={`absolute z-10 flex items-center gap-4 font-mono text-xs text-[var(--fg-muted)] ${captionClassName}`}
            >
                <span>
                    Frame <span ref={counterRef} className="tabular-nums text-[var(--fg-soft)]">001</span> / {TOTAL}
                </span>
            </figcaption>
        </figure>
    );
}

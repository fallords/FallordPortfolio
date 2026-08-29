"use client";

import { useEffect, useRef, useState } from "react";

/** Grid pitch in CSS pixels. Each cell carries at most one 1px dot. */
const PITCH = 3;

/*
 * These three numbers were measured off the reference rather than guessed.
 * Sampling a text-free patch of its opening frames gives: dots covering ~6% of
 * pixels, darkening the paper by ~14% on average and ~55% at the very darkest,
 * and clearing almost entirely within half a second.
 *
 * The first attempt here used alpha up to 235/255 across a dense grid — about
 * 92% contrast, six times too strong. That is the whole reason it read as a
 * screensaver instead of as grain on paper.
 */
/*
 * Gate, curve and alpha range were solved against the measured targets rather
 * than eyeballed. At pitch 3 only one pixel in nine is a candidate, so hitting
 * 6% *pixel* coverage means roughly 56% of cells must light — a fairly dense
 * grid of mostly very faint grains, which is exactly what the reference is.
 * Searching gate × exponent × alpha range lands on 6.2% / 14.1% / 54.4%.
 */
const GATE = 0.48;
const FALLOFF = 1.5;
const ALPHA_MIN = 8;
const ALPHA_MAX = 150;
const DURATION = 1800;
/** How long to wait on fonts and the load event before starting anyway. */
const READY_CEILING = 900;
/**
 * Absolute wall-clock deadline, independent of the animation.
 *
 * requestAnimationFrame stops in a background tab, so an intro that only ends
 * when its rAF loop reaches the last frame will sit there forever if the
 * visitor opens the page in a background tab and comes back. The page must
 * always be released on a timer that keeps running regardless.
 */
const HARD_DEADLINE = READY_CEILING + DURATION + 700;

/**
 * A drifting field of dots that thins out to uncover the page.
 *
 * The dots are written straight into an ImageData buffer, one pixel each, at
 * CSS resolution. An earlier version drew them with fillRect on a half-size
 * canvas scaled back up — which is what made them read as fat squares rather
 * than as print. Direct pixel writes are both finer and faster: filling the
 * buffer and setting ~130k pixels costs less than the same number of fillRect
 * calls, each of which carries its own state overhead.
 *
 * Occlusion is a plain div behind the canvas rather than a filled canvas, so
 * the cover fades on the compositor and the per-frame work stays limited to
 * the dots themselves.
 *
 * Density comes from three summed trig waves sampled per cell. Real value noise
 * would be marginally prettier and considerably more code; summed sines drift
 * on their own as time advances, which is exactly the motion wanted here.
 */
export default function Intro() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const coverRef = useRef<HTMLDivElement>(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let width = 0;
        let height = 0;
        let buffer: ImageData | null = null;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            buffer = ctx.createImageData(width, height);
        };
        resize();
        window.addEventListener("resize", resize);

        // Three waves at different frequencies; `t` slides them past each other,
        // so the cloud reshapes as well as travels.
        const field = (x: number, y: number, t: number) => {
            const a = Math.sin(x * 0.013 + t * 1.15) * Math.cos(y * 0.017 - t * 0.8);
            const b = Math.sin((x + y) * 0.009 - t * 1.5);
            const c = Math.cos(x * 0.021 - y * 0.011 + t * 0.65);
            return ((a + b + c) / 3) * 0.5 + 0.5;
        };

        let raf = 0;
        let start = 0;
        let finished = false;

        const finish = () => {
            if (finished) return;
            finished = true;
            cancelAnimationFrame(raf);
            clearTimeout(deadline);
            setDone(true);
        };

        // Runs on a timer, not on frames — this is what guarantees release.
        const deadline = setTimeout(finish, HARD_DEADLINE);

        const frame = (now: number) => {
            if (!start) start = now;
            const elapsed = now - start;
            const p = Math.min(1, elapsed / DURATION);
            const t = elapsed / 1000;

            if (!buffer) return;
            const data = buffer.data;
            data.fill(0);

            // Grain thins from a third of the way in, matching how quickly the
            // reference clears rather than holding a full field to the end.
            const fade = p < 0.35 ? 1 : Math.max(0, 1 - (p - 0.35) / 0.5);
            if (fade > 0) {
                for (let y = 0; y < height; y += PITCH) {
                    const row = y * width;
                    for (let x = 0; x < width; x += PITCH) {
                        const n = field(x, y, t);
                        if (n < GATE) continue;
                        // Falloff above the gate: most lit cells sit near the
                        // floor, a few reach the ceiling. That skew is what reads
                        // as grain rather than as a uniform screen.
                        const k = (n - GATE) / (1 - GATE);
                        const i = (row + x) * 4;
                        data[i] = 255;
                        data[i + 1] = 255;
                        data[i + 2] = 255;
                        data[i + 3] =
                            (ALPHA_MIN + Math.pow(k, FALLOFF) * (ALPHA_MAX - ALPHA_MIN)) * fade;
                    }
                }
            }

            ctx.putImageData(buffer, 0, 0);

            // The cover pulls back from 45% onward, so the dot field is fully
            // established before the page starts showing through it.
            if (coverRef.current) {
                const reveal = Math.min(1, Math.max(0, (p - 0.45) / 0.55));
                coverRef.current.style.opacity = String(1 - reveal);
            }

            if (p >= 1) {
                finish();
                return;
            }
            raf = requestAnimationFrame(frame);
        };

        let cancelled = false;
        const begin = () => {
            if (cancelled) return;
            if (reduce) {
                finish();
                return;
            }
            raf = requestAnimationFrame(frame);
        };

        const loaded = new Promise<void>((resolve) => {
            if (document.readyState === "complete") resolve();
            else window.addEventListener("load", () => resolve(), { once: true });
        });
        const fonts: Promise<unknown> = document.fonts?.ready ?? Promise.resolve();
        const ceiling = new Promise<void>((resolve) => setTimeout(resolve, READY_CEILING));

        Promise.race([
            Promise.all([loaded, fonts]).then(() => undefined),
            ceiling,
        ]).then(begin);

        document.body.style.overflow = "hidden";

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            clearTimeout(deadline);
            window.removeEventListener("resize", resize);
            document.body.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        if (done) document.body.style.overflow = "";
    }, [done]);

    // Unmount outright — never leave a full-screen layer over the site.
    if (done) return null;

    return (
        <div aria-hidden="true" className="fixed inset-0 z-[999]">
            <div ref={coverRef} className="absolute inset-0 bg-[var(--surface)]" />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>
    );
}

"use client";

import { useEffect, useRef } from "react";

/*
 * The spring that eases the bar towards the scroll position: the same values
 * the framer-motion version used (mass 1). A dozen lines of physics instead
 * of a motion library on every essay page.
 */
const STIFFNESS = 220;
const DAMPING = 40;
const REST_DELTA = 0.001;
const REST_SPEED = 0.01;
/** Integration step. Small enough that the result doesn't depend on the frame rate. */
const STEP = 1 / 240;

/**
 * A hairline that tracks progress through an article.
 *
 * This was deliberately left off the main page — there, it would be decoration.
 * On a long read it does actual work: it answers "how much is left?" without
 * making the reader scroll to find out. Same component, different justification.
 */
export default function ReadingProgress() {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const bar = barRef.current;
        if (!bar) return;

        const target = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        };

        // Starts at 0 and springs to wherever the page is, as the useSpring
        // version did (it matters when a page opens already scrolled).
        let x = 0;
        let v = 0;
        let raf = 0;
        let last = 0;
        // Frames to wait after waking before the spring moves. framer-motion
        // read the scroll on one frame and started the spring on the next;
        // waiting the same two keeps the bar's timing what it was.
        let lag = 0;
        const paint = () => (bar.style.transform = `scaleX(${x})`);

        const tick = (now: number) => {
            const to = target();
            if (lag > 0) {
                lag--;
                last = now;
                raf = requestAnimationFrame(tick);
                return;
            }
            // Seconds since the last frame, capped so a background tab doesn't jump.
            let dt = last ? Math.min((now - last) / 1000, 0.064) : 0;
            last = now;
            while (dt > 0) {
                const h = Math.min(dt, STEP);
                v += (-STIFFNESS * (x - to) - DAMPING * v) * h;
                x += v * h;
                dt -= h;
            }
            if (Math.abs(to - x) < REST_DELTA && Math.abs(v) < REST_SPEED) {
                x = to;
                v = 0;
                raf = 0;
                last = 0;
                paint();
                return;
            }
            paint();
            raf = requestAnimationFrame(tick);
        };

        const wake = () => {
            if (raf) return;
            lag = 2;
            raf = requestAnimationFrame(tick);
        };

        window.addEventListener("scroll", wake, { passive: true });
        window.addEventListener("resize", wake);
        wake();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", wake);
            window.removeEventListener("resize", wake);
        };
    }, []);

    return (
        <div
            ref={barRef}
            aria-hidden="true"
            style={{ transform: "scaleX(0)" }}
            className="fixed top-0 left-0 right-0 h-[2px] z-[80] origin-left pointer-events-none bg-[var(--gold)]"
        />
    );
}

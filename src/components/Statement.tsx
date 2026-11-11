"use client";

import { useEffect, useRef } from "react";
import "./statement.css";

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t: number) => t * t * (3 - 2 * t);
/* How far the camera goes into the mark: far enough that its ring is wider than the screen. */
const DEPTH = 18;

/**
 * Between the hero and the work, one statement, held on stage for about two
 * screens of scroll, the way the reference shows its "main security threat":
 * it comes up from part-ink to full ink, then the camera flies into the
 * green reticle set between its words until the reticle is bigger than the
 * screen and the work begins. The scroll drives it (a transform on one
 * element, measured once per frame); nothing captures the wheel.
 *
 * The full sentence about the work sits small in the corner. With motion
 * turned down there is no hold: the statement is simply set, mark and all.
 */
export default function Statement() {
    const track = useRef<HTMLElement>(null);
    const text = useRef<HTMLParagraphElement>(null);
    const mark = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = track.current;
        const words = text.current;
        const target = mark.current;
        if (!el || !words || !target) return;
        const live = window.matchMedia("(prefers-reduced-motion: no-preference)");
        let frame = 0;
        // The mark's centre in the statement's own box, and the stage's centre in the same frame; layout values, so transforms do not disturb them.
        let ox = 0;
        let oy = 0;
        let dx = 0;
        let dy = 0;

        const measure = () => {
            ox = target.offsetLeft + target.offsetWidth / 2;
            oy = target.offsetTop + target.offsetHeight / 2;
            const stage = words.parentElement!;
            dx = stage.clientWidth / 2 - (words.offsetLeft + ox);
            dy = stage.clientHeight / 2 - (words.offsetTop + oy);
            words.style.transformOrigin = `${ox}px ${oy}px`;
        };

        const update = () => {
            frame = 0;
            if (!live.matches) return;
            const r = el.getBoundingClientRect();
            const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
            // 0–0.25: it comes up to full ink; 0.25–0.92: the camera flies into the mark; then it gives way.
            const rise = ease(clamp(p / 0.25));
            const dive = clamp((p - 0.25) / 0.67);
            const scale = (0.9 + 0.1 * rise) * Math.pow(DEPTH, dive * dive);
            const pull = ease(clamp(dive * 1.6));
            words.style.transform = `translate(${(dx * pull).toFixed(1)}px, ${(dy * pull).toFixed(1)}px) scale(${scale.toFixed(4)})`;
            words.style.setProperty("--ink", (0.35 + 0.65 * rise).toFixed(3));
            el.style.setProperty("--gone", ease(clamp((p - 0.9) / 0.1)).toFixed(3));
        };
        const request = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        const sync = () => {
            el.toggleAttribute("data-live", live.matches);
            if (!live.matches) {
                words.style.transform = "";
                words.style.removeProperty("--ink");
                el.style.removeProperty("--gone");
            }
            measure();
            request();
        };

        sync();
        document.fonts?.ready.then(sync);
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", sync);
        live.addEventListener("change", sync);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", request);
            window.removeEventListener("resize", sync);
            live.removeEventListener("change", sync);
        };
    }, []);

    return (
        <section ref={track} id="brief" aria-labelledby="brief-title" className="zoom-track">
            <div className="zoom-stage">
                <h2 id="brief-title" className="zoom-label label">
                    <span aria-hidden="true" className="text-[var(--accent)]">
                        _
                    </span>
                    In short
                </h2>
                <p ref={text} className="zoom-text">
                    I design and build for the web, AI{" "}
                    <span ref={mark} aria-hidden="true" className="zoom-mark">
                        <svg viewBox="0 0 100 100" fill="none">
                            <circle cx="50" cy="50" r="33" />
                            <path d="M16 16l17 17M84 16L67 33M16 84l17-17M84 84L67 67" />
                        </svg>
                    </span>{" "}
                    and hardware
                </p>
                <p data-decode className="zoom-note label">
                    Web apps, AI tools and firmware for small boards. Two of the apps below are live, and the wearable was tested on real hardware.
                </p>
            </div>
        </section>
    );
}

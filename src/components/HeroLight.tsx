"use client";

import { useEffect, useRef } from "react";

const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
    const t = clamp(v);
    return t * t * (3 - 2 * t);
};

/**
 * The light in the hero. The stage is dark, and one light cuts through it:
 * the pointer carries it on a laptop, and otherwise it rests on his face.
 * A targeting reticle follows the light with a short lag and reads out
 * where it is, and inside its ring the portrait is seen through a night
 * scope: brighter, green, in scan lines (the `.hero-scope` layers Hero puts
 * over the picture). As the page scrolls through the held hero, the
 * darkness opens (--open, 0 to 1, measured against the same track as the
 * head turn), and over the second half the scope widens until the whole
 * stage is seen through it.
 *
 * Everything is driven by four custom properties on the stage, set only
 * while something moves them (the pointer, the scroll, or the light and
 * the opening settling where they were sent); at rest nothing runs. With
 * motion turned down the light is simply open and still, the scope its
 * resting size.
 */
export default function HeroLight() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const layer = ref.current;
        const stage = layer?.parentElement;
        const track = layer?.closest<HTMLElement>("[data-turn-track]");
        const ring = layer?.querySelector<HTMLElement>(".hero-track");
        if (!layer || !stage || !track || !ring) return;
        const coords = layer.querySelector<HTMLElement>("[data-coords]");
        const set = (x: number, y: number, open: number, widen: boolean) => {
            stage.style.setProperty("--lx", `${x.toFixed(1)}px`);
            stage.style.setProperty("--ly", `${y.toFixed(1)}px`);
            stage.style.setProperty("--open", open.toFixed(3));
            // The scope is the reticle's ring (which closes from 1.6 to 1 over the hold), then everything.
            const rest = ring.offsetWidth * 0.49 * (widen ? 1.6 - 0.6 * open : 1);
            const flood = widen ? smooth((open - 0.5) / 0.5) * Math.hypot(stage.clientWidth, stage.clientHeight) : 0;
            stage.style.setProperty("--sr", `${(rest + flood).toFixed(1)}px`);
            if (coords) coords.textContent = `X ${pad(x)} · Y ${pad(y)}`;
        };
        // Where his face is: a little right of centre on a laptop (the portrait is cropped from its left), the middle on a phone.
        const home = () => ({ x: stage.clientWidth * (window.innerWidth >= 768 ? 0.54 : 0.5), y: stage.clientHeight * 0.36 });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const h = home();
            set(h.x, h.y, 1, false);
            return;
        }

        let pos = home();
        let target = { ...pos };
        let open = 0;
        let visible = true;
        let frame = 0;

        const tick = () => {
            frame = 0;
            pos = { x: pos.x + (target.x - pos.x) * 0.12, y: pos.y + (target.y - pos.y) * 0.12 };
            const r = track.getBoundingClientRect();
            const want = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
            // Eased towards where the scroll is, so a wheel's steps do not show as jumps.
            open += (want - open) * 0.16;
            if (Math.abs(want - open) < 0.001) open = want;
            set(pos.x, pos.y, open, true);
            // Keep going only until the light and the opening have reached where they were sent.
            if (visible && (Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.5 || open !== want)) frame = requestAnimationFrame(tick);
        };
        const start = () => {
            if (!frame && visible) frame = requestAnimationFrame(tick);
        };

        const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
        const onMove = (event: PointerEvent) => {
            if (!fine.matches) return;
            const box = stage.getBoundingClientRect();
            target = { x: event.clientX - box.left, y: event.clientY - box.top };
            start();
        };
        const onLeave = () => {
            target = home();
            start();
        };

        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            start();
        });
        io.observe(stage);
        stage.addEventListener("pointermove", onMove);
        stage.addEventListener("pointerleave", onLeave);
        window.addEventListener("scroll", start, { passive: true });
        set(pos.x, pos.y, 0, true);
        return () => {
            cancelAnimationFrame(frame);
            io.disconnect();
            stage.removeEventListener("pointermove", onMove);
            stage.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("scroll", start);
        };
    }, []);

    return (
        <div ref={ref} aria-hidden="true" className="hero-light">
            <div className="hero-rays" />
            <div className="hero-dark" />
            <div className="hero-track">
                <svg viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="100" r="98" />
                    <circle cx="100" cy="100" r="80" strokeDasharray="0.6 5.6" />
                    <path d="M100 0v14M100 186v14M0 100h14M186 100h14" />
                    <path className="hero-track-mark" d="M100 90v6M100 104v6M90 100h6M104 100h6" />
                    <path className="hero-track-mark" d="M18 40V18h22M182 40V18h-22M18 160v22h22M182 160v22h-22" />
                </svg>
                <span data-coords className="hero-coords label">
                    X 0000 · Y 0000
                </span>
            </div>
        </div>
    );
}

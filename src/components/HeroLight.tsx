"use client";

import { useEffect, useRef } from "react";

const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");

/**
 * The light in the hero. The stage is dark, and one light cuts through it:
 * the pointer carries it on a laptop, and otherwise it rests on his face. A targeting reticle follows the light with
 * a short lag and reads out where it is. As the page scrolls through the
 * held hero, the darkness opens until the whole stage is lit (--open, 0 to
 * 1, measured against the same track as the head turn).
 *
 * Everything is driven by three custom properties on this one layer, set
 * only while something moves it (the pointer, the scroll, or the light
 * settling where it was sent); at rest nothing runs. With motion turned down the
 * light is simply open and still.
 */
export default function HeroLight() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const layer = ref.current;
        const stage = layer?.parentElement;
        const track = layer?.closest<HTMLElement>("[data-turn-track]");
        if (!layer || !stage || !track) return;
        const coords = layer.querySelector<HTMLElement>("[data-coords]");
        const set = (x: number, y: number, open: number) => {
            layer.style.setProperty("--lx", `${x.toFixed(1)}px`);
            layer.style.setProperty("--ly", `${y.toFixed(1)}px`);
            layer.style.setProperty("--open", open.toFixed(3));
            if (coords) coords.textContent = `X ${pad(x)} · Y ${pad(y)}`;
        };
        // Where his face is: a little right of centre on a laptop (the portrait is cropped from its left), the middle on a phone.
        const home = () => ({ x: stage.clientWidth * (window.innerWidth >= 768 ? 0.54 : 0.5), y: stage.clientHeight * 0.36 });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const h = home();
            set(h.x, h.y, 1);
            return;
        }

        let pos = home();
        let target = { ...pos };
        let visible = true;
        let frame = 0;

        const tick = () => {
            frame = 0;
            pos = { x: pos.x + (target.x - pos.x) * 0.12, y: pos.y + (target.y - pos.y) * 0.12 };
            const r = track.getBoundingClientRect();
            const span = Math.max(1, r.height - window.innerHeight);
            set(pos.x, pos.y, Math.min(1, Math.max(0, -r.top / span)));
            // Keep going only until the light has reached where it was sent.
            if (visible && Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.5) frame = requestAnimationFrame(tick);
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
        set(pos.x, pos.y, 0);
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

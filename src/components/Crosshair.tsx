"use client";

import { useEffect, useRef } from "react";

const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");
/* Where the pointer is over something to press, the crosshair opens out. */
const PRESSABLE = "a, button, [role='tab'], [role='button'], label, summary";
/* Where text is typed, the browser's own caret cursor comes back. */
const TYPED = "input, textarea, select, [contenteditable='true']";

/**
 * The reference's pointer: a crosshair in place of the arrow, drawn in
 * "difference" so it shows on light and dark alike, opening out over
 * anything that can be pressed, with the pointer's X and Y read out in the
 * frame's bottom corners (HudFrame's `data-coord` readouts).
 *
 * It follows the pointer exactly, with no easing, so it never lags behind
 * the real position. Only with a mouse or a trackpad; over a text field
 * the system caret comes back; and it hides when the pointer leaves the
 * window.
 */
export default function Crosshair() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
        if (!el || !fine.matches) return;
        const root = document.documentElement;
        root.classList.add("has-crosshair");
        let frame = 0;
        let x = -100;
        let y = -100;
        let target: Element | null = null;
        // Found again only when the page has changed under it (a new route renders new readouts).
        let coords: HTMLElement[] = [];

        const paint = () => {
            frame = 0;
            el.style.translate = `${x}px ${y}px`;
            el.toggleAttribute("data-press", !!target?.closest(PRESSABLE));
            el.toggleAttribute("data-hidden", !!target?.closest(TYPED));
            if (!coords[0]?.isConnected) coords = [...document.querySelectorAll<HTMLElement>("[data-coord]")];
            coords.forEach((node) => {
                node.textContent = pad(node.dataset.coord === "x" ? x : y);
            });
        };
        const onMove = (event: PointerEvent) => {
            if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
            x = event.clientX;
            y = event.clientY;
            target = event.target as Element | null;
            el.removeAttribute("data-away");
            if (!frame) frame = requestAnimationFrame(paint);
        };
        const onLeave = () => el.setAttribute("data-away", "");

        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
            cancelAnimationFrame(frame);
            root.classList.remove("has-crosshair");
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onLeave);
        };
    }, []);

    return (
        <div ref={ref} aria-hidden="true" className="crosshair" data-away="">
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 0v8M12 16v8M0 12h8M16 12h8" />
                <rect x="11" y="11" width="2" height="2" />
            </svg>
        </div>
    );
}

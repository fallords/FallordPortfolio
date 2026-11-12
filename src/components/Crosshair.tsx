"use client";

import { useEffect, useRef } from "react";

const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");
/* Where the pointer is over something to press, the crosshair opens out. */
const PRESSABLE = "a, button, [role='tab'], [role='button'], label, summary";
/* Where text is typed, the browser's own caret cursor comes back. */
const TYPED = "input, textarea, select, [contenteditable='true']";

/**
 * Everything the pointer does on this site, from one listener.
 *
 * The crosshair: in place of the arrow, drawn in "difference" so it shows
 * on light and dark alike, opening out over anything that can be pressed,
 * with the pointer's X and Y read out in the frame's bottom corners
 * (HudFrame's `data-coord` readouts). It follows the pointer exactly, with
 * no easing, so it never lags behind the real position.
 *
 * The word beside it: an element marked `data-cursor="Open"` says what
 * pressing it will do, in a small tag that travels with the crosshair.
 *
 * The pull: an action (`.action`) leans towards the pointer while it is
 * over it, and lets go when it leaves.
 *
 * The tilt: a panel marked `data-tilt` turns a few degrees to face the
 * pointer, as a plate held in the hand would (globals.css, `[data-tilting]`).
 *
 * Only with a mouse or a trackpad. The pull and the tilt are left out
 * with motion turned down; over a text field the system caret comes
 * back; and the crosshair hides when the pointer leaves the window.
 */
export default function Crosshair() {
    const ref = useRef<HTMLDivElement>(null);
    const word = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        const tag = word.current;
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
        if (!el || !tag || !fine.matches) return;
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const root = document.documentElement;
        root.classList.add("has-crosshair");
        let frame = 0;
        let x = -100;
        let y = -100;
        let target: Element | null = null;
        // Found again only when the page has changed under it (a new route renders new readouts).
        let coords: HTMLElement[] = [];
        let pulled: HTMLElement | null = null;
        let tilted: HTMLElement | null = null;
        let said = "";

        const release = () => {
            if (pulled) pulled.style.translate = "";
            pulled = null;
        };
        const level = () => {
            if (tilted) {
                tilted.removeAttribute("data-tilting");
                tilted.style.removeProperty("--tilt-x");
                tilted.style.removeProperty("--tilt-y");
            }
            tilted = null;
        };

        const paint = () => {
            frame = 0;
            el.style.translate = tag.style.translate = `${x}px ${y}px`;
            el.toggleAttribute("data-press", !!target?.closest(PRESSABLE));
            el.toggleAttribute("data-hidden", !!target?.closest(TYPED));

            const text = target?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
            if (text !== said) {
                said = text;
                if (text) tag.textContent = text;
                tag.toggleAttribute("data-on", !!text);
            }

            if (!coords[0]?.isConnected) coords = [...document.querySelectorAll<HTMLElement>("[data-coord]")];
            coords.forEach((node) => {
                node.textContent = pad(node.dataset.coord === "x" ? x : y);
            });
            if (still) return;

            const action = target?.closest<HTMLElement>(".action") ?? null;
            if (action !== pulled) release();
            if (action) {
                const r = action.getBoundingClientRect();
                pulled = action;
                action.style.translate = `${((x - r.left - r.width / 2) * 0.24).toFixed(1)}px ${((y - r.top - r.height / 2) * 0.32).toFixed(1)}px`;
            }

            const plane = target?.closest<HTMLElement>("[data-tilt]") ?? null;
            if (plane !== tilted) level();
            if (plane) {
                const r = plane.getBoundingClientRect();
                tilted = plane;
                plane.setAttribute("data-tilting", "");
                plane.style.setProperty("--tilt-x", ((x - r.left) / r.width - 0.5).toFixed(3));
                plane.style.setProperty("--tilt-y", ((y - r.top) / r.height - 0.5).toFixed(3));
            }
        };
        const onMove = (event: PointerEvent) => {
            if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
            x = event.clientX;
            y = event.clientY;
            target = event.target as Element | null;
            el.removeAttribute("data-away");
            tag.removeAttribute("data-away");
            if (!frame) frame = requestAnimationFrame(paint);
        };
        const onLeave = () => {
            el.setAttribute("data-away", "");
            tag.setAttribute("data-away", "");
            release();
            level();
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        root.addEventListener("pointerleave", onLeave);
        return () => {
            cancelAnimationFrame(frame);
            release();
            level();
            root.classList.remove("has-crosshair");
            window.removeEventListener("pointermove", onMove);
            root.removeEventListener("pointerleave", onLeave);
        };
    }, []);

    return (
        <>
            <div ref={ref} aria-hidden="true" className="crosshair" data-away="">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 0v8M12 16v8M0 12h8M16 12h8" />
                    <rect x="11" y="11" width="2" height="2" />
                </svg>
            </div>
            <div ref={word} aria-hidden="true" className="crosshair-word label" data-away="" />
        </>
    );
}

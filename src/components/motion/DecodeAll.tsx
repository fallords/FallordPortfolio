"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { decode, finishAll, shuffle } from "./textfx";

/* After the intro starts to lift, how long the page waits before its words come in, so they arrive as the sheet clears. */
const AFTER_INTRO_MS = 650;
/* Readouts that come into view together decode one after another, this far apart. */
const STAGGER_MS = 60;

/**
 * How text comes in, page-wide, the way the reference's does.
 *
 * - `data-decode`: a short readout decodes itself (textfx.ts) the first
 *   time it comes into view. Several at once go one after another.
 * - `data-shuffle`: running text has its letters jumbled and settling the
 *   first time it comes into view.
 * - `data-flicker="view"`: a heading's letters come in as a signal does,
 *   flashing green and flickering before they hold (motion.css). It is lit
 *   (`data-lit`) as it comes up, and put out again when it leaves past the
 *   foot of the screen, so scrolling back down to it plays it once more.
 * - `data-scramble`, and every `.action`: decodes again each time the
 *   pointer comes onto it.
 * - The value "active" (`data-decode="active"`, `data-shuffle="active"`,
 *   `data-flicker="active"`) hands the element to its own scene, which
 *   plays it each time it brings the element on (WorkStage); it is left
 *   alone here.
 *
 * On the first visit nothing starts under the intro: it all waits until the
 * intro lifts. With motion turned down nothing happens at all.
 */
export default function DecodeAll() {
    const pathname = usePathname();

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const html = document.documentElement;
        const timers = new Set<ReturnType<typeof setTimeout>>();
        const later = (fn: () => void, ms: number) => {
            const id = setTimeout(() => {
                timers.delete(id);
                fn();
            }, ms);
            timers.add(id);
        };

        // Waits for the intro to lift, then a moment more; with no intro, runs now.
        let waiting: (() => void)[] = [];
        const gate = new MutationObserver(() => {
            if (html.dataset.intro === "show") return;
            gate.disconnect();
            const queued = waiting;
            waiting = [];
            later(() => queued.forEach((fn) => fn()), AFTER_INTRO_MS);
        });
        if (html.dataset.intro === "show") gate.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
        const whenClear = (fn: () => void) => (html.dataset.intro === "show" ? waiting.push(fn) : fn());

        const once = new IntersectionObserver(
            (entries) => {
                const coming = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
                coming.forEach((el) => once.unobserve(el));
                whenClear(() =>
                    coming.forEach((el, k) => later(() => (el.hasAttribute("data-shuffle") ? shuffle(el) : decode(el)), k * STAGGER_MS))
                );
            },
            { rootMargin: "0px 0px -8% 0px" }
        );
        // "active" ones are run by their own scene each time it brings them on (WorkStage), not here.
        document.querySelectorAll('[data-decode]:not([data-decode="active"]), [data-shuffle]:not([data-shuffle="active"])').forEach((el) => once.observe(el));

        const lit = new IntersectionObserver(
            (entries) => {
                for (const { target, isIntersecting, boundingClientRect } of entries) {
                    if (isIntersecting) whenClear(() => target.setAttribute("data-lit", ""));
                    // Gone below the screen (scrolled back up): ready to come in again.
                    else if (boundingClientRect.top > 0) target.removeAttribute("data-lit");
                }
            },
            { rootMargin: "0px 0px -10% 0px" }
        );
        document.querySelectorAll('[data-flicker="view"]').forEach((el) => lit.observe(el));

        // Under the pointer: once per visit to the element, not once per child crossed inside it.
        const onOver = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            const el = (event.target as Element).closest?.("[data-scramble], .action");
            if (el && !el.contains(event.relatedTarget as Node | null)) decode(el);
        };
        document.addEventListener("pointerover", onOver, { passive: true });
        return () => {
            document.removeEventListener("pointerover", onOver);
            once.disconnect();
            lit.disconnect();
            gate.disconnect();
            timers.forEach(clearTimeout);
            finishAll();
        };
    }, [pathname]);

    return null;
}

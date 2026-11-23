"use client";

import { useEffect } from "react";

/**
 * Where an element would be in the page if nothing were pinned or held up: the hero's foot, then each section's
 * height in turn (sticky and translated sections report where they are drawn instead). For links to a section.
 */
export function pageTopOf(target: Element): number {
    const main = document.querySelector<HTMLElement>(".page-main[data-scenes]");
    const scene = target.closest<HTMLElement>(".page-main > section");
    if (!main || !scene || scene.classList.contains("hero")) return target.getBoundingClientRect().top + window.scrollY;
    const hero = main.querySelector<HTMLElement>(":scope > .hero");
    let y = main.getBoundingClientRect().top + window.scrollY + (hero ? hero.offsetTop + hero.offsetHeight : 0);
    for (const s of main.querySelectorAll<HTMLElement>(":scope > section:not(.hero)")) {
        if (s === scene) return y;
        y += s.offsetHeight + (parseFloat(s.style.marginBottom) || 0);
    }
    return y;
}

/**
 * The sections after the hero as scenes that change in place instead of scrolling past. Each is at least a screen
 * tall and stays pinned once its foot reaches the foot of the screen (sticky, `top` set from its height). The next
 * one, while it is still coming up from below, is drawn at the top of the screen instead (translated back by however
 * far it still has to come) and fades in there once the pinned one has faded out, in place, with the particle
 * stream between them (SectionScenes follows the scene marked `data-scene-on`). Once the new one has
 * truly arrived it takes over, and one taller than the screen reads on as normal until its own foot arrives. The
 * statement keeps its own entrance from the hero. Off with motion turned down: then the page scrolls as a page.
 */
/** How long each scene holds, whole and still, before the next comes: a share of a screen of scroll. */
const HOLD = 0.5;

export default function SceneFlow() {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const main = document.querySelector<HTMLElement>(".page-main");
        if (!main) return;
        const scenes = [...main.querySelectorAll<HTMLElement>(":scope > section:not(.hero)")];
        if (scenes.length < 2) return;
        const smooth = (v: number) => {
            const t = v < 0 ? 0 : v > 1 ? 1 : v;
            return t * t * (3 - 2 * t);
        };
        // How the handover runs over the screen of scroll it takes: the old one out over the first part, the new one in
        // over the last, never both at once (the particles stream across the gap between).
        const fadeOut = (p: number) => smooth((p - 0.05) / 0.38);
        const fadeIn = (p: number) => smooth((p - 0.57) / 0.38);
        let frame = 0;
        main.setAttribute("data-scenes", "");

        const pin = () => {
            const vh = window.innerHeight;
            scenes.forEach((s, i) => {
                s.style.minHeight = "100svh";
                s.style.position = "sticky";
                s.style.top = `${Math.min(0, vh - s.offsetHeight)}px`;
                // A stretch of scroll with the scene whole and still before the next one comes, so what comes in with
                // it (its numbers rolling up, its words decoding) has finished. The last one ends the page instead.
                s.style.marginBottom = i < scenes.length - 1 ? `${Math.round(vh * HOLD)}px` : "";
            });
        };

        const update = () => {
            frame = 0;
            const vh = window.innerHeight;
            // Where each scene's top is in the page, on the screen, leaving out the translate drawn on it (offsetTop
            // ignores it, and a scene still on its way up is not yet stuck).
            const mainTop = main.getBoundingClientRect().top;
            const tops = scenes.map((s) => mainTop + s.offsetTop);
            let on = 0;
            let best = -1;
            scenes.forEach((s, i) => {
                const arriving = i > 0 ? Math.max(0, tops[i]!) : 0;
                const next = tops[i + 1];
                const shown = arriving > 0 ? fadeIn((vh - arriving) / vh) : next === undefined ? 1 : 1 - fadeOut((vh - next) / vh);
                // Only a scene that is part of a handover gets a translate or an opacity: each one makes the scene a
                // composited layer thousands of pixels tall, and on a phone a stack of them ran out of memory (the
                // browser reloaded the page). A scene out of play stays where it is in the page, hidden.
                const hidden = shown <= 0.001;
                s.style.translate = arriving > 0 && !hidden ? `0 ${-arriving}px` : "";
                // Opacity 0 as well as hidden: parts inside that set their own visibility would show through otherwise.
                s.style.opacity = hidden ? "0" : shown >= 0.999 ? "" : shown.toFixed(3);
                s.style.visibility = hidden ? "hidden" : "";
                // Not the one on show: out of the pointer's reach (a part inside that sets its own visibility would
                // otherwise still take clicks meant for the scene over it). The keyboard still reaches it (see onFocus).
                s.style.pointerEvents = shown < 0.5 ? "none" : "";
                // The one most on show; in the gap of a handover (none on show), the one on its way in, so the particles
                // already pour into its shape.
                if (shown > best || (shown === best && tops[i]! < vh)) {
                    best = shown;
                    on = i;
                }
            });
            scenes.forEach((s, i) => s.toggleAttribute("data-scene-on", i === on && tops[0]! < vh * 0.5));
        };
        const request = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        const refit = () => {
            pin();
            request();
        };

        // Tabbing into a scene that is not on show goes to it, where it really is in the page.
        const onFocus = (e: FocusEvent) => {
            const scene = (e.target as Element).closest?.<HTMLElement>(".page-main > section:not(.hero)");
            if (scene && scene.style.pointerEvents === "none") window.scrollTo({ top: pageTopOf(scene) });
        };
        document.addEventListener("focusin", onFocus);

        refit();
        // Sections change height as their parts load and their stages switch on; re-pin when they do.
        const resize = new ResizeObserver(refit);
        scenes.forEach((s) => resize.observe(s));
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", refit);
        return () => {
            cancelAnimationFrame(frame);
            resize.disconnect();
            window.removeEventListener("scroll", request);
            window.removeEventListener("resize", refit);
            document.removeEventListener("focusin", onFocus);
            main.removeAttribute("data-scenes");
            scenes.forEach((s) => {
                for (const p of ["min-height", "position", "top", "margin-bottom", "translate", "opacity", "visibility", "pointer-events"]) s.style.removeProperty(p);

                s.removeAttribute("data-scene-on");
            });
        };
    }, []);
    return null;
}

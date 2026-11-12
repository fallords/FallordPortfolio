"use client";

import { useEffect, useRef } from "react";
import { decode, shuffle } from "./motion/textfx";

/* Held only on a screen with room for the panel, and only where motion is welcome; otherwise the roles are a plain log. */
const LIVE = "(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)";

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Drives the held Experience scene (Experience.tsx). It draws the reticle
 * and, from there, finds the rest of the stage. As the page scrolls through
 * the track, the role whose stretch it is comes on: its row gets
 * `data-active` (the panel shows it; its title flickers in, motion.css),
 * its date on the drum turns green and decodes, its name in the index
 * lights, the counter reads its number, and its words settle out of
 * jumbled letters. Nothing is on show until the stage is halfway up the
 * screen, so the first role comes in as the stage arrives. Work is done
 * only in frames where the page has scrolled.
 */
export default function ExperienceDrum() {
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const reticle = ref.current;
        const track = reticle?.closest<HTMLElement>(".xp-track");
        const stage = reticle?.parentElement;
        if (!reticle || !track || !stage) return;
        const rows = [...track.querySelectorAll<HTMLElement>(".xp-row")];
        const dates = [...track.querySelectorAll<HTMLElement>(".xp-date")];
        const names = [...track.querySelectorAll<HTMLElement>(".xp-index li")];
        const column = track.querySelector<HTMLElement>(".xp-drum-col");
        const counter = track.querySelector<HTMLElement>("[data-xp-count]");
        const live = window.matchMedia(LIVE);
        const n = rows.length;
        let active = -2;
        let frame = 0;

        const show = (index: number) => {
            if (index === active) return;
            active = index;
            rows.forEach((row, i) => row.toggleAttribute("data-active", i === index));
            dates.forEach((date, i) => date.toggleAttribute("data-on", i === index));
            names.forEach((name, i) => name.toggleAttribute("data-on", i === index));
            column?.style.setProperty("--active", String(Math.max(0, index)));
            const row = rows[index];
            if (!row) return;
            if (counter) counter.textContent = String(index + 1).padStart(2, "0");
            row.querySelectorAll('[data-shuffle="active"]').forEach(shuffle);
            row.querySelectorAll(".xp-facts").forEach(decode);
            decode(dates[index]);
        };

        const update = () => {
            frame = 0;
            if (!live.matches) return;
            const sticky = parseFloat(getComputedStyle(stage).top) || 0;
            const r = track.getBoundingClientRect();
            const p = clamp((sticky - r.top) / Math.max(1, r.height - stage.offsetHeight));
            reticle.style.rotate = `${(p * 135).toFixed(2)}deg`;
            show(r.top > window.innerHeight * 0.45 ? -1 : Math.min(n - 1, Math.floor(p * n)));
        };
        const request = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        const sync = () => {
            track.toggleAttribute("data-live", live.matches);
            if (!live.matches) {
                // The log: every role in full, nothing on show.
                active = -2;
                rows.forEach((row) => row.removeAttribute("data-active"));
                reticle.style.rotate = "";
            }
            request();
        };

        sync();
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
        live.addEventListener("change", sync);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", request);
            window.removeEventListener("resize", request);
            live.removeEventListener("change", sync);
        };
    }, []);

    return (
        <svg ref={ref} aria-hidden="true" className="xp-reticle" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="198" />
            <circle cx="200" cy="200" r="176" strokeDasharray="1 8.2" />
            <path d="M200 0v20M200 380v20M0 200h20M380 200h20" />
            <circle className="xp-arc" cx="200" cy="200" r="198" strokeDasharray="64 1180" />
        </svg>
    );
}

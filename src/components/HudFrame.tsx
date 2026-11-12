"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "./hud-frame.css";

/* The chapters, as the rail and the sector readout name them. Sections without a number are read out by name only. */
const CHAPTERS: Record<string, { num?: string; name: string }> = {
    brief: { name: "In short" },
    work: { num: "01", name: "Work" },
    experience: { num: "02", name: "Experience" },
    about: { num: "03", name: "What I do" },
    certificates: { num: "04", name: "Certificates" },
    writing: { num: "05", name: "Writing" },
    contact: { num: "06", name: "Contact" },
};
const RAIL = Object.entries(CHAPTERS).filter(([, c]) => c.num);

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_";

const clock = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

/**
 * The frame of the instrument, round the whole screen on a laptop: a mark
 * in each corner, a ruler down the left edge that runs with the scroll, the
 * chapters as a rail of numbers down the right (each a link, the one being
 * read in green), the sector being read in the bottom-left corner (it
 * decodes itself when it changes) and the time in Indonesia, to the
 * second, in the bottom-right. It stays out of the way of the hero, which
 * has its own readouts, and of every pointer except on the rail.
 *
 * Home page only; hidden below 1024px, where the margins are too narrow.
 */
export default function HudFrame() {
    const pathname = usePathname();
    const root = useRef<HTMLDivElement>(null);
    const sector = useRef<HTMLSpanElement>(null);
    const time = useRef<HTMLSpanElement>(null);
    const [active, setActive] = useState<string | null>(null);

    useEffect(() => {
        const el = root.current;
        if (pathname !== "/" || !el) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const sections = Object.keys(CHAPTERS)
            .map((id) => document.getElementById(id))
            .filter((s): s is HTMLElement => !!s);
        let frame = 0;
        let current: string | null = null;
        let decode = 0;
        // What leans with the speed of the scroll (the chapter numbers, the name in the footer).
        const movers = [...document.querySelectorAll<HTMLElement>("[data-vel]")];
        let lastY = window.scrollY;
        let lastT = performance.now();
        let vel = 0;

        const say = (text: string) => {
            const node = sector.current;
            if (!node) return;
            cancelAnimationFrame(decode);
            if (reduced) {
                node.textContent = text;
                return;
            }
            const start = performance.now();
            const tick = (now: number) => {
                const t = Math.min(1, (now - start) / 420);
                const settled = Math.floor(t * text.length);
                const seed = Math.floor(now / 45);
                node.textContent = [...text].map((ch, i) => (i < settled || ch === " " || ch === "/" ? ch : GLYPHS[(seed * 7 + i * 13) % GLYPHS.length])).join("");
                if (t < 1) decode = requestAnimationFrame(tick);
            };
            decode = requestAnimationFrame(tick);
        };

        const update = () => {
            frame = 0;
            el.style.setProperty("--sy", String(Math.round(window.scrollY)));
            // Speed in px per ms, eased and capped; it decays to 0 over a few frames once the scroll stops.
            const now = performance.now();
            const want = reduced ? 0 : Math.max(-9, Math.min(9, ((window.scrollY - lastY) / Math.max(8, now - lastT)) * 3.2));
            lastY = window.scrollY;
            lastT = now;
            const next = Math.abs(want) < 0.05 && Math.abs(vel) < 0.05 ? 0 : vel + (want - vel) * 0.25;
            if (next !== vel) {
                vel = next;
                movers.forEach((m) => m.style.setProperty("--vel", vel.toFixed(2)));
                frame = requestAnimationFrame(update);
            }
            // Over the hero (while its stage is still held at the top) the frame steps back.
            const stage = document.querySelector("[data-turn-track] > *");
            el.toggleAttribute("data-quiet", !!stage && stage.getBoundingClientRect().top > -1);
            const line = window.innerHeight * 0.4;
            let id: string | null = null;
            for (const s of sections) if (s.getBoundingClientRect().top <= line) id = s.id;
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) id = sections.at(-1)?.id ?? id;
            if (id !== current) {
                current = id;
                setActive(id);
                const c = id ? CHAPTERS[id] : null;
                say(c ? `${c.num ? `Sector ${c.num} / ` : ""}${c.name}` : "Sector 00 / Introduction");
            }
        };
        const request = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        const tickClock = () => {
            if (time.current) time.current.textContent = `${clock.format(new Date())} WIB`;
        };
        tickClock();
        const second = window.setInterval(tickClock, 1000);

        update();
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
        return () => {
            cancelAnimationFrame(frame);
            cancelAnimationFrame(decode);
            window.clearInterval(second);
            window.removeEventListener("scroll", request);
            window.removeEventListener("resize", request);
        };
    }, [pathname]);

    if (pathname !== "/") return null;

    return (
        <div ref={root} className="hud" data-quiet="">
            <span aria-hidden="true" className="hud-corner" data-at="tl" />
            <span aria-hidden="true" className="hud-corner" data-at="tr" />
            <span aria-hidden="true" className="hud-corner" data-at="bl" />
            <span aria-hidden="true" className="hud-corner" data-at="br" />
            <span aria-hidden="true" className="hud-ruler" />

            <nav aria-label="Chapters" className="hud-rail">
                <ol>
                    {RAIL.map(([id, c]) => (
                        <li key={id}>
                            <a href={`#${id}`} aria-label={`${c.num}: ${c.name}`} aria-current={active === id ? "location" : undefined} data-cursor={c.name} data-flick className="label">
                                {c.num}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>

            <p aria-hidden="true" className="hud-read label" data-at="bl">
                <span className="hud-coord">
                    X: <span data-coord="x">0000</span>
                </span>
                <span className="hud-dot" />
                <span ref={sector}>Sector 00 / Introduction</span>
            </p>
            <p aria-hidden="true" className="hud-read label" data-at="br">
                <span ref={time}>--:--:-- WIB</span>
                <span className="hud-coord">
                    Y: <span data-coord="y">0000</span>
                </span>
            </p>
        </div>
    );
}

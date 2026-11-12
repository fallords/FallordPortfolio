"use client";

import { useEffect, useRef, type ReactNode } from "react";
import useScrollFade from "@/lib/useScrollFade";
import SwipeHint from "./SwipeHint";
import { decode, shuffle } from "./motion/textfx";
import "./work-stage.css";

/*
 * The Work section as one big workbench. On a wide, tall enough screen with
 * motion allowed, the section is one screen tall per project and its stage
 * stays put while the page scrolls past: the machine on show comes apart
 * into its parts and the next one flies together out of its own, and the
 * text beside it changes with it. Otherwise each machine comes together as
 * it rises to the middle of the screen (or is simply there, under reduced
 * motion or without script): side by side with its text on a tablet, and on
 * a phone as a row to swipe through, one project to a screen.
 *
 * Each machine is on show in a viewport: a framed panel with the project's
 * number large behind the drawing, its figure name in one corner and its
 * year and kind along the bottom.
 *
 * The parts are found in the drawings themselves, so any isometric figure
 * can go on the bench: every solid, line and row of dots is a part, pushed
 * out from the figure's centre, the outer ones first. They move with the
 * CSS `translate` property, which adds to the `transform` each figure's own
 * loop writes, so the machines keep working while they come apart.
 */

export type StageItem = {
    id: string;
    label: string;
    /** The project's number as printed behind its machine: "01". */
    index: string;
    /** The readout along the bottom of the viewport: year, kind, whether it is live. */
    note: ReactNode;
    machine: ReactNode;
    text: ReactNode;
    /** What it does, laid out on its own: rows when stacked, callouts round the ring when held. */
    features?: ReactNode;
};

/* Pinned needs room for the text beside the machine; lower or narrower screens get the stack. */
const PINNED = "(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)";
const STILL = "(prefers-reduced-motion: reduce)";
/* How much later the innermost part starts moving than the outermost. */
const SPREAD = 0.35;

type Part = { el: SVGElement; vx: number; vy: number; delay: number; last: number };

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
    const t = clamp(v);
    return t * t * (3 - 2 * t);
};

/** The parts of a drawing, each with the way it leaves when the machine comes apart. */
function partsOf(root: HTMLElement): Part[] {
    const svg = root.querySelector("svg");
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return [];
    const inverse = ctm.inverse();
    const box = svg.viewBox.baseVal;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const found: { el: SVGElement; x: number; y: number }[] = [];
    const walk = (node: Element) => {
        for (const child of Array.from(node.children)) {
            const tag = child.tagName.toLowerCase();
            if (tag === "defs" || tag === "clippath" || tag === "title") continue;
            // These move as one piece: a solid, a row of dots, and any group that scales, skews or clips what is in it.
            const whole =
                tag !== "g" ||
                child.classList.contains("iso-solid") ||
                child.classList.contains("iso-dots") ||
                child.hasAttribute("clip-path") ||
                /matrix|scale/.test(child.getAttribute("transform") ?? "");
            if (!whole) {
                walk(child);
                continue;
            }
            const r = child.getBoundingClientRect();
            if (r.width + r.height === 0) continue;
            const p = new DOMPoint(r.x + r.width / 2, r.y + r.height / 2).matrixTransform(inverse);
            found.push({ el: child as SVGElement, x: p.x, y: p.y });
        }
    };
    walk(svg);
    const far = Math.max(1, ...found.map(({ x, y }) => Math.hypot(x - cx, y - cy)));
    const reach = Math.max(box.width, box.height);
    return found.map(({ el, x, y }) => {
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.hypot(dx, dy);
        const [ux, uy] = d < 1 ? [0, -1] : [dx / d, dy / d];
        const push = reach * 0.18 + d * 0.9;
        // Outer parts lead; everything also lifts a little, the way a cover comes off before what it covers.
        return { el, vx: ux * push, vy: uy * push - reach * 0.08, delay: (1 - d / far) * SPREAD, last: -1 };
    });
}

/** Moves a machine's parts to `t`: 0 assembled, 1 apart and faded out. */
function pose(machine: HTMLElement | null, parts: Part[], t: number) {
    if (!machine) return;
    for (const part of parts) {
        const k = smooth((t - part.delay) / (1 - SPREAD));
        if (Math.abs(k - part.last) < 0.002) continue;
        part.last = k;
        part.el.style.translate = k ? `${(part.vx * k).toFixed(2)}px ${(part.vy * k).toFixed(2)}px` : "";
    }
    machine.style.opacity = t > 0.5 ? String(1 - smooth((t - 0.5) / 0.5)) : "";
}

export default function WorkStage({ items, skipTo }: { items: StageItem[]; /** Where "Skip" leads: the section after this one. */ skipTo?: string }) {
    const track = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const bar = useRef<HTMLSpanElement>(null);
    // On a phone the stage is a row to swipe; this fades its far edge and feeds the hint under it.
    const edges = useScrollFade(stage);
    const machines = useRef<(HTMLDivElement | null)[]>([]);
    const articles = useRef<(HTMLElement | null)[]>([]);
    const texts = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const el = track.current;
        if (!el) return;
        const count = items.length;
        const pinned = window.matchMedia(PINNED);
        const still = window.matchMedia(STILL);
        let parts: Part[][] = [];
        let frame = 0;
        let active = -1;

        /** Where the stage sticks, how tall it is, and how far the page scrolls while it is held. */
        const geometry = () => {
            const stage = el.firstElementChild?.getBoundingClientRect().height ?? window.innerHeight;
            return { stage, sticky: window.innerHeight - stage, span: Math.max(1, el.offsetHeight - stage) };
        };

        /** The project on show (-1: none yet); its words, readouts and callouts follow this. */
        const show = (index: number) => {
            if (index === active) return;
            active = index;
            articles.current.forEach((article, i) => article?.toggleAttribute("data-active", i === index));
            // Each time a project comes on, its words come in the way the reference's chapters do: the title as a signal (motion.css), the text jumbled and settling, the readouts decoding.
            const article = articles.current[index];
            if (!article || still.matches) return;
            article.querySelectorAll('[data-shuffle="active"]').forEach(shuffle);
            article.querySelectorAll('.ws-fig, .ws-note, [data-decode="active"]').forEach(decode);
        };

        const update = () => {
            frame = 0;
            const vh = window.innerHeight;
            if (still.matches) {
                machines.current.forEach((m, i) => pose(m, parts[i] ?? [], 0));
                return;
            }
            if (!pinned.matches) {
                // Stacked: each machine comes together as its middle rises to just below the middle of the screen.
                machines.current.forEach((m, i) => {
                    if (!m) return;
                    const r = m.getBoundingClientRect();
                    pose(m, parts[i] ?? [], smooth((r.top + r.height / 2 - vh * 0.6) / (vh * 0.4)));
                });
                return;
            }
            const { sticky, span } = geometry();
            const top = el.getBoundingClientRect().top;
            const held = clamp((sticky - top) / span);
            const p = held * (count - 1);
            const i = Math.max(0, Math.min(count - 2, Math.floor(p)));
            const u = p - i;
            const ts = items.map(() => 1);
            // Each machine stays whole for the first 40% of its screen, comes apart just before its words give way at the half, and the next one is together by 80%.
            ts[i] = count > 1 ? smooth((u - 0.4) / 0.25) : 0;
            if (count > 1) ts[i + 1] = 1 - smooth((u - 0.5) / 0.3);
            // Before the stage locks, the first machine flies together as the section comes up.
            if (top > sticky) ts[0] = smooth((top - sticky) / (vh * 0.7));
            ts.forEach((t, j) => {
                pose(machines.current[j] ?? null, parts[j] ?? [], t);
                machines.current[j]?.toggleAttribute("data-gone", t >= 1);
            });
            // Nothing is on show until the stage is halfway up the screen, so the first project's words come in as it arrives (and again if it is scrolled back to).
            show(top > vh * 0.45 ? -1 : count > 1 && u >= 0.5 ? i + 1 : i);
            if (bar.current) bar.current.style.scale = `${held} 1`;
        };

        const request = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        const remeasure = () => {
            el.toggleAttribute("data-live", pinned.matches);
            // Measured assembled, so each part's way out starts from where it really sits.
            machines.current.forEach((m) => {
                if (!m) return;
                m.style.opacity = "";
                m.removeAttribute("data-gone");
                m.querySelectorAll<SVGElement>("svg *").forEach((node) => (node.style.translate = ""));
            });
            parts = machines.current.map((m) => (m ? partsOf(m) : []));
            active = -1;
            if (!pinned.matches) articles.current.forEach((article) => article?.removeAttribute("data-active"));
            request();
        };

        // Tabbing into a project that is not on show brings the stage round to it.
        const onFocus = (event: FocusEvent) => {
            if (!pinned.matches) return;
            const i = texts.current.findIndex((text) => text?.contains(event.target as Node));
            if (i < 0 || i === active) return;
            const { sticky, span } = geometry();
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - sticky + (span * i) / Math.max(1, count - 1) });
        };

        const ready = requestAnimationFrame(remeasure);
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", remeasure);
        pinned.addEventListener("change", remeasure);
        still.addEventListener("change", remeasure);
        el.addEventListener("focusin", onFocus);
        return () => {
            cancelAnimationFrame(ready);
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", request);
            window.removeEventListener("resize", remeasure);
            pinned.removeEventListener("change", remeasure);
            still.removeEventListener("change", remeasure);
            el.removeEventListener("focusin", onFocus);
        };
    }, [items]);

    return (
        <div ref={track} className="ws-track" style={{ "--ws-count": items.length } as React.CSSProperties}>
            <div ref={stage} className="ws-stage scroll-fade">
                {items.map((item, i) => (
                    <article
                        key={item.id}
                        ref={(node) => {
                            articles.current[i] = node;
                        }}
                        className="ws-item"
                        aria-label={item.label}
                    >
                        <div className="ws-view viewport" data-tilt>
                            {/* The scanning ring the machine sits in on the held stage. */}
                            <svg aria-hidden="true" className="ws-ring" viewBox="0 0 400 400" fill="none">
                                <circle cx="200" cy="200" r="198" />
                                <circle cx="200" cy="200" r="182" strokeDasharray="1 7.9" />
                                <path d="M200 0v22M200 378v22M0 200h22M378 200h22" />
                                <circle className="ws-ring-arc" cx="200" cy="200" r="198" strokeDasharray="90 1154" />
                            </svg>
                            <span aria-hidden="true" className="ws-num chapter-num">
                                {item.index}
                            </span>
                            <div
                                ref={(node) => {
                                    machines.current[i] = node;
                                }}
                                className="ws-machine"
                            >
                                {item.machine}
                            </div>
                            {/* On the held stage the machine is locked on: corners close in round it once it has come together. */}
                            <span aria-hidden="true" className="ws-lock">
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                                    <path d="M0 14V0h14M86 0h14v14M100 86v14H86M14 100H0V86" />
                                </svg>
                                <span className="label">Lock / Fig {item.index}</span>
                            </span>
                            <p aria-hidden="true" data-decode className="ws-fig label">
                                Fig {item.index} <span className="text-[var(--fg-dim)]">/ {item.label}</span>
                            </p>
                            <p data-decode className="ws-note label">
                                {item.note}
                            </p>
                        </div>
                        <div
                            ref={(node) => {
                                texts.current[i] = node;
                            }}
                            className="ws-text"
                        >
                            {item.text}
                        </div>
                        {item.features}
                    </article>
                ))}
                {/* How far through the bench the page is; only drawn while the stage is held. */}
                <span aria-hidden="true" className="ws-progress">
                    <span ref={bar} />
                </span>
                {/* A way out of the held scene for anyone who does not want the ride. */}
                {skipTo && (
                    <a href={skipTo} className="scene-skip label" data-scramble>
                        Skip <span aria-hidden="true">↓</span>
                    </a>
                )}
            </div>
            <SwipeHint edges={edges} className="mt-3 text-right md:hidden" />
        </div>
    );
}

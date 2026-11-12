"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./figures.css";

export type Figure = {
    /** What the figure counts, as a one- or two-word name for the index. */
    name: string;
    value: string;
    unit?: string;
    caption: string;
};

/* Held where motion is welcome; otherwise the figures are a plain row (figures.css, top half). */
const LIVE = "(prefers-reduced-motion: no-preference)";

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * The work in figures, as a held scene. The stage stays put for about three
 * screens of scroll while a drum of numbers turns inside a reticle: the
 * figure in the middle is green and its caption stands beside it, the
 * ones before and after it wait faint above and below, and the reticle
 * turns with the scroll. An index of all five runs down the left.
 *
 * Every figure is real and comes from the page's own content; see Home.
 */
export default function Figures({ items }: { items: Figure[] }) {
    const track = useRef<HTMLElement>(null);
    const reticle = useRef<SVGSVGElement>(null);
    const numbers = useRef<(HTMLSpanElement | null)[]>([]);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const el = track.current;
        if (!el) return;
        const live = window.matchMedia(LIVE);
        let frame = 0;

        const update = () => {
            frame = 0;
            if (!live.matches) return;
            const stage = el.firstElementChild as HTMLElement;
            const sticky = parseFloat(getComputedStyle(stage).top) || 0;
            const r = el.getBoundingClientRect();
            const p = clamp((sticky - r.top) / Math.max(1, r.height - stage.offsetHeight));
            const now = Math.min(items.length - 1, Math.floor(p * items.length));
            setActive(now);
            // The figure on show counts up to its value over the first 40% of its stretch, the others rest on theirs.
            const run = clamp((p * items.length - now) / 0.4);
            numbers.current.forEach((node, i) => {
                const text = node?.firstChild;
                if (!text) return;
                const value = items[i].value;
                const target = parseFloat(value);
                const decimals = value.includes(".") ? value.split(".")[1].length : 0;
                text.nodeValue = i === now && run < 1 ? (target * run * run * (3 - 2 * run)).toFixed(decimals) : value;
            });
            if (reticle.current) reticle.current.style.rotate = `${(p * 135).toFixed(2)}deg`;
        };
        const request = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        const sync = () => {
            el.toggleAttribute("data-live", live.matches);
            if (!live.matches) setActive(0);
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
    }, [items.length]);

    return (
        <section ref={track} id="numbers" aria-labelledby="numbers-title" className="fig-track" style={{ "--n": items.length } as CSSProperties}>
            <div className="fig-stage shell">
                <div className="fig-head">
                    <h2 id="numbers-title" className="label text-[var(--fg)]">
                        <span aria-hidden="true" className="text-[var(--accent)]">
                            _
                        </span>
                        In numbers
                    </h2>
                    <p className="fig-count label tabular-nums">
                        <span aria-hidden="true">
                            {active + 1} of {items.length}
                        </span>
                        {/* A way out of the held scene. */}
                        <a href="#about" className="scene-skip label" data-scramble>
                            Skip <span aria-hidden="true">↓</span>
                        </a>
                    </p>
                </div>

                <svg ref={reticle} aria-hidden="true" className="fig-reticle" viewBox="0 0 400 400" fill="none">
                    <circle cx="200" cy="200" r="198" />
                    <circle cx="200" cy="200" r="176" strokeDasharray="1 8.2" />
                    <path d="M200 0v20M200 380v20M0 200h20M380 200h20" />
                    <circle className="fig-arc" cx="200" cy="200" r="198" strokeDasharray="64 1180" />
                </svg>

                <ol aria-hidden="true" data-decode className="fig-index label">
                    {items.map((item, i) => (
                        <li key={item.name} data-on={i === active || undefined}>
                            <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span> {item.name}
                        </li>
                    ))}
                </ol>

                {/* The band the figure on show stands in, ruled across the stage. */}
                <span aria-hidden="true" className="fig-band" />

                <div aria-hidden="true" className="fig-drum">
                    <div className="fig-drum-col" style={{ "--active": active } as CSSProperties}>
                        {items.map((item, i) => (
                            <p key={item.name} className="fig-drum-value" data-on={i === active || undefined}>
                                <span
                                    ref={(node) => {
                                        numbers.current[i] = node;
                                    }}
                                >
                                    {item.value}
                                </span>
                                {item.unit && <span className="fig-unit label">{item.unit}</span>}
                            </p>
                        ))}
                    </div>
                </div>

                <ol className="fig-list">
                    {items.map((item, i) => (
                        <li key={item.name} className="fig-item" data-on={i === active || undefined}>
                            <p className="fig-item-value">
                                {item.value}
                                {item.unit && <span className="fig-unit label"> {item.unit}</span>}
                            </p>
                            <p className="label mt-3 text-[var(--fg-dim)]">{item.name}</p>
                            <p className="fig-item-caption">{item.caption}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

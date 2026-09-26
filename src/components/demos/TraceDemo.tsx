"use client";

import { useEffect, useState } from "react";

/*
 * A request trace, the way an observability tool draws one: each span is a
 * bar on a shared timeline. It plays back 2.5× slower than real time, with a
 * playhead, so you can watch where the time actually goes, and see why
 * streaming matters: the user can read from 410ms instead of waiting 1240ms.
 */
const TOTAL_MS = 1240;
const FIRST_TOKEN_MS = 410;
const SLOWDOWN = 2.5;

const spans = [
    { name: "POST /api/analyze", start: 0, end: 1240, depth: 0, tone: "var(--fg-soft)" },
    { name: "auth.verify", start: 4, end: 22, depth: 1 },
    { name: "input.validate", start: 22, end: 31, depth: 1 },
    { name: "ratelimit.check", start: 31, end: 46, depth: 1 },
    { name: "cache.lookup", start: 46, end: 58, depth: 1 },
    { name: "llm.stream", start: 60, end: 1150, depth: 1, tone: "var(--cloak-bright)" },
    { name: "first token", start: 60, end: FIRST_TOKEN_MS, depth: 2, tone: "var(--gold)" },
    { name: "db.insert", start: 1152, end: 1204, depth: 1 },
    { name: "response.end", start: 1204, end: 1240, depth: 1 },
];

const TICKS = [0, 250, 500, 750, 1000];
const pct = (ms: number) => `${(ms / TOTAL_MS) * 100}%`;

export default function TraceDemo() {
    const [t, setT] = useState(0);
    const [run, setRun] = useState(0);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const id = setTimeout(() => setT(TOTAL_MS), 0);
            return () => clearTimeout(id);
        }
        let raf = 0;
        let start = 0;
        const tick = (now: number) => {
            if (!start) start = now;
            const ms = Math.min(TOTAL_MS, (now - start) / SLOWDOWN);
            setT(ms);
            if (ms < TOTAL_MS) raf = requestAnimationFrame(tick);
        };
        // A short beat before the request goes out.
        const id = setTimeout(() => (raf = requestAnimationFrame(tick)), 400);
        return () => {
            clearTimeout(id);
            cancelAnimationFrame(raf);
        };
    }, [run]);

    const done = t >= TOTAL_MS;

    return (
        <div className="flex h-full flex-col p-3.5 font-mono text-[11px] sm:p-5 sm:text-[11.5px]">
            <div className="flex items-baseline justify-between text-[var(--fg-dim)]">
                <span>request timeline · played at 1/{SLOWDOWN} speed</span>
                <span className="tabular-nums text-[var(--fg)]">{Math.round(t)} ms</span>
            </div>

            <div className="relative mt-2 sm:mt-3">
                {/* Time axis */}
                <div className="relative ml-[7.5rem] mr-14 h-5 border-b border-[var(--rule)] text-[var(--fg-dim)] sm:ml-[9.5rem]">
                    {TICKS.map((tick) => (
                        <span
                            key={tick}
                            // Every other tick on a phone; five labels don't fit in ~100px.
                            className={`absolute -translate-x-1/2 ${tick % 500 ? "hidden sm:inline" : ""}`}
                            style={{ left: pct(tick) }}
                        >
                            {tick}
                        </span>
                    ))}
                </div>

                <ul className="mt-1.5 flex flex-col gap-1 leading-tight sm:mt-2 sm:gap-2 sm:leading-normal">
                    {spans.map((s) => {
                        const active = t >= s.start && t < s.end;
                        const grown = Math.min(1, Math.max(0, (t - s.start) / (s.end - s.start)));
                        return (
                            <li key={s.name} className="flex items-center">
                                <span
                                    className={`w-[7.5rem] shrink-0 truncate transition-colors sm:w-[9.5rem] ${
                                        active ? "text-[var(--fg)]" : t >= s.end ? "text-[var(--fg-muted)]" : "text-[var(--fg-dim)]"
                                    }`}
                                    style={{ paddingLeft: `${s.depth * 0.75}rem` }}
                                >
                                    {s.name}
                                </span>
                                <span className="relative h-3 flex-1">
                                    <span
                                        className="absolute inset-y-0"
                                        style={{
                                            left: pct(s.start),
                                            // Tiny spans get a minimum width so they stay visible.
                                            width: `calc(${pct(Math.max(6, s.end - s.start))} * ${grown})`,
                                            background: s.tone ?? "var(--fg-dim)",
                                        }}
                                    />
                                </span>
                                <span className="w-14 shrink-0 text-right tabular-nums text-[var(--fg-dim)]">
                                    {t >= s.end ? `${s.end - s.start}ms` : ""}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                {/* The playhead, over the bars only. */}
                <div className="pointer-events-none absolute inset-y-0 left-[7.5rem] right-14 sm:left-[9.5rem]">
                    <div className="absolute inset-y-0 w-px bg-[var(--gold)]/70" style={{ left: pct(t) }} />
                </div>
            </div>

            {/* What the person using it experiences. */}
            <div className="mt-4 border-t border-[var(--rule)] pt-2.5 sm:pt-3 md:mt-auto">
                {/* The replay button shares the question's line: one row less on a phone. */}
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[var(--fg-dim)]">when can the user start reading?</p>
                    <button
                        type="button"
                        onClick={() => {
                            setT(0);
                            setRun((r) => r + 1);
                        }}
                        disabled={!done}
                        className="min-h-[24px] shrink-0 border border-[var(--rule-strong)] px-2 py-0.5 text-[var(--fg-soft)] transition-colors hover:border-[var(--gold)] hover:text-[var(--fg)] disabled:opacity-40 sm:py-1"
                    >
                        ↻ Send again
                    </button>
                </div>
                {[
                    { label: "with streaming", at: FIRST_TOKEN_MS },
                    { label: "without", at: TOTAL_MS },
                ].map((row) => (
                    <div key={row.label} className="mt-1.5 flex items-center">
                        <span className="w-[7.5rem] shrink-0 text-[var(--fg-muted)] sm:w-[9.5rem]">{row.label}</span>
                        <span className="relative h-1.5 flex-1 bg-[var(--surface-raised)]">
                            <span className="absolute inset-y-0 left-0 bg-[var(--fg-dim)]" style={{ width: pct(Math.min(t, row.at)) }} />
                            {t >= row.at && <span className="absolute -top-[3px] h-3 w-0.5 bg-[var(--gold)]" style={{ left: pct(row.at) }} />}
                        </span>
                        <span className={`w-14 shrink-0 text-right tabular-nums ${t >= row.at ? "text-[var(--gold)]" : "text-[var(--fg-dim)]"}`}>
                            {t >= row.at ? `${row.at}ms` : "…"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

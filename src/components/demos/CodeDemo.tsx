"use client";

import { useEffect, useState } from "react";

/*
 * The loader behind the portrait at the top of the site
 * (components/Portrait.tsx), trimmed. The demo types it out, then runs it:
 * the strip below lights up the 181 frames in the order this code returns.
 */
const SOURCE = `// Rough frames first, then fill in the gaps.
function loadOrder(total: number) {
  const order: number[] = [];
  const seen = new Set<number>();
  const push = (i: number) => {
    if (i < 1 || i > total || seen.has(i)) return;
    seen.add(i);
    order.push(i);
  };
  push(1);
  push(total);
  for (const stride of [32, 16, 8, 4, 2, 1])
    for (let i = 1; i <= total; i += stride) push(i);
  return order;
}`;

/** The same function, for real, so the strip shows its actual output. */
function loadOrder(total: number) {
    const order: number[] = [];
    const seen = new Set<number>();
    const push = (i: number) => {
        if (i < 1 || i > total || seen.has(i)) return;
        seen.add(i);
        order.push(i);
    };
    push(1);
    push(total);
    for (const stride of [32, 16, 8, 4, 2, 1]) for (let i = 1; i <= total; i += stride) push(i);
    return order;
}

const TOTAL = 181;
const ORDER = loadOrder(TOTAL);
/** Frames needed before the portrait can start turning (every 8th, plus both ends). */
const PLAYABLE = Math.ceil(TOTAL / 8) + 1;
/** Position of each frame in the load order, for colouring the strip. */
const RANK = (() => {
    const r = new Array<number>(TOTAL + 1).fill(0);
    ORDER.forEach((frame, i) => (r[frame] = i));
    return r;
})();

const LINES = SOURCE.split("\n");
const STARTS = LINES.reduce<number[]>((acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + LINES[i - 1].length + 1], []);

const TOKEN =
    /(\/\/.*$)|("[^"]*"|`[^`]*`)|\b(const|let|function|return|for|if|of|new)\b|\b(number|string|Set)\b|\b(\d+)\b|\b([a-zA-Z_]\w*)(?=\s*\()/g;

const STYLE = [
    "text-[var(--fg-dim)] italic", // comment
    "text-[#8fbf9f]", // string
    "text-[var(--gold)]", // keyword
    "text-[#9fb6c6]", // type
    "text-[#c9a3c9]", // number
    "text-[var(--fg)]", // function call
];

/** A deliberately small highlighter: six token classes, one regex. */
function highlight(line: string) {
    const out: React.ReactNode[] = [];
    let last = 0;
    for (const m of line.matchAll(TOKEN)) {
        const kind = m.slice(1).findIndex(Boolean);
        if (m.index > last) out.push(line.slice(last, m.index));
        out.push(
            <span key={m.index} className={STYLE[kind]}>
                {m[0]}
            </span>
        );
        last = m.index + m[0].length;
    }
    out.push(line.slice(last));
    return out;
}

const CHARS_PER_TICK = 6;
const TICK_MS = 16;

export default function CodeDemo() {
    const [typed, setTyped] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [run, setRun] = useState(0);

    const done = typed >= SOURCE.length && loaded >= TOTAL;

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const id = setTimeout(() => {
                setTyped(SOURCE.length);
                setLoaded(TOTAL);
            }, 0);
            return () => clearTimeout(id);
        }
        let t = 0;
        let l = 0;
        let pause = 0;
        let slow = 0;
        const id = setInterval(() => {
            if (t < SOURCE.length) {
                t = Math.min(SOURCE.length, t + CHARS_PER_TICK);
                setTyped(t);
                return;
            }
            // A beat between writing the code and running it.
            if (pause < 18) {
                pause++;
                return;
            }
            // The first frames go in one at a time so the coarse pattern is
            // visible; the rest fill in quickly.
            l = Math.min(TOTAL, l + (l < PLAYABLE ? (slow++ % 3 === 0 ? 1 : 0) : 3));
            setLoaded(l);
            if (l >= TOTAL) clearInterval(id);
        }, TICK_MS);
        return () => clearInterval(id);
    }, [run]);

    const restart = () => {
        setTyped(0);
        setLoaded(0);
        setRun((r) => r + 1);
    };

    return (
        <div className="flex h-full flex-col">
            <pre className="min-h-0 flex-1 overflow-hidden px-4 py-2.5 font-mono text-[10px] leading-[1.45] text-[var(--fg-muted)] sm:px-5 sm:py-3.5 sm:text-[11px] sm:leading-[1.65] lg:py-4 lg:text-[12.5px] lg:leading-[1.55]">
                {/*
                 * Every line is laid out from the start, the untyped part
                 * invisible. On a phone the panel is only as tall as this, so
                 * it has its final height before the first character: typing
                 * never pushes the page down, and a line never re-wraps as it
                 * fills in.
                 */}
                {LINES.map((line, i) => {
                    const reached = typed >= STARTS[i];
                    const shown = reached ? line.slice(0, typed - STARTS[i]) : "";
                    const typingHere = reached && typed < SOURCE.length && typed <= STARTS[i] + line.length;
                    return (
                        <div key={i} className={reached ? "flex" : "invisible flex"} aria-hidden={!reached || undefined}>
                            {/* Under 380px the numbers give their width to the code, so fewer lines wrap. */}
                            <span className="w-6 shrink-0 select-none text-right text-[var(--fg-dim)] max-[379px]:hidden sm:w-8">{i + 1}</span>
                            {/* Wraps until the panel is wide enough (lg) rather than hiding half of each line off its side. */}
                            <code className="min-w-0 whitespace-pre-wrap break-words pl-[calc(0.625rem+2ch)] [text-indent:-2ch] max-[379px]:pl-[2ch] sm:pl-[calc(1rem+2ch)] lg:whitespace-pre lg:pl-5 lg:[text-indent:0]">
                                {highlight(shown)}
                                {/* Takes no room in the line, so it can't change where the line wraps. */}
                                {(typingHere || (typed >= SOURCE.length && i === LINES.length - 1)) && (
                                    <span className="caret -mr-[calc(0.55em+2px)] ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-[var(--gold)]" />
                                )}
                                <span className="invisible">{line.slice(shown.length)}</span>
                            </code>
                        </div>
                    );
                })}
            </pre>

            {/* The code's output: every frame, lit in the order loadOrder() returns. */}
            <div className="shrink-0 border-t border-[var(--rule)] px-4 py-2 font-mono text-[11px] sm:px-5 sm:py-2.5">
                <div className="flex items-baseline justify-between text-[var(--fg-dim)]">
                    <span>
                        loadOrder(181)<span className="hidden sm:inline"> → frames in load order</span>
                    </span>
                    <span className="tabular-nums">
                        {loaded >= PLAYABLE && <span className="text-[var(--gold)]">turn can start · </span>}
                        {loaded}/{TOTAL}
                    </span>
                </div>
                <svg viewBox={`0 0 ${TOTAL} 10`} preserveAspectRatio="none" className="mt-1 h-5 w-full sm:mt-1.5 sm:h-6" aria-hidden="true">
                    {Array.from({ length: TOTAL }, (_, k) => {
                        const frame = k + 1;
                        const lit = RANK[frame] < loaded;
                        return (
                            <rect
                                key={frame}
                                x={k}
                                y={0}
                                width={0.72}
                                height={10}
                                fill={lit ? (RANK[frame] < PLAYABLE ? "var(--gold)" : "var(--fg-soft)") : "var(--surface-raised)"}
                            />
                        );
                    })}
                </svg>
                <div className="mt-1 flex items-center justify-between text-[var(--fg-dim)] sm:mt-1.5">
                    <span>
                        <span className="text-[var(--gold)]">■</span> first {PLAYABLE} frames · <span className="text-[var(--fg-soft)]">■</span> the rest
                    </span>
                    <button
                        type="button"
                        onClick={restart}
                        disabled={!done}
                        className="min-h-[24px] border border-[var(--rule-strong)] px-2 py-0.5 text-[var(--fg-soft)] sm:py-1 transition-colors hover:border-[var(--gold)] hover:text-[var(--fg)] disabled:opacity-40"
                    >
                        ↻ Run again
                    </button>
                </div>
            </div>
        </div>
    );
}

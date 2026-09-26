"use client";

import { useEffect, useState } from "react";

/*
 * A streamed chat reply, rendered as it arrives. The replies are written in
 * advance (there is no API behind this); what is real is the behaviour you
 * feel: a pause before the first word, text appearing before the answer is
 * finished, a way to stop it, and numbers that settle when it is done.
 */
const EXAMPLES = [
    {
        chip: "Better button label",
        prompt: "What's a better label for the “Submit” button on a contact form?",
        reply: "Try “Send message”. It says exactly what happens when someone clicks it, and it's short enough to fit on one line on a phone.",
    },
    {
        chip: "Summarise a chat",
        prompt: "Summarise this in one line: “Are you coming tonight?” “Maybe, depends on work.” “Ok, let me know by 6.”",
        reply: "They're making plans for tonight. One of them isn't sure yet and has been asked to confirm by 6.",
    },
    {
        chip: "Explain LoRa",
        prompt: "Explain LoRa in one sentence.",
        reply: "LoRa is a low-power radio that sends small bits of data a long way, like a sensor reading from one end of a building to the other.",
    },
];

const TOKEN_MS = 55;
const THINK_MS = 600;

/** Word-sized chunks, spaces kept, the way a model streams tokens. */
const tokensOf = (text: string) => text.match(/\S+\s*/g) ?? [text];

export default function StreamDemo() {
    const [pick, setPick] = useState(0);
    const [count, setCount] = useState(0);
    const [stopped, setStopped] = useState(false);
    const [run, setRun] = useState(0);

    const tokens = tokensOf(EXAMPLES[pick].reply);
    const done = count >= tokens.length;
    const streaming = count > 0 && !done && !stopped;

    useEffect(() => {
        // Stopping re-runs this effect: its cleanup cancels the stream, and
        // this early return keeps a new one from starting.
        if (stopped) return;
        const total = tokensOf(EXAMPLES[pick].reply).length;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const id = setTimeout(() => setCount(total), 0);
            return () => clearTimeout(id);
        }
        let n = 0;
        let interval: ReturnType<typeof setInterval>;
        // A beat of "thinking" before the first token, as a real call has.
        const start = setTimeout(() => {
            interval = setInterval(() => {
                n += 1;
                setCount(n);
                if (n >= total) clearInterval(interval);
            }, TOKEN_MS);
        }, THINK_MS);
        return () => {
            clearTimeout(start);
            clearInterval(interval);
        };
    }, [pick, run, stopped]);

    const ask = (i: number) => {
        setCount(0);
        setStopped(false);
        if (i === pick) setRun((r) => r + 1);
        else setPick(i);
    };

    const stop = () => setStopped(true);

    const status = stopped ? "stopped" : done ? "done" : count ? "streaming" : "thinking";

    return (
        <div className="flex h-full flex-col gap-3 p-3.5 text-sm sm:gap-4 sm:p-5">
            {/* Suggested prompts */}
            <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                {EXAMPLES.map((ex, i) => (
                    <button
                        key={ex.chip}
                        type="button"
                        onClick={() => ask(i)}
                        aria-pressed={i === pick}
                        className={`border px-2 py-1 transition-colors ${
                            i === pick ? "border-[var(--gold)] text-[var(--fg)]" : "border-[var(--rule-strong)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
                        }`}
                    >
                        {ex.chip}
                    </button>
                ))}
            </div>

            <p key={`${pick}-${run}`} className="fade-in ml-auto max-w-[85%] bg-[var(--surface-raised)] px-4 py-3 leading-relaxed text-[var(--fg-soft)]">
                {EXAMPLES[pick].prompt}
            </p>

            {/* Room for the longest reply on a phone, where the panel is only as tall as its content: it grows no further while streaming. */}
            <div className="min-h-[6rem] max-w-[92%] leading-relaxed text-[var(--fg)] md:min-h-0" aria-live="polite">
                {count === 0 && !stopped ? (
                    <span className="font-mono text-xs text-[var(--fg-dim)]">
                        thinking<span className="caret">_</span>
                    </span>
                ) : (
                    <>
                        {tokens.slice(0, count).join("")}
                        {streaming && <span className="caret ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-[var(--gold)]" />}
                    </>
                )}
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--rule)] pt-3 font-mono text-[11px] text-[var(--fg-dim)]">
                <span className="tabular-nums">
                    {status} · first word {THINK_MS}ms · {count}/{tokens.length} tokens · {Math.round(1000 / TOKEN_MS)} tok/s
                </span>
                {streaming && (
                    <button
                        type="button"
                        onClick={stop}
                        className="shrink-0 border border-[var(--rule-strong)] px-2 py-1 text-[var(--fg-soft)] transition-colors hover:border-[var(--gold)] hover:text-[var(--fg)]"
                    >
                        ■ Stop
                    </button>
                )}
            </div>
        </div>
    );
}

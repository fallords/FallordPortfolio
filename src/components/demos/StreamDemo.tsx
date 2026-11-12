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
        prompt: "What’s a better label for the “Submit” button on a contact form?",
        reply: "Try “Send message”. It says exactly what happens when someone clicks it, and it’s short enough to fit on one line on a phone.",
    },
    {
        chip: "Summarise a chat",
        prompt: "Summarise this in one line: “Are you coming tonight?” “Maybe, depends on work.” “Ok, let me know by 6.”",
        reply: "They’re making plans for tonight. One of them isn’t sure yet and has been asked to confirm by 6.",
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
    // Time since the question, as the stream has played it: the pause, then one token every TOKEN_MS.
    const elapsed = count ? THINK_MS + count * TOKEN_MS : 0;
    const readouts = [
        { label: "status", value: status },
        { label: "first word", value: `${THINK_MS}`, unit: "ms" },
        { label: "tokens", value: `${count}/${tokens.length}` },
        { label: "elapsed", value: `${elapsed}`, unit: "ms" },
    ];

    return (
        <div className="flex h-full flex-col gap-3 p-3.5 text-sm sm:gap-4 sm:p-5">
            {/* Suggested prompts */}
            <div className="flex flex-wrap gap-2 text-xs">
                {EXAMPLES.map((ex, i) => (
                    <button
                        key={ex.chip}
                        type="button"
                        onClick={() => ask(i)}
                        aria-pressed={i === pick}
                        className={`border px-2 py-1 transition-colors pointer-coarse:min-h-[44px] ${
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
            <div className="min-h-[6rem] max-w-[92%] text-pretty leading-relaxed text-[var(--fg)] md:min-h-0 md:text-lg md:leading-[1.5]" aria-live="polite">
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

            {/* The stream as it arrives: one tick per token, lit as it lands, after the pause before the first. */}
            <div aria-hidden="true" className="mt-auto">
                <div className="flex items-center justify-between font-mono text-xs text-[var(--fg-dim)]">
                    <span>tokens · {Math.round(1000 / TOKEN_MS)} tok/s</span>
                    <span className="tabular-nums">
                        {count}/{tokens.length}
                    </span>
                </div>
                <div className="mt-2 flex h-5 gap-[3px]">
                    {tokens.map((_, i) => (
                        <span
                            key={i}
                            className={`flex-1 transition-colors duration-150 ${i < count ? (i === count - 1 && streaming ? "bg-[var(--fg)]" : "bg-[var(--gold)]") : "bg-[var(--surface-raised)]"}`}
                        />
                    ))}
                </div>
            </div>

            {/* The numbers that settle when it is done, read out the way the page reads its figures. */}
            <dl className="hidden grid-cols-4 gap-3 border-t border-[var(--rule)] pt-3 sm:grid">
                {readouts.map((r) => (
                    <div key={r.label}>
                        <dt className="font-mono text-[11px] uppercase tracking-wide text-[var(--fg-dim)]">{r.label}</dt>
                        <dd className={`mt-1 text-xl font-medium tabular-nums tracking-tight ${r.label === "status" && streaming ? "text-[var(--gold)]" : "text-[var(--fg)]"}`}>
                            {r.value}
                            {r.unit && <span className="ml-1 font-mono text-xs text-[var(--fg-dim)]">{r.unit}</span>}
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--rule)] pt-3 font-mono text-xs text-[var(--fg-dim)]">
                {/* The readouts above say this from 640px; a phone keeps the one line. */}
                <span className="tabular-nums sm:hidden">
                    {status} · first word {THINK_MS}ms · {count}/{tokens.length} tokens
                </span>
                <span className="hidden sm:inline">pick a question to ask it again</span>
                {/* Always laid out, hidden when idle, so the row doesn't grow and shrink as a reply starts and ends. */}
                <button
                    type="button"
                    onClick={stop}
                    className={`shrink-0 border border-[var(--rule-strong)] px-2 py-1 text-[var(--fg-soft)] transition-colors pointer-coarse:min-h-[44px] hover:border-[var(--gold)] hover:text-[var(--fg)] ${
                        streaming ? "" : "invisible"
                    }`}
                >
                    ■ Stop
                </button>
            </div>
        </div>
    );
}

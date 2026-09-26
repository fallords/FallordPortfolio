"use client";

import { useEffect, useRef, useState } from "react";

/*
 * An accelerometer stream and the pipeline behind it. The signal idles near
 * gravity (~9.8 m/s²) and shows an ordinary movement that stays under the
 * threshold. An impact crosses it, either on its own every cycle or when you
 * press the button, and that event is walked through each hop to the
 * database.
 */
const WINDOW = 120; // samples on screen
const CYCLE = 150; // samples before the automatic pattern repeats
const TICK_MS = 55;
/** The fall threshold from the thesis project: about 2.36 g. */
const THRESHOLD = 23.1;
const Y_MAX = 64;

/** An ordinary movement: a bump, well under the threshold. */
const BUMP: Record<number, number> = { 48: 12.4, 49: 14.7, 50: 13.1, 51: 11.0 };
/** The shape of an impact, sample by sample: a sharp spike, then the quiet after it. */
const IMPACT = [17.5, 38.6, 58.3, 31.2, 15.4, 7.9, 9.1];
const AUTO_IMPACT_AT = 108;

const HOPS = ["MPU6050", "ESP32", "LoRa 922 MHz", "Receiver", "HTTP POST", "MySQL"];
const HOP_MS = 260;

type LogLine = { time: string; value: number; rssi: number; manual: boolean };

/** Value of sample `i`, given the indices where button-press impacts start. */
function sampleAt(i: number, injected: number[]) {
    for (const at of injected) {
        if (i >= at && i < at + IMPACT.length) return IMPACT[i - at];
    }
    const k = ((i % CYCLE) + CYCLE) % CYCLE;
    if (k >= AUTO_IMPACT_AT && k < AUTO_IMPACT_AT + IMPACT.length) return IMPACT[k - AUTO_IMPACT_AT];
    return BUMP[k] ?? 9.8 + 0.28 * Math.sin(i * 1.7) + 0.18 * Math.sin(i * 3.3 + 1);
}

export default function SensorDemo() {
    const [n, setN] = useState(WINDOW);
    const [injected, setInjected] = useState<number[]>([]);
    const [hop, setHop] = useState(-1);
    const [log, setLog] = useState<LogLine[]>([]);
    const [events, setEvents] = useState(0);
    // The interval reads these; refs keep it from restarting on every change.
    const injectedRef = useRef<number[]>([]);
    const countRef = useRef(WINDOW);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const id = setTimeout(() => {
                setN(AUTO_IMPACT_AT + 10);
                setHop(HOPS.length - 1);
            }, 0);
            return () => clearTimeout(id);
        }
        let timers: ReturnType<typeof setTimeout>[] = [];
        const id = setInterval(() => {
            const count = ++countRef.current;
            const inj = injectedRef.current;
            setN(count);
            // The newest sample just crossed the threshold: walk the event through the hops.
            if (sampleAt(count, inj) > THRESHOLD && sampleAt(count - 1, inj) <= THRESHOLD) {
                const manual = inj.some((at) => count >= at && count < at + IMPACT.length);
                const value = Math.max(...IMPACT);
                // The previous event's timers have all fired by now; drop them
                // so the list doesn't grow for as long as the demo is open.
                timers.forEach(clearTimeout);
                timers = HOPS.map((_, i) => setTimeout(() => setHop(i), i * HOP_MS));
                timers.push(
                    setTimeout(() => {
                        const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
                        setLog((l) => [{ time, value, rssi: -68 - Math.round(Math.random() * 8), manual }, ...l].slice(0, 3));
                        setEvents((e) => e + 1);
                    }, HOPS.length * HOP_MS)
                );
                timers.push(setTimeout(() => setHop(-1), HOPS.length * HOP_MS + 2200));
            }
            // Forget injected impacts once they have scrolled off the chart.
            if (inj.some((at) => at <= count - WINDOW)) {
                injectedRef.current = inj.filter((at) => at > count - WINDOW);
                setInjected(injectedRef.current);
            }
        }, TICK_MS);
        return () => {
            clearInterval(id);
            timers.forEach(clearTimeout);
        };
    }, []);

    /** Start an impact on the next sample, right at the chart's leading edge. */
    const shake = () => {
        const at = countRef.current + 1;
        if (injectedRef.current.some((x) => Math.abs(x - at) < IMPACT.length + 2)) return;
        injectedRef.current = [...injectedRef.current, at];
        setInjected(injectedRef.current);
    };

    const points = Array.from({ length: WINDOW }, (_, i) => {
        const v = sampleAt(n - WINDOW + i, injected);
        return `${(i / (WINDOW - 1)) * 600},${200 - (Math.min(v, Y_MAX) / Y_MAX) * 190}`;
    }).join(" ");
    const thresholdY = 200 - (THRESHOLD / Y_MAX) * 190;
    const latest = sampleAt(n, injected);

    return (
        <div className="flex h-full flex-col gap-2.5 p-3.5 font-mono text-[11px] sm:gap-3 sm:p-5">
            <div className="flex items-baseline justify-between text-[var(--fg-dim)]">
                <span>acceleration · m/s²</span>
                <span className={`tabular-nums ${latest > THRESHOLD ? "text-[var(--gold)]" : "text-[var(--fg-soft)]"}`}>
                    {latest.toFixed(2)}
                </span>
            </div>

            {/* The chart itself is a big tap target for the same action. */}
            <button type="button" onClick={shake} aria-label="Simulate an impact on the sensor" className="block w-full cursor-pointer">
                <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="h-20 w-full sm:h-32" aria-hidden="true">
                    <line x1="0" x2="600" y1={thresholdY} y2={thresholdY} stroke="var(--gold)" strokeDasharray="4 4" strokeOpacity={0.7} vectorEffect="non-scaling-stroke" />
                    <polyline points={points} fill="none" stroke="var(--fg-soft)" strokeWidth={1.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
            </button>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[var(--fg-dim)]">
                <span>
                    <span aria-hidden="true" className="mr-1.5 inline-block w-5 border-t border-dashed border-[var(--gold)] align-middle" />
                    threshold {THRESHOLD} m/s²
                </span>
                <button
                    type="button"
                    onClick={shake}
                    className="border border-[var(--gold)] px-2 py-1 text-[var(--fg)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--surface)]"
                >
                    Simulate an impact
                </button>
            </div>

            {/* The event's path, hop by hop. */}
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2" aria-label="Event pipeline">
                {HOPS.map((h, i) => (
                    <li key={h} className="flex items-center gap-1.5">
                        {i > 0 && <span aria-hidden="true" className="text-[var(--fg-faint)]">→</span>}
                        <span
                            className={`border px-1.5 py-0.5 transition-colors duration-200 ${
                                i <= hop ? "border-[var(--gold)] text-[var(--fg)]" : "border-[var(--rule-strong)] text-[var(--fg-dim)]"
                            }`}
                        >
                            {h}
                        </span>
                    </li>
                ))}
            </ol>

            <ul className="mt-auto flex flex-col gap-1 border-t border-[var(--rule)] pt-3 text-[var(--fg-dim)]" aria-live="polite">
                <li className="flex justify-between">
                    <span>stored events</span>
                    <span className="tabular-nums text-[var(--fg-soft)]">{events}</span>
                </li>
                {log.length === 0 && <li>waiting for an impact…</li>}
                {log.map((l, i) => (
                    <li key={`${l.time}-${i}`} className={`truncate ${i === 0 ? "text-[var(--fg-soft)]" : ""}`}>
                        {l.time} · {l.manual ? "you" : "auto"} · {l.value.toFixed(2)} m/s²
                        {/* Too long for a phone's line; the rest of the entry still fits. */}
                        <span className="hidden sm:inline"> · RSSI {l.rssi} dBm</span> · saved
                    </li>
                ))}
                {/* Three lines are kept for the log from the start, so the first events don't make the panel grow. */}
                {Array.from({ length: 3 - Math.max(1, log.length) }, (_, i) => (
                    <li key={`empty-${i}`} aria-hidden="true" className="invisible">
                        ·
                    </li>
                ))}
            </ul>
        </div>
    );
}

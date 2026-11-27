"use client";

import { useSyncExternalStore } from "react";

/*
 * Two clocks share one store each: minutes tick every 15 seconds (enough to
 * turn the minute on time), seconds every second. The snapshot is bucketed
 * by the tick, so it stays referentially stable between ticks.
 */
const store = (tick: number) => ({
    subscribe: (onChange: () => void) => {
        const id = setInterval(onChange, tick);
        return () => clearInterval(id);
    },
    snapshot: () => Math.floor(Date.now() / tick),
});
const minutes = store(15_000);
const seconds = store(1_000);

// Server render has no clock — useSyncExternalStore swaps in the real value
// right after hydration, so there is no markup mismatch.
const getServerSnapshot = () => 0;

const format = (withSeconds: boolean) =>
    new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        ...(withSeconds ? { second: "2-digit" } : {}),
        hour12: false,
    });
const short = format(false);
const long = format(true);

/** Current time in Indonesia (WIB); `withSeconds` ticks every second, the way the reference's header clock does. */
export default function LocalTime({ className = "", withSeconds = false }: { className?: string; withSeconds?: boolean }) {
    const clock = withSeconds ? seconds : minutes;
    const tick = useSyncExternalStore(clock.subscribe, clock.snapshot, getServerSnapshot);
    const time = tick === 0 ? (withSeconds ? "--:--:--" : "--:--") : (withSeconds ? long : short).format(new Date());

    return (
        <time suppressHydrationWarning className={`tabular-nums ${className}`}>
            {time} WIB
        </time>
    );
}

"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 15_000;

function subscribe(onChange: () => void) {
    const id = setInterval(onChange, TICK_MS);
    return () => clearInterval(id);
}

// Bucket the clock so the snapshot stays referentially stable between ticks.
const getSnapshot = () => Math.floor(Date.now() / TICK_MS);

// Server render has no clock — useSyncExternalStore swaps in the real value
// right after hydration, so there is no markup mismatch.
const getServerSnapshot = () => 0;

const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

export default function LocalTime({
    // Ganti ke kota Anda, mis. "Bandung, ID" atau "Jakarta, ID"
    location = "Indonesia",
    className = "",
}: {
    location?: string;
    className?: string;
}) {
    const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const time = tick === 0 ? "--:--" : formatter.format(new Date());

    return (
        <span className={`inline-flex items-center gap-2 tabular-nums ${className}`}>
            <span className="text-[var(--fg-faint)]">{location}</span>
            <span className="text-[var(--fg-ghost)]">/</span>
            <time suppressHydrationWarning>{time} WIB</time>
        </span>
    );
}

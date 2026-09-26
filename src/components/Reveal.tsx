"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Rises into place the first time it scrolls into view, then stops watching.
 * The state lives in a data attribute rather than React state, so revealing
 * something never re-renders it.
 */
export default function Reveal({
    as: Tag = "div",
    delay = 0,
    className = "",
    children,
}: {
    as?: ElementType;
    delay?: number;
    className?: string;
    children: ReactNode;
}) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                el.dataset.shown = "";
                io.disconnect();
            },
            { rootMargin: "0px 0px -10% 0px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <Tag ref={ref} className={`reveal ${className}`} style={{ "--delay": `${delay}ms` } as React.CSSProperties}>
            {children}
        </Tag>
    );
}

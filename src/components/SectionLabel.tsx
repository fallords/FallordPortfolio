"use client";

import type { ReactNode } from "react";
import Reveal from "./Reveal";

interface SectionLabelProps {
    /** Two-digit index, e.g. "01". Omit for sub-labels inside a section. */
    index?: string;
    children: ReactNode;
    className?: string;
}

/**
 * The site's section marker: a bracketed, indexed, monospaced label.
 *
 * The brackets sit at a much lower contrast than the word between them. That
 * gap is what keeps this looking like an instrument panel rather than a
 * costume — the technical framing recedes and the content stays legible.
 */
export default function SectionLabel({
    index,
    children,
    className = "",
}: SectionLabelProps) {
    return (
        <span className={`block ${className}`}>
            <Reveal>
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--fg-muted)]">
                    <span className="text-[var(--fg-dim)]/60">[</span>
                    {index && (
                        <>
                            <span className="tabular-nums font-semibold text-[var(--brass)]">{index}</span>
                            <span className="text-[var(--fg-dim)]/40 font-mono text-[10px]">·</span>
                        </>
                    )}
                    <span className="text-[var(--fg-soft)] font-medium tracking-[0.22em]">{children}</span>
                    <span className="text-[var(--fg-dim)]/60">]</span>
                </span>
            </Reveal>
        </span>
    );
}

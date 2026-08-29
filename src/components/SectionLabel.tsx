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
                <span className="inline-flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--fg-dim)]">
                    <span className="text-[var(--fg-faint)]">[</span>
                    {index && <span className="tabular-nums text-[var(--fg-faint)]">{index}</span>}
                    <span>{children}</span>
                    <span className="text-[var(--fg-faint)]">]</span>
                </span>
            </Reveal>
        </span>
    );
}

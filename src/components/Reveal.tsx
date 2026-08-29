"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE } from "@/lib/motion";

interface RevealProps {
    children: ReactNode;
    delay?: number;
    /** `block` for headings and standalone lines, `inline-block` inside a sentence. */
    as?: "block" | "inline-block";
    className?: string;
}

const lift: Variants = {
    hidden: { y: "115%" },
    visible: { y: "0%" },
};

/**
 * Mask reveal — the line rises from behind a hard edge rather than fading in
 * from nowhere. The outer element clips; the inner one moves.
 *
 * Two things here are load-bearing and easy to get wrong:
 *
 * 1. The viewport trigger lives on the OUTER wrapper, never on the inner
 *    element. The inner one starts translated 115% down, which puts it fully
 *    outside the clipping parent — and IntersectionObserver intersects against
 *    ancestor clip boxes, so a transformed-out child reports 0% visible
 *    forever and the animation never fires. Watch the thing that doesn't move.
 *
 * 2. The motion is expressed as variants, not inline objects, so this still
 *    behaves when dropped inside a parent that drives its children with
 *    variant labels. An inline `whileInView` object under such a parent gets
 *    overridden by the propagated label and silently stays at its initial.
 *
 * Wrap one line per Reveal; the clip edge only reads correctly on a single line.
 */
export default function Reveal({
    children,
    delay = 0,
    as = "block",
    className = "",
}: RevealProps) {
    return (
        <motion.span
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className={`${as} overflow-hidden ${className}`}
        >
            <motion.span
                variants={lift}
                transition={{ duration: DURATION.slow, delay, ease: EASE.out }}
                className={as}
            >
                {children}
            </motion.span>
        </motion.span>
    );
}

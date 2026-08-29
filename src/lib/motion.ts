import type { Variants } from "framer-motion";

type Cubic = [number, number, number, number];

/*
 * One motion vocabulary for the whole site.
 *
 * The difference between motion that reads as craft and motion that reads as
 * decoration is mostly restraint:
 *   - short durations (250–700ms, never a second)
 *   - small travel (12–24px, never 60)
 *   - easing that decelerates hard and never overshoots (no bounce, no elastic)
 *   - one thing moving at a time
 *
 * Everything below sticks to that. Import these instead of hand-writing
 * durations per component, so the whole page moves with the same accent.
 */

export const EASE: Record<"out" | "inOut" | "ui", Cubic> = {
    /** Expo-out. Fast start, long settle. For entrances. */
    out: [0.22, 1, 0.36, 1],
    /** Symmetric. For things that move both ways — accordions, overlays. */
    inOut: [0.65, 0, 0.35, 1],
    /** Tight and neutral. For small state changes — hovers, toggles. */
    ui: [0.4, 0, 0.2, 1],
};

export const DURATION = {
    fast: 0.25,
    base: 0.45,
    slow: 0.7,
} as const;

/** Distance an element travels on entrance. Deliberately small. */
export const TRAVEL = 20;

/** Standard entrance: rise and fade. */
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: TRAVEL },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.slow, delay: i * 0.07, ease: EASE.out },
    }),
};

/**
 * Parent that releases its children one after another.
 *
 * Use this on any list whose items animate in. Three components had each
 * written their own inline version at 0.06 and 0.07 — close enough to look
 * accidental rather than intentional, which is what a shared file like this
 * exists to prevent.
 */
export const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

/** Shared viewport trigger — fires once, slightly before fully in view. */
export const VIEWPORT = { once: true, amount: 0.25 } as const;

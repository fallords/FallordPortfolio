"use client";

import { useRef } from "react";
import useScrollFade from "@/lib/useScrollFade";
import SwipeHint from "./SwipeHint";

/**
 * An ordered list that is a row of cards to swipe through on a phone: it
 * fades at whichever edge has more, and says so underneath. `className`
 * carries the row's styles and the layout it switches to at larger sizes;
 * `hintClassName` hides the hint wherever the row stops being a row.
 *
 * `relative` makes the row the containing block of anything absolutely
 * positioned inside it (an `sr-only` label, say), so its scrolling clips
 * those too. Without it, a label in the last card sat 1,200px to the right of
 * a phone's screen, outside the row's clip, and phone browsers widened the
 * whole page to reach it: an empty strip you could swipe the page into.
 */
export default function SwipeRow({
    className,
    hintClassName = "",
    children,
}: {
    className: string;
    hintClassName?: string;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLOListElement>(null);
    const edges = useScrollFade(ref);
    return (
        <>
            <ol ref={ref} className={`scroll-fade relative ${className}`}>
                {children}
            </ol>
            <SwipeHint edges={edges} className={hintClassName} />
        </>
    );
}

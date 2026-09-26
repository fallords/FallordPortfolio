"use client";

import { useRef } from "react";
import useScrollFade from "@/lib/useScrollFade";
import SwipeHint from "./SwipeHint";

/**
 * An ordered list that is a row of cards to swipe through on a phone: it
 * fades at whichever edge has more, and says so underneath. `className`
 * carries the row's styles and the layout it switches to at larger sizes;
 * `hintClassName` hides the hint wherever the row stops being a row.
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
            <ol ref={ref} className={`scroll-fade ${className}`}>
                {children}
            </ol>
            <SwipeHint edges={edges} className={hintClassName} />
        </>
    );
}

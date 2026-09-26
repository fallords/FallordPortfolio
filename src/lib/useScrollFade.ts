import { useEffect, useState } from "react";

export interface ScrollEdges {
    /** There is more to see to the left. */
    left: boolean;
    /** There is more to see to the right. */
    right: boolean;
}

/**
 * Marks a horizontally scrolling row with `data-more-left` / `data-more-right`
 * while there is more to see that way; the `.scroll-fade` class turns those
 * into a fade at that edge. A row that fades out says "keep swiping", and one
 * that stops fading says you have reached the end — which a hard crop through
 * the last visible item says much less clearly.
 *
 * Returns the same two facts, for a written hint beside the row.
 */
export default function useScrollFade(ref: React.RefObject<HTMLElement | null>): ScrollEdges {
    const [edges, setEdges] = useState<ScrollEdges>({ left: false, right: false });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => {
            const left = el.scrollLeft > 2;
            const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
            el.toggleAttribute("data-more-left", left);
            el.toggleAttribute("data-more-right", right);
            setEdges((e) => (e.left === left && e.right === right ? e : { left, right }));
        };
        el.addEventListener("scroll", update, { passive: true });
        // Also delivers the first measurement, once the row has been laid out.
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", update);
            ro.disconnect();
        };
    }, [ref]);

    return edges;
}

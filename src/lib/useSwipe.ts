import { useRef } from "react";

interface SwipeActions {
    onLeft?: () => void;
    onRight?: () => void;
    /** A long drag downwards, for dismissing something. */
    onDown?: () => void;
}

/**
 * Swipes from pointer events, for touch screens only: a mouse already has
 * arrows and clicks, and dragging with one should not change anything.
 *
 * The element needs a `touch-action` that leaves the gesture to the page
 * (`pan-y` to keep vertical scrolling, `pinch-zoom` to keep only zoom).
 * Otherwise the browser claims the movement and cancels the pointer.
 *
 * `swiped()` is true for a moment after a swipe, so an onClick can ignore
 * the click some browsers still fire when the finger lifts.
 */
export default function useSwipe({ onLeft, onRight, onDown }: SwipeActions, threshold = 40) {
    const start = useRef<{ x: number; y: number; id: number } | null>(null);
    const lastSwipe = useRef(0);

    const handlers = {
        onPointerDown: (e: React.PointerEvent) => {
            if (e.pointerType === "mouse" || !e.isPrimary) return;
            start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        },
        onPointerUp: (e: React.PointerEvent) => {
            const from = start.current;
            start.current = null;
            if (!from || from.id !== e.pointerId) return;
            // A pinch-zoomed page is being looked at, not swiped through.
            if ((window.visualViewport?.scale ?? 1) > 1.05) return;
            const dx = e.clientX - from.x;
            const dy = e.clientY - from.y;
            const side = dx < 0 ? onLeft : onRight;
            if (side && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
                lastSwipe.current = performance.now();
                side();
            } else if (onDown && dy >= threshold * 2 && dy > Math.abs(dx) * 1.5) {
                lastSwipe.current = performance.now();
                onDown();
            }
        },
        onPointerCancel: () => {
            start.current = null;
        },
    };

    return { handlers, swiped: () => performance.now() - lastSwipe.current < 400 };
}

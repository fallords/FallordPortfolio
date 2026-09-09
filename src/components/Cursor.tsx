"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor. Position is driven by a RAF loop writing directly to the DOM,
 * so pointer movement never triggers a React re-render — state changes only when
 * the *kind* of thing under the cursor changes.
 *
 * Add `data-cursor-label="View"` to any element to show a word inside the ring.
 *
 * Two things here are load-bearing:
 *
 * 1. Position, centring and press-scale all live in ONE transform string.
 *    They used to be split: RAF wrote `transform: translate3d(...)` while the
 *    press used the separate CSS `scale` property. Those compose as
 *    `scale × transform`, and `scale` resolves around the element's own origin
 *    — which, for a `fixed` element parked at top-left, is the corner of the
 *    screen. Pressing the mouse therefore yanked the ring 22% of the way
 *    toward that corner while the dot stayed under the pointer, and the two
 *    visibly came apart. The further from the corner, the wider the split.
 *
 * 2. Centring is `translate(-50%, -50%)`, not a hard-coded pixel offset. The
 *    old `x - 10` was written for the 20px ring; at 40px and 56px the ring sat
 *    10 and 18px off the pointer. Percentages resolve against whatever size
 *    the ring currently is, so it stays centred through every state.
 */
export default function Cursor() {
    const [isHovered, setIsHovered] = useState(false);
    const [label, setLabel] = useState<string | null>(null);

    const posRef = useRef({ x: 0, y: 0 });
    const cursorRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);

    // Press feedback is eased in the RAF loop rather than by a CSS transition,
    // because the loop overwrites `transform` every frame and would cancel one.
    // Keeping it out of React state also means a click causes no re-render.
    const scaleRef = useRef(1);
    const targetScaleRef = useRef(1);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            posRef.current.x = e.clientX;
            posRef.current.y = e.clientY;
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const labelled = target.closest<HTMLElement>("[data-cursor-label]");
            const nextLabel = labelled?.dataset.cursorLabel ?? null;

            setLabel((prev) => (prev === nextLabel ? prev : nextLabel));
            setIsHovered(!!nextLabel || !!target.closest("a, button, .hoverable"));
        };

        const animate = () => {
            const { x, y } = posRef.current;

            // Exponential ease — no target to overshoot, so it cannot wobble.
            scaleRef.current += (targetScaleRef.current - scaleRef.current) * 0.2;
            const s = scaleRef.current;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${s})`;
            }
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
            }
            rafRef.current = requestAnimationFrame(animate);
        };

        // Pressing shrinks the ring — the cursor acknowledges the click before
        // the page has a chance to respond, which is what makes it feel direct.
        const handleDown = () => {
            targetScaleRef.current = 0.78;
        };
        const handleUp = () => {
            targetScaleRef.current = 1;
        };

        window.addEventListener("mousemove", updateMousePosition, { passive: true });
        window.addEventListener("mouseover", handleMouseOver, { passive: true });
        window.addEventListener("mousedown", handleDown, { passive: true });
        window.addEventListener("mouseup", handleUp, { passive: true });
        // A button released outside the window never fires mouseup on it.
        window.addEventListener("blur", handleUp);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mouseover", handleMouseOver);
            window.removeEventListener("mousedown", handleDown);
            window.removeEventListener("mouseup", handleUp);
            window.removeEventListener("blur", handleUp);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const expanded = isHovered || !!label;

    return (
        <>
            <div
                ref={cursorRef}
                className={`fixed top-0 left-0 rounded-full pointer-events-none z-[100] hidden md:flex items-center justify-center ${
                    label
                        ? "w-16 h-16 bg-[#0e1612] border border-[var(--brass)]/50 text-[var(--fg)] shadow-xl backdrop-blur-md"
                        : expanded
                          ? "w-9 h-9 border border-[var(--steel)]/60 bg-white/[0.03]"
                          : "w-4 h-4 border border-[var(--steel)]/35"
                }`}
                style={{
                    willChange: "transform",
                    transition:
                        "width 220ms cubic-bezier(0.22,1,0.36,1), height 220ms cubic-bezier(0.22,1,0.36,1), border-color 200ms ease, background-color 200ms ease",
                }}
                aria-hidden="true"
            >
                {label && (
                    <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] select-none text-[var(--brass)]">
                        {label}
                    </span>
                )}
            </div>

            {/* Precision center dot */}
            <div
                ref={dotRef}
                className={`fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[101] hidden md:block transition-opacity duration-200 ${
                    expanded && !label ? "opacity-100" : label ? "opacity-0" : "opacity-80"
                }`}
                style={{ willChange: "transform" }}
                aria-hidden="true"
            />
        </>
    );
}

import type { ScrollEdges } from "@/lib/useScrollFade";

/**
 * The written half of a sideways-scrolling row's hint (the fade is the other
 * half). It says which way there is more, and nothing once the row fits. Its
 * line is reserved either way, so the page doesn't shift when it appears.
 *
 * Decorative for assistive tech: the row itself is a list it can walk.
 */
export default function SwipeHint({ edges, className = "" }: { edges: ScrollEdges; className?: string }) {
    return (
        <p aria-hidden="true" className={`h-4 font-mono text-[11px] leading-4 text-[var(--fg-dim)] ${className}`}>
            {edges.right ? (
                <>
                    swipe for more <span className="nudge-x text-[var(--gold)]">→</span>
                </>
            ) : edges.left ? (
                <>
                    <span className="text-[var(--gold)]">←</span> swipe back
                </>
            ) : null}
        </p>
    );
}

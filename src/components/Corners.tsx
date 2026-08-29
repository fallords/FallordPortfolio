/**
 * Crop marks at the four corners of a frame, in place of a full border.
 *
 * A continuous rectangle closes a shape; four short brackets only imply it.
 * The eye completes the edge on its own, which reads as a registration mark on
 * a technical drawing rather than as a card. Used sparingly — on the project
 * frame and the lightbox, not on every surface.
 */
export default function Corners({
    className = "",
    size = "size-2.5",
    tone = "border-[var(--rule-strong)]",
}: {
    className?: string;
    /** Arm length of each bracket. */
    size?: string;
    tone?: string;
}) {
    const arm = `absolute ${size} ${tone}`;

    return (
        <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
            <span className={`${arm} left-0 top-0 border-l border-t`} />
            <span className={`${arm} right-0 top-0 border-r border-t`} />
            <span className={`${arm} bottom-0 left-0 border-b border-l`} />
            <span className={`${arm} bottom-0 right-0 border-b border-r`} />
        </span>
    );
}

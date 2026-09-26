"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { Certification } from "@/content/certifications";
import useSwipe from "@/lib/useSwipe";

interface CertificateLightboxProps {
    /**
     * The certificate to paint. The parent keeps this set after closing, so
     * there is still something on screen while the dialog fades out.
     */
    cert: Certification | null;
    open: boolean;
    /** Zero-based position, for the "03 / 10" counter. */
    index: number;
    total: number;
    onClose: () => void;
    onStep: (direction: 1 | -1) => void;
}

const noopSubscribe = () => () => {};

/**
 * Full-size certificate viewer.
 *
 * It renders through a portal and stays mounted when closed; CSS drives the
 * fade. An earlier AnimatePresence version played its exit and then never
 * removed the node, leaving an invisible full-screen layer that swallowed
 * every click on the page. `visibility` is the load-bearing half: it takes the
 * closed dialog out of hit-testing, which `opacity` alone does not.
 */
export default function CertificateLightbox({
    cert,
    open,
    index,
    total,
    onClose,
    onStep,
}: CertificateLightboxProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    // Touch: swipe sideways to step through, drag down to put it away.
    const swipe = useSwipe({ onLeft: () => onStep(1), onRight: () => onStep(-1), onDown: onClose });

    // Portals need a DOM to aim at, which does not exist during SSR.
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowRight") onStep(1);
            else if (e.key === "ArrowLeft") onStep(-1);
        };

        // Whatever opened the viewer gets focus back when it closes; otherwise
        // focus falls to <body> and a keyboard user loses their place.
        const opener = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKey);
        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKey);
            opener?.focus({ preventScroll: true });
        };
    }, [open, onClose, onStep]);

    if (!mounted || !cert?.image) return null;

    const control =
        "flex h-10 w-10 items-center justify-center border border-[var(--rule-strong)] text-[var(--fg-soft)] transition-colors hover:border-[var(--fg-muted)] hover:text-[var(--fg)]";

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-hidden={!open}
            inert={!open}
            aria-label={cert.name}
            onClick={onClose}
            // Inline, not utility classes: whether this layer swallows clicks
            // must not depend on Tailwind's content scan having seen the file.
            style={{
                opacity: open ? 1 : 0,
                visibility: open ? "visible" : "hidden",
                transition: "opacity 200ms ease-out, visibility 200ms ease-out",
            }}
            className="fixed inset-0 z-[60] flex flex-col bg-[var(--surface)]/95 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] backdrop-blur-sm"
        >
            <div className="shell flex h-14 shrink-0 items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <span className="font-mono text-xs tabular-nums text-[var(--fg-dim)]">
                    {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={onClose}
                    className="-mr-3 flex h-11 items-center px-3 text-sm text-[var(--fg-soft)] underline decoration-[var(--rule-strong)] underline-offset-[0.3em] transition-colors hover:text-[var(--fg)] hover:decoration-[var(--gold)]"
                >
                    Close
                </button>
            </div>

            {/*
             * `pinch-zoom` keeps two-finger zoom for reading the small print and
             * hands every one-finger movement to the swipe.
             */}
            <div
                className="relative min-h-0 flex-1 px-4 md:px-10"
                onClick={(e) => e.stopPropagation()}
                {...swipe.handlers}
                style={{ touchAction: "pinch-zoom" }}
            >
                <Image
                    src={cert.image}
                    alt={`Certificate: ${cert.name}, issued by ${cert.issuer}`}
                    fill
                    sizes="(max-width: 1024px) 92vw, 1024px"
                    className="object-contain p-4 md:p-10"
                />
            </div>

            {/* Touch screens have no arrow keys and no obvious way out; say what the fingers do. */}
            <p aria-hidden="true" className="shrink-0 text-balance px-5 pt-3 text-center font-mono text-[11px] leading-relaxed text-[var(--fg-dim)] [@media(hover:hover)]:hidden">
                ← swipe → · pinch to zoom · drag down to close
            </p>

            <div className="shell flex shrink-0 items-center justify-between gap-6 py-5" onClick={(e) => e.stopPropagation()}>
                <div className="min-w-0">
                    <p className="text-sm leading-snug text-[var(--fg)]">{cert.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--fg-dim)]">
                        {cert.issuer} · <span className="font-mono">{cert.year}</span>
                        {cert.url && (
                            <>
                                {" · "}
                                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="link text-[var(--fg-muted)]">
                                    Verify ↗
                                </a>
                            </>
                        )}
                    </p>
                </div>
                <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => onStep(-1)} aria-label="Previous certificate" className={control}>
                        ←
                    </button>
                    <button type="button" onClick={() => onStep(1)} aria-label="Next certificate" className={control}>
                        →
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

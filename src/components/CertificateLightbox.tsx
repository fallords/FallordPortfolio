"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import Corners from "./Corners";
import type { Certification } from "@/content/certifications";

interface CertificateLightboxProps {
    /** The certificate on screen, or null when the lightbox is closed. */
    cert: Certification | null;
    /** Zero-based position, used only for the "03 / 09" counter. */
    index: number | null;
    total: number;
    onClose: () => void;
    onStep: (direction: 1 | -1) => void;
}

/**
 * Full-size certificate viewer.
 *
 * Two decisions here were paid for with bugs.
 *
 * 1. It renders through a portal to `document.body`. `page.tsx` wraps its
 *    content in `relative z-10`, which opens a stacking context that would
 *    otherwise trap this layer beneath the navbar however high its z-index.
 *
 * 2. It does NOT unmount when closed, and it does not use `AnimatePresence`.
 *    Inside the portal, AnimatePresence played the exit animation and then
 *    never removed the node — leaving a transparent, full-screen, still-clickable
 *    overlay on top of the page. Nothing looked wrong; the whole site simply
 *    stopped responding to clicks after you viewed one certificate. The same
 *    component works elsewhere on the site, so this is specific to the portal.
 *
 *    Rather than keep guessing at that, the dialog stays mounted and CSS drives
 *    it: opacity for the fade, `visibility` so it cannot be clicked or focused
 *    once hidden. `visibility` is the load-bearing half — browsers hold it at
 *    `visible` for the whole outgoing transition and flip it immediately on the
 *    way in, which is exactly the behaviour wanted, and unlike `opacity` alone
 *    it actually removes the element from hit-testing.
 */
export default function CertificateLightbox({
    cert,
    index,
    total,
    onClose,
    onStep,
}: CertificateLightboxProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const isOpen = cert !== null;

    /**
     * The certificate to paint. It lags `cert` by one close so there is still
     * something on screen to fade out; before the first open it is null and
     * nothing is rendered at all.
     */
    const [shown, setShown] = useState<Certification | null>(cert);
    useEffect(() => {
        if (cert) setShown(cert);
    }, [cert]);

    // Portals need a DOM to aim at, which does not exist during SSR.
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Keyboard control and scroll lock, both scoped to while the lightbox is open.
    useEffect(() => {
        if (!isOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowRight") onStep(1);
            else if (e.key === "ArrowLeft") onStep(-1);
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKey);
        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKey);
        };
    }, [isOpen, onClose, onStep]);

    if (!mounted || !shown || !shown.image) return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-hidden={!isOpen}
            // Keeps the closed dialog out of the tab order and the a11y tree.
            inert={!isOpen}
            aria-label={`Sertifikat ${shown.name}`}
            onClick={onClose}
            /*
             * Inline rather than Tailwind classes, deliberately. These two
             * properties decide whether the overlay swallows every click on the
             * page, and utility classes only exist if Tailwind's content scan
             * saw them — which it did not when this file was new, leaving the
             * dialog stuck at full opacity with the correct class names on it.
             * A rule that must be right is not worth making conditional on a
             * build step noticing a file.
             */
            style={{
                opacity: isOpen ? 1 : 0,
                visibility: isOpen ? "visible" : "hidden",
                transition: "opacity 300ms ease-out, visibility 300ms ease-out",
            }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/92 px-4 py-16 backdrop-blur-sm md:px-10"
        >
            <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="hoverable absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:border-white md:right-8 md:top-8"
            >
                <span aria-hidden="true" className="text-lg leading-none">
                    ✕
                </span>
            </button>

            <motion.div
                animate={
                    isOpen
                        ? { opacity: 1, scale: 1, y: 0 }
                        : { opacity: 0, scale: 0.985, y: 8 }
                }
                initial={false}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center gap-6"
            >
                <div className="relative min-h-0 w-full flex-1">
                    <Image
                        src={shown.image}
                        alt={`Sertifikat ${shown.name} dari ${shown.issuer}`}
                        fill
                        sizes="(max-width: 1024px) 92vw, 1024px"
                        className="object-contain"
                    />
                    <Corners tone="border-white/50" size="size-3" />
                </div>

                <div className="flex w-full shrink-0 flex-col items-center gap-3 text-center">
                    <p className="font-heading text-base font-bold tracking-tight text-white">
                        {shown.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-dim)]">
                        {shown.issuer} · {shown.year}
                        {shown.field && ` · ${shown.field}`}
                    </p>

                    {/* Only appears for certificates that print one. */}
                    {shown.url && (
                        <a
                            href={shown.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hoverable group font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-muted)] underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
                        >
                            Verify with issuer
                            <span
                                aria-hidden="true"
                                className="ml-2 inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5"
                            >
                                ↗
                            </span>
                        </a>
                    )}
                </div>
            </motion.div>

            <div
                onClick={(e) => e.stopPropagation()}
                className="mt-8 flex shrink-0 items-center gap-6"
            >
                <button
                    type="button"
                    onClick={() => onStep(-1)}
                    aria-label="Sertifikat sebelumnya"
                    className="hoverable flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:border-white sm:h-10 sm:w-10"
                >
                    <span aria-hidden="true">←</span>
                </button>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--fg-dim)] tabular-nums">
                    {String((index ?? 0) + 1).padStart(2, "0")} /{" "}
                    {String(total).padStart(2, "0")}
                </span>
                <button
                    type="button"
                    onClick={() => onStep(1)}
                    aria-label="Sertifikat berikutnya"
                    className="hoverable flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:border-white sm:h-10 sm:w-10"
                >
                    <span aria-hidden="true">→</span>
                </button>
            </div>
        </div>,
        document.body
    );
}

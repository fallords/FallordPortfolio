"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";
import CertificateLightbox from "./CertificateLightbox";
import { VIEWPORT, fadeUp, stagger } from "@/lib/motion";
import { certifications } from "@/content/certifications";

/** Pixels per second the track drifts on its own. Slow enough to read. */
const DRIFT_SPEED = 26;
/** How long after a manual interaction before the drift picks up again. */
const RESUME_AFTER = 1600;

/**
 * Certificates, shown large enough to actually read.
 *
 * The earlier version was a ruled list with 64px thumbnails — tidy, but the
 * scans were too small to make out, which defeats the point of showing a
 * document rather than a badge. This is a scrolling track instead: each scan
 * gets a real card, and clicking one opens it full-size.
 *
 * The track drifts on its own. Two things make that bearable rather than
 * irritating:
 *
 *   - It is slow. 26px/sec is well under reading speed, so a card you are
 *     looking at does not escape while you look at it.
 *   - It stops at every sign of attention: pointer over the track, keyboard
 *     focus inside it, the lightbox open, the section scrolled out of view, or
 *     `prefers-reduced-motion`. After you use the arrows it stays out of the
 *     way for a moment before resuming.
 *
 * The list is rendered twice so the wrap is seamless. Scrolling past the
 * halfway mark subtracts exactly one set's width, which lands on an identical
 * frame — there is no jump to see. The second copy is `aria-hidden` and out of
 * the tab order, so assistive tech and keyboard users still meet nine
 * certificates rather than eighteen.
 */
export default function Certifications() {
    const trackRef = useRef<HTMLUListElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const railRef = useRef<HTMLDivElement>(null);
    /** Only whether the rail is needed at all — its position is not state. */
    const [railVisible, setRailVisible] = useState(false);

    const active = openIndex === null ? null : certifications[openIndex];

    const close = useCallback(() => setOpenIndex(null), []);

    const step = useCallback((direction: 1 | -1) => {
        setOpenIndex((current) =>
            current === null
                ? current
                : (current + direction + certifications.length) % certifications.length
        );
    }, []);

    // --- drift state, all in refs: none of it should cause a re-render ------
    const pausedRef = useRef(false);
    const inViewRef = useRef(false);
    const lastInputRef = useRef(0);
    const tween = useRef<number | null>(null);
    /** Width of exactly one pass through the list. See measurePeriod below. */
    const periodRef = useRef(0);

    /** Anything the reader does that the drift should get out of the way for. */
    const markInput = useCallback(() => {
        lastInputRef.current = performance.now();
    }, []);

    // The lightbox covers the page; drifting behind it is pointless work.
    useEffect(() => {
        pausedRef.current = openIndex !== null;
    }, [openIndex]);

    /**
     * Scroll animation, done by hand.
     *
     * The browser's own `behavior: "smooth"` does not work on this element —
     * measured on this page, `scrollTo` with `smooth` moved it 0px while the
     * identical call with `auto` moved it the full 424px. Lenis is driving the
     * page scroll and appears to starve the native animation. Rather than ship
     * arrows that work on some machines and silently do nothing on others, this
     * steps `scrollLeft` itself. Setting `scrollLeft` frame by frame also emits
     * real scroll events, so the arrows and the rail stay in agreement.
     */
    const animateScroll = useCallback((to: number) => {
        const track = trackRef.current;
        if (!track) return;
        if (tween.current) cancelAnimationFrame(tween.current);

        const from = track.scrollLeft;
        const distance = to - from;
        if (Math.abs(distance) < 1) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            track.scrollLeft = to;
            return;
        }

        const DURATION = 480;
        const startedAt = performance.now();
        // Cubic out — quick to leave, slow to arrive.
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);

        const frame = (now: number) => {
            const t = Math.min(1, (now - startedAt) / DURATION);
            track.scrollLeft = from + distance * ease(t);
            tween.current = t < 1 ? requestAnimationFrame(frame) : null;
        };
        tween.current = requestAnimationFrame(frame);
    }, []);

    /** Arrows move to the next card's own edge, never by a guessed distance. */
    const scrollByCard = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        markInput();

        const cards = Array.from(track.querySelectorAll("li"));
        if (cards.length === 0) return;

        const origin = track.getBoundingClientRect().left - track.scrollLeft;
        const offsets = cards.map((card) => card.getBoundingClientRect().left - origin);

        // A pixel of tolerance so a card already flush with the edge counts as
        // "here" rather than "next".
        const current = track.scrollLeft;
        const target =
            direction === 1
                ? offsets.find((offset) => offset > current + 1)
                : offsets.filter((offset) => offset < current - 1).pop();

        animateScroll(target ?? (direction === 1 ? track.scrollWidth : 0));
    };

    /**
     * Distance from one card to the same card in the duplicate set.
     *
     * Read from the DOM rather than derived from `scrollWidth`. Halving
     * scrollWidth looks right and is not: doubling nine cards produces
     * seventeen gaps, not eighteen, so half the width falls one gap short of a
     * full pass. Measured here that was 3804 against a true period of 3816 —
     * a 12px lurch of the entire row at every wrap. Reading the offset of the
     * first duplicate sidesteps the arithmetic and survives responsive card
     * widths and gaps changing at breakpoints.
     */
    const measurePeriod = useCallback(() => {
        const track = trackRef.current;
        if (!track) return 0;
        const cards = track.children;
        const first = cards[0] as HTMLElement | undefined;
        const clone = cards[certifications.length] as HTMLElement | undefined;
        if (!first || !clone) return 0;
        return clone.offsetLeft - first.offsetLeft;
    }, []);

    /**
     * Keep the rail in step with the track.
     *
     * The rail is written straight to the DOM rather than held in state. It was
     * state, and the drift loop writes `scrollLeft` on every frame, which fires
     * a scroll event, which set a fresh `{width, offset}` object — re-rendering
     * this section and all eighteen cards sixty times a second for the whole
     * time the carousel was moving. Nothing about a one-pixel hairline is worth
     * a render; `visible` only flips when the track starts or stops
     * overflowing, which is rare.
     */
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const update = () => {
            const { scrollLeft, clientWidth } = track;
            const period = measurePeriod();
            periodRef.current = period;
            if (period <= 0) return;

            const width = Math.min(1, clientWidth / period);
            const offset = (scrollLeft % period) / period;

            const bar = railRef.current;
            if (bar) {
                bar.style.width = `${width * 100}%`;
                bar.style.transform = `translateX(${(offset / width) * 100}%)`;
            }

            setRailVisible((prev) => (prev === width < 1 ? prev : width < 1));
        };
        update();

        track.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        // Cards are sized from images that arrive after mount, so the first
        // measurement is taken before the track has its final width.
        const observer = new ResizeObserver(update);
        observer.observe(track);

        return () => {
            track.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
            observer.disconnect();
        };
    }, [measurePeriod]);

    // Only drift while the section is actually on screen.
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                inViewRef.current = entry.isIntersecting;
            },
            { threshold: 0.15 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // The drift itself.
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let previous = performance.now();
        let raf = 0;
        /**
         * The drift position, kept as a float.
         *
         * Reading `scrollLeft` back each frame and adding to it does not work
         * at this speed. 26px/sec is about 0.43px per frame, and the browser
         * quantises `scrollLeft`, so the fraction is thrown away every time:
         * some frames advance a whole pixel, some advance none. The result is a
         * visible limp — worse the slower the drift, which is the opposite of
         * what you want. Accumulating here and writing out keeps the motion
         * even.
         */
        let position = track.scrollLeft;

        const frame = (now: number) => {
            // Clamp: a backgrounded tab can hand back a delta of many seconds,
            // which would fling the track across several cards in one step.
            const dt = Math.min(now - previous, 64) / 1000;
            previous = now;

            const period = periodRef.current || measurePeriod();
            const idle = now - lastInputRef.current > RESUME_AFTER;
            /*
             * The duplicate set has to be wide enough to cover the viewport
             * after a wrap, or the seam shows empty track. Nine 400px cards
             * give a 3816px period, so this only bites on a display wider than
             * roughly 3800px of track — but there it would be plainly broken
             * rather than subtly off, so it is worth the one comparison.
             */
            const hasRunway = period > 0 && track.clientWidth <= period;
            const running =
                hasRunway && idle && inViewRef.current && !pausedRef.current && !tween.current;

            // Anything else that moved the track — a swipe, the arrows, a
            // wheel — wins. Resync rather than fight it.
            if (Math.abs(track.scrollLeft - position) > 1.5) {
                position = track.scrollLeft;
            }

            if (running) {
                position += DRIFT_SPEED * dt;
                if (position >= period) position -= period;
                track.scrollLeft = position;
            } else if (!tween.current && period > 0 && track.scrollLeft >= period) {
                // Wrap a manual scroll too, but never mid-tween: the tween holds
                // a start position that subtracting a period would invalidate.
                position = track.scrollLeft - period;
                track.scrollLeft = position;
            }

            raf = requestAnimationFrame(frame);
        };

        raf = requestAnimationFrame(frame);
        return () => {
            cancelAnimationFrame(raf);
            if (tween.current) cancelAnimationFrame(tween.current);
        };
    }, [measurePeriod]);

    if (certifications.length === 0) return null;

    // Rendered twice: the first set is the real one, the second exists only so
    // the wrap has somewhere to land.
    const loop = [...certifications, ...certifications];

    return (
        <div ref={sectionRef} className="mt-20 md:mt-28">
            <div className="flex items-end justify-between gap-6">
                <h3>
                    <SectionLabel>Certifications</SectionLabel>
                </h3>

                <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--fg-dim)] tabular-nums">
                        {String(certifications.length).padStart(2, "0")}
                    </span>
                    {/* No disabled state: the track loops, so there is no end to
                        arrive at in either direction. */}
                    {(["-1", "1"] as const).map((dir) => {
                        const forward = dir === "1";
                        return (
                            <button
                                key={dir}
                                type="button"
                                onClick={() => scrollByCard(forward ? 1 : -1)}
                                aria-label={forward ? "Sertifikat berikutnya" : "Sertifikat sebelumnya"}
                                /* 44px on phones, back to 32 once there is a
                                   pointer. At 32 these were the only non-swipe
                                   way to move the track and too small to hit
                                   reliably with a thumb. */
                                className="hoverable flex h-11 w-11 items-center justify-center border border-[var(--rule)] text-[var(--fg-muted)] transition-colors duration-300 hover:border-[var(--rule-strong)] hover:text-[var(--fg)] sm:h-8 sm:w-8"
                            >
                                <span aria-hidden="true" className="text-sm leading-none">
                                    {forward ? "→" : "←"}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/*
             * Cards are a fixed width rather than a fraction of the container, so
             * the next one always peeks in at the right edge — that sliver is what
             * tells the reader the track continues.
             */}
            <motion.ul
                ref={trackRef}
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                onMouseEnter={() => {
                    pausedRef.current = true;
                }}
                onMouseLeave={() => {
                    pausedRef.current = false;
                }}
                onFocusCapture={() => {
                    pausedRef.current = true;
                }}
                onBlurCapture={() => {
                    pausedRef.current = false;
                }}
                onPointerDown={markInput}
                onWheel={markInput}
                onTouchStart={markInput}
                /*
                 * pb-6 is not decoration. A horizontal scroll container also
                 * clips vertically, and the cards enter on a 20px upward
                 * translate — without room to travel into, the last caption
                 * line is cut off for the length of the animation.
                 *
                 * No scroll snapping: it fought the drift, and the arrows
                 * already land on exact card edges without it.
                 */
                className="cert-track mt-8 flex gap-6 overflow-x-auto pb-6"
            >
                {loop.map((cert, i) => {
                    const index = i % certifications.length;
                    const isClone = i >= certifications.length;

                    return (
                        <motion.li
                            key={`${cert.name}-${i}`}
                            variants={fadeUp}
                            aria-hidden={isClone || undefined}
                            className="w-[280px] shrink-0 sm:w-[340px] lg:w-[400px]"
                        >
                            <button
                                type="button"
                                onClick={() => setOpenIndex(index)}
                                tabIndex={isClone ? -1 : undefined}
                                data-cursor-label="Open"
                                aria-label={`Lihat sertifikat ${cert.name}`}
                                className="hoverable group block w-full cursor-pointer text-left"
                            >
                                {/*
                                 * One frame ratio for every card, portrait scans
                                 * letterboxed inside it. Sizing each frame to its own
                                 * scan made the row heights jump and threw the captions
                                 * out of line — a tidy shared baseline is worth more
                                 * than a few extra pixels of document.
                                 */}
                                <span className="relative block aspect-[1600/1132] w-full overflow-hidden rounded-lg border border-[var(--rule)] bg-white transition-colors duration-500 group-hover:border-[var(--rule-strong)]">
                                    {cert.image && (
                                        <Image
                                            src={cert.image}
                                            alt={`Sertifikat ${cert.name} dari ${cert.issuer}`}
                                            fill
                                            sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 400px"
                                            className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                        />
                                    )}
                                </span>

                                <span className="mt-4 block font-sans text-sm leading-snug text-[var(--fg-muted)] transition-colors duration-300 group-hover:text-[var(--fg)]">
                                    {cert.name}
                                </span>
                                <span className="mt-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg-dim)]">
                                    {cert.issuer}
                                    <span className="text-[var(--fg-faint)]">·</span>
                                    {cert.year}
                                    {cert.field && (
                                        <>
                                            <span className="text-[var(--fg-faint)]">·</span>
                                            {cert.field}
                                        </>
                                    )}
                                </span>
                            </button>
                        </motion.li>
                    );
                })}
            </motion.ul>

            {/*
             * The rail. A hairline that reports how much of the track is on
             * screen and where — the same job the native scrollbar does, drawn
             * at a weight that belongs to the rest of the page. Hidden when
             * everything already fits.
             */}
            <div
                aria-hidden="true"
                className="h-px w-full bg-[var(--rule)]"
                style={{ visibility: railVisible ? "visible" : "hidden" }}
            >
                <div ref={railRef} className="h-full bg-[var(--fg-dim)]" />
            </div>

            <CertificateLightbox
                cert={active}
                index={openIndex}
                total={certifications.length}
                onClose={close}
                onStep={step}
            />
        </div>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from "framer-motion";

const TOTAL_FRAMES = 181;

export default function SequenceScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);

    // Fix: Instead of using IntersectionObserver which violently recalculates
    // when Instagram/iOS Webviews hide their UI, we track pure pixel scrolling!
    const { scrollY } = useScroll();

    // The section is h-[400svh] — four screens tall — so the scrollable distance
    // to reach the end is three screens. Locked in a ref on mount (not state, so
    // no cascading re-render) so it NEVER recalculates when an in-app browser
    // hides or shows its chrome mid-scroll.
    const scrollRangeRef = useRef(3000);
    useEffect(() => {
        scrollRangeRef.current = window.innerHeight * 3;
    }, []);

    // Create a 0 to 1 progress based purely on absolute pixels scrolled since the top
    const fixedProgress = useTransform(scrollY, (v) => v / scrollRangeRef.current);

    // Dampen the violent layout recalculations caused by mobile Safari's hiding/showing URL bar
    const smoothedProgress = useSpring(fixedProgress, { stiffness: 300, damping: 40, restDelta: 0.001 });

    const currentIndex = useTransform(smoothedProgress, [0, 1], [1, TOTAL_FRAMES]);

    // Preload Images (kept in a ref — they're an external resource, not render state)
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];

        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            const paddedIndex = i.toString().padStart(3, "0");
            img.src = `/sequence/ezgif-frame-${paddedIndex}.jpg`;
            loadedImages.push(img);
        }
        imagesRef.current = loadedImages;
    }, []);

    // Draw to Canvas with cached dimensions
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let lastRenderedIndex = -1;
        let canvasWidth = window.innerWidth;
        let canvasHeight = window.innerHeight;
        let needsResize = true;

        const handleResize = () => {
            if (canvasWidth !== window.innerWidth) {
                canvasWidth = window.innerWidth;
                canvasHeight = window.innerHeight;
                needsResize = true;
                lastRenderedIndex = -1; // Force re-render on resize
            }
        };

        window.addEventListener("resize", handleResize);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const render = () => {
            const index = Math.floor(currentIndex.get());

            if (index === lastRenderedIndex && !needsResize) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            const img = imagesRef.current[index - 1];
            if (!img || !img.complete) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            // Only resize canvas when viewport changes
            if (needsResize) {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                needsResize = false;
            }

            const hRatio = canvasWidth / img.width;
            const vRatio = canvasHeight / img.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShift_x = (canvasWidth - img.width * ratio) / 2;
            const centerShift_y = (canvasHeight - img.height * ratio) / 2;

            ctx.drawImage(
                img, 0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
            );

            lastRenderedIndex = index;
            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, [currentIndex]);

    /*
     * Two overlays, not three. The opening used to hold the visitor through
     * five screens of scrolling and three separate statements before any work
     * appeared — the second and third were saying the same thing in two goes.
     * Merged, the hero says its piece in one pass and hands over sooner.
     */

    // Text 1: visible on load, gone by 0.3
    const opacity1 = useTransform(smoothedProgress, [0, 0.22, 0.3], [1, 1, 0]);
    const translateY1 = useTransform(smoothedProgress, [0, 0.3], [0, -60]);

    // Text 2: 0.32 to 0.86, carrying the statement, the stack and the CTA
    const opacity2 = useTransform(smoothedProgress, [0.32, 0.42, 0.76, 0.86], [0, 1, 1, 0]);
    const translateY2 = useTransform(smoothedProgress, [0.32, 0.42, 0.76, 0.86], [60, 0, 0, -60]);
    // Button settles in just after the lines above it
    const buttonOpacity2 = useTransform(smoothedProgress, [0.32, 0.5, 0.76, 0.86], [0, 0, 1, 0]);
    const buttonY2 = useTransform(smoothedProgress, [0.32, 0.5, 0.76, 0.86], [20, 20, 0, -20]);

    // Scroll indicator
    const scrollIndicatorOpacity = useTransform(smoothedProgress, [0, 0.03], [1, 0]);

    // Track when the CTA is visible so it only becomes clickable then
    const [isCtaVisible, setIsCtaVisible] = useState(false);
    useMotionValueEvent(opacity2, "change", (v) => setIsCtaVisible(v > 0.5));

    // Words for text 1 clip reveal
    const heroWords = ["Hi,", "I'm", "Fadhlan"];

    return (
        <section ref={containerRef} className="relative h-[400svh] w-full bg-[var(--surface)]">
            <div
                // Sticky offset and height both account for the frame gutter, so
                // the pinned hero sits inside the panel instead of being clipped
                // by it. `overflow: clip` on the frame keeps sticky working —
                // `hidden` would turn it into a scroll container and break it.
                className="sticky w-full overflow-hidden will-change-transform transform-gpu"
                style={{
                    top: "var(--frame)",
                    height: "calc(var(--vh, 1vh) * 100 - var(--frame) * 2)",
                }}
            >
                {/*
                 * Desaturated in CSS rather than by re-exporting 181 files. The
                 * source frames are lit hard red, which was the only saturated
                 * colour left on an otherwise strictly monochrome site — and it
                 * sat on the largest, first thing anyone sees. Slight contrast
                 * lift compensates for the punch that removing the hue costs.
                 */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover will-change-transform transform-gpu"
                    style={{ filter: "grayscale(1) contrast(1.06)" }}
                />

                {/* Global overlay for contrast if needed */}
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                {/* Text 1 — Clip-reveal entrance */}
                <motion.div
                    style={{ opacity: opacity1, y: translateY1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
                >
                    {/*
                     * No mount-time entrance here. The intro overlay covers the
                     * first couple of seconds, so an animation timed to page load
                     * plays entirely behind it — invisible, but still able to fail
                     * and leave the name stuck off-screen. The intro dissolving
                     * *is* the reveal.
                     */}
                    <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight uppercase mb-5 flex flex-wrap justify-center gap-x-[0.3em]">
                        {heroWords.map((word, i) => (
                            <span key={i} className="inline-block">
                                {word}
                            </span>
                        ))}
                    </h1>
                    <p
                        className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-[var(--fg-muted)] max-w-3xl leading-relaxed"
                    >
                        Web Developer · Designer · Software Engineer · AI Integration
                    </p>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    style={{ opacity: scrollIndicatorOpacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
                >
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--fg-dim)]">
                        Scroll
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--fg-muted)]">
                            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                        </svg>
                    </motion.div>
                </motion.div>

                {/* Text 2 — the statement, the stack and the way in, together */}
                <motion.div
                    style={{ opacity: opacity2, y: translateY2 }}
                    className="absolute inset-0 flex flex-col items-start justify-center text-left px-8 md:px-24 max-w-4xl pointer-events-none"
                >
                    <h2 className="font-heading font-bold text-2xl md:text-4xl tracking-tight mb-6">
                        I design and build<br />web applications.
                    </h2>
                    <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.24em] text-[var(--fg-dim)] leading-loose">
                        Next.js · React · TypeScript · Python
                        <br />
                        Based in Indonesia
                    </p>

                    {/* Label swap on hover: the word leaves upward while its twin
                        arrives from below. Nothing scales, nothing bounces. */}
                    <motion.a
                        href="#works"
                        style={{ opacity: buttonOpacity2, y: buttonY2 }}
                        className={`hoverable group relative mt-8 overflow-hidden px-6 py-3 bg-white text-black font-medium font-mono uppercase tracking-[0.2em] text-[11px] ${
                            isCtaVisible ? "pointer-events-auto" : "pointer-events-none"
                        }`}
                    >
                        <span className="relative block overflow-hidden">
                            <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
                                See my work
                            </span>
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                            >
                                See my work
                            </span>
                        </span>
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from "framer-motion";

const TOTAL_FRAMES = 181;

export default function SequenceScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Dampen the violent layout recalculations caused by mobile Safari's hiding/showing URL bar
    const smoothedProgress = useSpring(scrollYProgress, { stiffness: 300, damping: 40, restDelta: 0.001 });

    const currentIndex = useTransform(smoothedProgress, [0, 1], [1, TOTAL_FRAMES]);

    // Preload Images
    useEffect(() => {
        let loadedCount = 0;
        const loadedImages: HTMLImageElement[] = [];

        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            const paddedIndex = i.toString().padStart(3, "0");
            img.src = `/sequence/ezgif-frame-${paddedIndex}.jpg`;
            img.onload = () => {
                loadedCount++;
            };
            loadedImages.push(img);
        }
        setImages(loadedImages);
    }, []);

    // Draw to Canvas with cached dimensions
    useEffect(() => {
        if (images.length === 0 || !canvasRef.current) return;

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

            const img = images[index - 1];
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
    }, [images, currentIndex]);

    // Text Animations mapped to smoothedProgress

    // Text 1: Visible on load, fades out by 0.2
    const opacity1 = useTransform(smoothedProgress, [0, 0.15, 0.2], [1, 1, 0]);
    const translateY1 = useTransform(smoothedProgress, [0, 0.2], [0, -60]);

    // Text 2: 0.2 to 0.4
    const opacity2 = useTransform(smoothedProgress, [0.2, 0.26, 0.34, 0.4], [0, 1, 1, 0]);
    const translateY2 = useTransform(smoothedProgress, [0.2, 0.26, 0.34, 0.4], [60, 0, 0, -60]);

    // Text 3: 0.4 to 0.6
    const opacity3 = useTransform(smoothedProgress, [0.4, 0.46, 0.54, 0.6], [0, 1, 1, 0]);
    const translateX3 = useTransform(smoothedProgress, [0.4, 0.46, 0.54, 0.6], [80, 0, 0, -80]);

    // Text 4: 0.6 to 0.8
    const opacity4 = useTransform(smoothedProgress, [0.6, 0.66, 0.74, 0.8], [0, 1, 1, 0]);
    const translateY4 = useTransform(smoothedProgress, [0.6, 0.66, 0.74, 0.8], [60, 0, 0, -60]);
    // Button fades in after text
    const buttonOpacity4 = useTransform(smoothedProgress, [0.6, 0.69, 0.74, 0.8], [0, 0, 1, 0]);
    const buttonY4 = useTransform(smoothedProgress, [0.6, 0.69, 0.74, 0.8], [20, 20, 0, -20]);

    // Scroll indicator
    const scrollIndicatorOpacity = useTransform(smoothedProgress, [0, 0.03], [1, 0]);

    // Track when overlay 4 is visible so its button becomes clickable
    const [isOverlay4Visible, setIsOverlay4Visible] = useState(false);
    useMotionValueEvent(opacity4, "change", (v) => setIsOverlay4Visible(v > 0.5));

    // Words for text 1 clip reveal
    const heroWords = ["Hi,", "I'm", "Fadhlan"];

    return (
        <section ref={containerRef} className="relative h-[500svh] w-full bg-black">
            <div
                className="sticky top-0 w-full overflow-hidden will-change-transform transform-gpu"
                style={{ height: "calc(var(--vh, 1vh) * 100)" }}
            >
                {/* Canvas for Sequence */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover will-change-transform transform-gpu" />

                {/* Global overlay for contrast if needed */}
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                {/* Text 1 — Clip-reveal entrance */}
                <motion.div
                    style={{ opacity: opacity1, y: translateY1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
                >
                    <h1 className="font-heading font-bold text-5xl md:text-7xl lg:text-9xl tracking-tighter uppercase mb-6 flex flex-wrap justify-center gap-x-[0.3em]">
                        {heroWords.map((word, i) => (
                            <span key={i} className="overflow-hidden inline-block">
                                <motion.span
                                    initial={{ y: "100%" }}
                                    animate={{ y: "0%" }}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.2 * i + 3,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="inline-block"
                                >
                                    {word}
                                </motion.span>
                            </span>
                        ))}
                    </h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 3.8, ease: "easeOut" }}
                        className="font-sans text-lg md:text-2xl font-light text-zinc-300 max-w-xl"
                    >
                        Web Developer, Designer, Software Engineer & AI Integration Developer
                    </motion.p>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    style={{ opacity: scrollIndicatorOpacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
                >
                    <span className="font-sans text-xs uppercase tracking-[0.25em] text-zinc-400">
                        Scroll
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
                            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                        </svg>
                    </motion.div>
                </motion.div>

                {/* Text 2 — Simple fade-up */}
                <motion.div
                    style={{ opacity: opacity2, y: translateY2 }}
                    className="absolute inset-0 flex flex-col items-start justify-center text-left px-8 md:px-24 max-w-4xl pointer-events-none"
                >
                    <h2 className="font-heading font-bold text-4xl md:text-6xl tracking-tight mb-6">
                        Bridging the gap between<br />Design and Engineering.
                    </h2>
                    <p className="font-sans text-lg md:text-xl font-light text-zinc-400">
                        I craft digital experiences that are not only visually stunning but also technically robust, fluid, and scalable.
                    </p>
                </motion.div>

                {/* Text 3 — Slide from right */}
                <motion.div
                    style={{ opacity: opacity3, x: translateX3 }}
                    className="absolute inset-0 flex flex-col items-end justify-center text-right px-8 md:px-24 pointer-events-none"
                >
                    <div className="max-w-2xl">
                        <h2 className="font-heading font-bold text-4xl md:text-7xl mb-6 tracking-tight uppercase">
                            Motion <br />
                            is <span className="text-neutral-500 italic">Emotion</span>
                        </h2>
                    </div>
                </motion.div>

                {/* Text 4 — Fade-up with delayed button */}
                <motion.div
                    style={{ opacity: opacity4, y: translateY4 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
                >
                    <h2 className="font-heading font-bold text-5xl md:text-8xl mb-8 tracking-tighter">
                        Let&apos;s build something<br />Extraordinary.
                    </h2>
                    <motion.a
                        href="#works"
                        style={{ opacity: buttonOpacity4, y: buttonY4 }}
                        className={`hoverable px-8 py-4 bg-white text-black font-semibold rounded-full font-sans uppercase tracking-widest text-sm hover:scale-105 transition-transform ${isOverlay4Visible ? "pointer-events-auto" : "pointer-events-none"}`}
                    >
                        Explore My Work
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
}

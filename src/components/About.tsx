"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function About() {
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end center"],
    });

    const text = "I'm Fadhlan — a developer and designer who thrives at the intersection of clean code and thoughtful design. I build modern web applications with Next.js and React, craft intuitive user experiences, and integrate AI to solve real problems. Every project is an opportunity to make something that works beautifully.";
    const words = text.split(" ");

    const totalLetters = text.replace(/\s+/g, "").length;
    let letterCount = 0;

    return (
        <section
            id="about"
            ref={containerRef}
            className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-[#0a0a0a] text-white flex justify-center items-center min-h-[60vh] md:min-h-[80vh]"
        >
            <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
                <h2 className="text-zinc-500 uppercase tracking-widest text-xs font-semibold mb-12">
                    About Fadhlan Bani
                </h2>

                <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 md:gap-x-4 md:gap-y-4 text-2xl md:text-5xl lg:text-5xl font-heading font-medium tracking-tight">
                    {words.map((word, wordIndex) => (
                        <span key={wordIndex} className="inline-flex overflow-hidden">
                            {word.split("").map((letter, letterIndex) => {
                                const start = letterCount / totalLetters;
                                const end = start + (1 / totalLetters);
                                letterCount++;

                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const y = useTransform(scrollYProgress, [start, end], [30, 0]);

                                return (
                                    <motion.span
                                        key={letterIndex}
                                        className="inline-block"
                                        style={{ opacity, y }}
                                    >
                                        {letter}
                                    </motion.span>
                                );
                            })}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

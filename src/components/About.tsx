"use client";

import { motion } from "framer-motion";
export default function About() {
    const text = "I'm Fadhlan — a developer and designer who thrives at the intersection of clean code and thoughtful design. I build modern web applications with Next.js and React, craft intuitive user experiences, and integrate AI to solve real problems. Every project is an opportunity to make something that works beautifully.";
    const words = text.split(" ");

    const containerVariants: import("framer-motion").Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.015,
            },
        },
    };

    const childVariants: import("framer-motion").Variants = {
        hidden: {
            opacity: 0.1,
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    return (
        <section
            id="about"
            className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-[#0a0a0a] text-white flex justify-center items-center min-h-[60svh] md:min-h-[80svh]"
        >
            <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
                <h2 className="text-zinc-500 uppercase tracking-widest text-xs font-semibold mb-12">
                    About Fadhlan Bani
                </h2>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex flex-wrap justify-center gap-x-2 gap-y-1 md:gap-x-4 md:gap-y-4 text-2xl md:text-5xl lg:text-5xl font-heading font-medium tracking-tight"
                >
                    {words.map((word, wordIndex) => (
                        <span key={wordIndex} className="inline-flex overflow-hidden">
                            {word.split("").map((letter, letterIndex) => (
                                <motion.span
                                    key={letterIndex}
                                    variants={childVariants}
                                    className="inline-block"
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

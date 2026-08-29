"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionLabel from "./SectionLabel";
import { EASE, VIEWPORT, fadeUp } from "@/lib/motion";

const services = [
    {
        num: "01",
        title: "Web Development",
        desc: "I build websites and web applications with Next.js, React, and TypeScript — from a single landing page to an application with a backend.",
    },
    {
        num: "02",
        title: "UI / UX Design",
        desc: "I design the interface before I build it: layouts, screen flows, and the states in between. I work in Figma.",
    },
    {
        num: "03",
        title: "Software Engineering",
        desc: "The part users don't see — API design, database structure, and keeping a codebase workable as it grows.",
    },
    {
        num: "04",
        title: "AI Integration",
        desc: "Adding AI features to a product: chat interfaces, text generation, and connecting to LLM APIs.",
    },
];

export default function Services() {
    // First row starts open so the section never reads as an empty list.
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section
            id="expertise"
            className="relative py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-[var(--surface)] text-[var(--fg)]"
        >
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT}
                    className="lg:w-1/3 static lg:sticky top-32 h-fit"
                >
                    {/* Every other section marks its label as an h2; this one
                        was a bare span, which left the four service headings
                        below it hanging under no parent. */}
                    <h2>
                        <SectionLabel index="04" className="mb-8 md:mb-10">
                            Expertise
                        </SectionLabel>
                    </h2>

                    <motion.p
                        variants={fadeUp}
                        custom={2}
                        className="mt-6 text-[var(--fg-muted)] font-sans text-sm max-w-xs leading-relaxed"
                    >
                        Four areas I work in. Most projects involve more than one.
                    </motion.p>

                    <motion.p
                        variants={fadeUp}
                        custom={3}
                        className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--fg-faint)]"
                    >
                        Select to expand
                    </motion.p>
                </motion.div>

                <div className="lg:w-2/3 flex flex-col">
                    {services.map((srv, i) => {
                        const isOpen = openIndex === i;
                        const panelId = `service-panel-${srv.num}`;

                        return (
                            <motion.div
                                key={srv.num}
                                variants={fadeUp}
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={VIEWPORT}
                                className="group relative border-t border-[var(--rule)] last:border-b"
                            >
                                {/* Accent line that draws itself in when active */}
                                <span
                                    aria-hidden="true"
                                    className={`absolute -top-px left-0 h-px bg-gradient-to-r from-white via-white/50 to-transparent transition-all duration-700 ${
                                        isOpen ? "w-full" : "w-0 group-hover:w-full"
                                    }`}
                                />

                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                    aria-expanded={isOpen}
                                    aria-controls={panelId}
                                    className="hoverable w-full cursor-pointer py-5 md:py-6 text-left flex items-center gap-4 md:gap-8"
                                >
                                    <span
                                        className={`font-mono text-[10px] tracking-[0.2em] tabular-nums transition-colors duration-300 ${
                                            isOpen ? "text-white" : "text-[var(--fg-faint)] group-hover:text-white"
                                        }`}
                                    >
                                        {srv.num}
                                    </span>

                                    <h3
                                        className={`flex-grow text-lg md:text-2xl font-heading font-bold tracking-tight transition-colors duration-300 ${
                                            isOpen ? "text-white" : "text-[var(--fg-soft)] group-hover:text-white"
                                        }`}
                                    >
                                        {srv.title}
                                    </h3>

                                    {/* Plus / minus toggle */}
                                    <span
                                        aria-hidden="true"
                                        className={`relative flex h-7 w-7 shrink-0 items-center justify-center border transition-all duration-300 ${
                                            isOpen
                                                ? "border-white/50 bg-white/10"
                                                : "border-[var(--rule)] group-hover:border-white/50"
                                        }`}
                                    >
                                        <span className="absolute h-px w-2.5 bg-current" />
                                        <span
                                            className={`absolute h-2.5 w-px bg-current transition-transform duration-300 ${
                                                isOpen ? "scale-y-0" : "scale-y-100"
                                            }`}
                                        />
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            id={panelId}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.45, ease: EASE.inOut }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-7 md:pl-[3.5rem] flex flex-col gap-5">
                                                <p className="max-w-lg font-sans text-sm leading-relaxed text-[var(--fg-muted)]">
                                                    {srv.desc}
                                                </p>

                                                <a
                                                    href="#contact"
                                                    className="hoverable group/cta inline-flex w-fit items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--fg-muted)] transition-colors hover:text-white"
                                                >
                                                    Discuss a {srv.title.toLowerCase()} project
                                                    <span className="transition-transform duration-300 group-hover/cta:translate-x-1">
                                                        →
                                                    </span>
                                                </a>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

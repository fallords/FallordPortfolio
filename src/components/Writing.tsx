"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";
import { VIEWPORT, fadeUp, stagger } from "@/lib/motion";
import { essaysByYear } from "@/content/writing";

/**
 * Essays, listed as a table of contents rather than a card grid.
 *
 * A row of cards with thumbnails would make three essays look like a content
 * farm. A ruled list with the year in the margin reads like a bibliography —
 * quieter, and far more confident. The field label sits next to each title on
 * purpose: seeing "Psychology" and "Business" side by side is the whole point.
 */
export default function Writing() {
    // Nothing to show yet — render nothing at all rather than an empty shell.
    if (essaysByYear.length === 0) return null;

    return (
        <section
            id="writing"
            className="relative py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-[var(--surface)] text-[var(--fg)]"
        >
            <div className="max-w-7xl mx-auto">
                <h2>
                    <SectionLabel index="03">Writing</SectionLabel>
                </h2>

                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT}
                    className="mt-6 max-w-sm font-sans text-sm leading-relaxed text-[var(--fg-muted)]"
                >
                    Essays outside of code — where a lot of the thinking behind my work
                    actually comes from.
                </motion.p>

                <motion.ul
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={VIEWPORT}
                    className="mt-14 md:mt-20 border-t border-[var(--rule)]"
                >
                    {essaysByYear.map((essay) => (
                        <motion.li
                            key={essay.slug}
                            variants={fadeUp}
                            className="border-b border-[var(--rule)]"
                        >
                            <Link
                                href={`/writing/${essay.slug}`}
                                data-cursor-label="Read"
                                className="hoverable group relative block overflow-hidden py-5 md:py-6"
                            >
                                {/* Fill wipes up from the baseline on hover — direction,
                                    rather than a colour change. */}
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 bg-[var(--fg)]/[0.04] translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                                />

                                <div className="relative flex flex-col gap-3 md:flex-row md:items-baseline md:gap-8">
                                    <span className="shrink-0 font-mono text-[10px] tabular-nums tracking-[0.18em] text-[var(--fg-faint)] md:w-12">
                                        {essay.year}
                                    </span>

                                    <div className="flex-grow">
                                        <h3 className="font-heading text-base md:text-xl font-bold tracking-tight text-[var(--fg-soft)] transition-colors duration-300 group-hover:text-white">
                                            {essay.title}
                                        </h3>
                                        <p className="mt-1.5 max-w-xl font-sans text-xs leading-relaxed text-[var(--fg-dim)] transition-colors duration-300 group-hover:text-[var(--fg-muted)]">
                                            {essay.summary}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-end md:gap-1.5">
                                        <span className="border border-[var(--rule)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-dim)] transition-colors duration-300 group-hover:border-[var(--rule-strong)] group-hover:text-[var(--fg-soft)]">
                                            {essay.field}
                                        </span>
                                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-faint)]">
                                            {essay.readingTime}
                                        </span>
                                    </div>

                                    <span
                                        aria-hidden="true"
                                        className="hidden shrink-0 text-[var(--fg-faint)] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-white md:block md:-translate-x-2 md:group-hover:translate-x-0"
                                    >
                                        →
                                    </span>
                                </div>
                            </Link>
                        </motion.li>
                    ))}
                </motion.ul>
            </div>
        </section>
    );
}

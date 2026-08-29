"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import SectionLabel from "./SectionLabel";
import Certifications from "./Certifications";
import { VIEWPORT, fadeUp, stagger } from "@/lib/motion";

/* ------------------------------------------------------------------------- *
 * Kalimat lugas, tanpa superlatif. Segment ber-`accent: true` tetap putih
 * penuh sepanjang animasi sebagai penekanan.
 *
 * Tanda baca harus menempel di akhir segment sebelumnya. Paragraf ini dipecah
 * per kata ke dalam flex ber-gap, jadi titik yang berdiri sendiri akan tampil
 * terpisah dari kata terakhirnya — "code behind it ." bukan "code behind it."
 * ------------------------------------------------------------------------- */
const lead: { text: string; accent?: boolean }[] = [
    { text: "I'm Fadhlan. I design and build web applications — I handle both the" },
    { text: "interface", accent: true },
    { text: "and the" },
    { text: "code behind it.", accent: true },
    {
        text: "I work mainly with Next.js, React, and TypeScript, and I build AI features into products where they're useful. I'm based in Indonesia.",
    },
];

// Empat peran ini diambil persis dari tagline Fadhlan sendiri di hero.
const disciplines = [
    "Web Developer",
    "Designer",
    "Software Engineer",
    "AI Integration Developer",
];

const leadWords = lead.flatMap((segment) =>
    segment.text
        .split(" ")
        .filter(Boolean)
        .map((word) => ({ word, accent: segment.accent ?? false }))
);

/**
 * One word of the lead paragraph. Its brightness is tied to scroll position
 * rather than a one-shot entrance, so the sentence lights up under the reader
 * as they move down the page — and dims again if they scroll back.
 */
function LeadWord({
    word,
    accent,
    progress,
    range,
}: {
    word: string;
    accent: boolean;
    progress: MotionValue<number>;
    range: [number, number];
}) {
    const opacity = useTransform(progress, range, [0.34, 1]);

    return (
        <motion.span
            style={{ opacity }}
            className={`inline-block ${accent ? "text-[var(--fg)]" : ""}`}
        >
            {word}
        </motion.span>
    );
}

export default function About() {
    const paragraphRef = useRef<HTMLParagraphElement>(null);

    // Map the paragraph's travel through the middle of the viewport onto 0–1.
    const { scrollYProgress } = useScroll({
        target: paragraphRef,
        offset: ["start 0.85", "end 0.55"],
    });

    const total = leadWords.length;

    return (
        <section
            id="about"
            className="relative py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-[var(--surface)] text-[var(--fg)]"
        >
            <div className="max-w-7xl mx-auto">
                <h2>
                    <SectionLabel index="02">About</SectionLabel>
                </h2>

                <p
                    ref={paragraphRef}
                    className="mt-14 md:mt-20 max-w-3xl flex flex-wrap gap-x-[0.26em] gap-y-1 text-lg leading-[1.5] md:text-2xl md:leading-[1.45] lg:text-[1.75rem] lg:leading-[1.4] font-heading font-normal tracking-tight text-[var(--fg-muted)]"
                >
                    {leadWords.map(({ word, accent }, i) => (
                        <LeadWord
                            key={`${word}-${i}`}
                            word={word}
                            accent={accent}
                            progress={scrollYProgress}
                            // Overlap each word's range slightly so the sweep reads
                            // as a wave rather than a row of switches flipping.
                            range={[i / total, (i + 2) / total]}
                        />
                    ))}
                </p>

                {/* What I do */}
                <div className="mt-20 md:mt-28">
                    <h3>
                        <SectionLabel>What I do</SectionLabel>
                    </h3>

                    <motion.ul
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VIEWPORT}
                        className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden border border-[var(--rule)] bg-[var(--rule)]"
                    >
                        {disciplines.map((discipline, i) => (
                            <motion.li key={discipline} variants={fadeUp} className="bg-[var(--surface)]">
                                <a
                                    href="#expertise"
                                    className="hoverable group relative flex h-full flex-col justify-between gap-6 overflow-hidden p-4 md:p-5"
                                >
                                    {/* Wipe that fills from the bottom on hover — cheaper to
                                        read than a colour change, and it has direction. */}
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 bg-[var(--fg)]/[0.05] translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                                    />

                                    <span className="relative font-mono text-[10px] tabular-nums tracking-[0.18em] text-[var(--fg-faint)] transition-colors duration-300 group-hover:text-[var(--fg)]">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>

                                    <span className="relative flex items-end justify-between gap-3">
                                        <span className="font-heading text-sm md:text-base font-bold leading-tight tracking-tight text-[var(--fg-muted)] transition-colors duration-300 group-hover:text-[var(--fg)]">
                                            {discipline}
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className="shrink-0 text-[var(--fg-faint)] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[var(--fg)]"
                                        >
                                            →
                                        </span>
                                    </span>
                                </a>
                            </motion.li>
                        ))}
                    </motion.ul>
                </div>

                {/*
                 * Certifications sit last and quietest on purpose. They are a
                 * footnote to the work, not a headline. The component renders
                 * nothing at all until the list is filled in.
                 */}
                <Certifications />
            </div>
        </section>
    );
}

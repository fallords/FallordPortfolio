"use client";

import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";
import { VIEWPORT, fadeUp } from "@/lib/motion";

const testimonials = [
    {
        quote: "Fadhlan perfectly bridged the gap between our design team's wild ideas and the technical reality. The final product is a masterpiece.",
        author: "Ilham F.",
        role: "CEO, Forteza"
    },
    {
        quote: "Working with Fadhlan was a smooth experience from start to finish. He truly listened to what we needed and delivered something beyond our expectations.",
        author: "Anshar A.",
        role: "Stakeholder, PT Agni Persada"
    }
];

export default function Testimonials() {
    return (
        <section
            className="py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-[var(--surface)] text-[var(--fg)]"
        >
            <div className="max-w-7xl mx-auto">
                <h2>
                    <SectionLabel>Client Feedback</SectionLabel>
                </h2>

                <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                    {/*
                     * figure/blockquote/figcaption, not a div with a heading.
                     * The attribution was an <h4> under an <h2>, which both
                     * skipped a level and told assistive tech that a person's
                     * name was a section of the page. This markup says what the
                     * thing actually is: a quotation and its source.
                     */}
                    {testimonials.map((test, i) => (
                        <motion.figure
                            key={i}
                            variants={fadeUp}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={VIEWPORT}
                            className="group m-0 flex flex-col gap-6"
                        >
                            <blockquote className="text-base md:text-xl font-heading font-medium tracking-tight leading-relaxed">
                                <span className="text-[var(--fg)]/25 select-none">&ldquo;</span>
                                {test.quote}
                                <span className="text-[var(--fg)]/25 select-none">&rdquo;</span>
                            </blockquote>

                            <figcaption className="flex gap-4 items-center mt-auto">
                                <span
                                    aria-hidden="true"
                                    className="w-9 h-9 flex justify-center items-center font-mono text-xs font-medium bg-[var(--fg)]/[0.07] ring-1 ring-[var(--rule)] transition-colors duration-500 group-hover:bg-[var(--fg)]/[0.14]"
                                >
                                    {test.author[0]}
                                </span>
                                <span className="flex flex-col">
                                    <span className="font-sans font-bold text-sm">{test.author}</span>
                                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg-dim)]">
                                        {test.role}
                                    </span>
                                </span>
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Reveal from "./Reveal";
import Corners from "./Corners";
import SectionLabel from "./SectionLabel";
import { EASE, VIEWPORT, fadeUp } from "@/lib/motion";

/*
 * Only real, shipped work belongs here. Add an entry when a project is
 * actually live — placeholders read worse than a short list.
 */
const projects = [
    {
        id: 1,
        title: "S.E.R.A.",
        category: "AI / Forensic Analytics",
        description:
            "Smart Emotional Relationship Adviser. A web app that analyses relationship patterns using an LLM. Built with Next.js and TypeScript, deployed on Vercel.",
        image: "/sera-preview.png",
        href: "https://s-e-r-a-smart-emotional-relationshi.vercel.app/",
        objectPosition: "center 20%",
        year: "2026",
        stack: ["Next.js", "TypeScript", "LLM API"],
    },
];

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
    const cardRef = useRef<HTMLAnchorElement>(null);

    // Parallax: the image drifts slower than the page, which reads as depth.
    // Kept to a few percent — any more and it becomes the thing you notice.
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "end start"],
    });
    const rawY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
    const imageY = useSpring(rawY, { stiffness: 120, damping: 30, restDelta: 0.001 });

    return (
        <motion.div initial="hidden" whileInView="visible" viewport={VIEWPORT}>
            <a
                ref={cardRef}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="View"
                className="hoverable group grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-center"
            >
                {/* Preview — fades up while the image settles out of a 4% over-scale.
                    Small enough to feel like the frame coming to rest rather than a
                    zoom. The inner scale is a variant so the card's labels reach it. */}
                <motion.div
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    transition={{ duration: 0.9, ease: EASE.out }}
                    className="relative w-full aspect-[16/10] overflow-hidden bg-[var(--surface)] border border-[var(--rule)] group-hover:border-[var(--rule-strong)] transition-colors duration-500"
                >
                    <motion.div
                        variants={{ hidden: { scale: 1.04 }, visible: { scale: 1 } }}
                        transition={{ duration: 1.1, ease: EASE.out }}
                        style={{ y: imageY }}
                        className="absolute -inset-y-[8%] inset-x-0"
                    >
                        <Image
                            src={project.image}
                            alt={`${project.title} — screenshot`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            priority
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            style={{ objectPosition: project.objectPosition }}
                        />
                    </motion.div>

                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/5 transition-colors duration-500" />

                    {/* Crop marks instead of a closed border */}
                    <Corners className="m-2" tone="border-[var(--rule-strong)]" />
                </motion.div>

                {/* Detail */}
                <div>
                    <motion.div
                        variants={fadeUp}
                        className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--fg-faint)]"
                    >
                        <span className="tabular-nums">{project.year}</span>
                        <span className="h-px w-4 bg-white/15" />
                        <span className="text-[var(--fg-dim)]">{project.category}</span>
                    </motion.div>

                    <h3 className="mt-4 font-heading text-2xl md:text-3xl font-bold tracking-tight">
                        <Reveal delay={0.05}>{project.title}</Reveal>
                    </h3>

                    <motion.p
                        variants={fadeUp}
                        custom={1}
                        className="mt-4 max-w-md font-sans text-sm leading-relaxed text-[var(--fg-muted)]"
                    >
                        {project.description}
                    </motion.p>

                    <motion.ul variants={fadeUp} custom={2} className="mt-5 flex flex-wrap gap-1.5">
                        {project.stack.map((tool) => (
                            <li
                                key={tool}
                                className="border border-[var(--rule)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-dim)] transition-colors duration-300 group-hover:border-[var(--rule-strong)] group-hover:text-[var(--fg-soft)]"
                            >
                                {tool}
                            </li>
                        ))}
                    </motion.ul>

                    <motion.span
                        variants={fadeUp}
                        custom={3}
                        className="mt-7 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--fg-muted)] transition-colors duration-300 group-hover:text-white"
                    >
                        {/* Underline draws from the left on hover */}
                        <span className="relative">
                            Open live site
                            <span
                                aria-hidden="true"
                                className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                            />
                        </span>
                        <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
                            →
                        </span>
                    </motion.span>
                </div>
            </a>
        </motion.div>
    );
}

export default function Works() {
    return (
        <section
            id="works"
            className="relative py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-[var(--surface)] text-[var(--fg)]"
        >
            <div className="max-w-7xl mx-auto">
                <h2>
                    <SectionLabel index="01">Work</SectionLabel>
                </h2>

                <div className="mt-14 md:mt-20 flex flex-col gap-24">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>
        </section>
    );
}

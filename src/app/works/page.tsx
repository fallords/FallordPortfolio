"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const projects = [
    {
        id: 1,
        title: "S.E.R.A.",
        category: "AI / Forensic Analytics",
        description: "Smart Emotional Relationship Adviser — an AI-powered forensic analytics platform for relationship pattern analysis.",
        image: "/sera-preview.png",
        href: "https://s-e-r-a-smart-emotional-relationshi.vercel.app/",
        objectPosition: "center 20%",
        year: "2026",
        comingSoon: false,
    },
    {
        id: 2,
        title: "Aetherial",
        category: "Web Development / 3D",
        description: "Immersive 3D web experience built with Three.js and WebGL, pushing the boundaries of browser-based visuals.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        href: "#",
        year: "2025",
        comingSoon: true,
    },
    {
        id: 3,
        title: "Quantum UI",
        category: "Design System",
        description: "A modern design system featuring responsive components, fluid typography, and adaptive theming.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
        href: "#",
        year: "2025",
        comingSoon: true,
    },
    {
        id: 4,
        title: "Nexus Core",
        category: "AI Integration",
        description: "Full-stack AI integration platform connecting multiple LLM providers with seamless API orchestration.",
        image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop",
        href: "#",
        year: "2024",
        comingSoon: true,
    },
];

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

    const spotlightX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
    const spotlightY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformPerspective: 800,
                }}
                className={`group relative ${project.comingSoon ? "cursor-default" : "hoverable"}`}
            >
                {project.comingSoon ? (
                    <div className={`block md:flex items-center gap-12 ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}>
                        {/* Image */}
                        <div className="relative md:w-[60%] aspect-[16/10] overflow-hidden rounded-xl bg-zinc-900 border border-white/10 shrink-0">
                            {/* Number watermark */}
                            <div className="absolute top-4 left-5 z-10 font-heading font-bold text-[8rem] md:text-[12rem] leading-none text-white/[0.03] select-none pointer-events-none">
                                {String(index + 1).padStart(2, "0")}
                            </div>

                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 60vw"
                                className="object-cover grayscale opacity-40"
                                style={{ objectPosition: project.objectPosition || "center" }}
                            />

                            {/* Dark overlay */}
                            <div className="absolute inset-0 bg-black/50" />

                            {/* Coming Soon badge */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <span className="px-5 py-2 text-xs font-sans font-bold uppercase tracking-[0.25em] text-white/70 border border-white/20 rounded-full backdrop-blur-md bg-white/5">
                                    Coming Soon
                                </span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className={`mt-6 md:mt-0 flex-1 ${isEven ? "" : "md:text-right"}`}>
                            <span className="inline-block px-3 py-1 text-xs font-sans font-semibold uppercase tracking-widest text-white/30 border border-white/10 rounded-full mb-4">
                                {project.year}
                            </span>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-zinc-600">
                                Coming Soon
                            </h2>
                            <p className="text-zinc-700 text-sm font-sans tracking-widest uppercase mt-2">
                                Coming Soon
                            </p>
                            <p className="text-zinc-600 text-base font-sans leading-relaxed mt-4 max-w-md">
                                Coming Soon
                            </p>
                        </div>
                    </div>
                ) : (
                    <a
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block md:flex items-center gap-12 ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}
                    >
                        {/* Image */}
                        <div className="relative md:w-[60%] aspect-[16/10] overflow-hidden rounded-xl bg-zinc-900 border border-white/5 group-hover:border-white/20 transition-colors duration-500 shrink-0">
                            {/* Number watermark */}
                            <div className="absolute top-4 left-5 z-10 font-heading font-bold text-[8rem] md:text-[12rem] leading-none text-white/[0.03] group-hover:text-white/[0.08] transition-colors duration-700 select-none pointer-events-none">
                                {String(index + 1).padStart(2, "0")}
                            </div>

                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 60vw"
                                priority={index < 2}
                                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                style={{ objectPosition: project.objectPosition || "center" }}
                            />

                            {/* Overlays */}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

                            <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{
                                    background: useTransform(
                                        [spotlightX, spotlightY],
                                        ([x, y]) =>
                                            `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
                                    ),
                                }}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            {/* Corner glow */}
                            <div
                                className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                style={{
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)",
                                }}
                            />
                        </div>

                        {/* Info */}
                        <div className={`mt-6 md:mt-0 flex-1 ${isEven ? "" : "md:text-right"}`}>
                            <span className="inline-block px-3 py-1 text-xs font-sans font-semibold uppercase tracking-widest text-white/50 border border-white/10 rounded-full mb-4">
                                {project.year}
                            </span>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight group-hover:text-white transition-colors duration-300">
                                {project.title}
                            </h2>
                            <p className="text-zinc-500 text-sm font-sans tracking-widest uppercase mt-2 group-hover:text-zinc-400 transition-colors duration-300">
                                {project.category}
                            </p>
                            <p className="text-zinc-400 text-base font-sans leading-relaxed mt-4 max-w-md group-hover:text-zinc-300 transition-colors duration-300">
                                {project.description}
                            </p>

                            {/* Arrow */}
                            <div className={`mt-6 flex items-center gap-3 ${isEven ? "" : "md:justify-end"}`}>
                                <span className="text-sm font-sans font-semibold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors duration-300">
                                    View Project
                                </span>
                                <div className="w-10 h-10 rounded-full border border-white/20 group-hover:border-white/60 flex items-center justify-center group-hover:translate-x-1 transition-all duration-300">
                                    <span className="text-lg">↗</span>
                                </div>
                            </div>
                        </div>
                    </a>
                )}
            </motion.div>
        </motion.div>
    );
}

export default function WorksPage() {
    return (
        <main className="bg-[#0a0a0a] text-white min-h-[100svh] selection:bg-white/20">
            {/* Hero header */}
            <section className="pt-36 pb-20 px-6 md:px-12 lg:px-24">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col md:flex-row justify-between items-end gap-8"
                    >
                        <div>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="text-zinc-500 uppercase tracking-widest text-sm font-sans font-semibold block mb-4"
                            >
                                Portfolio
                            </motion.span>
                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold tracking-tighter uppercase leading-[0.9]">
                                All <br />
                                <span className="text-zinc-500">Works</span>
                            </h1>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="max-w-sm"
                        >
                            <p className="text-zinc-400 text-base font-sans leading-relaxed">
                                A curated collection of projects showcasing expertise in web development, AI integration, and creative design.
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Divider line */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="h-[1px] bg-white/10 mt-16 origin-left"
                    />
                </div>
            </section>

            {/* Projects list */}
            <section className="pb-32 px-6 md:px-12 lg:px-24">
                <div className="max-w-7xl mx-auto flex flex-col gap-24 md:gap-32">
                    {projects.map((project, i) => (
                        <ProjectCard key={project.id} project={project} index={i} />
                    ))}
                </div>
            </section>

            {/* Back link */}
            <section className="pb-24 px-6 md:px-12 lg:px-24">
                <div className="max-w-7xl mx-auto border-t border-white/10 pt-12 flex justify-center">
                    <Link
                        href="/"
                        className="hoverable flex items-center gap-3 text-zinc-400 hover:text-white transition-colors duration-300 font-sans font-semibold uppercase tracking-widest text-sm"
                    >
                        <span className="text-xl rotate-[225deg]">↗</span>
                        Back to Home
                    </Link>
                </div>
            </section>
        </main>
    );
}

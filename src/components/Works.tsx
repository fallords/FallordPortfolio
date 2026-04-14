"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

const projects = [
    {
        id: 1,
        title: "S.E.R.A.",
        category: "AI / Forensic Analytics",
        image: "/sera-preview.png",
        href: "https://s-e-r-a-smart-emotional-relationshi.vercel.app/",
    },
    {
        id: 2,
        title: "Aetherial",
        category: "Web Development / 3D",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        href: "#",
    },
    {
        id: 3,
        title: "Quantum UI",
        category: "Design System",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
        href: "#",
    },
    {
        id: 4,
        title: "Nexus Core",
        category: "AI Integration",
        image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop",
        href: "#",
    },
];

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Mouse position for 3D tilt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

    // Spotlight gradient position
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={`${index % 2 !== 0 ? "md:mt-32" : ""}`}
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
                className="group hoverable relative cursor-pointer"
            >
                <a
                    href={project.href}
                    target={project.href !== "#" ? "_blank" : undefined}
                    rel={project.href !== "#" ? "noopener noreferrer" : undefined}
                    className="block"
                >
                    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-zinc-900 border border-white/5 group-hover:border-white/20 transition-colors duration-500">
                        {/* Project number watermark */}
                        <div className="absolute top-4 left-5 z-10 font-heading font-bold text-[8rem] md:text-[10rem] leading-none text-white/[0.03] group-hover:text-white/[0.08] transition-colors duration-700 select-none pointer-events-none">
                            {String(index + 1).padStart(2, "0")}
                        </div>

                        {/* Image with zoom */}
                        <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={index < 2}
                            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        />

                        {/* Dark overlay → transparent on hover */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

                        {/* Mouse-following spotlight */}
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

                        {/* Bottom gradient with project info on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        {/* Hover category badge */}
                        <div className="absolute bottom-5 left-5 right-5 z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                            <span className="inline-block px-3 py-1 text-xs font-sans font-semibold uppercase tracking-widest text-white/80 border border-white/20 rounded-full backdrop-blur-sm">
                                {project.category}
                            </span>
                        </div>

                        {/* Corner glow on hover */}
                        <div className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                            style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)",
                            }}
                        />
                    </div>

                    {/* Project info below */}
                    <div className="mt-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-heading font-bold tracking-tight group-hover:text-white transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-zinc-500 text-sm font-sans tracking-widest uppercase mt-1 group-hover:text-zinc-400 transition-colors">
                                {project.category}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-white/20 group-hover:border-white/40 flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-0 rotate-45">
                            <span className="text-lg">↗</span>
                        </div>
                    </div>
                </a>
            </motion.div>
        </motion.div>
    );
}

export default function Works() {
    return (
        <section id="works" className="pt-24 pb-32 px-6 md:px-12 lg:px-24 bg-[#0a0a0a] text-white">
            <div className="max-w-7xl mx-auto border-t border-white/10 pt-16">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-heading font-bold tracking-tighter uppercase"
                    >
                        Selected <br className="hidden md:block" />
                        <span className="text-zinc-500">Works</span>
                    </motion.h2>

                    <motion.a
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        href="#"
                        className="hoverable flex items-center gap-2 pb-2 border-b border-white hover:text-zinc-400 hover:border-zinc-400 transition-colors uppercase font-sans tracking-widest text-sm font-semibold"
                    >
                        See All Projects
                        <span className="text-xl">↗</span>
                    </motion.a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {projects.map((project, i) => (
                        <ProjectCard key={project.id} project={project} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

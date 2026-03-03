"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const projects = [
    {
        id: 1,
        title: "Aetherial",
        category: "Web Development / 3D",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    },
    {
        id: 2,
        title: "Quantum UI",
        category: "Design System",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop",
    },
    {
        id: 3,
        title: "Nexus Core",
        category: "AI Integration",
        image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop",
    },
    {
        id: 4,
        title: "Lumina",
        category: "E-Commerce",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop",
    },
];

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
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                            className={`group hoverable relative cursor-pointer ${i % 2 !== 0 ? "md:mt-32" : ""}`}
                        >
                            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-zinc-900 border border-white/5">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={i < 2}
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

                                {/* Subtle Hover Glow Effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            </div>

                            <div className="mt-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-heading font-bold tracking-tight">{project.title}</h3>
                                    <p className="text-zinc-500 text-sm font-sans tracking-widest uppercase mt-1">
                                        {project.category}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                    <span className="text-lg">↗</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

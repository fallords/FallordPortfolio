"use client";

import { motion } from "framer-motion";

const services = [
    {
        num: "01",
        title: "Web Development",
        desc: "Building modern, responsive, and high-performance websites using Next.js, React, and TypeScript — from pixel-perfect landing pages to full-stack web applications.",
    },
    {
        num: "02",
        title: "UI / UX Design",
        desc: "Designing intuitive interfaces and user flows that balance aesthetics with usability. From wireframes to polished prototypes, every detail is intentional.",
    },
    {
        num: "03",
        title: "Software Engineering",
        desc: "Architecting scalable, maintainable codebases with clean patterns. API design, database modeling, and system architecture built for long-term growth.",
    },
    {
        num: "04",
        title: "AI Integration",
        desc: "Embedding intelligent features into products — from LLM-powered chatbots and content generation to custom AI pipelines that automate complex workflows.",
    },
];

export default function Services() {
    return (
        <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-black text-white min-h-screen">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-32">

                <div className="lg:w-1/3 static lg:sticky top-40 h-fit">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-7xl font-heading font-bold uppercase tracking-tighter"
                    >
                        My <br />
                        <span className="text-zinc-500">Expertise</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-8 text-zinc-400 font-sans text-lg max-w-sm"
                    >
                        I specialize in transforming complex problems into elegant, functional, and visually striking digital solutions.
                    </motion.p>
                </div>

                <div className="lg:w-2/3 flex flex-col gap-8 md:gap-12">
                    {services.map((srv, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="group hoverable border-t border-white/20 pt-8"
                        >
                            <div className="flex flex-col md:flex-row gap-4 md:gap-12 items-start md:items-center">
                                <span className="text-xl font-heading text-zinc-600 font-bold w-12">{srv.num}</span>
                                <div className="flex-grow">
                                    <h3 className="text-2xl md:text-4xl font-heading font-bold tracking-tight group-hover:text-zinc-400 transition-colors">
                                        {srv.title}
                                    </h3>
                                </div>
                            </div>
                            <div className="pl-0 md:pl-24 mt-4 overflow-hidden h-0 group-hover:h-auto opacity-0 group-hover:opacity-100 transition-all duration-500 origin-top">
                                <p className="text-zinc-400 text-lg font-sans max-w-lg pb-8">
                                    {srv.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";

export default function Contact() {
    return (
        <section id="contact" className="py-32 px-6 md:px-12 lg:px-24 bg-zinc-950 text-white min-h-[80vh] flex flex-col justify-center relative overflow-hidden">
            <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-8xl font-heading font-bold tracking-tighter leading-none"
                    >
                        Let&apos;s <br /> Create <br /> <span className="text-zinc-600">Together.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-zinc-400 font-sans mt-8 max-w-sm text-lg"
                    >
                        Looking to push the boundaries of the digital realm? Let&apos;s discuss your next ambitious project.
                    </motion.p>
                </div>

                <div className="flex flex-col justify-end gap-12 md:pb-8">
                    <motion.a
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        href="https://wa.me/+6282295007446"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group hoverable relative inline-flex items-center gap-4 py-6 border-b border-white/20 hover:border-white transition-colors w-fit"
                    >
                        <span className="text-xl md:text-4xl font-sans uppercase tracking-widest font-bold">Start a Project</span>
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                            <span className="text-xl -rotate-45 group-hover:rotate-0 transition-transform duration-300">→</span>
                        </div>
                    </motion.a>

                    <div className="flex flex-col gap-4 mt-8">
                        <span className="text-zinc-600 uppercase tracking-widest text-xs font-semibold">Socials</span>
                        <div className="flex flex-wrap gap-6 md:gap-8 font-sans font-semibold uppercase tracking-widest text-sm">
                            <a href="https://www.linkedin.com/in/fadhlan-bani-nugraha" target="_blank" rel="noopener noreferrer" className="hoverable hover:text-zinc-400 transition-colors">LinkedIn</a>
                            <a href="#" className="hoverable hover:text-zinc-400 transition-colors">Twitter</a>
                            <a href="https://www.instagram.com/fadhlanbani/" target="_blank" rel="noopener noreferrer" className="hoverable hover:text-zinc-400 transition-colors">Instagram</a>
                            <a href="#" className="hoverable hover:text-zinc-400 transition-colors">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Graphic */}
            <div className="absolute bottom-0 right-0 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tr from-zinc-800 to-transparent opacity-10 blur-3xl pointer-events-none translate-x-1/4 translate-y-1/4" />
        </section>
    );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Footer() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

    return (
        <footer
            ref={containerRef}
            className="relative bg-black text-white overflow-hidden h-[50vh] md:h-[80vh] flex flex-col justify-end"
        >
            <div className="absolute inset-0 bg-zinc-950 pointer-events-none -z-10" />

            <motion.div
                style={{ y, opacity }}
                className="w-full flex justify-center items-center pb-20 px-4"
            >
                <h1 className="text-[12vw] font-heading font-extrabold uppercase tracking-tighter leading-none text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600">
                    Fadhlan Bani
                </h1>
            </motion.div>

            <div className="flex flex-col sm:flex-row justify-between items-center p-6 lg:px-12 border-t border-white/10 font-sans text-sm uppercase tracking-widest text-zinc-500 font-semibold relative z-10 bg-black">
                <p>© {new Date().getFullYear()} — All Rights Reserved.</p>
                <div className="flex gap-6 mt-4 sm:mt-0 cursor-pointer">
                    <span className="hoverable hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to Top ↑</span>
                </div>
            </div>
        </footer>
    );
}

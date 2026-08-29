"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import LocalTime from "./LocalTime";

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
            className="relative bg-[var(--surface)] text-white overflow-hidden h-[42svh] md:h-[58svh] flex flex-col justify-end"
        >
            <motion.div
                style={{ y, opacity }}
                className="w-full flex justify-center items-center pb-20 px-4"
            >
                {/*
                 * A wordmark, not a heading. It was an <h1>, which gave the page
                 * a second top-level heading and told a screen reader the footer
                 * was where the document begins. It carries no information the
                 * hero has not already given, so it is marked decorative.
                 */}
                <p
                    aria-hidden="true"
                    className="text-[6.5vw] font-heading font-extrabold uppercase tracking-tight leading-none text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-[var(--fg-ghost)]"
                >
                    Fadhlan Bani
                </p>
            </motion.div>

            {/* pb-9 clears the fixed HUD strip pinned to the bottom of the viewport */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-5 lg:px-12 border-t border-[var(--rule)] font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-faint)] relative z-10 bg-[var(--surface)]">
                <p>© {new Date().getFullYear()} — All rights reserved</p>

                <LocalTime className="text-[10px] tracking-[0.22em] text-[var(--fg-faint)]" />

                <div className="flex gap-6">
                    <button
                        type="button"
                        className="hoverable uppercase tracking-[0.22em] transition-colors hover:text-white cursor-pointer"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                        Back to top ↑
                    </button>
                </div>
            </div>
        </footer>
    );
}

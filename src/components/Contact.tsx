"use client";

import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";
import { VIEWPORT, fadeUp } from "@/lib/motion";

const socials = [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/fadhlan-bani-nugraha" },
    { label: "Instagram", href: "https://www.instagram.com/fadhlanbani/" },
];

export default function Contact() {
    return (
        <section
            id="contact"
            className="py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-[var(--surface)] text-[var(--fg)] min-h-[70svh] flex flex-col justify-center relative overflow-hidden"
        >
            <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
                <motion.div initial="hidden" whileInView="visible" viewport={VIEWPORT}>
                    <h2>
                        <SectionLabel index="05">Contact</SectionLabel>
                    </h2>

                    {/*
                     * Tidak ada badge status di sini. Penanda "tersedia untuk
                     * kerja" hanya berguna kalau selalu diperbarui, dan begitu
                     * basi ia justru salah memberi informasi.
                     */}
                    <motion.p
                        variants={fadeUp}
                        custom={2}
                        className="text-[var(--fg-muted)] font-sans mt-8 md:mt-10 max-w-sm text-sm leading-relaxed"
                    >
                        Have a project in mind? Send me the details and I&apos;ll get back to you.
                    </motion.p>
                </motion.div>

                <div className="flex flex-col justify-end gap-12 md:pb-8">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={VIEWPORT}
                        className="flex flex-col gap-8"
                    >
                        <a
                            href="mailto:fadhlanbanin@gmail.com"
                            className="group hoverable flex items-center gap-4 border-b border-[var(--rule-strong)] pb-5 transition-colors hover:border-white w-fit"
                        >
                            <span className="font-sans text-base md:text-xl font-bold tracking-tight break-all">
                                fadhlanbanin@gmail.com
                            </span>
                            <span className="shrink-0 text-xl transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </a>

                        {/* Nomor telepon dihapus atas permintaan. Email dan
                            LinkedIn sudah cukup untuk memulai percakapan, dan
                            nomor pribadi di halaman publik akan dipanen bot. */}
                    </motion.div>

                    <div className="flex flex-col gap-4 mt-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--fg-faint)]">
                            Elsewhere
                        </span>
                        <div className="flex flex-wrap gap-6 md:gap-8 font-mono text-[11px] uppercase tracking-[0.2em]">
                            {socials.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hoverable relative text-[var(--fg-soft)] hover:text-white transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-white hover:after:w-full after:transition-all after:duration-300"
                                >
                                    {social.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

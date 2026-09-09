"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { hasEssays } from "@/content/writing";

const MotionLink = motion.create(Link);

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const menuVariants: Variants = {
        closed: {
            clipPath: "circle(0% at calc(100% - 44px) 44px)",
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] }
        },
        open: {
            clipPath: "circle(150% at calc(100% - 44px) 44px)",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
        }
    };

    const linkVariants: Variants = {
        closed: { y: "100%", opacity: 0 },
        open: (i: number) => ({
            y: "0%",
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: [0.76, 0, 0.24, 1],
                delay: 0.1 * i + 0.3
            }
        })
    };

    // "Writing" only appears once there is something to read — a menu item
    // pointing at an anchor that doesn't exist is worse than no menu item.
    const navLinks = [
        { title: "Home", href: "/" },
        { title: "Works", href: "/#works" },
        { title: "About", href: "/#about" },
        ...(hasEssays ? [{ title: "Writing", href: "/#writing" }] : []),
        { title: "Expertise", href: "/#expertise" },
        { title: "Contact", href: "/#contact" }
    ];

    return (
        <>
            {/* Logo — confident editorial mark */}
            <div className="fixed top-6 left-6 lg:top-8 lg:left-8 z-[50] pointer-events-auto">
                <Link href="/" className="font-heading font-bold text-base text-white uppercase tracking-[0.22em] cursor-pointer hoverable transition-colors hover:text-[var(--fg-soft)]">
                    Fallord
                </Link>
            </div>

            {/* Handcrafted circular menu button */}
            <button
                className="hoverable fixed top-5 right-5 lg:top-7 lg:right-7 z-[70] w-14 h-14 rounded-full bg-[#131a16] border border-[var(--rule-strong)] flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-[var(--steel)] active:scale-95 pointer-events-auto shadow-xl"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                <div className="flex flex-col items-center justify-center gap-[5px] w-5">
                    <motion.span
                        className="block w-full h-[1.5px] bg-white origin-center"
                        animate={isOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                    <motion.span
                        className="block w-full h-[1.5px] bg-[var(--brass)] origin-center"
                        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.span
                        className="block w-full h-[1.5px] bg-white origin-center"
                        animate={isOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                </div>
            </button>

            {/* Fullscreen overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                        className="fixed inset-0 z-[60] bg-[#0c120f] text-white flex flex-col"
                    >
                        {/* Overlay content */}
                        <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-y-visible">
                            {/* Left: Nav links */}
                            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20">
                                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--fg-dim)] mb-8">
                                    [ Index ]
                                </span>
                                <div className="flex flex-col gap-2">
                                    {navLinks.map((link, i) => (
                                        <div key={i} className="overflow-hidden">
                                            <MotionLink
                                                custom={i}
                                                variants={linkVariants}
                                                href={link.href}
                                                className="group flex items-center gap-6 py-3 hoverable"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--brass)] w-8 tabular-nums font-semibold">
                                                    0{i + 1}
                                                </span>
                                                <span className="text-2xl lg:text-4xl font-heading font-bold tracking-tight text-[var(--fg-soft)] group-hover:text-white transition-colors duration-300">
                                                    {link.title}
                                                </span>
                                                <span className="hidden lg:block w-0 group-hover:w-16 h-[1.5px] bg-[var(--brass)] transition-all duration-500" />
                                            </MotionLink>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Info panel */}
                            <div className="lg:w-[380px] flex flex-col justify-end gap-10 px-8 md:px-16 lg:px-12 pb-12 lg:pb-16 border-t lg:border-t-0 lg:border-l border-[var(--rule)] bg-[#0f1612]">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="flex flex-col items-start gap-3"
                                >
                                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--brass)]">About</span>
                                    <p className="text-sm leading-relaxed text-[var(--fg-soft)]">
                                        Developer and designer. I build web applications with Next.js,
                                        React, and TypeScript. Based in Indonesia.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.6 }}
                                    className="flex flex-col gap-3"
                                >
                                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--brass)]">Get in Touch</span>
                                    <a href="mailto:fadhlanbanin@gmail.com" className="text-sm font-sans hoverable hover:text-white transition-colors break-all">
                                        fadhlanbanin@gmail.com
                                    </a>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7, duration: 0.6 }}
                                    className="flex gap-6 font-mono font-semibold uppercase tracking-[0.2em] text-[11px] text-[var(--fg-dim)]"
                                >
                                    <a href="https://www.linkedin.com/in/fadhlan-bani-nugraha" target="_blank" rel="noopener noreferrer" className="hoverable hover:text-white transition-colors">LinkedIn</a>
                                    <a href="https://www.instagram.com/fadhlanbani/" target="_blank" rel="noopener noreferrer" className="hoverable hover:text-white transition-colors">Instagram</a>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}


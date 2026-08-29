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
            {/* Logo — always visible */}
            <div className="fixed top-6 left-6 lg:top-8 lg:left-8 z-[50] pointer-events-auto">
                <Link href="/" className="font-heading font-bold text-base text-white uppercase tracking-[0.2em] cursor-pointer hoverable">
                    Fallord
                </Link>
            </div>

            {/* Floating pill menu button */}
            <button
                className="hoverable fixed top-5 right-5 lg:top-7 lg:right-7 z-[70] w-14 h-14 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 pointer-events-auto"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                <div className="flex flex-col items-center justify-center gap-[5px] w-5">
                    <motion.span
                        className="block w-full h-[2px] bg-black origin-center"
                        animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                    <motion.span
                        className="block w-full h-[2px] bg-black origin-center"
                        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.span
                        className="block w-full h-[2px] bg-black origin-center"
                        animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
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
                        className="fixed inset-0 z-[60] bg-[#111] text-white flex flex-col"
                    >
                        {/* Overlay content */}
                        <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-y-visible">
                            {/* Left: Nav links */}
                            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20">
                                <span className="text-[var(--fg-dim)] uppercase tracking-widest text-xs font-semibold mb-8">Navigation</span>
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
                                                <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--fg-faint)] w-8 tabular-nums">
                                                    0{i + 1}
                                                </span>
                                                <span className="text-2xl lg:text-4xl font-heading font-bold tracking-tight group-hover:text-[var(--fg-muted)] transition-colors duration-300">
                                                    {link.title}
                                                </span>
                                                <span className="hidden lg:block w-0 group-hover:w-16 h-[2px] bg-white transition-all duration-500" />
                                            </MotionLink>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Info panel */}
                            <div className="lg:w-[380px] flex flex-col justify-end gap-10 px-8 md:px-16 lg:px-12 pb-12 lg:pb-16 border-t lg:border-t-0 lg:border-l border-[var(--rule)]">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="flex flex-col items-start gap-3"
                                >
                                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--fg-faint)]">About</span>
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
                                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--fg-faint)]">Get in Touch</span>
                                    <a href="mailto:fadhlanbanin@gmail.com" className="text-sm font-sans hoverable hover:text-[var(--fg-muted)] transition-colors break-all">
                                        fadhlanbanin@gmail.com
                                    </a>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7, duration: 0.6 }}
                                    className="flex gap-6 font-sans font-semibold uppercase tracking-widest text-xs text-[var(--fg-dim)]"
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


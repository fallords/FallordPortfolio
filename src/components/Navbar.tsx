"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

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

    const navLinks = [
        { title: "Home", href: "#" },
        { title: "Works", href: "#works" },
        { title: "About", href: "#about" },
        { title: "Contact", href: "#contact" }
    ];

    return (
        <>
            {/* Logo — always visible */}
            <div className="fixed top-6 left-6 lg:top-8 lg:left-8 z-[50] mix-blend-difference pointer-events-auto">
                <a href="#" className="font-heading font-bold text-xl text-white uppercase tracking-widest cursor-pointer hoverable">
                    Fallord
                </a>
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
                        <div className="flex flex-col lg:flex-row h-full">
                            {/* Left: Nav links */}
                            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20">
                                <span className="text-zinc-500 uppercase tracking-widest text-xs font-semibold mb-8">Navigation</span>
                                <div className="flex flex-col gap-2">
                                    {navLinks.map((link, i) => (
                                        <div key={i} className="overflow-hidden">
                                            <motion.a
                                                custom={i}
                                                variants={linkVariants}
                                                href={link.href}
                                                className="group flex items-center gap-6 py-3 hoverable"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <span className="font-sans text-sm text-zinc-600 w-8 tabular-nums">
                                                    0{i + 1}
                                                </span>
                                                <span className="text-4xl lg:text-7xl font-heading font-bold tracking-tight group-hover:text-zinc-400 transition-colors duration-300">
                                                    {link.title}
                                                </span>
                                                <span className="hidden lg:block w-0 group-hover:w-16 h-[2px] bg-white transition-all duration-500" />
                                            </motion.a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Info panel */}
                            <div className="lg:w-[380px] flex flex-col justify-end gap-10 px-8 md:px-16 lg:px-12 pb-12 lg:pb-16 border-t lg:border-t-0 lg:border-l border-white/10">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="flex flex-col gap-3"
                                >
                                    <span className="text-zinc-500 uppercase tracking-widest text-xs font-semibold">About</span>
                                    <p className="text-sm leading-relaxed text-zinc-300">
                                        A Creative Developer specializing in Next.js, Motion, and web interactions. Crafting digital experiences that feel alive.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.6 }}
                                    className="flex flex-col gap-3"
                                >
                                    <span className="text-zinc-500 uppercase tracking-widest text-xs font-semibold">Get in Touch</span>
                                    <a href="mailto:fadhlanbanin@gmail.com" className="text-lg font-heading hoverable hover:text-zinc-400 transition-colors">
                                        fadhlanbanin@gmail.com
                                    </a>
                                    <a href="https://wa.me/+6282295007446" className="text-lg font-heading hoverable hover:text-zinc-400 transition-colors">
                                        +62 822 9500 7446
                                    </a>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7, duration: 0.6 }}
                                    className="flex gap-6 font-sans font-semibold uppercase tracking-widest text-xs text-zinc-500"
                                >
                                    <a href="https://www.linkedin.com/in/fadhlan-bani-nugraha" target="_blank" rel="noopener noreferrer" className="hoverable hover:text-white transition-colors">Li</a>
                                    <a href="https://www.instagram.com/fadhlanbani/" target="_blank" rel="noopener noreferrer" className="hoverable hover:text-white transition-colors">Ig</a>
                                    <a href="#" className="hoverable hover:text-white transition-colors">Tw</a>
                                    <a href="#" className="hoverable hover:text-white transition-colors">Gh</a>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}


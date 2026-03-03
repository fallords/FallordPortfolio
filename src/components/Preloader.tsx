"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Preloader() {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Lock scroll while preloader is active
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsComplete(true), 500);
                    return 100;
                }
                return prev + Math.floor(Math.random() * 15) + 1;
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    if (isComplete) {
        document.body.style.overflow = "";
        return null;
    }

    const displayProgress = Math.min(progress, 100);

    return (
        <motion.div
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black text-white"
            initial={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
            animate={progress === 100 ? { clipPath: "polygon(0 0, 100% 0, 100% 0%, 0% 0%)" } : {}}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
            onAnimationComplete={() => progress === 100 && setIsComplete(true)}
        >
            {/* Center content */}
            <div className="flex flex-col items-center gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="overflow-hidden"
                >
                    <span className="font-heading font-bold text-sm uppercase tracking-[0.3em] text-zinc-500">
                        Fadhlan Bani
                    </span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="font-heading font-bold text-6xl md:text-7xl tracking-tighter tabular-nums select-none"
                >
                    {displayProgress.toString().padStart(3, "0")}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-48 h-[1px] bg-white/10 relative overflow-hidden"
                >
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: `${displayProgress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                </motion.div>

                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="font-sans text-xs text-zinc-600 uppercase tracking-widest"
                >
                    Loading
                </motion.span>
            </div>
        </motion.div>
    );
}

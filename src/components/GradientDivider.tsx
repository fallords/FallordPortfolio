"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function GradientDivider() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const scaleX = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    return (
        <div ref={ref} className="relative w-full h-px overflow-visible">
            {/* Main gradient line */}
            <motion.div
                className="absolute left-0 right-0 h-[1px] origin-left"
                style={{
                    scaleX,
                    opacity,
                    background:
                        "linear-gradient(90deg, transparent, #6366f1, #a855f7, #ec4899, #6366f1, transparent)",
                }}
            />
            {/* Glow effect */}
            <motion.div
                className="absolute left-0 right-0 h-[6px] -top-[2.5px] origin-left"
                style={{
                    scaleX,
                    opacity,
                    background:
                        "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4), rgba(99, 102, 241, 0.4), transparent)",
                    filter: "blur(4px)",
                }}
            />
        </div>
    );
}

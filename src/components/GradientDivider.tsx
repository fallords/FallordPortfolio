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
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), rgba(255,255,255,0.85), rgba(255,255,255,0.35), transparent)",
                }}
            />
            {/* Glow effect */}
            <motion.div
                className="absolute left-0 right-0 h-[6px] -top-[2.5px] origin-left"
                style={{
                    scaleX,
                    opacity,
                    background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), rgba(255,255,255,0.35), rgba(255,255,255,0.18), transparent)",
                    filter: "blur(4px)",
                }}
            />
        </div>
    );
}

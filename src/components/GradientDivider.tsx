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
            {/* Handcrafted hairline: surgical steel with an antique brass center taper */}
            <motion.div
                className="absolute left-0 right-0 h-px origin-left"
                style={{
                    scaleX,
                    opacity,
                    background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), rgba(197, 160, 89, 0.4) 48%, rgba(217, 227, 234, 0.65) 50%, rgba(197, 160, 89, 0.4) 52%, rgba(255,255,255,0.06), transparent)",
                }}
            />
        </div>
    );
}

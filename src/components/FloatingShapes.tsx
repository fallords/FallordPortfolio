"use client";

import { memo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const shapes = [
    { type: "ring", size: 60, x: "10%", y: "20%", speed: 0.4, dur: 20 },
    { type: "dot", size: 8, x: "85%", y: "15%", speed: 0.6, dur: 25 },
    { type: "cross", size: 20, x: "75%", y: "70%", speed: 0.3, dur: 30 },
    { type: "ring", size: 40, x: "90%", y: "45%", speed: 0.5, dur: 35 },
    { type: "dot", size: 6, x: "20%", y: "75%", speed: 0.45, dur: 22 },
] as const;

const Shape = memo(function Shape({ type, size }: { type: string; size: number }) {
    const color = "rgba(255, 255, 255, 0.08)";
    switch (type) {
        case "ring":
            return (
                <div
                    style={{
                        width: size,
                        height: size,
                        border: `1px solid ${color}`,
                        borderRadius: "50%",
                    }}
                />
            );
        case "dot":
            return (
                <div
                    style={{
                        width: size,
                        height: size,
                        backgroundColor: color,
                        borderRadius: "50%",
                    }}
                />
            );
        case "cross":
            return (
                <div className="relative" style={{ width: size, height: size }}>
                    <div
                        className="absolute left-1/2 top-0 -translate-x-1/2"
                        style={{ width: 1, height: size, backgroundColor: color }}
                    />
                    <div
                        className="absolute top-1/2 left-0 -translate-y-1/2"
                        style={{ width: size, height: 1, backgroundColor: color }}
                    />
                </div>
            );
        default:
            return null;
    }
});

export default function FloatingShapes() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
            {shapes.map((shape, i) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const y = useTransform(scrollYProgress, [0, 1], [0, -200 * shape.speed]);

                return (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            left: shape.x,
                            top: shape.y,
                            y,
                            willChange: "transform",
                        }}
                    >
                        {/* Single CSS animation instead of two nested Framer Motion animates */}
                        <div
                            className="animate-float"
                            style={{ animationDuration: `${shape.dur}s` }}
                        >
                            <Shape type={shape.type} size={shape.size} />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

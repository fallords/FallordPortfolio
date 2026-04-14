"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface MagneticButtonProps {
    children: ReactNode;
    href: string;
    className?: string;
    disabled?: boolean;
}

export default function MagneticButton({
    children,
    href,
    className = "",
    disabled = false,
}: MagneticButtonProps) {
    const ref = useRef<HTMLAnchorElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    // Glow position
    const glowX = useTransform(springX, (v) => v * 0.5);
    const glowY = useTransform(springY, (v) => v * 0.5);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current || disabled) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * 0.3);
        y.set((e.clientY - centerY) * 0.3);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.a
            ref={ref}
            href={href}
            className={`relative group inline-block ${className}`}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Glow ring behind the button */}
            <motion.div
                className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    x: glowX,
                    y: glowY,
                    background:
                        "radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)",
                    filter: "blur(12px)",
                }}
            />

            {/* Inner content */}
            <span className="relative z-10 flex items-center justify-center">
                {children}
            </span>

            {/* Shimmer sweep */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
                <motion.div
                    className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    animate={{
                        x: ["-200%", "200%"],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 4,
                        ease: "easeInOut",
                    }}
                />
            </div>
        </motion.a>
    );
}

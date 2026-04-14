"use client";

import { motion } from "framer-motion";

export default function AuroraBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
            {/* Primary aurora blob — CSS animation avoids Framer re-renders */}
            <div
                className="absolute -top-[40%] -left-[20%] w-[80vw] h-[80vh] rounded-full opacity-[0.07] animate-aurora-1"
                style={{
                    background: "radial-gradient(circle, #6366f1, #8b5cf6, transparent 70%)",
                    filter: "blur(80px)",
                    willChange: "transform",
                }}
            />

            {/* Secondary aurora blob */}
            <div
                className="absolute -bottom-[30%] -right-[20%] w-[70vw] h-[70vh] rounded-full opacity-[0.06] animate-aurora-2"
                style={{
                    background: "radial-gradient(circle, #06b6d4, #3b82f6, transparent 70%)",
                    filter: "blur(80px)",
                    willChange: "transform",
                }}
            />

            {/* Tertiary accent blob */}
            <div
                className="absolute top-[20%] right-[10%] w-[40vw] h-[40vh] rounded-full opacity-[0.04] animate-aurora-3"
                style={{
                    background: "radial-gradient(circle, #a855f7, #ec4899, transparent 70%)",
                    filter: "blur(60px)",
                    willChange: "transform",
                }}
            />
        </div>
    );
}

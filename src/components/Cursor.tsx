"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Cursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest("a, button, .hoverable")) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    const variants = {
        default: {
            x: mousePosition.x - 16,
            y: mousePosition.y - 16,
            opacity: 1,
        },
        hover: {
            x: mousePosition.x - 40,
            y: mousePosition.y - 40,
            height: 80,
            width: 80,
            backgroundColor: "rgba(255, 255, 255, 1)",
            mixBlendMode: "difference" as const,
            opacity: 1,
        }
    };

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference hidden md:block style-will-change-transform"
                variants={variants}
                animate={isHovered ? "hover" : "default"}
                transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
                style={{ willChange: "transform, width, height, background-color" }}
                aria-hidden="true"
            />
            {isHovered && (
                <motion.div
                    className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[101] mix-blend-difference hidden md:block style-will-change-transform"
                    animate={{
                        x: mousePosition.x - 4,
                        y: mousePosition.y - 4,
                    }}
                    transition={{ type: "tween", ease: "linear", duration: 0 }}
                    style={{ willChange: "transform" }}
                    aria-hidden="true"
                />
            )}
        </>
    );
}

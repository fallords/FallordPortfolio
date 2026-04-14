"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Cursor() {
    const [isHovered, setIsHovered] = useState(false);
    const posRef = useRef({ x: 0, y: 0 });
    const cursorRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        // Use RAF loop instead of setState for mouse position — avoids re-renders
        const updateMousePosition = (e: MouseEvent) => {
            posRef.current.x = e.clientX;
            posRef.current.y = e.clientY;
        };

        const handleMouseOver = (e: MouseEvent) => {
            const hovered = !!(e.target as HTMLElement).closest("a, button, .hoverable");
            setIsHovered(hovered);
        };

        // Animate cursor position via RAF — no React re-renders
        const animate = () => {
            const { x, y } = posRef.current;
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
            }
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
            }
            rafRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener("mousemove", updateMousePosition, { passive: true });
        window.addEventListener("mouseover", handleMouseOver, { passive: true });
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mouseover", handleMouseOver);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className={`fixed top-0 left-0 rounded-full pointer-events-none z-[100] mix-blend-difference hidden md:block transition-[width,height] duration-150 ease-out ${
                    isHovered ? "w-20 h-20 bg-white" : "w-8 h-8 bg-white"
                }`}
                style={{ willChange: "transform" }}
                aria-hidden="true"
            />
            {isHovered && (
                <div
                    ref={dotRef}
                    className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[101] mix-blend-difference hidden md:block"
                    style={{ willChange: "transform" }}
                    aria-hidden="true"
                />
            )}
        </>
    );
}

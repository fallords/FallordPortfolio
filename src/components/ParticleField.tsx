"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    fadeDirection: number;
}

export default function ParticleField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>(0);
    const isVisibleRef = useRef(true);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const PARTICLE_COUNT = 50;
        const CONNECTION_DIST_SQ = 150 * 150; // Squared to avoid sqrt
        const MOUSE_RADIUS_SQ = 150 * 150;
        const MOUSE_RADIUS = 150;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            if (canvas.width === window.innerWidth) return;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        resize();

        // Throttled resize
        let resizeTimer: ReturnType<typeof setTimeout>;
        const throttledResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        };
        window.addEventListener("resize", throttledResize);
        window.addEventListener("mousemove", handleMouseMove, { passive: true });

        // Pause when tab is hidden
        const handleVisibility = () => {
            isVisibleRef.current = !document.hidden;
            if (isVisibleRef.current) {
                animationRef.current = requestAnimationFrame(render);
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        // Initialize particles
        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            radius: Math.random() * 1.2 + 0.3,
            opacity: Math.random() * 0.3 + 0.05,
            fadeDirection: Math.random() > 0.5 ? 1 : -1,
        }));

        // Pre-compute opacity strings to reduce GC pressure
        const opacityCache = new Map<number, string>();
        const getOpacityFill = (opacity: number): string => {
            const key = Math.round(opacity * 100);
            let cached = opacityCache.get(key);
            if (!cached) {
                cached = `rgba(255,255,255,${(key / 100).toFixed(2)})`;
                opacityCache.set(key, cached);
            }
            return cached;
        };

        const render = () => {
            if (!isVisibleRef.current) return;

            ctx.clearRect(0, 0, width, height);
            const particles = particlesRef.current;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const len = particles.length;

            for (let i = 0; i < len; i++) {
                const p = particles[i];

                // Mouse repulsion (squared distance — no sqrt)
                const dx = p.x - mx;
                const dy = p.y - my;
                const distSq = dx * dx + dy * dy;
                if (distSq < MOUSE_RADIUS_SQ && distSq > 0) {
                    const dist = Math.sqrt(distSq);
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.2;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }

                // Update & damp
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.99;
                p.vy *= 0.99;

                // Wrap edges
                if (p.x < 0) p.x = width;
                else if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                else if (p.y > height) p.y = 0;

                // Fade
                p.opacity += p.fadeDirection * 0.001;
                if (p.opacity > 0.35) p.fadeDirection = -1;
                else if (p.opacity < 0.05) p.fadeDirection = 1;

                // Draw dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, 6.2832); // 2*PI
                ctx.fillStyle = getOpacityFill(p.opacity);
                ctx.fill();

                // Connections (squared distance — skip sqrt for reject)
                for (let j = i + 1; j < len; j++) {
                    const p2 = particles[j];
                    const cdx = p.x - p2.x;
                    const cdy = p.y - p2.y;
                    const cdistSq = cdx * cdx + cdy * cdy;

                    if (cdistSq < CONNECTION_DIST_SQ) {
                        const lineOpacity = (1 - Math.sqrt(cdistSq) / 150) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(255,255,255,${lineOpacity.toFixed(3)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationRef.current = requestAnimationFrame(render);
        };

        animationRef.current = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationRef.current);
            clearTimeout(resizeTimer);
            window.removeEventListener("resize", throttledResize);
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [handleMouseMove]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
            aria-hidden="true"
        />
    );
}

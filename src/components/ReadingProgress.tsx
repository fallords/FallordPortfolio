"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A hairline that tracks progress through an article.
 *
 * This was deliberately left off the main page — there, it would be decoration.
 * On a long read it does actual work: it answers "how much is left?" without
 * making the reader scroll to find out. Same component, different justification.
 */
export default function ReadingProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 220,
        damping: 40,
        restDelta: 0.001,
    });

    return (
        <motion.div
            aria-hidden="true"
            style={{ scaleX }}
            className="fixed top-0 left-0 right-0 h-px z-[80] origin-left pointer-events-none bg-white/70"
        />
    );
}

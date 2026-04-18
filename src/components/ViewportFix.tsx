"use client";

import { useEffect } from "react";

export default function ViewportFix() {
    useEffect(() => {
        const setVh = () => {
            // Calculate 1% of the exact inner height
            const vh = window.innerHeight * 0.01;
            // Set the value in the --vh custom property to the root of the document
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        };

        // Set immediately on mount
        setVh();

        // On mobile, only update on orientation change to prevent layout jumping
        // when the in-app browser (like Instagram WebView) hides/shows its navigation bar
        const handleResize = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            if (!isMobile) {
                setVh();
            }
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", () => setTimeout(setVh, 100));

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", setVh);
        };
    }, []);

    return null;
}

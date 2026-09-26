"use client";

import { useEffect, useState } from "react";

export const TOGGLE_GRID_EVENT = "toggle-grid";

/**
 * The layout grid, made visible. Press G, or use the switch in the footer.
 *
 * It draws the same `.shell` + `.grid-12` every section is built on, so what
 * you see is the real grid, not a picture of one: if a column edge and a text
 * edge don't line up, that is a bug in the page.
 */
export default function GridOverlay() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggle = () => setVisible((v) => !v);

        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "g" && e.key !== "G") return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            const target = e.target as HTMLElement;
            if (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
            toggle();
        };

        window.addEventListener("keydown", onKey);
        window.addEventListener(TOGGLE_GRID_EVENT, toggle);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener(TOGGLE_GRID_EVENT, toggle);
        };
    }, []);

    if (!visible) return null;

    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
            <div className="shell grid-12 h-full">
                {Array.from({ length: 12 }, (_, i) => (
                    <div
                        key={i}
                        className={`h-full border-x border-[var(--gold)]/25 bg-[var(--gold)]/[0.05] ${
                            i >= 4 ? "hidden md:block" : ""
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasEssays } from "@/content/writing";
import { OPEN_PALETTE_EVENT } from "./CommandPalette";

const links = [
    { label: "Work", id: "work" },
    { label: "About", id: "about" },
    ...(hasEssays ? [{ label: "Writing", id: "writing", wide: true }] : []),
    { label: "Contact", id: "contact" },
];

const noopSubscribe = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Sections that don't have their own link light up the one before them. */
const OWNER: Record<string, string> = { certificates: "about" };

/**
 * Plain links, always visible. Five destinations don't need a menu button.
 *
 * On the home page the link for the section you're reading is marked. The
 * active section is the last one whose top has passed a line a third of the
 * way down the screen — cheaper and steadier than juggling observer ratios,
 * and it is only computed once per frame while scrolling.
 */
export default function Header() {
    const pathname = usePathname();
    const [active, setActive] = useState<string | null>(null);
    // The server can't know the platform; it renders "Ctrl" and the client corrects it.
    const mac = useSyncExternalStore(noopSubscribe, isMac, () => false);

    useEffect(() => {
        if (pathname !== "/") return;

        const sections = [...document.querySelectorAll<HTMLElement>("main section[id]")];
        let frame = 0;

        const update = () => {
            frame = 0;
            const line = window.innerHeight / 3;
            let current: string | null = null;
            for (const section of sections) {
                if (section.getBoundingClientRect().top <= line) current = section.id;
            }
            // The last section is short; at the very bottom it can never reach the line.
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
                current = sections.at(-1)?.id ?? current;
            }
            setActive(current ? (OWNER[current] ?? current) : null);
        };

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [pathname]);

    // On the home page these links only jump to a section of the page already
    // loaded; prefetching "/" for them would download this page's data again.
    const prefetch = pathname === "/" ? false : undefined;

    return (
        <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[var(--surface)]/85 backdrop-blur-md">
            <div className="shell flex h-12 items-center justify-between md:h-14">
                <Link href="/" prefetch={prefetch} className="flex h-12 items-center text-sm font-medium text-[var(--fg)] md:h-14">
                    Fadhlan Bani
                </Link>

                <nav aria-label="Primary">
                    {/* Tight on a phone so all four fit from 360px; a 320px screen drops Writing. */}
                    <ul className="flex items-center gap-3.5 text-sm min-[400px]:gap-5 md:gap-7">
                        {links.map((link) => {
                            const isActive = pathname === "/" && active === link.id;
                            return (
                                <li key={link.id} className={"wide" in link ? "hidden min-[360px]:block" : undefined}>
                                    <Link
                                        href={`/#${link.id}`}
                                        prefetch={prefetch}
                                        aria-current={isActive ? "location" : undefined}
                                        // Full header height as the hit area: 44px+ to tap, not the ~20px of the text.
                                        className={`flex h-12 items-center underline-offset-[0.4em] md:h-14 transition-colors hover:text-[var(--fg)] ${
                                            isActive
                                                ? "text-[var(--fg)] underline decoration-[var(--gold)] decoration-1"
                                                : "text-[var(--fg-muted)]"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                        <li className="hidden md:block">
                            <button
                                type="button"
                                onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
                                aria-label="Open command menu"
                                className="flex h-7 items-center gap-1 border border-[var(--rule-strong)] px-2 font-mono text-xs text-[var(--fg-muted)] transition-colors hover:border-[var(--gold)] hover:text-[var(--fg)]"
                            >
                                {mac ? "⌘" : "Ctrl"} K
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LocalTime from "./LocalTime";

// Nothing from content/: this runs in the browser, and importing writing.ts would ship every essay with it.
const links = [
    { label: "Work", id: "work" },
    { label: "About", id: "about" },
    { label: "Writing", id: "writing" },
    { label: "Contact", id: "contact" },
];

/*
 * The strip's bars: 160 of them, each a fixed, irregular height, like the
 * bands of a spectrum. Made once from a small deterministic hash, so the
 * server and the browser draw the same bars.
 */
const noise = (i: number) => {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
};
const BARS = Array.from({ length: 160 }, (_, i) => {
    // Two octaves of noise and a slow swell, so neighbouring bars are related but never repeat.
    const h = 4 + 20 * (0.55 * noise(i) + 0.25 * noise(i * 0.37 + 11) + 0.2 * (0.5 + 0.5 * Math.sin(i * 0.11)));
    return `M${i * 4} ${(24 - h).toFixed(1)}h2V24h-2z`;
}).join("");

/** Sections that don't have their own link light up the one before them. */
const OWNER: Record<string, string> = { experience: "work", certificates: "about" };

/**
 * The instrument's top bar: the name, where and when he is, the four
 * destinations, and a strip of bars that fills with green as the page is
 * read, with the same figure as a number beside it. On a phone it is the
 * name and the links, and the strip is a thin line under them.
 *
 * On the home page the link for the section you're reading is marked. The
 * active section is the last one whose top has passed a line a third of the
 * way down the screen — cheaper and steadier than juggling observer ratios,
 * and it is only computed once per frame while scrolling.
 */
export default function Header() {
    const pathname = usePathname();
    const [active, setActive] = useState<string | null>(null);
    // Over the hero the bar has no ground of its own: the stage runs up under it.
    const [atHero, setAtHero] = useState(true);
    const overHero = pathname === "/" && atHero;
    const percent = useRef<HTMLSpanElement>(null);
    const strip = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const home = pathname === "/";
        const sections = home ? [...document.querySelectorAll<HTMLElement>("main section[id]")] : [];
        let frame = 0;

        const update = () => {
            frame = 0;
            const root = document.documentElement;
            const travel = root.scrollHeight - window.innerHeight;
            const read = travel > 0 ? Math.min(1, Math.max(0, window.scrollY / travel)) : 0;
            // Written straight to the node: a number that changes every frame is not worth a render.
            if (percent.current) percent.current.textContent = String(Math.round(read * 100)).padStart(3, "0");
            strip.current?.style.setProperty("--read", read.toFixed(4));
            if (!home) return;

            const line = window.innerHeight / 3;
            let current: string | null = null;
            for (const section of sections) {
                if (section.getBoundingClientRect().top <= line) current = section.id;
            }
            // The last section is short; at the very bottom it can never reach the line.
            if (window.innerHeight + window.scrollY >= root.scrollHeight - 2) {
                current = sections.at(-1)?.id ?? current;
            }
            setActive(current ? (OWNER[current] ?? current) : null);
            // Clear only while the hero's stage is still in place at the top; once it moves, its words would pass under the links.
            const stage = document.querySelector("[data-turn-track] > *");
            setAtHero(stage ? stage.getBoundingClientRect().top > -1 : false);
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
        <header
            className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
                overHero ? "border-transparent bg-transparent" : "border-[var(--rule)] bg-[var(--surface)]"
            }`}
        >
            <div className="shell flex h-[var(--bar-h)] items-center gap-4 md:gap-6">
                <Link href="/" prefetch={prefetch} className="flex h-full shrink-0 items-center gap-2.5 text-[15px] font-medium tracking-[-0.02em] text-[var(--fg)]">
                    <span aria-hidden="true" className="h-2 w-2 bg-[var(--accent)]" />
                    Fadhlan Bani
                </Link>

                {/* A hairline between the name and the readouts, as on the reference's bar. */}
                <span aria-hidden="true" className="hidden h-8 w-px bg-[var(--rule-strong)] md:block" />

                <div className="ml-auto flex min-w-0 flex-col justify-center md:ml-0 md:gap-0.5">
                    <p className="label hidden text-[var(--fg-dim)] md:block">
                        <span className="text-[var(--fg)]">Indonesia,</span> <LocalTime withSeconds />
                    </p>
                    <nav aria-label="Primary">
                        {/* Tighter and a step smaller under 380px, so all four fit on a 320px screen too. */}
                        <ul className="label flex items-center gap-2.5 max-[379px]:text-[0.6875rem] min-[360px]:gap-3.5 min-[400px]:gap-4 md:gap-5">
                            {links.map((link, i) => {
                                const isActive = pathname === "/" && active === link.id;
                                return (
                                    // From md the last destination is the button at the far end of the bar.
                                    <li key={link.id} className={i === links.length - 1 ? "md:hidden" : undefined}>
                                        <Link
                                            href={`/#${link.id}`}
                                            prefetch={prefetch}
                                            aria-current={isActive ? "location" : undefined}
                                            data-scramble
                                            data-flick
                                            // On a phone the full height of the bar is the hit area, not the ~16px of the text.
                                            className={`flex h-[var(--bar-h)] items-center transition-colors hover:text-[var(--accent)] md:h-6 ${
                                                isActive ? "text-[var(--accent)]" : "text-[var(--fg)]"
                                            }`}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>

                {/* How much of the page has been read: the strip fills from the left (globals.css, "the strip"). */}
                <span ref={strip} aria-hidden="true" className="strip">
                    <span />
                    <svg className="strip-bars" viewBox="0 0 640 24" preserveAspectRatio="none">
                        <path d={BARS} />
                    </svg>
                    <svg className="strip-bars strip-fill" viewBox="0 0 640 24" preserveAspectRatio="none">
                        <path d={BARS} />
                    </svg>
                </span>
                <p aria-hidden="true" className="label hidden shrink-0 tabular-nums text-[var(--fg-dim)] md:block">
                    <span ref={percent} className="text-[var(--fg)]">
                        000
                    </span>
                    %
                </p>

                <Link href="/#contact" prefetch={prefetch} className="action hidden !min-h-9 shrink-0 md:inline-flex">
                    Contact
                </Link>
            </div>
        </header>
    );
}

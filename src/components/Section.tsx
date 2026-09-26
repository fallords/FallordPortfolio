import type { ReactNode } from "react";
import Reveal from "./Reveal";

/**
 * Every section below the hero shares one skeleton on the 12-column grid.
 *
 *   Columns 1–3  the margin: the gold index, and inside wide sections the
 *                things that hang beside the content — an index list, a
 *                screenshot, a cover.
 *   Columns 4–12 the content: the title, the text and the main visual, all
 *                starting on the same line.
 *
 * `wide` hands a section all twelve columns so it can use the margin; its
 * content must still start at column 4 to stay on that line.
 *
 * On a phone the chrome is kept tight (title, gaps): each section is meant
 * to fit on one screen there, and every pixel of chrome is a pixel the
 * content doesn't get. The padding is the exception: 64px either side, so
 * one section doesn't run straight into the next. It stays 64px on a
 * tablet, and grows only to 80px from lg: any more and a section floats off
 * on its own.
 */
export default function Section({
    id,
    index,
    title,
    intro,
    count,
    wide = false,
    children,
    className = "",
    introClassName = "",
}: {
    id?: string;
    index: string;
    title: string;
    intro?: ReactNode;
    /** Set as a superscript on the title when the section lists several things. */
    count?: number;
    wide?: boolean;
    children: ReactNode;
    className?: string;
    /** Extra classes for the intro, e.g. to leave it out on a phone. */
    introClassName?: string;
}) {
    return (
        <section id={id} className={`border-t border-[var(--rule)] ${className}`}>
            <div className="shell grid-12 py-16 lg:py-20">
                {/*
                 * On a phone the index shares the title's line, just ahead of it: both
                 * sit in the first row, and the title's left padding keeps clear of it.
                 */}
                <Reveal className="col-span-1 col-start-1 row-start-1 self-baseline font-mono text-xs text-[var(--gold)] md:col-span-3 md:self-auto md:pt-4">
                    {index}
                </Reveal>

                <Reveal
                    as="h2"
                    delay={80}
                    className="col-span-4 col-start-1 row-start-1 self-baseline pl-8 font-serif text-[2.25rem] font-medium leading-[0.95] tracking-[-0.01em] text-[var(--fg)] md:col-span-9 md:col-start-4 md:self-auto md:pl-0 md:text-7xl"
                >
                    {title}
                    {count !== undefined && count > 1 && (
                        <sup className="ml-2 align-super font-mono text-sm font-normal tracking-normal text-[var(--fg-dim)] md:text-base">
                            {String(count).padStart(2, "0")}
                        </sup>
                    )}
                </Reveal>

                {intro && (
                    <Reveal
                        as="p"
                        delay={160}
                        className={`col-span-4 mt-3 max-w-[36rem] text-[15px] leading-relaxed text-[var(--fg-muted)] md:col-span-6 md:col-start-4 md:mt-6 md:text-lg ${introClassName}`}
                    >
                        {intro}
                    </Reveal>
                )}

                <div className={`col-span-4 mt-5 md:mt-16 ${wide ? "md:col-span-12" : "md:col-span-9 md:col-start-4"}`}>
                    {children}
                </div>
            </div>
        </section>
    );
}

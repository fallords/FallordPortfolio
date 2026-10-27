import type { ReactNode } from "react";

/**
 * Every section below the hero shares one skeleton on the 12-column grid.
 *
 *   Columns 1–3  the margin: inside wide sections, the things that hang
 *                beside the content — an index list, a screenshot, a cover.
 *   Columns 4–12 the content: the text and the main visual, all starting on
 *                the same line.
 *
 * It opens with a running head across all twelve columns, the way a datasheet
 * heads its pages: the name in mono, a hairline to the far edge, and a count
 * at the end. The hairline is also the divider between sections, so there is
 * no border above. The head stays small on purpose: each section leads with
 * its own content (a project's name, a demo, a certificate, the address), not
 * the same giant word every time.
 *
 * `wide` hands a section all twelve columns so it can use the margin; its
 * content must still start at column 4 to stay on that line.
 *
 * On a phone the chrome is kept tight: each section is meant to fit on one
 * screen there, and every pixel of chrome is a pixel the content doesn't get.
 * The padding is the exception: 64px either side, so one section doesn't run
 * straight into the next. It stays 64px on a tablet, and grows only to 80px
 * from lg. A section can set its own (`padding`), so the page doesn't repeat
 * one rhythm from top to bottom.
 */
export default function Section({
    id,
    title,
    intro,
    meta,
    wide = false,
    children,
    className = "",
    introClassName = "",
    padding = "py-16 lg:py-20",
}: {
    id?: string;
    title: string;
    intro?: ReactNode;
    /** The note at the end of the running head: a count, a span of years. */
    meta?: ReactNode;
    wide?: boolean;
    children: ReactNode;
    className?: string;
    /** Extra classes for the intro, e.g. to leave it out on a phone. */
    introClassName?: string;
    /** Vertical padding classes, in place of the default. */
    padding?: string;
}) {
    return (
        <section id={id} className={className}>
            <div className={`shell grid-12 ${padding}`}>
                <div className="col-span-4 flex items-baseline gap-3 font-mono text-sm md:col-span-12 md:gap-4">
                    <h2 className="shrink-0 font-medium text-[var(--fg)]">{title}</h2>
                    <span aria-hidden="true" className="h-px min-w-6 flex-1 self-center bg-[var(--rule-strong)]" />
                    {meta && <p className="text-right text-[var(--fg-dim)]">{meta}</p>}
                </div>

                {intro && (
                    <p
                        className={`col-span-4 mt-4 max-w-[36rem] text-[15px] leading-relaxed text-[var(--fg-muted)] md:col-span-6 md:col-start-4 md:mt-8 md:text-lg ${introClassName}`}
                    >
                        {intro}
                    </p>
                )}

                <div className={`col-span-4 mt-6 md:mt-10 ${wide ? "md:col-span-12" : "md:col-span-9 md:col-start-4"}`}>
                    {children}
                </div>
            </div>
        </section>
    );
}

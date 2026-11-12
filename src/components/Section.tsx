import type { ReactNode } from "react";
import { Chars, Roll } from "./motion/Split";
import Decode from "./motion/Decode";

/**
 * Every section below the hero shares one skeleton on the 12-column grid.
 *
 * It opens as a chapter: its number very large and barely there, and
 * beside it a readout (a count, a span of years) over its name in the
 * display face, the whole head closed by a hairline. As the head comes up
 * the scroll works it (motion.css): the number's digits roll up to their
 * value, the name's letters rise out of their masks, the readout decodes
 * itself, and a green line runs along the rule.
 *
 * `wide` hands a section all twelve columns; otherwise its content starts
 * at column 4, the line the text of the page shares.
 *
 * A section can set its own vertical padding (`padding`), so the page
 * doesn't repeat one rhythm from top to bottom.
 */
export default function Section({
    id,
    index,
    title,
    intro,
    meta,
    wide = false,
    children,
    className = "",
    introClassName = "",
    padding = "py-20 lg:py-28",
}: {
    id?: string;
    /** The chapter's number, as it is printed: "01". */
    index?: string;
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
                <div data-reveal data-vel className="relative col-span-4 flex items-end gap-x-5 border-b border-[var(--rule)] pb-5 md:col-span-12 md:gap-x-8 md:pb-7">
                    {index && (
                        <span aria-hidden="true" className="chapter-num">
                            <Roll value={index} />
                        </span>
                    )}
                    <div className="min-w-0 pb-[0.12em]">
                        {meta && (
                            <p className="label text-[var(--fg-dim)]">{typeof meta === "string" ? <Decode text={meta} /> : meta}</p>
                        )}
                        <h2 className="display mt-1.5 text-[clamp(2rem,4.4vw,4rem)] text-[var(--fg)]">
                            <Chars text={title} />
                        </h2>
                    </div>
                    <span aria-hidden="true" className="rule-sweep absolute inset-x-0 -bottom-px h-px bg-[var(--accent)] opacity-0" />
                </div>

                {intro && (
                    <p
                        className={`enter-rise col-span-4 mt-5 max-w-[40rem] text-pretty text-[length:var(--step-lead)] leading-[1.35] text-[var(--fg)] md:col-span-8 md:col-start-4 md:mt-8 ${introClassName}`}
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

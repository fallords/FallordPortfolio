import Link from "next/link";
import Section from "./Section";
import { essaysByYear, type Essay } from "@/content/writing";

/** First paragraph under "## Abstract", or the first plain paragraph at all. */
function abstractOf(essay: Essay) {
    const start = essay.body.indexOf("## Abstract");
    const rest = start >= 0 ? essay.body.slice(start + 1) : essay.body;
    return rest.find((b) => !b.startsWith("## ") && !b.startsWith("> ")) ?? essay.summary;
}

/**
 * A title page, set the way a printed preprint's is: paper stock, the
 * status line along the top, title and author on the page. It is the one
 * light surface on the site, which is the point — it is a different kind of
 * work from everything around it.
 */
function Cover({ essay }: { essay: Essay }) {
    /*
     * Type and margins are sized in container units (cqw), as fractions of the
     * cover's own width, so it scales like a printed page and the title can
     * never overflow the sheet at any column width.
     *
     * From 12rem wide the small print keeps a legible floor. Narrower than
     * that (the thumbnail beside the title on a phone) the floor would push
     * the page past its own bottom edge, so the cover simply shrinks, like a
     * page seen from further away, and drops its subtitle and ORCID line; the
     * title and details sit right beside it anyway.
     */
    return (
        <Link href={`/writing/${essay.slug}`} aria-label={`Read ${essay.title}`} className="group @container block">
            <span className="flex aspect-[3/4] flex-col overflow-hidden bg-[#ebe6da] p-[8.5cqw] text-[#1c1d1e] shadow-[0_16px_32px_-10px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5 @min-[12rem]:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)]">
                <span className="flex justify-between border-b border-[#1c1d1e]/25 pb-[2.5cqw] font-mono text-[3.5cqw] text-[#1c1d1e]/70 @min-[12rem]:text-[max(9px,3.5cqw)]">
                    <span>{essay.label ?? "Essay"}</span>
                    <span>{essay.year}</span>
                </span>

                <span className="mt-[8cqw] text-[3.9cqw] text-[#1c1d1e]/60 @min-[12rem]:text-[max(9px,3.9cqw)]">{essay.field}</span>
                <span className="mt-[2.5cqw] font-serif text-[9.2cqw] font-semibold leading-[1.08]">{essay.title}</span>
                {essay.subtitle && (
                    <span className="mt-[4cqw] hidden font-serif text-[5.2cqw] italic leading-snug text-[#1c1d1e]/75 @min-[12rem]:block">
                        {essay.subtitle}
                    </span>
                )}

                <span className="mt-auto border-t border-[#1c1d1e]/25 pt-[4cqw]">
                    <span className="block text-[4.2cqw] font-medium @min-[12rem]:text-[max(10px,4.2cqw)]">Fadhlan Bani Nugraha</span>
                    {essay.orcid && (
                        <span className="mt-0.5 hidden font-mono text-[max(9px,3.5cqw)] text-[#1c1d1e]/60 @min-[12rem]:block">ORCID {essay.orcid}</span>
                    )}
                </span>
            </span>
        </Link>
    );
}

const readLabel = (essay: Essay) => (essay.label === "Case study" ? "Read the case study" : "Read the essay");

/*
 * One piece of writing. On a phone it is an entry in a list, so both fit on
 * one screen: a small cover with the title beside it, the one-line summary,
 * and the buttons; the abstract and keywords wait on the piece's own page.
 * From md up: the cover in the margin (columns 1 to 3) and everything else
 * from column 4, abstract included. The second row takes whatever height the
 * cover has left over, so the details never get pushed apart to match it.
 */
function Piece({ essay }: { essay: Essay }) {
    return (
        <article className="grid grid-cols-[minmax(0,2fr)_minmax(0,5fr)] items-start gap-x-4 gap-y-3.5 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-6 md:gap-y-0">
            <div className="md:col-span-3 md:row-span-2">
                <Cover essay={essay} />
            </div>

            <div className="md:col-span-9 md:col-start-4 lg:col-span-7">
                <p className="font-mono text-[11px] leading-relaxed text-[var(--fg-dim)] md:text-xs">
                    {essay.field} · {essay.year} · {essay.readingTime} read
                </p>
                <h3 className="mt-1 text-pretty font-serif text-[1.3rem] font-medium leading-[1.1] text-[var(--fg)] md:mt-4 md:text-4xl">
                    <Link href={`/writing/${essay.slug}`} className="transition-colors hover:text-[var(--gold)]">
                        {essay.title}
                    </Link>
                </h3>
            </div>

            <div className="col-span-2 md:col-span-9 md:col-start-4 lg:col-span-7">
                <p className="text-[13px] leading-5 text-[var(--fg-muted)] md:hidden">{essay.summary}</p>

                <div className="hidden md:block">
                    <p className="mt-8 text-xs text-[var(--fg-dim)]">{essay.body.includes("## Abstract") ? "Abstract" : "Summary"}</p>
                    <p className="mt-2 line-clamp-6 leading-relaxed text-[var(--fg-muted)]">{abstractOf(essay)}</p>

                    {essay.keywords && essay.keywords.length > 0 && (
                        <ul className="mt-6 flex flex-wrap gap-2">
                            {essay.keywords.map((word) => (
                                <li key={word} className="border border-[var(--rule)] px-2.5 py-1 text-xs text-[var(--fg-muted)]">
                                    {word}
                                </li>
                            ))}
                        </ul>
                    )}

                    {essay.publishedIn && <p className="mt-6 text-xs text-[var(--fg-dim)]">{essay.publishedIn}</p>}
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-8">
                    <Link
                        href={`/writing/${essay.slug}`}
                        className="inline-flex h-10 items-center bg-[var(--fg)] px-4 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--gold)]"
                    >
                        {readLabel(essay)}
                    </Link>
                    {essay.pdfUrl && (
                        <a href={essay.pdfUrl} target="_blank" rel="noopener noreferrer" className="link text-sm text-[var(--fg-soft)]">
                            Download the PDF ↗
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function Writing() {
    if (essaysByYear.length === 0) return null;

    return (
        <Section
            id="writing"
            index="04"
            title="Writing"
            count={essaysByYear.length}
            intro="Longer pieces: my thesis project, written up as a case study, and an essay on something outside of code."
            introClassName="hidden md:block"
            wide
        >
            {/* Every piece gets the same treatment, separated by a rule. */}
            <div className="flex flex-col gap-6 md:gap-20">
                {essaysByYear.map((essay, i) => (
                    <div key={essay.slug} className={i > 0 ? "border-t border-[var(--rule)] pt-6 md:pt-20" : undefined}>
                        <Piece essay={essay} />
                    </div>
                ))}
            </div>
        </Section>
    );
}

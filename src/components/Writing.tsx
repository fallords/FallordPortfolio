import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import Section from "./Section";
import ErrorBoundary from "./ErrorBoundary";
import { DoorThumb, WearableThumb } from "./figures/thumbs/art";
import { Words } from "./motion/Split";
import { essaysByYear, type Essay } from "@/content/writing";

/**
 * A title page, set the way a printed preprint's is: paper stock, the
 * status line along the top, title and author on the page. It is the one
 * light surface on the site, which is the point — it is a different kind of
 * work from everything around it.
 */
export function Cover({ essay }: { essay: Essay }) {
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
     *
     * It is only the page, with no link; the piece's own page shows it beside
     * the title.
     */
    return (
        <span className="@container block">
            <span className="flex aspect-[3/4] flex-col overflow-hidden bg-[var(--paper)] p-[8.5cqw] text-[var(--ink)] shadow-[0_16px_32px_-10px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5 @min-[12rem]:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)]">
                <span className="flex justify-between border-b border-[var(--ink)]/25 pb-[2.5cqw] font-mono text-[3.5cqw] text-[var(--ink)]/70 @min-[12rem]:text-[max(9px,3.5cqw)]">
                    <span>{essay.label ?? "Essay"}</span>
                    <span>{essay.year}</span>
                </span>

                <span className="mt-[8cqw] text-[3.9cqw] text-[var(--ink)]/60 @min-[12rem]:text-[max(9px,3.9cqw)]">{essay.field}</span>
                <span className="mt-[2.5cqw] font-display text-[8.4cqw] font-bold leading-[1.08] tracking-[-0.02em]">{essay.title}</span>
                {essay.subtitle && (
                    <span className="mt-[4cqw] hidden text-[4.6cqw] leading-snug text-[var(--ink)]/75 @min-[12rem]:block">
                        {essay.subtitle}
                    </span>
                )}

                <span className="mt-auto border-t border-[var(--ink)]/25 pt-[4cqw]">
                    <span className="block text-[4.2cqw] font-medium @min-[12rem]:text-[max(10px,4.2cqw)]">Fadhlan Bani Nugraha</span>
                    {essay.orcid && (
                        <span className="mt-0.5 hidden font-mono text-[max(9px,3.5cqw)] text-[var(--ink)]/60 @min-[12rem]:block">ORCID {essay.orcid}</span>
                    )}
                </span>
            </span>
        </span>
    );
}
const readLabel = (essay: Essay) => (essay.label === "Case study" ? "Read the case study" : "Read the essay");

/*
 * Each piece's thumbnail: a small working drawing of the thing it is about,
 * not its cover. The thesis gets its wearable taken apart (Fig 1 on its page
 * is the whole system on a bench); the essay gets a door being shut and bolted.
 */
const thumbs: Record<string, ReactNode> = {
    "lora-emergency-alert-system": <WearableThumb />,
    "privacy-as-boundary-and-pretext": <DoorThumb />,
};

/*
 * One piece as a spread: its working drawing large on one side, framed as a
 * figure, and on the other its facts, its title at heading size, its one
 * sentence and the two ways in. The sides swap from one piece to the next.
 * On a phone the drawing sits above the words.
 *
 * The drawing opens the piece for a mouse or a finger but stays out of the
 * Tab order: the title is the same link.
 */
function Piece({ essay, index }: { essay: Essay; index: number }) {
    const href = `/writing/${essay.slug}`;
    const facts = [essay.year, essay.field, `${essay.readingTime} read`];
    // Every other piece puts its drawing on the right, so the two read as a spread rather than a list.
    const flip = index % 2 === 1;
    return (
        <li data-reveal className="grid gap-6 border-b border-[var(--rule)] py-10 md:grid-cols-12 md:items-center md:gap-x-6 md:py-14">
            <Link
                href={href}
                tabIndex={-1}
                aria-hidden="true"
                data-cursor="Read"
                data-tilt
                className={`viewport open-frame relative block self-start overflow-hidden transition-colors hover:border-[var(--accent-line)] md:col-span-6 ${flip ? "md:order-2 md:col-start-7" : ""}`}
            >
                {/* The drawing runs in the browser; if it fails, the empty card holds its place. */}
                <ErrorBoundary fallback={<span className="block aspect-[4/3]" />}>{thumbs[essay.slug] ?? <Cover essay={essay} />}</ErrorBoundary>
                <span data-decode className="label pointer-events-none absolute left-3 top-2.5 text-[var(--fg)]">
                    Fig {String(index + 1).padStart(2, "0")} <span className="text-[var(--fg-dim)]">/ {essay.label ?? "Essay"}</span>
                </span>
            </Link>

            <div className={`min-w-0 md:col-span-5 ${flip ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
                {/* One line, broken only between the facts; the dot goes down with the fact after it, never left hanging. */}
                <p data-decode className="label text-[var(--fg-dim)]">
                    {facts.map((fact, i) => (
                        <Fragment key={fact}>
                            {i > 0 && " "}
                            <span className="whitespace-nowrap">
                                {i > 0 && <span aria-hidden="true">· </span>}
                                {fact}
                            </span>
                        </Fragment>
                    ))}
                </p>
                <h3 className="display mt-3 min-w-0 text-pretty text-[1.75rem] leading-[1.02] text-[var(--fg)] wrap-anywhere md:text-[clamp(2rem,3.2vw,3.25rem)]">
                    <Link href={href} className="transition-colors hover:text-[var(--accent)]">
                        <Words text={essay.title} />
                    </Link>
                </h3>
                <p className="mt-4 max-w-[34rem] text-pretty text-[15px] leading-relaxed text-[var(--fg-soft)] md:text-base">{essay.summary}</p>
                <p className="mt-6 flex items-center gap-x-5">
                    <Link href={href} aria-label={`${readLabel(essay)}: ${essay.title}`} className="action" data-solid>
                        {readLabel(essay)} →
                    </Link>
                    {essay.pdfUrl && (
                        <a
                            href={essay.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Download the PDF of ${essay.title}`}
                            className="label link flex min-h-11 items-center whitespace-nowrap text-[var(--fg-soft)]"
                        >
                            PDF ↗
                        </a>
                    )}
                </p>
            </div>
        </li>
    );
}

/**
 * The pieces as an index, not a shelf: one ruled row each, newest first,
 * across the full width so the thumbnails sit in the margin columns and
 * every title starts on the content line at column 4.
 */
export default function Writing() {
    if (essaysByYear.length === 0) return null;

    return (
        <Section
            id="writing"
            index="05"
            title="Writing"
            meta={`${essaysByYear.length} pieces`}
            intro="Longer pieces: my thesis project, written up as a case study, and an essay on something outside of code."
            introClassName="hidden md:block"
            wide
        >
            <ul>
                {essaysByYear.map((essay, index) => (
                    <Piece key={essay.slug} essay={essay} index={index} />
                ))}
            </ul>
        </Section>
    );
}

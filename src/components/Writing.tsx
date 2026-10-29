import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import Section from "./Section";
import ErrorBoundary from "./ErrorBoundary";
import { DoorThumb, WearableThumb } from "./figures/thumbs/art";
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
 * One piece as a row of the index, read like a line in a datasheet's
 * revision table: the thumbnail in the margin columns, then from column 4
 * the facts in mono (year, field, length), the title and its one sentence,
 * and the two ways in at the far edge. On a phone the thumbnail sits beside
 * the facts and title, and the sentence and links run under both. The
 * abstract and keywords wait on the piece's page.
 *
 * The thumbnail opens the piece for a mouse or a finger but stays out of the
 * Tab order: the title is the same link.
 */
function Piece({ essay }: { essay: Essay }) {
    const href = `/writing/${essay.slug}`;
    const facts = [essay.year, essay.field, `${essay.readingTime} read`];
    return (
        <li className="grid grid-cols-[34%_minmax(0,1fr)] gap-x-4 border-b border-[var(--rule)] py-6 md:grid-cols-12 md:grid-rows-[auto_auto_1fr] md:gap-x-6 md:py-8">
            <Link
                href={href}
                tabIndex={-1}
                aria-hidden="true"
                className="block self-start overflow-hidden border border-[var(--rule-strong)] bg-[var(--surface-card)] transition-colors hover:border-[var(--gold)] md:col-span-3 md:row-span-3"
            >
                {/* The drawing runs in the browser; if it fails, the empty card holds its place. */}
                <ErrorBoundary fallback={<span className="block aspect-[4/3]" />}>{thumbs[essay.slug] ?? <Cover essay={essay} />}</ErrorBoundary>
            </Link>

            <div className="min-w-0 md:col-span-7 md:col-start-4">
                {/* One line, broken only between the facts; the dot goes down with the fact after it, never left hanging. */}
                <p className="font-mono text-xs leading-relaxed text-[var(--fg-dim)] md:text-sm">
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
                <h3 className="mt-1.5 min-w-0 text-pretty font-display text-lg font-bold leading-[1.1] tracking-[-0.03em] text-[var(--fg)] wrap-anywhere md:mt-2 md:text-3xl">
                    <Link href={href} className="transition-colors hover:text-[var(--gold)]">
                        {essay.title}
                    </Link>
                </h3>
            </div>

            <p className="col-span-2 mt-3 max-w-[36rem] text-pretty text-sm leading-relaxed text-[var(--fg-muted)] md:col-span-7 md:col-start-4 md:row-start-2 md:text-base">
                {essay.summary}
            </p>

            <p className="col-span-2 mt-4 flex gap-x-5 text-sm md:col-span-2 md:col-start-11 md:row-span-2 md:row-start-1 md:mt-1 md:flex-col md:items-end md:gap-y-2">
                <Link href={href} aria-label={`${readLabel(essay)}: ${essay.title}`} className="link whitespace-nowrap text-[var(--fg)]">
                    Read →
                </Link>
                {essay.pdfUrl && (
                    <a
                        href={essay.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Download the PDF of ${essay.title}`}
                        className="link whitespace-nowrap text-[var(--fg-soft)]"
                    >
                        PDF ↗
                    </a>
                )}
            </p>
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
            title="Writing"
            meta={`${essaysByYear.length} pieces`}
            intro="Longer pieces: my thesis project, written up as a case study, and an essay on something outside of code."
            introClassName="hidden md:block"
            wide
        >
            <ul className="border-t border-[var(--rule-strong)]">
                {essaysByYear.map((essay) => (
                    <Piece key={essay.slug} essay={essay} />
                ))}
            </ul>
        </Section>
    );
}

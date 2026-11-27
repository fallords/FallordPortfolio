import { Fragment } from "react";
import Link from "next/link";
import Section from "./Section";
import MultiView from "./MultiView";
import "./bento.css";
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

/* The 3D object that stands for each piece (three/models.ts): the thesis's wearable, the essay's door. */
const MODEL: Record<string, "wearable" | "door"> = {
    "lora-emergency-alert-system": "wearable",
    "privacy-as-boundary-and-pretext": "door",
};

/** One piece's words: its facts in one line, its title (the link), its one sentence and the two ways in. */
function PieceText({ essay }: { essay: Essay }) {
    const href = `/writing/${essay.slug}`;
    const facts = [essay.year, essay.field, `${essay.readingTime} read`];
    return (
        <>
            {/* One line, broken only between the facts; the dot goes down with the fact after it, never left hanging. */}
            <p className="label text-[var(--fg-dim)]">
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
                    {essay.title}
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
        </>
    );
}

/**
 * The pieces, newest first, as alcoves side by side, the way showrooms give each piece its own room: the thing it
 * is about turning in 3D above (one canvas for both, MultiView), spinning up while pointed at; the piece under it.
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
            {/* One alcove per piece, side by side: the thing it is about turning in 3D above, the piece under it. */}
            <div className="relative grid gap-4 md:grid-cols-2">
                {essaysByYear.map((essay, i) => (
                    <article key={essay.slug} data-view-card={i} className="alcove viewport enter-rise">
                        <div aria-hidden="true" data-view={i} className="alcove-art" />
                        <div className="alcove-text">
                            <PieceText essay={essay} />
                        </div>
                    </article>
                ))}
                <MultiView models={essaysByYear.map((essay) => MODEL[essay.slug] ?? "door")} />
            </div>
        </Section>
    );
}

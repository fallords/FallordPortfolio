import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { essaysByYear } from "@/content/writing";
import ReadingProgress from "@/components/ReadingProgress";
import Footer from "@/components/Footer";

// Only the slugs that exist get built; anything else is a genuine 404.
export function generateStaticParams() {
    return essaysByYear.map((essay) => ({ slug: essay.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const essay = essaysByYear.find((e) => e.slug === slug);

    if (!essay) return {};

    return {
        title: `${essay.title} — Fadhlan Bani`,
        description: essay.summary,
        openGraph: {
            title: essay.title,
            description: essay.summary,
            type: "article",
        },
    };
}

export default async function EssayPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const index = essaysByYear.findIndex((e) => e.slug === slug);
    const essay = essaysByYear[index];

    if (!essay) notFound();

    const newer = essaysByYear[index - 1];
    const older = essaysByYear[index + 1];

    return (
        <main className="bg-[var(--surface)] text-white selection:bg-white/20">
            <ReadingProgress />

            <article className="px-6 md:px-12 lg:px-24 pt-36 pb-24 md:pt-44 md:pb-32">
                {/* Header shares the body's measure so the whole thing reads as one column */}
                <header className="mx-auto max-w-[68ch]">
                    {/*
                     * A way out, at the top.
                     *
                     * The only other one is at the foot of the article, which
                     * assumes every reader arrived by scrolling down from the
                     * homepage. Anyone who lands here from a search result or a
                     * shared link would have to read to the end of a 47-minute
                     * paper — or hunt for the menu button — just to get back.
                     */}
                    <Link
                        href="/#writing"
                        className="hoverable group mb-10 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--fg-faint)] transition-colors hover:text-white"
                    >
                        <span
                            aria-hidden="true"
                            className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1"
                        >
                            ←
                        </span>
                        All writing
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--fg-faint)]">
                        <span className="text-[var(--fg-ghost)]">[</span>
                        <span className="text-[var(--fg-dim)]">{essay.field}</span>
                        <span className="text-[var(--fg-ghost)]">/</span>
                        <span className="tabular-nums">{essay.year}</span>
                        <span className="text-[var(--fg-ghost)]">/</span>
                        <span>{essay.readingTime} read</span>
                        <span className="text-[var(--fg-ghost)]">]</span>
                    </div>

                    <h1 className="mt-7 font-heading text-2xl md:text-4xl font-bold leading-[1.15] tracking-tight text-balance">
                        {essay.title}
                    </h1>

                    {essay.subtitle && (
                        <p className="mt-4 font-heading text-base md:text-lg italic leading-snug text-[var(--fg-muted)]">
                            {essay.subtitle}
                        </p>
                    )}

                    <p className="mt-6 font-sans text-base md:text-lg leading-relaxed text-[var(--fg-muted)]">
                        {essay.summary}
                    </p>

                    {/* Publication status and identifiers, the way a preprint carries them */}
                    {(essay.publishedIn || essay.orcid) && (
                        <div className="mt-5 flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-faint)]">
                            {essay.publishedIn && <span>{essay.publishedIn}</span>}
                            {essay.orcid && (
                                <a
                                    href={`https://orcid.org/${essay.orcid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hoverable w-fit transition-colors hover:text-white"
                                >
                                    ORCID {essay.orcid}
                                </a>
                            )}
                        </div>
                    )}

                    <div className="mt-12 h-px w-full bg-white/10" />
                </header>

                {/*
                 * Body. The measure is capped at 68 characters because that is
                 * roughly where the eye stops tracking reliably from the end of one
                 * line to the start of the next. Line-height is loose (1.8) and the
                 * text sits at --fg-soft rather than pure white — full-contrast body
                 * text on black is harsh over more than a few paragraphs.
                 */}
                <div className="mx-auto mt-12 max-w-[68ch]">
                    {essay.body.map((block, i) => {
                        if (block.startsWith("## ")) {
                            return (
                                <h2
                                    key={i}
                                    className="mt-12 mb-5 font-heading text-lg md:text-xl font-bold tracking-tight text-white first:mt-0"
                                >
                                    {block.slice(3)}
                                </h2>
                            );
                        }

                        if (block.startsWith("> ")) {
                            return (
                                <blockquote
                                    key={i}
                                    className="my-12 border-l border-[var(--rule-strong)] pl-6 md:pl-8"
                                >
                                    <p className="font-heading text-base md:text-lg font-medium leading-[1.5] tracking-tight text-white">
                                        {block.slice(2)}
                                    </p>
                                </blockquote>
                            );
                        }

                        return (
                            <p
                                key={i}
                                className="mb-7 font-sans text-[1.0625rem] md:text-[1.125rem] leading-[1.8] text-[var(--fg-soft)]"
                            >
                                {block}
                            </p>
                        );
                    })}
                </div>

                {/* Keywords and the full paper */}
                {(essay.keywords?.length || essay.pdfUrl) && (
                    <div className="mx-auto mt-14 max-w-[68ch] border-t border-[var(--rule)] pt-10">
                        {essay.keywords && essay.keywords.length > 0 && (
                            <>
                                <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--fg-faint)]">
                                    Keywords
                                </h2>
                                <ul className="mt-4 flex flex-wrap gap-2">
                                    {essay.keywords.map((word) => (
                                        <li
                                            key={word}
                                            className="border border-[var(--rule)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-dim)]"
                                        >
                                            {word}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {essay.pdfUrl && (
                            <a
                                href={essay.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hoverable group mt-10 inline-flex items-center gap-3 border border-[var(--rule)] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fg-soft)] transition-colors hover:border-[var(--rule-strong)] hover:text-white"
                            >
                                Read the full preprint
                                <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
                                    ↗
                                </span>
                            </a>
                        )}
                    </div>
                )}

                {/* Foot of the article */}
                <div className="mx-auto mt-16 max-w-[68ch] border-t border-[var(--rule)] pt-10">
                    <Link
                        href="/#writing"
                        className="hoverable group inline-flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fg-muted)] transition-colors hover:text-white"
                    >
                        <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1.5">
                            ←
                        </span>
                        All writing
                    </Link>

                    {(newer || older) && (
                        <nav className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--rule)] bg-white/10 sm:grid-cols-2">
                            {[
                                { essay: newer, label: "Newer" },
                                { essay: older, label: "Older" },
                            ].map(({ essay: sibling, label }) =>
                                sibling ? (
                                    <Link
                                        key={label}
                                        href={`/writing/${sibling.slug}`}
                                        className="hoverable group flex flex-col gap-2 bg-[var(--surface)] p-6 transition-colors duration-500 hover:bg-white/[0.03]"
                                    >
                                        <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-[var(--fg-faint)]">
                                            {label}
                                        </span>
                                        <span className="font-heading text-lg font-bold leading-tight tracking-tight text-[var(--fg-soft)] transition-colors duration-300 group-hover:text-white">
                                            {sibling.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div key={label} className="hidden bg-[var(--surface)] sm:block" />
                                )
                            )}
                        </nav>
                    )}
                </div>
            </article>

            <Footer />
        </main>
    );
}

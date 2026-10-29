import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { essaysByYear, type Essay } from "@/content/writing";
import ReadingProgress from "@/components/ReadingProgress";
import Footer from "@/components/Footer";
import { Cover } from "@/components/Writing";
import { LoraFigure } from "@/components/figures/lora/figure";

/**
 * What the page shows of a piece: the paragraphs under its "## Abstract", or
 * for a piece without one (the case study) the paragraphs it opens with,
 * before its first heading. Both are the piece's own words.
 */
function summaryOf(essay: Essay) {
    const abstract = essay.body.indexOf("## Abstract");
    const paragraphs: string[] = [];
    for (let i = abstract >= 0 ? abstract + 1 : 0; i < essay.body.length && !essay.body[i].startsWith("## "); i++) {
        if (!essay.body[i].startsWith("> ")) paragraphs.push(essay.body[i]);
    }
    return {
        label: abstract >= 0 ? "Abstract" : "Summary",
        paragraphs: paragraphs.length > 0 ? paragraphs : [essay.summary],
    };
}

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

    const path = `/writing/${essay.slug}`;
    // Setting openGraph here replaces the root's, image included; restate it.
    const image = { url: "/opengraph-image", width: 1200, height: 630, alt: "Fadhlan Bani" };
    return {
        title: `${essay.title} · Fadhlan Bani`,
        description: essay.summary,
        alternates: { canonical: path },
        openGraph: {
            title: essay.title,
            description: essay.summary,
            url: path,
            siteName: "Fadhlan Bani",
            type: "article",
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title: essay.title,
            description: essay.summary,
            images: [image],
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
    const summary = summaryOf(essay);

    return (
        <main>
            <ReadingProgress />

            {/* One column at the body's measure, so the whole piece reads top to bottom; only a figure is let out wider. */}
            <article className="shell pt-12 pb-24 md:pt-20 md:pb-32">
                <div className="mx-auto max-w-[68ch]">
                    <Link href="/#writing" className="link text-sm text-[var(--fg-muted)]">
                        ← All writing
                    </Link>

                    {/* The piece's own cover beside its title, as on the shelf. Under sm the title takes the width. */}
                    <header className="mt-8 sm:grid sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start sm:gap-8 md:mt-10">
                        <div className="hidden sm:block">
                            <Cover essay={essay} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-mono text-xs text-[var(--fg-dim)] md:text-sm">
                                {essay.field} · {essay.year} · {essay.readingTime} read
                            </p>
                            <h1 className="mt-3 min-w-0 font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-balance wrap-anywhere md:text-5xl">
                                {essay.title}
                            </h1>
                            {essay.subtitle && <p className="mt-3 text-lg leading-snug text-[var(--fg-muted)] md:text-xl">{essay.subtitle}</p>}

                            {/* The full text lives in the PDF, so it sits right under the title. */}
                            {essay.pdfUrl && (
                                <a
                                    href={essay.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 inline-flex h-11 items-center bg-[var(--fg)] px-4 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--gold)] md:h-10"
                                >
                                    Download the PDF ↗
                                </a>
                            )}
                        </div>
                    </header>

                    {/* Publication status and identifiers, on one line, the way a preprint carries them. */}
                    {(essay.publishedIn || essay.orcid) && (
                        <p className="mt-8 text-pretty text-xs leading-relaxed text-[var(--fg-dim)]">
                            {essay.publishedIn}
                            {essay.publishedIn && essay.orcid && " · "}
                            {essay.orcid && (
                                <a href={`https://orcid.org/${essay.orcid}`} target="_blank" rel="noopener noreferrer" className="link">
                                    ORCID <span className="font-mono">{essay.orcid}</span>
                                </a>
                            )}
                        </p>
                    )}

                    {/*
                     * Only the summary: the paper's own abstract, or for a case study
                     * the opening it starts with. The rest is in the PDF above. The
                     * measure is capped at 68 characters, roughly where the eye stops
                     * tracking reliably from the end of one line to the start of the
                     * next; line-height is loose and the text sits at --fg-soft rather
                     * than pure white, which is harsh over more than a few lines.
                     */}
                    <section className="mt-10 border-t border-[var(--rule)] pt-10" aria-labelledby="summary-heading">
                        <h2 id="summary-heading" className="mb-5 font-mono text-sm font-medium text-[var(--fg)]">
                            {summary.label}
                        </h2>
                        {summary.paragraphs.map((paragraph, i) => (
                            <p key={i} className="mb-7 font-sans text-[1.0625rem] leading-[1.8] text-[var(--fg-soft)] md:text-[1.125rem]">
                                {paragraph}
                            </p>
                        ))}
                    </section>
                </div>

                {/* The thesis project gets its system as a bench you can work: drop the wearable, press its button. Wider than the text, so the small parts read. */}
                {essay.slug === "lora-emergency-alert-system" && (
                    <section className="mx-auto mb-12 max-w-[56rem]" aria-label="How the system works, as an interactive figure">
                        <LoraFigure />
                    </section>
                )}

                <div className="mx-auto max-w-[68ch]">
                    {/* Keywords as one line of words, not a cloud of chips. */}
                    {essay.keywords && essay.keywords.length > 0 && (
                        <section className="border-t border-[var(--rule)] pt-6" aria-labelledby="keywords-heading">
                            <h2 id="keywords-heading" className="font-mono text-sm font-medium text-[var(--fg)]">
                                Keywords
                            </h2>
                            {/* Each keyword kept whole (spaces and hyphens that don't break); the line breaks only between them. */}
                            <p className="mt-2 text-pretty font-mono text-xs leading-relaxed text-[var(--fg-dim)]">
                                {essay.keywords.map((word) => word.replaceAll(" ", " ").replaceAll("-", "‑")).join(" · ")}
                            </p>
                        </section>
                    )}

                    {/* The pieces either side, as plain links: newer on the left, older on the right, no empty box for a missing one. */}
                    {(newer || older) && (
                        <nav aria-label="More writing" className="mt-14 grid gap-6 border-t border-[var(--rule)] pt-8 sm:grid-cols-2">
                            {newer && (
                                <Link href={`/writing/${newer.slug}`} className="group flex flex-col gap-1.5">
                                    <span className="font-mono text-xs text-[var(--fg-dim)]">← Newer</span>
                                    <span className="font-display text-lg font-bold leading-tight tracking-[-0.02em] text-[var(--fg-soft)] transition-colors group-hover:text-[var(--gold)]">
                                        {newer.title}
                                    </span>
                                </Link>
                            )}
                            {older && (
                                <Link href={`/writing/${older.slug}`} className="group flex flex-col gap-1.5 sm:col-start-2 sm:text-right">
                                    <span className="font-mono text-xs text-[var(--fg-dim)]">Older →</span>
                                    <span className="font-display text-lg font-bold leading-tight tracking-[-0.02em] text-[var(--fg-soft)] transition-colors group-hover:text-[var(--gold)]">
                                        {older.title}
                                    </span>
                                </Link>
                            )}
                        </nav>
                    )}
                </div>
            </article>

            <Footer />
        </main>
    );
}

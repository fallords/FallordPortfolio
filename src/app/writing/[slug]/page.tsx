import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { essaysByYear, type Essay } from "@/content/writing";
import ReadingProgress from "@/components/ReadingProgress";
import Footer from "@/components/Footer";

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

            <article className="shell pt-16 pb-24 md:pt-24 md:pb-32">
                {/* Header shares the body's measure so the whole thing reads as one column */}
                <header className="mx-auto max-w-[68ch]">
                    <Link
                        href="/#writing"
                        className="link mb-10 inline-block text-sm text-[var(--fg-muted)]"
                    >
                        ← All writing
                    </Link>

                    <p className="text-sm text-[var(--fg-dim)]">
                        {essay.field} · <span className="font-mono">{essay.year}</span>
                    </p>

                    <h1 className="mt-5 font-serif text-4xl md:text-5xl font-medium leading-[1.05] text-balance">
                        {essay.title}
                    </h1>

                    {essay.subtitle && (
                        <p className="mt-4 font-serif text-xl md:text-2xl italic leading-snug text-[var(--fg-muted)]">
                            {essay.subtitle}
                        </p>
                    )}

                    {/* The full text lives in the PDF, so it sits right under the title. */}
                    {essay.pdfUrl && (
                        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                            <a
                                href={essay.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-11 items-center bg-[var(--fg)] px-4 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--gold)] md:h-10"
                            >
                                Download the PDF ↗
                            </a>
                            <span className="font-mono text-xs text-[var(--fg-dim)]">Full text · {essay.readingTime} read</span>
                        </div>
                    )}

                    {/* Publication status and identifiers, the way a preprint carries them */}
                    {(essay.publishedIn || essay.orcid) && (
                        <div className="mt-6 flex flex-col gap-1 text-xs text-[var(--fg-dim)]">
                            {essay.publishedIn && <span>{essay.publishedIn}</span>}
                            {essay.orcid && (
                                <a
                                    href={`https://orcid.org/${essay.orcid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link w-fit"
                                >
                                    ORCID <span className="font-mono">{essay.orcid}</span>
                                </a>
                            )}
                        </div>
                    )}

                    <div className="mt-12 h-px w-full bg-[var(--rule)]" />
                </header>

                {/*
                 * Only the summary: the paper's own abstract, or for a case study
                 * the opening it starts with. The rest is in the PDF above. The
                 * measure is capped at 68 characters, roughly where the eye stops
                 * tracking reliably from the end of one line to the start of the
                 * next; line-height is loose and the text sits at --fg-soft rather
                 * than pure white, which is harsh over more than a few lines.
                 */}
                <section className="mx-auto mt-12 max-w-[68ch]" aria-labelledby="summary-heading">
                    <h2 id="summary-heading" className="mb-5 font-serif text-2xl md:text-3xl font-medium text-[var(--fg)]">
                        {summary.label}
                    </h2>
                    {summary.paragraphs.map((paragraph, i) => (
                        <p
                            key={i}
                            className="mb-7 font-sans text-[1.0625rem] md:text-[1.125rem] leading-[1.8] text-[var(--fg-soft)]"
                        >
                            {paragraph}
                        </p>
                    ))}
                </section>

                {essay.keywords && essay.keywords.length > 0 && (
                    <div className="mx-auto mt-10 max-w-[68ch] border-t border-[var(--rule)] pt-10">
                        <h2 className="text-sm font-medium text-[var(--fg)]">
                            Keywords
                        </h2>
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {essay.keywords.map((word) => (
                                <li
                                    key={word}
                                    className="border border-[var(--rule)] px-2.5 py-1 text-xs text-[var(--fg-muted)]"
                                >
                                    {word}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Foot of the article */}
                <div className="mx-auto mt-16 max-w-[68ch] border-t border-[var(--rule)] pt-10">
                    <Link
                        href="/#writing"
                        className="link text-sm text-[var(--fg-muted)]"
                    >
                        ← All writing
                    </Link>

                    {(newer || older) && (
                        <nav className="mt-12 grid grid-cols-1 gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2">
                            {[
                                { essay: newer, label: "Newer" },
                                { essay: older, label: "Older" },
                            ].map(({ essay: sibling, label }) =>
                                sibling ? (
                                    <Link
                                        key={label}
                                        href={`/writing/${sibling.slug}`}
                                        className="flex flex-col gap-2 bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--cloak)]"
                                    >
                                        <span className="text-xs text-[var(--fg-dim)]">
                                            {label}
                                        </span>
                                        <span className="font-serif text-xl font-medium leading-tight text-[var(--fg-soft)]">
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

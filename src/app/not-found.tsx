import Link from "next/link";
import Footer from "@/components/Footer";

/*
 * 404.
 *
 * There was none, so a mistyped or stale URL landed on Next's default page:
 * unstyled black-on-white, no navigation, no way back to the site. Essay routes
 * are built with `dynamicParams = false`, so every slug that is not in the
 * content file ends up here — including old links after a slug is renamed.
 */
export default function NotFound() {
    return (
        <main className="flex min-h-[100svh] flex-col bg-[var(--surface)] text-[var(--fg)] selection:bg-white/20">
            <div className="flex flex-1 flex-col justify-center px-6 py-32 md:px-12 lg:px-24">
                <div className="mx-auto w-full max-w-7xl">
                    <span className="inline-flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--fg-dim)]">
                        <span className="text-[var(--fg-ghost)]">[</span>
                        <span className="tabular-nums text-[var(--fg-faint)]">404</span>
                        <span>Not found</span>
                        <span className="text-[var(--fg-ghost)]">]</span>
                    </span>

                    <h1 className="mt-10 max-w-2xl font-heading text-2xl font-bold leading-[1.2] tracking-tight text-balance md:text-4xl">
                        This page doesn&apos;t exist.
                    </h1>

                    <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-[var(--fg-muted)]">
                        The link may be out of date, or the address may have a typo in it.
                    </p>

                    <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
                        <Link
                            href="/"
                            className="hoverable group inline-flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fg-muted)] transition-colors hover:text-white"
                        >
                            <span
                                aria-hidden="true"
                                className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1.5"
                            >
                                ←
                            </span>
                            Home
                        </Link>

                        <Link
                            href="/#works"
                            className="hoverable font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fg-muted)] transition-colors hover:text-white"
                        >
                            Work
                        </Link>

                        <Link
                            href="/#writing"
                            className="hoverable font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fg-muted)] transition-colors hover:text-white"
                        >
                            Writing
                        </Link>

                        <Link
                            href="/#contact"
                            className="hoverable font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fg-muted)] transition-colors hover:text-white"
                        >
                            Contact
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";

/*
 * Error boundary.
 *
 * Without one, anything that throws during render in production shows Next's
 * generic error screen — no styling and, more to the point, no link back into
 * the site. This gives the reader both a retry and a way home.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Nothing is wired to a reporting service, so at least leave a trace in
        // the console rather than swallowing the failure entirely.
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-[100svh] flex-col justify-center bg-[var(--surface)] px-6 py-32 text-[var(--fg)] selection:bg-white/20 md:px-12 lg:px-24">
            <div className="mx-auto w-full max-w-7xl">
                <span className="inline-flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--fg-dim)]">
                    <span className="text-[var(--fg-ghost)]">[</span>
                    <span>Something broke</span>
                    <span className="text-[var(--fg-ghost)]">]</span>
                </span>

                <h1 className="mt-10 max-w-2xl font-heading text-2xl font-bold leading-[1.2] tracking-tight text-balance md:text-4xl">
                    This page didn&apos;t load properly.
                </h1>

                <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-[var(--fg-muted)]">
                    Trying again often clears it. If it doesn&apos;t, the homepage still works.
                </p>

                {error.digest && (
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-faint)]">
                        Reference {error.digest}
                    </p>
                )}

                <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
                    <button
                        type="button"
                        onClick={reset}
                        className="hoverable border border-[var(--rule)] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fg-muted)] transition-colors hover:border-[var(--rule-strong)] hover:text-white"
                    >
                        Try again
                    </button>

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
                </div>
            </div>
        </main>
    );
}

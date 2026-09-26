"use client";

import Link from "next/link";
import { useEffect } from "react";

/*
 * Error boundary: a retry and a way home, instead of Next's unstyled screen.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Nothing is wired to a reporting service; at least leave a trace.
        console.error(error);
    }, [error]);

    return (
        <main className="shell grid-12 min-h-[70svh] content-center py-24">
            <div className="col-span-4 md:col-span-8 md:col-start-4">
                <p className="font-mono text-xs text-[var(--fg-dim)]">Error</p>
                <h1 className="mt-4 font-serif text-5xl font-medium leading-none md:text-6xl">
                    Something went wrong.
                </h1>
                <p className="mt-6 max-w-md text-[var(--fg-muted)]">
                    Try loading it again. If that doesn&apos;t work, the homepage should.
                </p>
                {error.digest && (
                    <p className="mt-3 font-mono text-xs text-[var(--fg-dim)]">Reference {error.digest}</p>
                )}
                <div className="mt-10 flex flex-wrap items-center gap-6 text-sm">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex h-10 items-center bg-[var(--fg)] px-4 font-medium text-[var(--surface)] transition-colors hover:bg-[var(--gold)]"
                    >
                        Try again
                    </button>
                    <Link href="/" className="link text-[var(--fg-soft)]">← Home</Link>
                </div>
            </div>
        </main>
    );
}

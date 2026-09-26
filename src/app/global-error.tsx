"use client";

import { useEffect } from "react";
import "./globals.css";

const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/*
 * The last resort: an error in the root layout itself, where app/error.tsx
 * can't help because the layout is what failed. It brings its own <html> and
 * <body>, and since the layout's fonts went down with it, it names system
 * fallbacks for the same three voices. Otherwise it is the error page.
 */
export default function GlobalError({
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
        <html lang="en">
            <body className="antialiased" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
                <main className="shell grid-12 min-h-svh content-center py-24">
                    <div className="col-span-4 md:col-span-8 md:col-start-4">
                        <p className="text-xs text-[var(--fg-dim)]" style={{ fontFamily: MONO }}>
                            Error
                        </p>
                        <h1 className="mt-4 text-5xl font-medium leading-none md:text-6xl" style={{ fontFamily: SERIF }}>
                            Something went wrong.
                        </h1>
                        <p className="mt-6 max-w-md text-[var(--fg-muted)]">
                            The site couldn&apos;t load this time. Try again, or come back in a moment.
                        </p>
                        {error.digest && (
                            <p className="mt-3 text-xs text-[var(--fg-dim)]" style={{ fontFamily: MONO }}>
                                Reference {error.digest}
                            </p>
                        )}
                        <div className="mt-10 flex flex-wrap items-center gap-6 text-sm">
                            <button
                                type="button"
                                onClick={reset}
                                className="inline-flex h-10 items-center bg-[var(--fg)] px-4 font-medium text-[var(--surface)] transition-colors hover:bg-[var(--gold)]"
                            >
                                Try again
                            </button>
                            {/* A full reload, not a client navigation: the app shell is what failed. */}
                            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                            <a href="/" className="link text-[var(--fg-soft)]">
                                ← Home
                            </a>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}

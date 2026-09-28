import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

// Otherwise the tab carries the home page's title over a page that isn't it.
export const metadata: Metadata = { title: "Page not found · Fadhlan Bani" };

/*
 * Essay routes are built with `dynamicParams = false`, so every slug not in
 * the content file lands here — including old links after a slug is renamed.
 */
export default function NotFound() {
    return (
        <>
            <main className="shell grid-12 min-h-[70svh] content-center py-24">
                <div className="col-span-4 md:col-span-8 md:col-start-4">
                    <p className="font-mono text-xs text-[var(--fg-dim)]">404</p>
                    <h1 className="mt-4 font-serif text-5xl font-medium leading-none md:text-6xl">
                        This page doesn&apos;t exist.
                    </h1>
                    <p className="mt-6 max-w-md text-[var(--fg-muted)]">
                        The link might be old, or there&apos;s a typo in the address.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-6 text-sm">
                        <Link href="/" className="link text-[var(--fg-soft)]">← Home</Link>
                        <Link href="/#work" className="link text-[var(--fg-muted)]">Work</Link>
                        <Link href="/#writing" className="link text-[var(--fg-muted)]">Writing</Link>
                        <Link href="/#contact" className="link text-[var(--fg-muted)]">Contact</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

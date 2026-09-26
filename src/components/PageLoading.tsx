"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Where a click is headed, for the label. */
const labelFor = (pathname: string) => (pathname.startsWith("/writing/") ? "Writing" : pathname === "/" ? "Home" : "Page");

/**
 * The screen between pages: the name and a gold line running along a rule,
 * under the header, while the next page is on its way.
 *
 * It starts on the click of an internal link to another page and ends when
 * the address changes to it, so it needs nothing from the server. (Next's
 * loading.tsx would have meant wrapping every page in a Suspense boundary,
 * and a page served that way is blank without JavaScript.) It fades in after
 * a beat, and pages are static and prefetched, so on most clicks it is
 * never seen at all.
 */
export default function PageLoading() {
    const pathname = usePathname();
    // The page a click is waiting for. It is done once the address shows it.
    const [target, setTarget] = useState<string | null>(null);
    const pending = target !== null && target !== pathname;

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            // Opening in a new tab or window, or a download: nothing to wait for here.
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
            const url = new URL(link.href, window.location.href);
            // Other sites, and jumps within this page, don't load a page.
            if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
            setTarget(url.pathname);
        };
        // Capture: Next's <Link> handles the click (and prevents its default) on the way up.
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, []);

    if (!pending) return null;

    return (
        // A quick fade: the page behind shows through while it runs.
        <div role="status" className="page-loading fade-in" style={{ "--delay": "150ms", animationDuration: "250ms" } as React.CSSProperties}>
            <div className="shell grid-12 w-full">
                <div className="col-span-4 md:col-span-6 md:col-start-4">
                    <p className="font-mono text-xs text-[var(--gold)]">{labelFor(target)}</p>
                    <p aria-hidden="true" className="mt-3 font-serif text-5xl font-medium leading-none tracking-[-0.02em] text-[var(--fg)] md:text-7xl">
                        Fadhlan Bani
                    </p>
                    <div aria-hidden="true" className="mt-10 h-px w-full overflow-hidden bg-[var(--rule)]">
                        <div className="loading-bar h-full w-1/3 bg-[var(--gold)]" />
                    </div>
                    <p className="mt-3 font-mono text-xs text-[var(--fg-dim)]">Loading</p>
                </div>
            </div>
        </div>
    );
}

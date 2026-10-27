import GridToggle from "./GridToggle";

/*
 * One line under a hairline, the way a datasheet closes its last page: who,
 * how it was made, and the two things you can do from here. Contact above
 * already says the name large; the footer doesn't repeat it.
 */
export default function Footer() {
    return (
        <footer className="border-t border-[var(--rule)] bg-[var(--cloak)]">
            {/* The last row clears the home indicator on phones that have one. */}
            <div className="shell grid-12 gap-y-3 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 text-xs text-[var(--fg-muted)]">
                <p className="col-span-4 font-mono md:col-span-3">© {new Date().getFullYear()} Fadhlan Bani</p>
                <p className="col-span-4 md:col-span-6">Designed and coded by me with Next.js. Fonts: Geist and Geist Mono.</p>
                <div className="col-span-4 flex gap-5 md:col-span-3 md:justify-end">
                    <GridToggle />
                    <a href="#top" className="link">
                        Back to top ↑
                    </a>
                </div>
            </div>
        </footer>
    );
}

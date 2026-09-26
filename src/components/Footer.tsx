import GridToggle from "./GridToggle";

export default function Footer() {
    return (
        <footer className="overflow-hidden border-t border-[var(--rule)] bg-[var(--cloak)]">
            {/*
             * The name, cut into the cloth: one shade off the background, with
             * a hairline of shadow above and light below each stroke. No
             * gradient, no glow. Decorative — the hero already says it.
             */}
            <p
                aria-hidden="true"
                className="shell select-none whitespace-nowrap pt-12 font-serif text-[min(18vw,15rem)] font-medium leading-[0.8] tracking-[-0.02em] text-[#1c3426] [text-shadow:0_-1px_0_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.045)] md:pt-20"
            >
                Fadhlan Bani
            </p>

            {/* The last row clears the home indicator on phones that have one. */}
            <div className="shell grid-12 gap-y-3 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 text-xs text-[var(--fg-muted)]">
                <p className="col-span-4 md:col-span-3">© {new Date().getFullYear()} Fadhlan Bani</p>
                <p className="col-span-4 md:col-span-6">
                    Designed and coded by me with Next.js. Fonts: Cormorant Garamond and Geist.
                </p>
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

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { onPortraitProgress } from "@/lib/portraitProgress";
import { INTRO_FADE_MS, INTRO_MIN_MS } from "@/lib/intro";

const noopSubscribe = () => () => {};

/**
 * The first-visit screen: the name, and a gold line that fills as the page
 * actually gets ready (the fonts, and on the home page the portrait's first
 * frames). It lifts as soon as both are in, and the hero's entrance plays
 * as it goes.
 *
 * Whether it shows at all, and the latest it may stay, are settled by
 * BOOT_SCRIPT in <head> before the first paint; this only ends it sooner.
 * Until the app hydrates, a CSS creep keeps the line moving, so a slow
 * load never shows a stuck bar.
 */
export default function IntroScreen() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    // The percentage is only known in the browser; the server renders none.
    const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

    // Tells the boot script the app is running, so what waits on it stays hidden until revealed.
    useEffect(() => {
        document.documentElement.dataset.hydrated = "";
    }, []);

    useEffect(() => {
        const html = document.documentElement;
        if (html.dataset.intro !== "show") return;

        // Only the home page has a portrait to wait for.
        const needsPortrait = pathname === "/";
        let fonts = false;
        let portrait = needsPortrait ? 0 : 1;
        let finished = false;
        const timers: ReturnType<typeof setTimeout>[] = [];

        const lift = () => {
            // The head script may already have lifted it at the time limit.
            if (html.dataset.intro !== "show") return;
            setProgress(1);
            html.dataset.intro = "leaving";
            try {
                sessionStorage.setItem("intro-seen", "1");
            } catch {
                // Private mode without storage: it simply plays again next load.
            }
            timers.push(setTimeout(() => (html.dataset.intro = "done"), INTRO_FADE_MS));
        };

        const update = () => {
            setProgress(needsPortrait ? 0.25 * Number(fonts) + 0.75 * portrait : Number(fonts));
            if (!finished && fonts && portrait >= 1) {
                finished = true;
                // performance.now() counts from the start of the page load.
                timers.push(setTimeout(lift, Math.max(0, INTRO_MIN_MS - performance.now())));
            }
        };

        document.fonts.ready.then(() => {
            fonts = true;
            update();
        });
        const unsubscribe = needsPortrait
            ? onPortraitProgress((value) => {
                  portrait = value;
                  update();
              })
            : () => {};

        return () => {
            unsubscribe();
            timers.forEach(clearTimeout);
        };
    }, [pathname]);

    return (
        <div className="intro" aria-hidden="true">
            <div className="shell grid-12 w-full">
                <div className="col-span-4 md:col-span-6 md:col-start-4">
                    <p className="font-mono text-xs text-[var(--gold)]">Portfolio</p>
                    <p className="intro-name mt-3 font-serif text-5xl font-medium leading-none tracking-[-0.02em] text-[var(--fg)] md:text-7xl">
                        Fadhlan Bani
                    </p>
                    <p className="mt-4 text-sm text-[var(--fg-muted)]">Developer &amp; designer from Indonesia</p>

                    {/* Two lines on one rule: a steady creep, and the real progress over it. */}
                    <div className="relative mt-10 h-px w-full overflow-hidden bg-[var(--rule)]">
                        <div className="intro-creep absolute inset-0 origin-left bg-[var(--gold)]/45" />
                        <div
                            className="absolute inset-0 origin-left bg-[var(--gold)] transition-transform duration-300 ease-out"
                            style={{ transform: `scaleX(${progress})` }}
                        />
                    </div>
                    <p className="mt-3 flex justify-between font-mono text-xs text-[var(--fg-dim)]">
                        <span>Loading</span>
                        {hydrated && <span className="tabular-nums">{String(Math.round(progress * 100)).padStart(3, "0")}%</span>}
                    </p>
                </div>
            </div>
        </div>
    );
}

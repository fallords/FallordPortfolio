"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { onPortraitProgress } from "@/lib/portraitProgress";
import { INTRO_FADE_MS, INTRO_MIN_MS } from "@/lib/intro";
import { SITE_HOST } from "@/lib/site";

const noopSubscribe = () => () => {};

/**
 * The first-visit screen, kept as spare as the reference's: four faint
 * corners, the name at the top, one line across the middle on which an
 * green square travels from "Loading" to the site's address as the page
 * actually gets ready (the fonts, and on the home page the portrait's first
 * frames), and the percentage at the foot. It lifts as soon as both are in, and the
 * hero's entrance plays as it goes.
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
            <span className="intro-corner" data-at="tl" />
            <span className="intro-corner" data-at="tr" />
            <span className="intro-corner" data-at="bl" />
            <span className="intro-corner" data-at="br" />
            <p className="intro-name label">Fadhlan Bani</p>

            {/* The line: the square travels from "Loading" to the address as the page gets ready. */}
            <div className="intro-line label" style={{ "--p": progress } as React.CSSProperties}>
                <span>Loading</span>
                <span className="intro-track">
                    <span className="intro-creep" />
                    <span className="intro-square" />
                </span>
                <span>{SITE_HOST}</span>
            </div>

            <p className="intro-percent label tabular-nums">
                ( <span className="text-[var(--fg)]">{hydrated ? String(Math.round(progress * 100)).padStart(3, "0") : "000"}%</span> )
            </p>
        </div>
    );
}

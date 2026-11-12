import ErrorBoundary from "./ErrorBoundary";
import HeroVoxel from "./HeroVoxel";
import LocalTime from "./LocalTime";
import { Chars } from "./motion/Split";
import { EMAIL } from "@/lib/site";
import "./hero.css";

/*
 * The first screen, laid out as the reference lays out its own: his head in
 * voxels on a curved, flickering screen (HeroVoxel), his name large on the
 * left with "// Portfolio ©2026" under it, and on the right, in the mono
 * face, what he does and that he is open to work, with the two things to do
 * next. On a phone the head stands in the middle and the words sit under it.
 *
 * One screen tall: the head boots and turns on its own when the intro
 * lifts, so nothing holds the scroll.
 */
export default function Hero() {
    return (
        // data-turn-track: how the bar and the frame know the hero is at the top (Header, HudFrame).
        <section className="hero" data-turn-track aria-label="Introduction">
            <div className="hero-stage">
                {/* Should the scene fail, the still drawing inside it stays; should the component itself fail, the words still stand. */}
                <ErrorBoundary fallback={null}>
                    <HeroVoxel className="hero-voxel" />
                </ErrorBoundary>

                <div className="hero-name">
                    <h1 data-flicker="view" className="hero-title display">
                        <Chars text="Fadhlan Bani" />
                    </h1>
                    <p className="hero-sub label rise" style={{ "--rise-delay": "200ms" } as React.CSSProperties}>
                        <span>{"//"} Portfolio</span>
                        <span className="tabular-nums">©{new Date().getFullYear()}</span>
                    </p>
                </div>

                <div className="hero-about rise" style={{ "--rise-delay": "320ms" } as React.CSSProperties}>
                    <p data-decode className="hero-desc label">
                        Developer and designer from Indonesia, building web apps, AI tools and firmware for small boards.
                    </p>
                    <p className="hero-status label">
                        Status: open to work — <LocalTime withSeconds />
                    </p>
                    <div className="hero-actions">
                        <a href={`mailto:${EMAIL}`} className="action" data-solid data-cursor="Write">
                            Email me
                        </a>
                        <a href="#work" className="action" data-cursor="Go">
                            See my work <span aria-hidden="true">↓</span>
                        </a>
                    </div>
                </div>

                <p aria-hidden="true" className="hero-hint label">
                    Scroll <span className="text-[var(--accent)]">↓</span>
                </p>
            </div>
        </section>
    );
}

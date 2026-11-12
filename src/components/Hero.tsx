import Portrait from "./Portrait";
import ErrorBoundary from "./ErrorBoundary";
import HeroLight from "./HeroLight";
import LocalTime from "./LocalTime";
import { Words } from "./motion/Split";
import { EMAIL } from "@/lib/site";
import "./hero.css";


/*
 * The first screen is a dark stage with him in it, the whole width of the
 * page, and one light cutting through the dark (HeroLight): the pointer
 * carries it, a reticle tracks it and reads out where it is. The screen is
 * held for one more screen of scroll, and the scroll works it: the portrait
 * turns from profile to face the visitor (Portrait's `scrub`), the darkness
 * opens, and the night scope inside the reticle widens until the whole
 * stage is seen through it. The words stay where they
 * are: who he is, bottom-left, with the two things to do next; what the
 * instrument reads about him, top-left.
 *
 * With motion turned down nothing is held: the stage is one screen, the
 * portrait is the still frame looking at the camera and the light is open.
 */
export default function Hero() {
    return (
        <section className="hero" data-turn-track aria-label="Introduction">
            <div className="hero-stage">
                {/* Should the portrait fail, its box stays and the layout holds. */}
                <ErrorBoundary fallback={<div aria-hidden="true" className="hero-portrait" />}>
                    {/* focalX 0: on a wide screen the crop is taken from the left of the frame, which moves his face right of the words. */}
                    <Portrait scrub className="hero-portrait" focalX={0} captionClassName="hero-caption">
                        {/* The night scope: inside the reticle's ring the picture is lifted, turned green and scanned (hero.css). */}
                        <span aria-hidden="true" className="hero-scope hero-scope-gain" />
                        <span aria-hidden="true" className="hero-scope hero-scope-tint" />
                        <span aria-hidden="true" className="hero-scope hero-scope-lines" />
                    </Portrait>
                </ErrorBoundary>
                <HeroLight />

                {/* What the instrument reads about him, set as a block of code the way the reference sets its telemetry. */}
                <div className="hero-code label rise" style={{ animationDelay: "240ms" }}>
                    <p aria-hidden="true">{"//"}</p>
                    <p data-decode>Portfolio loaded — Indonesia, UTC+7.</p>
                    <p data-decode className="hero-code-in">
                        Focus: software, AI, IoT, UI design
                    </p>
                    <p data-decode className="hero-code-in">
                        Stack: Next.js, React, TypeScript, Python, C++
                    </p>
                    <p aria-hidden="true">{"};"}</p>
                    <p>
                        Status: open to work — <LocalTime withSeconds />
                    </p>
                </div>

                <div className="hero-foot">
                    <p aria-hidden="true" className="label rise flex gap-1.5">
                        <span className="tag">_Portfolio</span>
                        <span className="tag" data-solid>
                            2026
                        </span>
                    </p>
                    <h1 className="hero-title display">
                        <Words text="I’m Fadhlan Bani, a developer and designer from Indonesia" />
                    </h1>
                    <div className="hero-next rise" style={{ animationDelay: "160ms" }}>
                        <p className="text-pretty text-[length:var(--step-body)] leading-[1.4] text-[var(--fg-soft)]">
                            I build web apps, AI tools and firmware for small boards.
                        </p>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <a href={`mailto:${EMAIL}`} className="action" data-solid data-cursor="Write">
                                Email me
                            </a>
                            <a href="#work" className="action" data-cursor="Go">
                                See my work <span aria-hidden="true">↓</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Only where the stage is held is there anything to turn. */}
                <p aria-hidden="true" className="hero-hint label">
                    Scroll to turn the portrait <span className="text-[var(--accent)]">↓</span>
                </p>
            </div>
        </section>
    );
}

import Portrait from "./Portrait";
import ErrorBoundary from "./ErrorBoundary";
import LocalTime from "./LocalTime";
import { EMAIL } from "@/lib/site";

/** The portrait's box: a block on a phone, bleeding off the right edge from md. */
const PORTRAIT_BOX = "relative h-[46svh] w-full md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[62%]";

/** The fades that blend the portrait into the page; the fallback box keeps them too. */
const fades = (
    <>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/10 to-transparent" />
        <div
            aria-hidden="true"
            className="absolute inset-0 hidden bg-gradient-to-r from-[var(--surface)] via-[var(--surface)]/25 to-transparent md:block"
        />
    </>
);

const facts = [
    { label: "Based in", value: <>Indonesia · <LocalTime /></> },
    { label: "Focus", value: "Web apps, UI design, AI, IoT" },
    { label: "Stack", value: "Next.js, React, TypeScript, Python, C++" },
];

/*
 * On a phone the portrait is a block at the top and the text rides up over
 * its faded bottom edge. From md up the portrait bleeds off the right edge of
 * the page at full height, and the name is set across the seam between the
 * two, so image and type read as one composition rather than two columns.
 */
export default function Hero() {
    return (
        <section className="relative isolate md:flex md:min-h-[min(calc(100svh-3.5rem),60rem)]">
            {/* Should the portrait fail, its box stays (the cloak colour, the same fades) and the layout holds. */}
            <ErrorBoundary fallback={<div aria-hidden="true" className={`${PORTRAIT_BOX} bg-[var(--cloak)]`}>{fades}</div>}>
                <Portrait
                    className={PORTRAIT_BOX}
                    focalX={0.45}
                    captionClassName="top-4 right-5 md:top-auto md:bottom-8 md:right-[max(2.5rem,calc((100vw_-_1280px)/2_+_2.5rem))]"
                >
                    {fades}
                </Portrait>
            </ErrorBoundary>

            <div className="shell grid-12 relative -mt-28 pb-16 md:mt-0 md:content-end md:py-16">
                <div className="col-span-4 md:col-span-8">
                    <p className="rise text-sm text-[var(--fg-muted)]">Web developer &amp; designer from Indonesia</p>

                    <h1
                        className="rise mt-4 font-serif text-[4rem] font-medium leading-[0.85] tracking-[-0.02em] text-[var(--fg)] md:text-[min(9.5vw,9rem)]"
                        style={{ animationDelay: "60ms" }}
                    >
                        Fadhlan Bani
                    </h1>

                    <p
                        className="rise mt-5 max-w-[30rem] text-[1.0625rem] leading-relaxed text-[var(--fg-soft)] md:mt-8 md:text-xl"
                        style={{ animationDelay: "140ms" }}
                    >
                        A learner and a builder.
                    </p>

                    <div className="rise mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-8" style={{ animationDelay: "200ms" }}>
                        <a
                            href={`mailto:${EMAIL}`}
                            className="inline-flex h-11 items-center bg-[var(--fg)] px-5 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--gold)]"
                        >
                            Email me
                        </a>
                        <a href="#work" className="link text-sm text-[var(--fg-soft)]">
                            See my work
                        </a>
                    </div>
                </div>

                <dl
                    className="rise col-span-4 mt-7 grid grid-cols-1 gap-2 border-t border-[var(--rule-strong)] pt-4 sm:grid-cols-3 sm:gap-4 sm:pt-6 md:col-span-7 md:mt-20"
                    style={{ animationDelay: "260ms" }}
                >
                    {facts.map((fact) => (
                        // Label beside value on a phone (three short rows), stacked from sm up.
                        <div key={fact.label} className="grid grid-cols-[5rem_1fr] items-baseline gap-3 sm:block">
                            <dt className="text-xs text-[var(--fg-dim)]">{fact.label}</dt>
                            <dd className="text-sm text-[var(--fg-soft)] sm:mt-1">{fact.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}

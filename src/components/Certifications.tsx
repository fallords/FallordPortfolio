"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Section from "./Section";
import CertificateLightbox from "./CertificateLightbox";
import { certifications, type Certification } from "@/content/certifications";
import useSwipe from "@/lib/useSwipe";
import useScrollFade from "@/lib/useScrollFade";
import SwipeHint from "./SwipeHint";

/** How long each certificate is on show before the next one slides in. */
const ADVANCE_MS = 5000;
const SLIDE_MS = 700;
const SLIDE = `${SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1) both`;

/*
 * Fields grouped into the four areas they actually cover. Anything with a
 * field not listed here still shows up, under "Other", so adding a
 * certificate never makes one silently disappear.
 */
const GROUPS = [
    { label: "Cloud & AI", fields: ["AI Engineering", "Generative AI", "Artificial Intelligence", "Cloud Infrastructure"] },
    { label: "Computer science", fields: ["Computer Science", "Programming"] },
    { label: "Earth observation", fields: ["Remote Sensing"] },
    { label: "Psychology & society", fields: ["Psychology", "Political Science", "Safeguarding"] },
];

const grouped = (() => {
    const known = new Set(GROUPS.flatMap((g) => g.fields));
    const all = [
        ...GROUPS.map((g) => ({ label: g.label, items: certifications.filter((c) => g.fields.includes(c.field ?? "")) })),
        { label: "Other", items: certifications.filter((c) => !known.has(c.field ?? "")) },
    ].filter((g) => g.items.length > 0);
    // One running index across groups: the order they are listed is the order they play.
    let i = 0;
    return all.map((g) => ({ ...g, items: g.items.map((cert) => ({ cert, index: i++ })) }));
})();

const ORDERED: Certification[] = grouped.flatMap((g) => g.items.map((x) => x.cert));
const TOTAL = ORDERED.length;
const ISSUERS = new Set(ORDERED.map((c) => c.issuer)).size;
const YEARS = ORDERED.map((c) => Number(c.year)).filter(Boolean);
const SPAN = YEARS.length ? `${Math.min(...YEARS)} to ${Math.max(...YEARS)}` : "";

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
    const mq = window.matchMedia(motionQuery);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
};

/**
 * An exhibit rather than a grid: one certificate large enough to read, the
 * full index beside it grouped by field, sliding on to the next by itself.
 *
 * The advance is driven by the progress bar's own CSS animation — when it
 * finishes, the next certificate slides in. Pausing is then just
 * `animation-play-state: paused`: by the Pause button (moving content must
 * be stoppable — WCAG 2.2.2), while the full-size view is open, while the
 * section is off screen, and always under reduced motion.
 *
 * It deliberately does not pause on hover or focus. It used to, and clicking
 * an arrow left focus inside, which stopped it until you clicked elsewhere —
 * so it looked like it never moved at all.
 */
export default function Certifications() {
    const rootRef = useRef<HTMLDivElement>(null);
    const stripRef = useRef<HTMLUListElement>(null);
    /*
     * `prev` and `dir` describe the slide in progress: `active` comes in from
     * the `dir` side, `prev` leaves to the other. Everything else is hidden,
     * so jumping several places at once never sweeps other certificates
     * across the viewer.
     */
    const [slide, setSlide] = useState({ active: 0, prev: -1, dir: 1 as 1 | -1, instant: false });
    const { active, prev, dir, instant } = slide;
    /*
     * A change that lands while the previous slide is still moving switches
     * instantly. Otherwise the slide that was halfway in would restart its
     * exit from the centre — a visible jump when the arrows are clicked fast.
     */
    const lastChange = useRef(0);
    const isMidSlide = () => {
        const now = performance.now();
        const mid = now - lastChange.current < SLIDE_MS;
        lastChange.current = now;
        return mid;
    };
    const [userPaused, setUserPaused] = useState(false);
    const [visible, setVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);

    const paused = userPaused || !visible || open || reduced || TOTAL < 2;
    const cert = ORDERED[active];

    const step = useCallback((d: 1 | -1) => {
        if (TOTAL < 2) return;
        const quick = isMidSlide();
        setSlide((s) => ({ active: (s.active + d + TOTAL) % TOTAL, prev: s.active, dir: d, instant: quick }));
    }, []);
    const select = (i: number) => {
        if (i === active) return;
        const quick = isMidSlide();
        setSlide((s) => ({ active: i, prev: s.active, dir: i > s.active ? 1 : -1, instant: quick }));
    };
    const onClose = useCallback(() => setOpen(false), []);
    // On a phone the viewer swipes like a photo gallery.
    const swipe = useSwipe({ onLeft: () => step(1), onRight: () => step(-1) });
    const stripEdges = useScrollFade(stripRef);

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Keep the active thumbnail in view on the phone strip. Scrolls the strip
    // only — scrollIntoView could drag the whole page along with it.
    useEffect(() => {
        const strip = stripRef.current;
        const thumb = strip?.children[active] as HTMLElement | undefined;
        if (!strip || !thumb || !visible) return;
        // Measured against the strip itself, not offsetLeft — that is relative
        // to whichever ancestor happens to be positioned, so it only lined up
        // by coincidence of the current layout.
        const left = thumb.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft - 20;
        strip.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
    }, [active, visible, reduced]);

    if (TOTAL === 0) return null;

    const arrow =
        "flex h-10 w-10 items-center justify-center border border-[var(--rule-strong)] text-[var(--fg-soft)] transition-colors hover:border-[var(--gold)] hover:text-[var(--fg)]";

    return (
        <Section id="certificates" index="03" title="Certificates" count={TOTAL} wide>
            {/*
             * lg and up: the index sits in the margin (columns 1–3), the viewer
             * takes columns 4–12 under the section title. Below lg the margin is
             * too narrow for a list, so it is one column with a thumbnail strip.
             */}
            <div ref={rootRef} className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-12">
                <p className="font-mono text-xs text-[var(--fg-dim)] md:col-span-9 md:col-start-4 lg:row-start-1">
                    {TOTAL} certificates · {ISSUERS} institutions · {SPAN}
                </p>

                {/* Viewer */}
                <div className="md:col-span-9 md:col-start-4 lg:row-start-2">
                    <button
                        type="button"
                        {...swipe.handlers}
                        onClick={() => !swipe.swiped() && setOpen(true)}
                        aria-label={`View ${cert.name} full size`}
                        style={{ touchAction: "pan-y" }}
                        className="group relative block aspect-[3/2] w-full overflow-hidden sm:aspect-[4/3] border border-[var(--rule)] bg-[var(--surface-raised)] transition-colors hover:border-[var(--rule-strong)] lg:aspect-[16/10]"
                    >
                        {ORDERED.map((c, i) => {
                            const role = i === active ? "in" : i === prev ? "out" : "idle";
                            const animation = instant
                                ? "none"
                                : role === "in" && prev !== -1
                                    ? `slide-in-${dir > 0 ? "right" : "left"} ${SLIDE}`
                                    : role === "out"
                                      ? `slide-out-${dir > 0 ? "left" : "right"} ${SLIDE}`
                                      : "none";
                            return (
                                <span
                                    key={c.name}
                                    aria-hidden={role !== "in"}
                                    className="absolute inset-0"
                                    style={{
                                        animation,
                                        // With no slide to play, the outgoing one would sit on top at centre.
                                        visibility: role === "idle" || (instant && role === "out") ? "hidden" : "visible",
                                    }}
                                >
                                    {c.image && (
                                        <Image
                                            src={c.image}
                                            alt={role === "in" ? `Certificate: ${c.name}, ${c.issuer}` : ""}
                                            fill
                                            sizes="(max-width: 768px) 92vw, 700px"
                                            className="object-contain p-3 drop-shadow-[0_14px_28px_rgba(0,0,0,0.6)] sm:p-5 md:p-10"
                                        />
                                    )}
                                </span>
                            );
                        })}
                        {/* Revealed on hover with a mouse; always there on a touch screen, which also gets the swipe. */}
                        <span className="absolute bottom-3 right-4 border border-[var(--rule-strong)] bg-[var(--surface)]/80 px-1.5 py-0.5 font-mono text-xs text-[var(--fg-muted)] transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                            <span className="[@media(hover:none)]:hidden">Open full size ↗</span>
                            <span className="[@media(hover:hover)]:hidden">← swipe → · tap to enlarge</span>
                        </span>
                    </button>

                    {/* Progress — its animationend is the timer. */}
                    <div className="relative h-px overflow-hidden bg-[var(--rule)]">
                        {!reduced && (
                            <span
                                key={active}
                                className="absolute inset-0 origin-left bg-[var(--gold)]"
                                style={{
                                    animation: `progress ${ADVANCE_MS}ms linear forwards`,
                                    animationPlayState: paused ? "paused" : "running",
                                }}
                                onAnimationEnd={() => step(1)}
                            />
                        )}
                    </div>

                    {/*
                     * Phone: the controls get their own row above the name, so
                     * the name has the full width instead of wrapping to four
                     * lines beside three buttons. From sm up they sit side by side.
                     */}
                    <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="min-w-0" aria-live="polite">
                            <p className="text-base leading-snug text-[var(--fg)] sm:text-lg">{cert.name}</p>
                            <p className="mt-1 text-sm text-[var(--fg-dim)]">
                                {cert.issuer} · <span className="font-mono">{cert.year}</span>
                                {cert.field && <> · {cert.field}</>}
                                {cert.url && (
                                    <>
                                        {" · "}
                                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="link text-[var(--fg-muted)]">
                                            Verify ↗
                                        </a>
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="order-first flex shrink-0 items-center justify-between gap-3 sm:order-none sm:justify-start">
                            <span className="font-mono text-xs tabular-nums text-[var(--fg-dim)]">
                                {String(active + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
                            </span>
                            <span className="flex gap-2 sm:gap-3">
                            {!reduced && (
                                <button
                                    type="button"
                                    onClick={() => setUserPaused((p) => !p)}
                                    aria-label={userPaused ? "Resume slideshow" : "Pause slideshow"}
                                    aria-pressed={userPaused}
                                    className={`${arrow} font-mono text-xs`}
                                >
                                    {userPaused ? "▶" : "❚❚"}
                                </button>
                            )}
                            <button type="button" onClick={() => step(-1)} aria-label="Previous certificate" className={arrow}>
                                ←
                            </button>
                            <button type="button" onClick={() => step(1)} aria-label="Next certificate" className={arrow}>
                                →
                            </button>
                            </span>
                        </div>
                    </div>

                    {/* Phone: a strip of thumbnails in place of the index. */}
                    <div className="mt-6 flex items-baseline justify-between gap-4 lg:hidden">
                        <p className="text-xs text-[var(--fg-dim)]">All {TOTAL} · tap one to show it</p>
                        <SwipeHint edges={stripEdges} />
                    </div>
                    <ul ref={stripRef} className="scroll-fade -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 lg:hidden [&::-webkit-scrollbar]:hidden">
                        {ORDERED.map((c, i) => (
                            <li key={c.name} className="shrink-0">
                                <button
                                    type="button"
                                    onClick={() => select(i)}
                                    aria-label={c.name}
                                    aria-current={i === active}
                                    className={`relative block aspect-[4/3] w-24 border bg-[var(--surface-raised)] transition-colors ${
                                        i === active ? "border-[var(--gold)]" : "border-[var(--rule)]"
                                    }`}
                                >
                                    {c.image && <Image src={c.image} alt="" fill sizes="96px" className="object-contain p-1.5" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Index, grouped by field */}
                <nav aria-label="Certificate index" className="hidden lg:col-span-3 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block">
                    {grouped.map((group) => (
                        <div key={group.label} className="mb-6 last:mb-0">
                            <p className="flex justify-between text-xs text-[var(--fg-dim)]">
                                <span>{group.label}</span>
                                <span className="font-mono">{String(group.items.length).padStart(2, "0")}</span>
                            </p>
                            <ul className="mt-2 border-t border-[var(--rule)]">
                                {group.items.map(({ cert: c, index }) => {
                                    const isActive = index === active;
                                    return (
                                        <li key={c.name} className="border-b border-[var(--rule)]">
                                            <button
                                                type="button"
                                                onClick={() => select(index)}
                                                aria-current={isActive}
                                                className={`relative grid w-full grid-cols-[1fr_auto] gap-3 py-2 pl-3.5 text-left text-[13px] transition-colors ${
                                                    isActive ? "text-[var(--fg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-soft)]"
                                                }`}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={`absolute inset-y-2 left-0 w-0.5 transition-colors ${
                                                        isActive ? "bg-[var(--gold)]" : "bg-transparent"
                                                    }`}
                                                />
                                                <span className="leading-snug">{c.name}</span>
                                                <span className="font-mono text-xs leading-5 text-[var(--fg-dim)]">{c.year}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            <CertificateLightbox
                cert={cert}
                open={open}
                index={active}
                total={TOTAL}
                onClose={onClose}
                onStep={step}
            />
        </Section>
    );
}

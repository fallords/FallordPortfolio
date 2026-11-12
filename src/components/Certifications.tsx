"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Section from "./Section";
import CertificateLightbox from "./CertificateLightbox";
import { Words } from "./motion/Split";
import { decode } from "./motion/textfx";
import { certifications, type Certification } from "@/content/certifications";
import "./certifications.css";

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
const groupOf = (cert: Certification) => GROUPS.find((g) => g.fields.includes(cert.field ?? ""))?.label ?? "Other";

/* Ordered by area; the order they are listed is the order the slides and the full-size view step through. */
const ORDERED: Certification[] = [...GROUPS.map((g) => g.label), "Other"].flatMap((label) => certifications.filter((c) => groupOf(c) === label));
const TOTAL = ORDERED.length;
const ISSUERS = new Set(ORDERED.map((c) => c.issuer)).size;
const YEARS = ORDERED.map((c) => Number(c.year)).filter(Boolean);
const SPAN = YEARS.length ? `${Math.min(...YEARS)}–${Math.max(...YEARS)}` : "";
const pad = (i: number) => String(i).padStart(2, "0");

/** How long each certificate stays before the next comes on; the green line under the scan runs this long. */
const SLIDE_MS = 5000;

/**
 * The certificates as the reference's photo chapters, shown one at a time
 * and turning on their own, so the page never has to be held to get
 * through all of them. Each is a chapter: its number very large and barely
 * there, its name coming in as a signal, its area, issuer and year
 * decoding under it; the scan beside it in the page's green with a field
 * of crosses over it and the reference's bracketed caption ("// … };"),
 * coming down over the last one like a shutter. A green line runs along
 * the foot of the scan for as long as the slide stays; when it reaches the
 * end the next one comes on.
 *
 * It holds still while the pointer or the keyboard is on it, while it is
 * off the screen, while a certificate is open full size, and when Pause is
 * pressed (WCAG 2.2.2). The arrows step through by hand, and the row of
 * numbers goes to any one. With motion turned down it never turns on its
 * own. Pressing the scan, or "View", opens it full size, from where the
 * arrow keys step through all of them.
 */
export default function Certifications() {
    const stage = useRef<HTMLDivElement>(null);
    const [cur, setCur] = useState(0);
    const [stopped, setStopped] = useState(false);
    const [inView, setInView] = useState(false);
    const [pointed, setPointed] = useState(false);
    const [focused, setFocused] = useState(false);
    const [lit, setLit] = useState(0);
    const [open, setOpen] = useState(false);
    const onClose = useCallback(() => setOpen(false), []);
    const step = useCallback((d: 1 | -1) => setLit((i) => (i + d + TOTAL) % TOTAL), []);
    const go = (i: number) => setCur(((i % TOTAL) + TOTAL) % TOTAL);
    const view = (i: number) => {
        setLit(i);
        setOpen(true);
    };
    const paused = stopped || !inView || pointed || focused || open;

    useEffect(() => {
        const el = stage.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Each time a certificate comes on, its readouts decode.
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        stage.current?.querySelectorAll(`.cc-item:nth-child(${cur + 1}) :is(.cc-meta, .cc-cap)`).forEach(decode);
    }, [cur]);

    if (TOTAL === 0) return null;

    return (
        <Section
            id="certificates"
            index="04"
            title="Certificates"
            meta={
                <>
                    {TOTAL} from {ISSUERS} institutions<span className="hidden sm:inline"> · {SPAN}</span>
                </>
            }
            wide
        >
            <div
                ref={stage}
                role="region"
                aria-roledescription="carousel"
                aria-label="Certificates"
                className="cc-stage"
                data-paused={paused || undefined}
                style={{ "--n": TOTAL, "--active": cur, "--slide": `${SLIDE_MS}ms` } as CSSProperties}
                onPointerEnter={(e) => e.pointerType === "mouse" && setPointed(true)}
                onPointerLeave={() => setPointed(false)}
                onFocus={() => setFocused(true)}
                onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setFocused(false)}
            >
                {/* While it turns on its own, a screen reader is not interrupted at every slide; once held, the slide is read as it changes. */}
                <ol className="cc-list" aria-live={paused ? "polite" : "off"}>
                    {ORDERED.map((cert, i) => (
                        <li
                            key={cert.name}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${i + 1} of ${TOTAL}`}
                            className="cc-item"
                            data-active={i === cur || undefined}
                        >
                            <div className="cc-text">
                                <span aria-hidden="true" className="cc-big">
                                    {pad(i + 1)}
                                </span>
                                <div className="cc-words">
                                    <h3 data-flicker="active" className="cc-name">
                                        <Words text={cert.name} />
                                    </h3>
                                    <p className="cc-meta label">
                                        {groupOf(cert)} <span aria-hidden="true">·</span> {cert.issuer} <span aria-hidden="true">·</span> {cert.year}
                                    </p>
                                    <p className="cc-actions label">
                                        <button type="button" onClick={() => view(i)} className="link text-[var(--fg)]">
                                            View full size
                                        </button>
                                        {cert.url && (
                                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="link text-[var(--accent)]">
                                                Verify ↗
                                            </a>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => view(i)}
                                aria-label={`View ${cert.name} full size`}
                                data-cursor="View"
                                data-tilt
                                className="cc-frame cert-frame viewport"
                            >
                                {cert.image && (
                                    <Image src={cert.image} alt="" fill sizes="(max-width: 768px) 92vw, 52vw" className="cert-img object-contain" />
                                )}
                                <span aria-hidden="true" className="cert-wash" />
                                <svg aria-hidden="true" className="cert-marks" width="100%" height="100%">
                                    <rect width="100%" height="100%" fill="url(#cert-cross)" />
                                </svg>
                                {/* The reference's caption over a photograph: a block of telemetry in brackets. */}
                                <span aria-hidden="true" className="cc-cap label">
                                    {"//"}
                                    <br />
                                    C-{pad(i + 1)} / {cert.year}
                                    <br />
                                    {cert.issuer}
                                    <br />
                                    {"};"}
                                </span>
                            </button>
                        </li>
                    ))}
                </ol>

                {/* The slide's time, run along the foot of the scan; when it reaches the end, the next one comes on. Restarted for every slide (key). */}
                <span key={cur} aria-hidden="true" className="cc-timer" onAnimationEnd={() => go(cur + 1)} />

                {/* How far through: a short green stretch down the right edge. */}
                <span aria-hidden="true" className="cc-rail">
                    <span />
                </span>

                <div className="cc-controls label">
                    <div className="cc-nav">
                        {ORDERED.map((cert, i) => (
                            <button
                                key={cert.name}
                                type="button"
                                onClick={() => go(i)}
                                aria-label={`Show certificate ${i + 1}: ${cert.name}`}
                                aria-current={i === cur ? "step" : undefined}
                                className="tabular-nums"
                            >
                                {pad(i + 1)}
                            </button>
                        ))}
                    </div>
                    <div className="cc-buttons">
                        <button type="button" onClick={() => go(cur - 1)} aria-label="Previous certificate">
                            ←
                        </button>
                        <button type="button" onClick={() => setStopped((s) => !s)} aria-pressed={stopped} className="cc-pause">
                            {stopped ? "Play" : "Pause"}
                        </button>
                        <button type="button" onClick={() => go(cur + 1)} aria-label="Next certificate">
                            →
                        </button>
                        <span aria-hidden="true" className="tabular-nums text-[var(--fg-dim)]">
                            {pad(cur + 1)} / {pad(TOTAL)}
                        </span>
                    </div>
                </div>
            </div>

            {/* One pattern of crosses for every frame. */}
            <svg aria-hidden="true" width="0" height="0" className="absolute">
                <defs>
                    <pattern id="cert-cross" width="64" height="64" patternUnits="userSpaceOnUse" x="-32" y="-32">
                        {/* A pattern takes its colours where it is defined, not where it is used, so they are set here. */}
                        <path d="M32 27v10M27 32h10" stroke="#ffffff" strokeOpacity="0.4" />
                    </pattern>
                </defs>
            </svg>

            <CertificateLightbox cert={ORDERED[lit]} open={open} index={lit} total={TOTAL} onClose={onClose} onStep={step} />
        </Section>
    );
}

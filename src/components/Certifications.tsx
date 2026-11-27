"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Section from "./Section";
import CertRing from "./CertRing";
import "./ring.css";
import CertificateLightbox from "./CertificateLightbox";
import { certifications, type Certification } from "@/content/certifications";

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

/* Ordered by area; the order they are listed is the order the numbers and the full-size view step through. */
const ORDERED: Certification[] = [...GROUPS.map((g) => g.label), "Other"].flatMap((label) => certifications.filter((c) => groupOf(c) === label));
const TOTAL = ORDERED.length;
const ISSUERS = new Set(ORDERED.map((c) => c.issuer)).size;
const YEARS = ORDERED.map((c) => Number(c.year)).filter(Boolean);
const IMAGES = ORDERED.map((c) => c.image);
const SPAN = YEARS.length ? `${Math.min(...YEARS)}–${Math.max(...YEARS)}` : "";

/**
 * The certificates as a ring of cards turning in 3D (CertRing): the one at the front is on show, its name, area,
 * issuer and year under the ring with the full-size view and the issuer's own check. The ring turns to the next on
 * its own every few seconds (a green line filling for its time), and holds while the pointer or the keyboard is on
 * it, while it is off the screen or a certificate is open, and always with motion turned down; the arrows, the
 * numbers or a drag turn it by hand, and pressing the front card opens it full size.
 */
export default function Certifications() {
    const [open, setOpen] = useState(false);
    const [cur, setCur] = useState(0);
    const [held, setHeld] = useState(false);
    const [seen, setSeen] = useState(false);
    const box = useRef<HTMLDivElement>(null);
    const onClose = useCallback(() => setOpen(false), []);
    const step = useCallback((d: 1 | -1) => setCur((i) => (i + d + TOTAL) % TOTAL), []);
    const go = (i: number) => setCur(((i % TOTAL) + TOTAL) % TOTAL);

    useEffect(() => {
        const el = box.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.4 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    if (TOTAL === 0) return null;
    const cert = ORDERED[cur]!;

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
                ref={box}
                role="region"
                aria-roledescription="carousel"
                aria-label="Certificates"
                className="ring"
                data-paused={held || !seen || open || undefined}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
                onPointerLeave={() => setHeld(false)}
                onFocus={() => setHeld(true)}
                onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHeld(false)}
            >
                <div className="ring-stage">
                    <CertRing images={IMAGES} active={cur} onPick={go} onOpen={() => setOpen(true)} />
                </div>

                <div className="ring-info" aria-live={held ? "polite" : "off"}>
                    <p className="label text-[var(--fg-dim)]">
                        <span className="tabular-nums text-[var(--accent)]">{String(cur + 1).padStart(2, "0")}</span> / {String(TOTAL).padStart(2, "0")}
                        <span aria-hidden="true"> · </span>
                        {groupOf(cert)} <span aria-hidden="true">·</span> {cert.issuer} <span aria-hidden="true">·</span> {cert.year}
                    </p>
                    <h3 key={cur} className="ring-name display text-balance text-[1.75rem] leading-[1.04] text-[var(--fg)] lg:text-[2.5rem]">
                        {cert.name}
                    </h3>
                    <div className="label mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
                        <button type="button" onClick={() => go(cur - 1)} aria-label="Previous certificate" className="action">
                            ←
                        </button>
                        <button type="button" onClick={() => go(cur + 1)} aria-label="Next certificate" className="action">
                            →
                        </button>
                        <button type="button" onClick={() => setOpen(true)} className="action" data-solid data-cursor="View">
                            View full size
                        </button>
                        {cert.url && (
                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="action" data-cursor="Open">
                                Verify ↗
                            </a>
                        )}
                    </div>
                    {/* The slide's time: when the line is full the ring turns to the next one. */}
                    <span key={`t${cur}`} aria-hidden="true" className="ring-timer" onAnimationEnd={() => go(cur + 1)} />
                </div>
            </div>

            <CertificateLightbox cert={ORDERED[cur]} open={open} index={cur} total={TOTAL} onClose={onClose} onStep={step} />
        </Section>
    );
}

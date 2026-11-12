"use client";

import { useCallback, useState, type CSSProperties } from "react";
import Image from "next/image";
import Section from "./Section";
import CertificateLightbox from "./CertificateLightbox";
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

const grouped = (() => {
    const known = new Set(GROUPS.flatMap((g) => g.fields));
    const all = [
        ...GROUPS.map((g) => ({ label: g.label, items: certifications.filter((c) => g.fields.includes(c.field ?? "")) })),
        { label: "Other", items: certifications.filter((c) => !known.has(c.field ?? "")) },
    ].filter((g) => g.items.length > 0);
    // One running index across groups: the order they are listed is the order the full-size view steps through.
    let i = 0;
    return all.map((g) => ({ ...g, items: g.items.map((cert) => ({ cert, index: i++ })) }));
})();

const ORDERED: Certification[] = grouped.flatMap((g) => g.items.map((x) => x.cert));
const TOTAL = ORDERED.length;
const ISSUERS = new Set(ORDERED.map((c) => c.issuer)).size;
const YEARS = ORDERED.map((c) => Number(c.year)).filter(Boolean);
const SPAN = YEARS.length ? `${Math.min(...YEARS)}–${Math.max(...YEARS)}` : "";
const code = (i: number) => `C-${String(i + 1).padStart(2, "0")}`;

/**
 * The certificates as a wall of evidence, the way the reference shows its
 * photographs: every one in a green-washed frame with a field of crosses
 * over it, its code and issuer read out on the frame. Pointing at one (or
 * focusing it) washes the green off and shows it as it is; pressing it
 * opens it full size, from where the arrow keys step through all of them.
 * One grid, ordered by field; the last tile is the readout of the fields
 * with their counts, which also closes the grid's last row.
 *
 * Each frame opens from the top as it comes up the screen (motion.css,
 * `.open-frame`), a beat after the one before it.
 */
export default function Certifications() {
    const [active, setActive] = useState(0);
    const [open, setOpen] = useState(false);
    const onClose = useCallback(() => setOpen(false), []);
    const step = useCallback((d: 1 | -1) => setActive((i) => (i + d + TOTAL) % TOTAL), []);

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
            <ul className="cert-grid">
                {grouped.map((group) =>
                    group.items.map(({ cert, index }, k) => (
                        <li key={cert.name} data-reveal className="cert-card fly-in" style={{ "--k": index % 4 } as CSSProperties}>
                            <button
                                type="button"
                                onClick={() => {
                                    setActive(index);
                                    setOpen(true);
                                }}
                                aria-label={`View ${cert.name} full size`}
                                data-cursor="View"
                                data-tilt
                                className="cert-frame viewport open-frame"
                            >
                                {cert.image && (
                                    <Image src={cert.image} alt="" fill sizes="(max-width: 768px) 45vw, 340px" className="cert-img object-contain" />
                                )}
                                <span aria-hidden="true" className="cert-wash" />
                                <svg aria-hidden="true" className="cert-marks" width="100%" height="100%">
                                    <rect width="100%" height="100%" fill="url(#cert-cross)" />
                                </svg>
                                <span aria-hidden="true" data-decode className="cert-code label">
                                    {code(index)} <span className="text-[var(--fg-dim)]">/ {cert.year}</span>
                                </span>
                            </button>
                            <p className="mt-3 text-pretty text-sm leading-snug text-[var(--fg)] md:text-[15px]">{cert.name}</p>
                            <p className="label mt-1.5 text-[var(--fg-dim)]">
                                {k === 0 && <span className="sr-only">{group.label}: </span>}
                                {cert.issuer}
                                {cert.url && (
                                    <>
                                        {" · "}
                                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="link text-[var(--accent)]">
                                            Verify ↗
                                        </a>
                                    </>
                                )}
                            </p>
                        </li>
                    ))
                )}
                {/* The readout: the fields and how many in each. */}
                <li className="cert-readout-tile">
                    <p className="label text-[var(--accent)]">By field</p>
                    <dl className="mt-4 grid gap-2">
                        {grouped.map((group) => (
                            <div key={group.label} className="label flex justify-between gap-4 border-b border-[var(--rule)] pb-2">
                                <dt className="text-[var(--fg)]">{group.label}</dt>
                                <dd className="tabular-nums text-[var(--fg-dim)]">{String(group.items.length).padStart(2, "0")}</dd>
                            </div>
                        ))}
                    </dl>
                    <p className="label mt-4 text-[var(--fg-dim)]">
                        {TOTAL} certificates · {ISSUERS} institutions · {SPAN}
                    </p>
                </li>
            </ul>

            {/* One pattern of crosses for every frame. */}
            <svg aria-hidden="true" width="0" height="0" className="absolute">
                <defs>
                    <pattern id="cert-cross" width="64" height="64" patternUnits="userSpaceOnUse" x="-32" y="-32">
                        {/* A pattern takes its colours where it is defined, not where it is used, so they are set here. */}
                        <path d="M32 27v10M27 32h10" stroke="#ffffff" strokeOpacity="0.4" />
                    </pattern>
                </defs>
            </svg>

            <CertificateLightbox cert={ORDERED[active]} open={open} index={active} total={TOTAL} onClose={onClose} onStep={step} />
        </Section>
    );
}

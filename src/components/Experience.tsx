import type { CSSProperties } from "react";
import Section from "./Section";
import ExperienceDrum from "./ExperienceDrum";
import { Words } from "./motion/Split";
import { experience, type Role } from "@/content/experience";
import "./experience.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Sep 2026" as the site stamps a date ("09 2026", the footer's "12 11 2026" without the day); anything else as it is. */
function stamp(date: string) {
    const [month, year] = date.split(" ");
    const m = MONTHS.indexOf(month ?? "");
    return m < 0 || !year ? date : `${String(m + 1).padStart(2, "0")} ${year}`;
}

/*
 * One role. In the log (a phone, a tablet, motion turned down) the margin
 * holds its number, large, with the dates, the kind of work and the place
 * under it, pinned beside the role while it is read. On the held drum the
 * number gives way to the date on the drum, and the role stands in the
 * panel beside it, coming in each time the drum turns to it: the facts
 * decode, the title comes in as a signal, the summary settles out of
 * jumbled letters ("active", see ExperienceDrum).
 */
function Row({ role, index }: { role: Role; index: number }) {
    // A role that began and ended in one month shows that month once.
    const dates = role.end === role.start ? role.start : `${role.start} – ${role.end ?? "now"}`;
    return (
        <li className="xp-row" data-reveal>
            <div className="xp-side">
                <span aria-hidden="true" className="xp-num">
                    {String(index + 1).padStart(2, "0")}
                </span>
                <p data-decode className="label xp-facts">
                    <span className="text-[var(--fg)]">
                        {!role.end && <span aria-hidden="true" className="pulse-dot mr-1.5 inline-block h-1.5 w-1.5 bg-[var(--live)] align-middle" />}
                        {dates}
                    </span>
                    <span>{role.type}</span>
                    <span>{role.place}</span>
                </p>
            </div>

            <div className="xp-body">
                <h3
                    data-flicker="active"
                    className="xp-title display min-w-0 text-[1.625rem] leading-[1.05] text-[var(--fg)] wrap-anywhere md:text-[2.5rem]"
                    style={{ "--step": "2.2%" } as CSSProperties}
                >
                    <Words text={role.title} />
                </h3>
                <p className="mt-2 text-pretty text-sm text-[var(--fg-soft)] md:text-base">
                    {role.org}
                    {role.orgNote && <span className="text-[var(--fg-dim)]"> ({role.orgNote})</span>}
                </p>
                <p data-shuffle="active" className="mt-4 max-w-[42rem] text-pretty text-[15px] leading-relaxed text-[var(--fg-muted)] md:text-base">
                    {role.summary}
                </p>

                {role.projects && (
                    <dl className="xp-projects mt-5 max-w-[42rem] border-t border-[var(--rule)]">
                        {role.projects.map((project) => (
                            <div key={project.name} className="text-pretty border-b border-[var(--rule)] py-2.5 text-[13px] leading-[1.55] md:text-sm lg:grid lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-6 lg:py-3">
                                <dt className="label mr-1.5 inline text-[var(--fg)] lg:mr-0 lg:block lg:leading-[1.55rem]">{project.name}</dt>
                                <dd className="inline text-[var(--fg-muted)] lg:block">
                                    <span data-shuffle="active">{project.desc}</span>
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        </li>
    );
}

/**
 * Where I have worked, newest first, on the reference's number scene: on a
 * laptop the section holds still for a screen of scroll per role while a
 * drum of dates turns inside a reticle, the one in the band green (when
 * the role began, stamped the way the footer stamps the date), the role
 * itself in the panel beside it, and an index of all of them down the
 * left. Everywhere else, and with motion turned down, it is a plain log of
 * numbered rows (experience.css, top half). ExperienceDrum drives it.
 */
export default function Experience() {
    if (experience.length === 0) return null;
    const since = experience[experience.length - 1]!.start.slice(-4);
    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <Section id="experience" index="02" title="Experience" meta={`${experience.length} roles · since ${since}`} wide>
            <div className="xp-track" style={{ "--n": experience.length } as CSSProperties}>
                <div className="xp-stage">
                    <ExperienceDrum />

                    <p aria-hidden="true" className="xp-count label tabular-nums">
                        <span>
                            <span data-xp-count className="text-[var(--fg)]">
                                01
                            </span>{" "}
                            / {pad(experience.length)}
                        </span>
                        {/* A way out of the held scene. */}
                        <a href="#about" className="scene-skip label" data-scramble>
                            Skip <span aria-hidden="true">↓</span>
                        </a>
                    </p>

                    <ol aria-hidden="true" className="xp-index label">
                        {experience.map((role, i) => (
                            <li key={`${role.org}-${role.start}`}>
                                <span className="tabular-nums">{pad(i + 1)}</span> {role.title}
                            </li>
                        ))}
                    </ol>

                    {/* The band the date on show stands in. */}
                    <span aria-hidden="true" className="xp-band" />

                    <div aria-hidden="true" className="xp-drum">
                        <div className="xp-drum-col">
                            {experience.map((role) => (
                                <p key={`${role.org}-${role.start}`} className="xp-date">
                                    {stamp(role.start)}
                                </p>
                            ))}
                        </div>
                    </div>

                    <ol className="xp-list">
                        {experience.map((role, i) => (
                            <Row key={`${role.org}-${role.start}`} role={role} index={i} />
                        ))}
                    </ol>
                </div>
            </div>
        </Section>
    );
}

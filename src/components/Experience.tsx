import type { CSSProperties } from "react";
import Section from "./Section";
import { Words } from "./motion/Split";
import { experience, type Role } from "@/content/experience";
import "./experience.css";

/*
 * One role as a chapter of the log. On a laptop the margin columns hold its
 * number, large, with the dates, the kind of work and the place under it,
 * and that block stays pinned beside the role while the role is read, until
 * the next one pushes it on. The role sharpens as it passes the middle of
 * the screen and its number turns green; the others wait at 45%
 * (experience.css). On a phone the number and the facts sit above the title.
 * A role still running carries the green dot a live project has in Work.
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
                <h3 className="display min-w-0 text-[1.625rem] leading-[1.05] text-[var(--fg)] wrap-anywhere md:text-[2.5rem]" style={{ "--step": "2.2%" } as CSSProperties}>
                    <Words text={role.title} />
                </h3>
                <p className="mt-2 text-pretty text-sm text-[var(--fg-soft)] md:text-base">
                    {role.org}
                    {role.orgNote && <span className="text-[var(--fg-dim)]"> ({role.orgNote})</span>}
                </p>
                <p className="mt-4 max-w-[42rem] text-pretty text-[15px] leading-relaxed text-[var(--fg-muted)] md:text-base">{role.summary}</p>

                {role.projects && (
                    <dl className="mt-5 max-w-[42rem] border-t border-[var(--rule)]">
                        {role.projects.map((project) => (
                            <div key={project.name} className="text-pretty border-b border-[var(--rule)] py-2.5 text-[13px] leading-[1.55] md:text-sm lg:grid lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-6 lg:py-3">
                                <dt className="label mr-1.5 inline text-[var(--fg)] lg:mr-0 lg:block lg:leading-[1.55rem]">{project.name}</dt>
                                <dd className="inline text-[var(--fg-muted)] lg:block">{project.desc}</dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        </li>
    );
}

/** Where I have worked, newest first, as a log of numbered chapters under the projects. */
export default function Experience() {
    if (experience.length === 0) return null;
    const since = experience[experience.length - 1]!.start.slice(-4);

    return (
        <Section id="experience" index="02" title="Experience" meta={`${experience.length} roles · since ${since}`} wide>
            <ol>
                {experience.map((role, i) => (
                    <Row key={`${role.org}-${role.start}`} role={role} index={i} />
                ))}
            </ol>
        </Section>
    );
}

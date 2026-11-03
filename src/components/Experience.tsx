import { Fragment } from "react";
import Section from "./Section";
import { experience, type Role } from "@/content/experience";

/*
 * One role as a line of the log: the dates, the kind of work and the place
 * stacked in the margin columns, the role from column 4 with the place it
 * was done for, one sentence, and its projects as ruled rows like Work's
 * features. On a phone the facts run on one line above the title. A role
 * still running carries the green dot a live project has in Work.
 */
function Row({ role }: { role: Role }) {
    // A role that began and ended in one month shows that month once.
    const dates = role.end === role.start ? role.start : `${role.start} – ${role.end ?? "now"}`;
    const facts = [dates, role.type, role.place];
    return (
        <li className="border-b border-[var(--rule)] py-6 md:grid md:grid-cols-12 md:gap-x-6 md:py-8">
            {/* Broken only between the facts; the dot goes down with the fact after it. */}
            <p className="font-mono text-xs leading-relaxed text-[var(--fg-dim)] md:col-span-3 md:text-sm md:leading-6">
                {facts.map((fact, i) => (
                    <Fragment key={fact}>
                        {i > 0 && " "}
                        <span className={`whitespace-nowrap md:block ${i === 0 ? "text-[var(--fg-soft)]" : ""}`}>
                            {i > 0 && (
                                <span aria-hidden="true" className="md:hidden">
                                    ·{" "}
                                </span>
                            )}
                            {i === 0 && !role.end && <span aria-hidden="true" className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--live)] align-middle" />}
                            {fact}
                        </span>
                    </Fragment>
                ))}
            </p>

            <div className="mt-2 min-w-0 md:col-span-8 md:col-start-4 md:mt-0">
                <h3 className="min-w-0 font-display text-xl font-bold leading-tight tracking-[-0.02em] text-[var(--fg)] wrap-anywhere md:text-2xl">{role.title}</h3>
                <p className="mt-1 text-pretty text-sm text-[var(--fg-soft)]">
                    {role.org}
                    {role.orgNote && <span className="text-[var(--fg-dim)]"> ({role.orgNote})</span>}
                </p>
                <p className="mt-3 max-w-[40rem] text-pretty text-sm leading-relaxed text-[var(--fg-muted)] md:text-base">{role.summary}</p>

                {role.projects && (
                    <dl className="mt-4 max-w-[40rem] border-t border-[var(--rule)]">
                        {role.projects.map((project) => (
                            <div key={project.name} className="text-pretty border-b border-[var(--rule)] py-2 text-[13px] leading-[1.55] md:text-sm lg:grid lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-6 lg:py-3">
                                <dt className="mr-1.5 inline font-medium text-[var(--fg)] lg:mr-0 lg:block">{project.name}</dt>
                                <dd className="inline text-[var(--fg-muted)] lg:block">{project.desc}</dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        </li>
    );
}

/** Where I have worked, newest first, as a ruled log under the projects. */
export default function Experience() {
    if (experience.length === 0) return null;
    const since = experience[experience.length - 1]!.start.slice(-4);

    return (
        <Section id="experience" title="Experience" meta={`${experience.length} roles · since ${since}`} wide>
            <ol className="border-t border-[var(--rule-strong)]">
                {experience.map((role) => (
                    <Row key={`${role.org}-${role.start}`} role={role} />
                ))}
            </ol>
        </Section>
    );
}

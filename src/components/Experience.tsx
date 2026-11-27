"use client";

import { useEffect, useRef, useState } from "react";
import Section from "./Section";
import ExperienceRail from "./ExperienceRail";
import "./rail.css";
import { experience, type Role } from "@/content/experience";

/*
 * The 3D object that stands for each role, by the kind of work it was (three/models.ts): testing AI models, building
 * software, building systems for government use, a website's front end. Anything not listed falls back to code.
 */
const MODEL: Record<string, "ai" | "code" | "systems" | "design"> = {
    "AI Evaluator": "ai",
    "Software Developer": "code",
    "Software Engineer": "systems",
    "Frontend Web Developer": "design",
};

/** One role's words: when, what kind of work and where; the title, the organisation, what was done, its projects. */
function RoleText({ role }: { role: Role }) {
    // A role that began and ended in one month shows that month once.
    const dates = role.end === role.start ? role.start : `${role.start} – ${role.end ?? "now"}`;
    return (
        <>
            <p className="label flex flex-wrap gap-x-4 gap-y-1 text-[var(--fg-dim)]">
                <span className="text-[var(--fg)]">
                    {!role.end && <span aria-hidden="true" className="pulse-dot mr-1.5 inline-block h-1.5 w-1.5 bg-[var(--live)] align-middle" />}
                    {dates}
                </span>
                <span>{role.type}</span>
                <span>{role.place}</span>
            </p>
            <h3 className="display mt-3 min-w-0 text-[2rem] leading-[1.02] text-[var(--fg)] wrap-anywhere lg:text-[2.75rem]">{role.title}</h3>
            <p className="mt-2 text-pretty text-sm text-[var(--fg-soft)] md:text-base">
                {role.org}
                {role.orgNote && <span className="text-[var(--fg-dim)]"> ({role.orgNote})</span>}
            </p>
            <p className="mt-4 max-w-[34rem] text-pretty text-[15px] leading-relaxed text-[var(--fg-muted)] md:text-base">{role.summary}</p>
            {role.projects && (
                <dl className="sc-list">
                    {role.projects.map((project, k) => (
                        <div key={project.name}>
                            <dt className="text-[var(--fg)]">
                                <span aria-hidden="true" className="label sc-list-n">
                                    {String(k + 1).padStart(2, "0")}
                                </span>
                                {project.name}
                            </dt>
                            <dd className="text-[var(--fg-muted)]">{project.desc}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </>
    );
}

/**
 * Where I have worked as a timeline in 3D (ExperienceRail): the roles stand along a rail, oldest on the left, and the
 * camera glides to the one on show. Under the rail a row of dates chooses one; under that the role itself. The next
 * comes on by itself every few seconds (a green line filling under the dates), holding while the pointer or the
 * keyboard is on the section or it is off the screen, and always with motion turned down.
 */
export default function Experience() {
    const [cur, setCur] = useState(0);
    const [held, setHeld] = useState(false);
    const [seen, setSeen] = useState(false);
    const box = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = box.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.4 });
        io.observe(el);
        return () => io.disconnect();
    }, []);
    if (experience.length === 0) return null;
    const since = experience[experience.length - 1]!.start.slice(-4);
    const n = experience.length;
    // Oldest first along the row, as along the rail.
    const order = experience.map((_, i) => n - 1 - i);

    return (
        <Section id="experience" index="02" title="Experience" meta={`${n} roles · since ${since}`} wide>
            <div
                ref={box}
                className="rail"
                data-paused={held || !seen || undefined}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
                onPointerLeave={() => setHeld(false)}
                onFocus={() => setHeld(true)}
                onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHeld(false)}
            >
                <div className="rail-stage">
                    <ExperienceRail models={experience.map((role) => MODEL[role.title] ?? "code")} active={cur} />
                </div>

                <div role="tablist" aria-label="Roles" className="rail-dates label">
                    {order.map((i) => {
                        const role = experience[i]!;
                        return (
                            <button key={i} type="button" role="tab" aria-selected={i === cur} aria-controls={`role-${i}`} onClick={() => setCur(i)}>
                                <span className="tabular-nums">{role.start}</span>
                                <span className="rail-date-title">{role.title}</span>
                            </button>
                        );
                    })}
                    {/* The role's time: when the line is full the next (older) one comes on, then round again. */}
                    <span key={cur} aria-hidden="true" className="rail-timer" onAnimationEnd={() => setCur((c) => (c + 1) % n)} />
                </div>

                {experience.map((role, i) => (
                    <div key={i} id={`role-${i}`} role="tabpanel" hidden={i !== cur} className="rail-body">
                        <RoleText role={role} />
                    </div>
                ))}
            </div>
        </Section>
    );
}

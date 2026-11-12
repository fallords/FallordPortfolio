import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import Section from "./Section";
import ErrorBoundary from "./ErrorBoundary";
import WorkStage from "./WorkStage";
import { CvThumb, SeraThumb, WearableThumb } from "./figures/thumbs/art";

/*
 * Only real work belongs here: the two apps are live, and the wearable was
 * built and tested on real hardware for the thesis. Add an entry when a
 * project actually exists; placeholders read worse than a short list.
 *
 * Every feature below is read off the project's own source. For S.E.R.A.
 * (api/app.py), the limits, the summary rule, the follow-up memory and the
 * model chain are the values in the code, not marketing copy. For the CV
 * maker, the templates, the page guides, the local drafts and the AI being
 * off by default are what its lib/ and components/ do. For the wearable, the
 * threshold, the drop-test peak, the radio and the alarm are the thesis's
 * own numbers (see figures/lora/model.ts).
 *
 * Each project's machine is a working isometric drawing of what it does:
 * the CV maker as a printer feeding out a CV in the template its dial picks,
 * S.E.R.A. as a lens scanning down a chat and marking the sentences that
 * read oddly, the wearable taken apart on a cutting mat.
 *
 * A description's last two words are joined by a non-breaking space: on a
 * phone, text-pretty would otherwise still leave "Indonesian." on its own.
 */
type Project = {
    title: string;
    subtitle: string;
    description: string;
    machine: ReactNode;
    href: string;
    /** What the button says; an external link gets ↗, a page of this site →. */
    action: string;
    year: string;
    type: string;
    /** A deployed app anyone can open now. */
    live?: boolean;
    stack: string[];
    features: { title: string; desc: string; chain?: string[] }[];
};

const projects: Project[] = [
    {
        title: "Free AI CV Maker",
        subtitle: "A CV builder that runs in the browser",
        description:
            "You fill in a form, and the preview lays your CV out on A4 pages as you type. Then you save it as a PDF from the print dialog, with selectable text and no watermark. It’s free and needs no account. The app is in English and Indonesian.",
        machine: <CvThumb />,
        href: "https://fallord-cv-maker.vercel.app/",
        action: "Open the app",
        year: "2026",
        type: "Web app",
        live: true,
        stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vitest", "Playwright", "Vercel"],
        features: [
            {
                title: "Three templates",
                desc: "ATS Minimal, Modern Professional and Graduate. All three use the same details, so you can switch at any time.",
            },
            {
                title: "Page guides",
                desc: "Dashed lines in the preview show roughly where each printed page will end, next to a page count.",
            },
            {
                title: "Stays on your device",
                desc: "Drafts save to the browser as you type and come back after a refresh. There’s no server. Export to JSON to keep a copy.",
            },
            {
                title: "Optional AI",
                desc: "A summary rewrite, off by default. It asks before sending any text, and its prompts forbid inventing jobs, dates or numbers.",
            },
        ],
    },
    {
        title: "S.E.R.A.",
        subtitle: "Smart Emotional Relationship Adviser",
        description:
            "A web app for reading relationship chats. You paste in a conversation or upload screenshots of it, and it writes up the patterns it sees. After that you can keep asking it questions about the result. The app is in Indonesian.",
        machine: <SeraThumb />,
        href: "https://s-e-r-a-smart-emotional-relationshi.vercel.app/",
        action: "Open the app",
        year: "2026",
        type: "AI web app",
        live: true,
        stack: ["Python", "Flask", "Google Gemini API", "JavaScript", "Canvas", "Vercel"],
        features: [
            {
                title: "Text or screenshots",
                desc: "Paste up to 20,000 characters of chat, or upload up to five screenshots. Gemini reads both.",
            },
            {
                title: "Short summary",
                desc: "The full report can be cut down to two sentences: the main point, and the one thing to keep an eye on.",
            },
            {
                title: "Ask more questions",
                desc: "You can keep asking about the result. It remembers the last six questions and answers.",
            },
            {
                title: "Model fallback",
                desc: "If one Gemini model fails, it tries the next one instead of showing an error.",
                chain: ["2.5-flash", "2.0-flash", "2.5-pro", "2.0-flash-lite"],
            },
        ],
    },
    {
        title: "Fall Alert Wearable",
        subtitle: "My thesis: an emergency alert system for the elderly",
        description:
            "A device worn at the waist in an elderly care home. It detects a fall on its own, has a button for calling help, and reaches the staff over LoRa, so it needs no phone and no Wi-Fi on the wearer. I built it and tested it on real hardware.",
        machine: <WearableThumb />,
        href: "/writing/lora-emergency-alert-system",
        action: "Read the case study",
        year: "2026",
        type: "Thesis · hardware",
        stack: ["ESP32-C3", "Arduino (C++)", "MPU6050", "LoRa RFM95W", "PHP", "MySQL"],
        features: [
            {
                title: "Fall detection",
                desc: "An MPU6050 reads the acceleration. A magnitude over 23.1 m/s² counts as a fall; in the drop test it peaked at 58.25.",
            },
            {
                title: "Emergency button",
                desc: "A large red button on the front sends an alert by hand.",
            },
            {
                title: "LoRa at 922 MHz",
                desc: "The receiver sounds a buzzer: double beeps for 30 seconds on a fall, one long beep for the button.",
            },
            {
                title: "Dashboard",
                desc: "The receiver posts each event to a server, and the staff see it on a web page.",
            },
        ],
    },
];

/* The words beside a machine. A keyed fragment: the stage staggers its children in one by one. */
function words(project: Project, index: number) {
    const external = project.href.startsWith("http");
    return (
        <Fragment key="text">
            <p className="label text-[var(--fg-dim)]">
                Project {index + 1} of {projects.length}
            </p>
            <h3 className="ws-title display mt-2.5 min-w-0 text-[2.25rem] text-[var(--fg)] wrap-anywhere lg:text-5xl">{project.title}</h3>
            <p className="mt-2 text-sm text-[var(--fg-soft)] md:text-base">{project.subtitle}</p>
            <p className="mt-4 text-pretty text-[15px] leading-relaxed text-[var(--fg-soft)] md:text-base">{project.description}</p>

            {/* Non-breaking spaces keep each tool's name whole ("Tailwind CSS") and tie each dot to the name before it. */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <p className="label min-w-0 flex-1 basis-48 text-pretty leading-relaxed text-[var(--fg-muted)]">
                    {project.stack.map((tool) => tool.replaceAll(" ", " ")).join(" · ")}
                </p>
                {external ? (
                    <a href={project.href} target="_blank" rel="noopener noreferrer" className="action shrink-0" data-cursor="Open">
                        {project.action} ↗
                    </a>
                ) : (
                    <Link href={project.href} className="action shrink-0" data-cursor="Read">
                        {project.action} →
                    </Link>
                )}
            </div>
        </Fragment>
    );
}

/*
 * What the project does, as its own list. Stacked, the features are ruled
 * rows under the words; on the held stage of a wide screen they become
 * callouts round the scanning ring, one in each corner (work-stage.css).
 */
function features(project: Project) {
    return (
        <dl key="features" className="ws-feats">
            {project.features.map((f, i) => (
                <div key={f.title} className="ws-feat">
                    <dt className="text-[var(--fg)]">
                        <span aria-hidden="true" className="label ws-feat-n">
                            {String(i + 1).padStart(2, "0")}
                        </span>
                        {f.title}
                    </dt>
                    <dd className="text-[var(--fg-muted)]">
                        {f.desc}
                        {f.chain && (
                            <span className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1.5 font-mono text-xs text-[var(--fg-soft)] sm:gap-x-1.5">
                                {/* The arrow trails its model, so a wrapped line ends on → instead of starting with one. */}
                                {f.chain.map((model, j) => (
                                    <span key={model} className="flex items-center gap-1 sm:gap-1.5">
                                        <span className="border border-[var(--rule-strong)] px-1 sm:px-1.5">{model}</span>
                                        {j < f.chain!.length - 1 && <span aria-hidden="true" className="text-[var(--fg-faint)]">→</span>}
                                    </span>
                                ))}
                            </span>
                        )}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

/**
 * The projects on one workbench: a big machine and the words for it, one
 * project at a time. WorkStage holds the bench still while the page scrolls
 * and takes each machine apart to bring in the next.
 */
/** How many projects are on the page; the figures quote it. */
export const PROJECT_COUNT = projects.length;

export default function Works() {
    return (
        <Section id="work" index="01" title="Work" meta={`${projects.length} projects`} wide>
            <WorkStage
                skipTo="#experience"
                items={projects.map((project, index) => ({
                    id: project.title,
                    label: project.title,
                    index: String(index + 1).padStart(2, "0"),
                    note: (
                        <>
                            {project.year} <span aria-hidden="true">·</span> {project.type}
                            {project.live && (
                                <span className="ml-auto flex items-center gap-1.5 text-[var(--live)]">
                                    <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 bg-[var(--live)]" />
                                    Live
                                </span>
                            )}
                        </>
                    ),
                    // The drawing runs in the browser; if it fails, its place on the bench stays empty.
                    machine: (
                        <ErrorBoundary key="machine" fallback={null}>
                            {project.machine}
                        </ErrorBoundary>
                    ),
                    text: words(project, index),
                    features: features(project),
                }))}
            />
        </Section>
    );
}

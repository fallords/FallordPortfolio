import Image from "next/image";
import Section from "./Section";
import SwipeRow from "./SwipeRow";

/*
 * Only real, shipped work belongs here. Add an entry when a project is
 * actually live — placeholders read worse than a short list.
 *
 * Every feature below is read off the project's own source. For S.E.R.A.
 * (api/app.py), the limits, the summary rule, the follow-up memory and the
 * model chain are the values in the code, not marketing copy. For the CV
 * maker, the templates, the page guides, the local drafts and the AI being
 * off by default are what its lib/ and components/ do.
 *
 * Each screenshot is the live app at phone width (390px, at 2x), cut to the
 * frame's 625:985, so every project's frame is the same size. S.E.R.A.'s ends
 * on its chat box's divider, not a sliver of the box below it.
 *
 * A description's last two words are joined by a non-breaking space: on a
 * phone, text-pretty would otherwise still leave "Indonesian." on its own.
 */
const projects = [
    {
        title: "Free AI CV Maker",
        subtitle: "A CV builder that runs in the browser",
        description:
            "You fill in a form, and the preview lays your CV out on A4 pages as you type. Then you save it as a PDF from the print dialog, with selectable text and no watermark. It’s free and needs no account. The app is in English and Indonesian.",
        image: "/cv-maker-phone.png",
        href: "https://fallord-cv-maker.vercel.app/",
        year: "2026",
        type: "Web app",
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
            "A web app for reading relationship chats. You paste in a conversation or upload screenshots of it, and it writes up the patterns it sees. After that you can keep asking it questions about the result. The app is in Indonesian.",
        image: "/sera-phone.png",
        href: "https://s-e-r-a-smart-emotional-relationshi.vercel.app/",
        year: "2026",
        type: "AI web app",
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
];

export default function Works() {
    return (
        <Section id="work" title="Work" meta={`${projects.length} projects`} wide>
            {/*
             * The projects side by side, as equals: the same parts in the same
             * places, so the eye compares across instead of reading one template
             * twice down the page. From md, two columns split by a hairline. On a
             * phone, one project per screen, swiped like the other rows here.
             * Each project is a flex column, so the stack and the button sit on one
             * line across both, however long either's features run.
             */}
            <SwipeRow
                className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-0 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
                hintClassName="mt-2 text-right md:hidden"
            >
                {projects.map((project, index) => (
                    <li
                        key={project.title}
                        className={`flex w-[88%] shrink-0 snap-start flex-col border border-[var(--rule)] p-4 md:w-auto md:p-0 ${
                            index === 0 ? "md:border-0 md:pr-8 lg:pr-12" : "md:border-y-0 md:border-r-0 md:pl-8 lg:pl-12"
                        }`}
                    >
                        {/*
                         * The live app's screenshot in a hairline frame, at its own
                         * proportions (no imitation browser bar: the visitor already
                         * has one), with the name beside it. From lg the description
                         * joins the name there; narrower, it runs full width below.
                         */}
                        <div className="flex gap-4 lg:gap-6">
                            <a
                                href={project.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${project.title}`}
                                className="group block w-[34%] max-w-[9.5rem] shrink-0 self-start border border-[var(--rule-strong)] bg-[var(--surface-card)] transition-colors hover:border-[var(--gold)]"
                            >
                                <span className="relative block aspect-[625/985] overflow-hidden">
                                    <Image
                                        src={project.image}
                                        alt={`Screenshot of ${project.title}`}
                                        fill
                                        sizes="152px"
                                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                    />
                                </span>
                            </a>

                            <div className="min-w-0">
                                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-[var(--fg-dim)]">
                                    <span>{project.year}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>{project.type}</span>
                                    <span aria-hidden="true">·</span>
                                    <span className="flex items-center gap-1.5 text-[var(--live)]">
                                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--live)]" />
                                        Live
                                    </span>
                                </p>
                                <h3 className="mt-2 min-w-0 font-display text-2xl font-bold leading-[1.05] tracking-[-0.03em] text-[var(--fg)] wrap-anywhere lg:text-4xl">
                                    {project.title}
                                </h3>
                                <p className="mt-1.5 text-sm text-[var(--fg-dim)]">{project.subtitle}</p>
                                <p className="mt-4 hidden text-pretty text-sm leading-relaxed text-[var(--fg-muted)] lg:block">{project.description}</p>
                            </div>
                        </div>
                        <p className="mt-4 text-pretty text-[13px] leading-[1.55] text-[var(--fg-muted)] md:text-sm lg:hidden">{project.description}</p>

                        {/*
                         * The features as rows, not cards: a hairline under each.
                         * Nothing boxes them, so the four read as parts of one thing.
                         * Below lg the name runs into its line, which keeps one
                         * project to one phone screen; from lg it sits beside it.
                         */}
                        <dl className="mt-5 border-t border-[var(--rule)]">
                            {project.features.map((f) => (
                                <div key={f.title} className="text-pretty border-b border-[var(--rule)] py-2 text-[13px] leading-[1.55] md:text-sm lg:grid lg:grid-cols-[9.5rem_minmax(0,1fr)] lg:gap-6 lg:py-3">
                                    <dt className="mr-1.5 inline font-medium text-[var(--fg)] lg:mr-0 lg:block">{f.title}</dt>
                                    <dd className="inline text-[var(--fg-muted)] lg:block">
                                        {f.desc}
                                        {f.chain && (
                                            <span className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1.5 font-mono text-xs text-[var(--fg-soft)] sm:gap-x-1.5">
                                                {/* The arrow trails its model, so a wrapped line ends on → instead of starting with one. */}
                                                {f.chain.map((model, j) => (
                                                    <span key={model} className="flex items-center gap-1 sm:gap-1.5">
                                                        <span className="border border-[var(--rule-strong)] px-1 sm:px-1.5">{model}</span>
                                                        {j < f.chain.length - 1 && <span aria-hidden="true" className="text-[var(--fg-faint)]">→</span>}
                                                    </span>
                                                ))}
                                            </span>
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        {/*
                         * mt-auto: the stack and the button sit on the same line in
                         * both columns. Non-breaking spaces keep each tool's name whole
                         * ("Tailwind CSS") and tie each dot to the name before it.
                         */}
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-4">
                            <p className="min-w-0 flex-1 basis-48 text-pretty font-mono text-xs leading-relaxed text-[var(--fg-soft)]">
                                {project.stack.map((tool) => tool.replaceAll(" ", " ")).join(" · ")}
                            </p>
                            <a
                                href={project.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-10 shrink-0 items-center justify-center border border-[var(--rule-strong)] px-4 text-sm text-[var(--fg)] transition-colors pointer-coarse:h-[44px] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                            >
                                Open the app ↗
                            </a>
                        </div>
                    </li>
                ))}
            </SwipeRow>
        </Section>
    );
}

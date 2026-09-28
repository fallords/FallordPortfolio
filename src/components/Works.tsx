import Image from "next/image";
import Section from "./Section";
import SwipeRow from "./SwipeRow";

/*
 * Only real, shipped work belongs here. Add an entry when a project is
 * actually live — placeholders read worse than a short list.
 *
 * Every feature below is read off the project's own source (api/app.py):
 * the limits, the summary rule, the follow-up memory and the model chain are
 * the values in the code, not marketing copy.
 */
const projects = [
    {
        title: "S.E.R.A.",
        subtitle: "Smart Emotional Relationship Adviser",
        description:
            "A web app for reading relationship chats. You paste in a conversation or upload screenshots of it, and it writes up the patterns it sees. After that you can keep asking it questions about the result. The app is in Indonesian.",
        image: "/sera-screen.png",
        href: "https://s-e-r-a-smart-emotional-relationshi.vercel.app/",
        host: "s-e-r-a-smart-emotional-relationshi.vercel.app",
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
                desc: "If one Gemini model fails, it tries the next one on the list instead of showing an error.",
                chain: ["2.5-flash", "2.0-flash", "2.5-pro", "2.0-flash-lite"],
            },
        ],
    },
];

export default function Works() {
    return (
        <Section id="work" index="01" title="Work" count={projects.length} wide>
            <ul className="flex flex-col gap-24">
                {projects.map((project) => (
                    /*
                     * Three grid items so the order can differ by width. A phone
                     * reads name → screenshot → features, so you know what you
                     * are looking at before a tall screenshot fills the screen.
                     * From md up the screenshot hangs in the margin (columns 1–3)
                     * and the rest starts at column 4, under the section title.
                     */
                    <li key={project.title} className="grid grid-cols-1 items-start gap-x-6 gap-y-5 md:grid-cols-12 md:gap-y-10">
                        <div className="md:col-span-9 md:col-start-4 md:row-start-1">
                            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-[var(--fg-dim)]">
                                <span>{project.year}</span>
                                <span aria-hidden="true">·</span>
                                <span>{project.type}</span>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#5fbf8a]">Live</span>
                            </p>

                            <h3 className="mt-2 font-serif text-[2.25rem] font-medium leading-none text-[var(--fg)] md:mt-4 md:text-6xl">
                                {project.title}
                            </h3>
                            <p className="mt-1.5 text-sm text-[var(--fg-dim)] md:mt-2">{project.subtitle}</p>
                            {/* A phone has this beside the screenshot instead. */}
                            <p className="mt-6 hidden max-w-[40rem] leading-relaxed text-[var(--fg-muted)] md:block">{project.description}</p>
                        </div>

                        {/*
                         * The live app in a slim browser frame, at the screenshot's own
                         * proportions. On a phone the frame takes a third of the width
                         * and the description, with the button to open the app, sits
                         * beside it, so the whole project fits on one screen.
                         */}
                        <div className="flex gap-4 md:col-span-3 md:col-start-1 md:row-span-2 md:row-start-1 md:block">
                            <a
                                href={project.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${project.title}`}
                                className="group block w-[36%] max-w-[15rem] shrink-0 self-start border border-[var(--rule-strong)] bg-[var(--surface-card)] transition-colors hover:border-[var(--gold)] md:w-auto md:max-w-none"
                            >
                                <span className="flex h-8 items-center gap-2 border-b border-[var(--rule)] px-3 font-mono text-[10px] text-[var(--fg-dim)] md:h-9 md:text-[11px]">
                                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5fbf8a]" />
                                    <span className="truncate">{project.host}</span>
                                </span>
                                <span className="relative block aspect-[625/985] overflow-hidden">
                                    <Image
                                        src={project.image}
                                        alt={`Screenshot of ${project.title}`}
                                        fill
                                        sizes="(max-width: 768px) 240px, 300px"
                                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                    />
                                </span>
                            </a>

                            <div className="flex min-w-0 flex-1 flex-col md:hidden">
                                <p className="pb-3 text-[13px] leading-[1.55] text-[var(--fg-muted)]">{project.description}</p>
                                <a
                                    href={project.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-auto inline-flex h-10 w-full shrink-0 items-center justify-center bg-[var(--fg)] px-3 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--gold)]"
                                >
                                    Open the app ↗
                                </a>
                            </div>
                        </div>

                        <div className="md:col-span-9 md:col-start-4 md:row-start-2">
                            {/*
                             * A phone: a row of cards to swipe through, one screen's worth
                             * instead of four stacked. From sm: a hairline grid, where 1px
                             * gaps over a rule-coloured ground draw the dividers.
                             */}
                            <SwipeRow
                                className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-px sm:overflow-visible sm:border sm:border-[var(--rule)] sm:bg-[var(--rule)] sm:px-0 [&::-webkit-scrollbar]:hidden"
                                hintClassName="mt-2 text-right sm:hidden"
                            >
                                {project.features.map((f, i) => (
                                    <li key={f.title} className="w-[84%] shrink-0 snap-start border border-[var(--rule)] bg-[var(--surface)] p-4 sm:w-auto sm:border-0 sm:p-5">
                                        <p className="flex items-baseline gap-3">
                                            <span className="font-mono text-xs text-[var(--gold)]">{String(i + 1).padStart(2, "0")}</span>
                                            <span className="font-medium text-[var(--fg)]">{f.title}</span>
                                        </p>
                                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-muted)] sm:mt-2">{f.desc}</p>
                                        {f.chain && (
                                            <p className="mt-2.5 flex flex-wrap items-center gap-x-1 gap-y-1.5 font-mono text-[10.5px] text-[var(--fg-soft)] sm:mt-3 sm:gap-x-1.5 sm:gap-y-2 sm:text-[11px]">
                                                {f.chain.map((model, j) => (
                                                    <span key={model} className="flex items-center gap-1 sm:gap-1.5">
                                                        {j > 0 && <span aria-hidden="true" className="text-[var(--fg-faint)]">→</span>}
                                                        <span className="border border-[var(--rule-strong)] px-1 sm:px-1.5 sm:py-0.5">{model}</span>
                                                    </span>
                                                ))}
                                            </p>
                                        )}
                                    </li>
                                ))}
                                {/* A phone: the stack is the last card, rather than a line of its own below. */}
                                <li className="w-[84%] shrink-0 snap-start border border-[var(--rule)] bg-[var(--surface)] p-4 sm:hidden">
                                    <p className="font-medium text-[var(--fg)]">Built with</p>
                                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-muted)]">{project.stack.join(" · ")}</p>
                                </li>
                            </SwipeRow>

                            {/*
                             * The stack from sm, where the features are a grid and its
                             * swipe card is gone; the button from md, where it no longer
                             * sits beside the screenshot.
                             */}
                            <div className="mt-6 hidden flex-wrap items-center justify-between gap-6 sm:flex md:mt-8">
                                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--fg-soft)]">
                                    {project.stack.map((tool) => (
                                        <li key={tool}>{tool}</li>
                                    ))}
                                </ul>
                                <a
                                    href={project.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden h-10 items-center justify-center border border-[var(--rule-strong)] px-4 text-sm text-[var(--fg)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] md:inline-flex"
                                >
                                    Open the app ↗
                                </a>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </Section>
    );
}

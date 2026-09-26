"use client";

import { useEffect, useRef, useState } from "react";
import Section from "./Section";
import useScrollFade from "@/lib/useScrollFade";
import SwipeHint from "./SwipeHint";
import Reveal from "./Reveal";
import ErrorBoundary from "./ErrorBoundary";
import FallbackNotice from "./FallbackNotice";
import CodeDemo from "./demos/CodeDemo";
import WireframeDemo from "./demos/WireframeDemo";
import TraceDemo from "./demos/TraceDemo";
import StreamDemo from "./demos/StreamDemo";
import SensorDemo from "./demos/SensorDemo";

const services = [
    {
        title: "Code",
        desc: "I write software in TypeScript, Python and C++: web apps and the servers behind them, tools built on AI models, and firmware for small boards.",
        file: "Portrait.tsx",
        meta: "code from this site",
        hint: "watch it, then rerun",
        Demo: CodeDemo,
    },
    {
        title: "Design",
        desc: "Before I write any code, I work out the layout, the screens, and what happens between them. Usually in Figma.",
        file: "home / hero",
        meta: "wireframe → design",
        hint: "drag the slider",
        Demo: WireframeDemo,
    },
    {
        title: "Systems",
        desc: "The parts people don't see. I plan APIs and databases (with DFDs and ERDs), set up Linux servers, and test things properly before they go live.",
        file: "trace",
        meta: "POST /api/analyze",
        hint: "send the request again",
        Demo: TraceDemo,
    },
    {
        title: "AI",
        desc: "Adding AI to a product: chat, text generation, reading images, and connecting to LLM APIs like Gemini.",
        file: "chat",
        meta: "streaming",
        hint: "pick a question",
        Demo: StreamDemo,
    },
    {
        title: "Hardware",
        desc: "I program ESP32 boards in C++, wire up sensors, and send their data over LoRa to a server and a web dashboard. I've put this together and tested it on real hardware.",
        file: "sensor → server",
        meta: "live",
        hint: "tap the chart",
        Demo: SensorDemo,
    },
];

const tools = [
    { group: "Web", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PHP", "MySQL"] },
    { group: "AI", items: ["Python", "LLM APIs", "Google Gemini"] },
    { group: "Hardware", items: ["ESP32", "Arduino (C++)", "LoRa", "MPU6050"] },
    { group: "Ops & design", items: ["Linux (Ubuntu, Apache)", "Vercel", "Figma"] },
];

/**
 * Four capabilities, each shown rather than described. Selecting one swaps
 * the window on the right; the demo is keyed on the selection, so it plays
 * from the start every time you come back to it.
 */
export default function About() {
    const [active, setActive] = useState(0);
    const { Demo, file, meta, hint } = services[active];
    /*
     * Until someone actually uses the demo on screen, its header carries a
     * pulsing "try this" hint instead of the plain label. Switching to
     * another demo brings the hint back for that one.
     */
    const [tried, setTried] = useState(false);
    // A phone keeps the tools list folded, so the section fits one screen.
    const [toolsOpen, setToolsOpen] = useState(false);
    const choose = (i: number) => {
        if (i === active) return;
        setActive(i);
        setTried(false);
    };

    /*
     * Below lg the tabs are a row of chips wider than the screen. Bring the
     * chosen one to the middle of the row, so the next one along is always
     * in sight. Scrolls the row only, never the page.
     */
    const tabsRef = useRef<HTMLOListElement>(null);
    const tabEdges = useScrollFade(tabsRef);
    useEffect(() => {
        const row = tabsRef.current;
        const chip = row?.children[active] as HTMLElement | undefined;
        if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
        const box = chip.getBoundingClientRect();
        const left = box.left - row.getBoundingClientRect().left + row.scrollLeft - (row.clientWidth - box.width) / 2;
        const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        row.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    }, [active]);

    // ARIA tabs pattern: arrows move between tabs, Home/End jump to the ends,
    // and only the selected tab sits in the Tab order.
    const onTabKey = (e: React.KeyboardEvent) => {
        const last = services.length - 1;
        const next =
            e.key === "ArrowDown" || e.key === "ArrowRight"
                ? (active + 1) % services.length
                : e.key === "ArrowUp" || e.key === "ArrowLeft"
                  ? (active - 1 + services.length) % services.length
                  : e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? last
                      : null;
        if (next === null) return;
        e.preventDefault();
        choose(next);
        document.getElementById(`skill-tab-${next}`)?.focus();
    };

    return (
        <Section
            id="about"
            index="02"
            title="What I do"
            intro="Five things I work on. Most projects need more than one. Pick one and try it."
            // A phone goes straight to the chips; their hint and the demo's say the same thing.
            introClassName="hidden md:block"
            wide
        >
            {/*
             * Separate grid items so a narrow screen gets tabs → demo →
             * description → tools: the demo sits right under the chip you just
             * tapped, and the description follows it as a caption, instead of
             * pushing it most of a screen further down. Below lg the tabs are a
             * swipeable row of chips. From lg the tabs become a list in the
             * margin (columns 1–3), with the description inside the list, and
             * the demo and tools take columns 4–12, under the section title.
             */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:gap-y-4 md:grid-cols-12 lg:gap-y-8">
                <div className="md:col-span-9 md:col-start-4 lg:col-span-3 lg:col-start-1 lg:row-start-1">
                    <ol
                        ref={tabsRef}
                        role="tablist"
                        aria-label="Capabilities"
                        onKeyDown={onTabKey}
                        className="scroll-fade -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 lg:block lg:overflow-visible lg:border-b lg:border-[var(--rule)] lg:pb-0 [&::-webkit-scrollbar]:hidden"
                    >
                        {services.map((service, i) => {
                            const selected = i === active;
                            return (
                                <li key={service.title} className="shrink-0 lg:border-t lg:border-[var(--rule)]">
                                    <button
                                        type="button"
                                        role="tab"
                                        id={`skill-tab-${i}`}
                                        aria-selected={selected}
                                        aria-controls="skill-panel"
                                        tabIndex={selected ? 0 : -1}
                                        onClick={() => choose(i)}
                                        onMouseEnter={() => choose(i)}
                                        className={`group flex h-9 items-center gap-2 whitespace-nowrap border px-3 sm:h-10 text-left transition-colors lg:grid lg:h-auto lg:w-full lg:grid-cols-[2.25rem_1fr] lg:items-baseline lg:gap-0 lg:whitespace-normal lg:border-0 lg:px-0 lg:py-4 ${
                                            selected ? "border-[var(--gold)]" : "border-[var(--rule-strong)]"
                                        }`}
                                    >
                                        <span
                                            className={`font-mono text-xs transition-colors ${
                                                selected ? "text-[var(--gold)]" : "text-[var(--fg-dim)]"
                                            }`}
                                        >
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span
                                            className={`text-sm transition-colors lg:text-xl ${
                                                selected ? "text-[var(--fg)]" : "text-[var(--fg-dim)] group-hover:text-[var(--fg-muted)]"
                                            }`}
                                        >
                                            {service.title}
                                        </span>
                                        {/* 0fr → 1fr: the only honest way to animate to "auto" height in CSS. */}
                                        <span
                                            className={`col-start-2 hidden transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid ${
                                                selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                            }`}
                                        >
                                            <span className="overflow-hidden">
                                                <span className="block pt-2 pr-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                                                    {service.desc}
                                                </span>
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                    <SwipeHint edges={tabEdges} className="mt-1.5 text-right lg:hidden" />
                </div>

                <Reveal className="md:col-span-9 md:col-start-4 lg:row-start-1">
                    <div
                        id="skill-panel"
                        role="tabpanel"
                        onPointerDownCapture={() => setTried(true)}
                        onKeyDownCapture={() => setTried(true)}
                        aria-labelledby={`skill-tab-${active}`}
                        // A phone: as tall as the demo inside needs, so a short one leaves no
                        // empty box. From md: one fixed height, so switching never moves the page.
                        className="flex flex-col border border-[var(--rule-strong)] bg-[var(--surface-card)] md:h-[30rem]"
                    >
                        {/* A narrow phone may wrap the hint to two lines; the bar grows rather than clipping it. */}
                        <div className="flex min-h-9 shrink-0 items-center justify-between gap-4 border-b border-[var(--rule)] px-4 py-1.5 font-mono text-xs sm:min-h-10 sm:py-2">
                            <span className="shrink-0 text-[var(--fg-soft)]">{file}</span>
                            {tried ? (
                                <span className="text-right text-[var(--fg-dim)]">{meta}</span>
                            ) : (
                                // The dot is inline, so if the hint ever wraps it stays with the first line.
                                <span className="text-right text-[var(--gold)]">
                                    <span aria-hidden="true" className="pulse-dot mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)] align-middle" />
                                    <span className="sr-only">Interactive demo: </span>
                                    {hint}
                                </span>
                            )}
                        </div>
                        <div className="md:min-h-0 md:flex-1">
                            {/* A demo that breaks is replaced by a notice, in its own panel only. */}
                            <ErrorBoundary
                                key={active}
                                fallback={(retry) => (
                                    <FallbackNotice
                                        message="This demo stopped working. Starting it again usually fixes it."
                                        onRetry={retry}
                                        className="h-full min-h-[16rem] justify-center p-6"
                                    />
                                )}
                            >
                                <Demo />
                            </ErrorBoundary>
                        </div>
                    </div>
                </Reveal>

                {/* Below lg: the chosen capability's description, as a caption under its demo. */}
                <p className="max-w-[40rem] text-[13px] leading-[1.55] text-[var(--fg-muted)] sm:text-base md:col-span-9 md:col-start-4 lg:hidden">
                    {services[active].desc}
                </p>

                {/*
                 * Below md the list folds behind a toggle; from md it is always open.
                 * Label beside value on a phone; from sm, one column per group.
                 */}
                <div className="md:col-span-9 md:col-start-4 md:mt-6 lg:row-start-2 lg:mt-0">
                    <button
                        type="button"
                        aria-expanded={toolsOpen}
                        aria-controls="tools-list"
                        onClick={() => setToolsOpen((o) => !o)}
                        className="flex h-10 w-full items-center justify-between border-y border-[var(--rule)] text-sm text-[var(--fg-soft)] md:hidden"
                    >
                        <span>
                            Tools I use <span className="font-mono text-xs text-[var(--fg-dim)]">· {tools.reduce((n, t) => n + t.items.length, 0)}</span>
                        </span>
                        <span className="font-mono text-xs text-[var(--gold)]">{toolsOpen ? "hide ↑" : "show ↓"}</span>
                    </button>
                    <p className="hidden text-sm text-[var(--fg-dim)] md:block">Tools I use</p>
                    <dl
                        id="tools-list"
                        className={`${toolsOpen ? "grid" : "hidden"} mt-3 grid-cols-[6.5rem_1fr] gap-x-4 gap-y-2 text-sm sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5 md:grid lg:grid-cols-4`}
                    >
                        {tools.map((t) => (
                            <div key={t.group} className="contents sm:block">
                                <dt className="font-mono text-xs leading-5 text-[var(--fg-dim)]">{t.group}</dt>
                                <dd className="text-[var(--fg-soft)] sm:mt-1">{t.items.join(" · ")}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </Section>
    );
}

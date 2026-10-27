"use client";

import { useEffect, useRef, useState } from "react";
import Section from "./Section";
import SwipeRow from "./SwipeRow";
import ErrorBoundary from "./ErrorBoundary";
import FallbackNotice from "./FallbackNotice";
import CodeDemo from "./demos/CodeDemo";
import WireframeDemo from "./demos/WireframeDemo";
import TraceDemo from "./demos/TraceDemo";
import StreamDemo from "./demos/StreamDemo";
import SensorDemo from "./demos/SensorDemo";

/*
 * Each capability carries the tools it is done with, so there is no separate
 * "Tools I use" list to cross-reference. All sixteen tools are here, each
 * under the one place it is used.
 *
 * `span` places the card on the bench from lg: the two that need room (the
 * code, the wireframe) share the top row, the three that read fine at a
 * phone's width share the bottom one. `panel` is the demo's height from md,
 * the size each one is drawn for.
 */
const services = [
    {
        title: "Code",
        desc: "I write software in TypeScript, Python and C++: web apps and the servers behind them, tools built on AI models, and firmware for small boards.",
        tools: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        meta: "Portrait.tsx, code from this site",
        hint: "watch it, then rerun",
        Demo: CodeDemo,
        span: "md:col-span-2 lg:col-span-7",
        panel: "md:h-[27.5rem]",
    },
    {
        title: "Design",
        desc: "Before I write any code, I work out the layout, the screens, and what happens between them. Usually in Figma.",
        tools: ["Figma"],
        meta: "this site's hero, wireframe → design",
        hint: "drag the slider",
        Demo: WireframeDemo,
        span: "lg:col-span-5",
        panel: "md:h-[27.5rem]",
    },
    {
        title: "Systems",
        desc: "Behind the screens, I plan APIs and databases (with DFDs and ERDs), set up Linux servers, and test things properly before they go live.",
        tools: ["PHP", "MySQL", "Linux (Ubuntu, Apache)", "Vercel"],
        meta: "POST /api/analyze",
        hint: "send the request again",
        Demo: TraceDemo,
        span: "lg:col-span-4",
        panel: "md:h-[27.5rem] lg:h-[25rem]",
    },
    {
        title: "AI",
        desc: "Adding AI to a product: chat, text generation, reading images, and connecting to LLM APIs like Gemini.",
        tools: ["Python", "LLM APIs", "Google Gemini"],
        meta: "a streamed reply",
        hint: "pick a question",
        Demo: StreamDemo,
        span: "lg:col-span-4",
        panel: "md:h-[27.5rem] lg:h-[25rem]",
    },
    {
        title: "Hardware",
        desc: "I program ESP32 boards in C++, wire up sensors, and send their data over LoRa to a server and a web dashboard. I’ve put this together and tested it on real hardware.",
        tools: ["ESP32", "Arduino (C++)", "LoRa", "MPU6050"],
        meta: "sensor → server, live",
        hint: "tap the chart",
        Demo: SensorDemo,
        span: "lg:col-span-4",
        panel: "md:h-[27.5rem] lg:h-[25rem]",
    },
];

type Service = (typeof services)[number];

/**
 * One capability on the bench: its name, its demo, what it is and what it is
 * done with. The demo mounts the first time the card comes into view, so the
 * ones that play once (the code typing itself, the trace, the reply) play
 * while someone is looking, not before.
 */
function Bench({ service }: { service: Service }) {
    const { title, desc, tools, meta, hint, Demo, span, panel } = service;
    const ref = useRef<HTMLLIElement>(null);
    const [shown, setShown] = useState(false);
    /*
     * Until someone uses the demo, its card carries a pulsing "try this" hint
     * instead of the plain label.
     */
    const [tried, setTried] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setShown(true);
                io.disconnect();
            },
            { threshold: 0.35 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <li ref={ref} className={`flex w-[88%] shrink-0 snap-start flex-col md:w-auto ${span}`}>
            <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-[var(--fg)]">{title}</h3>
                {tried ? (
                    <p className="text-xs text-[var(--fg-dim)]">{meta}</p>
                ) : (
                    // The dot is inline, so if the hint ever wraps it stays with the first line.
                    <p className="text-xs text-[var(--gold)]">
                        <span aria-hidden="true" className="pulse-dot mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)] align-middle" />
                        <span className="sr-only">Interactive demo: </span>
                        {hint}
                    </p>
                )}
            </div>

            {/*
             * The only box on the card: the demo itself. A phone: as tall as the
             * demo needs (with room held for it until it mounts). From md: the
             * height the demo is drawn for.
             */}
            <div
                onPointerDownCapture={() => setTried(true)}
                onKeyDownCapture={() => setTried(true)}
                className={`flex min-h-[20rem] flex-col border border-[var(--rule-strong)] bg-[var(--surface-card)] md:min-h-0 ${panel}`}
            >
                {shown && (
                    <div className="fade-in md:min-h-0 md:flex-1" style={{ animationDuration: "300ms" }}>
                        {/* A demo that breaks is replaced by a notice, in its own panel only. */}
                        <ErrorBoundary
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
                )}
            </div>

            <p className="mt-3 max-w-[40rem] text-pretty text-[13px] leading-[1.55] text-[var(--fg-muted)] md:text-sm">{desc}</p>
            {/* Non-breaking spaces keep each tool's name whole ("Tailwind CSS"). */}
            <p className="mt-1.5 font-mono text-xs leading-5 text-[var(--fg-dim)]">
                {tools.map((tool) => tool.replaceAll(" ", " ")).join(" · ")}
            </p>
        </li>
    );
}

/**
 * Five capabilities, each shown working rather than described: a bench of
 * live demos. From lg an uneven grid (the code and the wireframe big on top,
 * the trace, the chat and the sensor below); on a tablet two to a row, the
 * code across both; on a phone one per screen, swiped.
 */
export default function About() {
    return (
        <Section id="about" title="What I do" meta={`${services.length} demos`} wide>
            <SwipeRow
                className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-12 md:overflow-visible md:px-0 lg:grid-cols-12 [&::-webkit-scrollbar]:hidden"
                hintClassName="mt-2 text-right md:hidden"
            >
                {services.map((service) => (
                    <Bench key={service.title} service={service} />
                ))}
            </SwipeRow>
        </Section>
    );
}

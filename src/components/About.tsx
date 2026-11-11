"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Section from "./Section";
import ErrorBoundary from "./ErrorBoundary";
import FallbackNotice from "./FallbackNotice";
import CodeDemo from "./demos/CodeDemo";
import WireframeDemo from "./demos/WireframeDemo";
import TraceDemo from "./demos/TraceDemo";
import StreamDemo from "./demos/StreamDemo";
import SensorDemo from "./demos/SensorDemo";
import "./about.css";

/*
 * Each capability carries the tools it is done with, so there is no separate
 * "Tools I use" list to cross-reference. All sixteen tools are here, each
 * under the one place it is used.
 */
const services = [
    {
        title: "Code",
        desc: "I write software in TypeScript, Python and C++: web apps and the servers behind them, tools built on AI models, and firmware for small boards.",
        tools: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        meta: "Portrait.tsx, code from this site",
        hint: "watch it, then rerun",
        Demo: CodeDemo,
    },
    {
        title: "Design",
        desc: "Before I write any code, I work out the layout, the screens and what happens between them, usually in Figma.",
        tools: ["Figma"],
        meta: "this site's hero, wireframe → design",
        hint: "drag the slider",
        Demo: WireframeDemo,
    },
    {
        title: "Systems",
        desc: "Behind the screens, I plan APIs and databases (with DFDs and ERDs), set up Linux servers, and test things properly before they go live.",
        tools: ["PHP", "MySQL", "Linux (Ubuntu, Apache)", "Vercel"],
        meta: "POST /api/analyze",
        hint: "send the request again",
        Demo: TraceDemo,
    },
    {
        title: "AI",
        desc: "Adding AI to a product: chat, text generation, reading images, and connecting to LLM APIs like Gemini.",
        tools: ["Python", "LLM APIs", "Google Gemini"],
        meta: "a streamed reply",
        hint: "pick a question",
        Demo: StreamDemo,
    },
    {
        title: "Hardware",
        desc: "I program ESP32 boards in C++, wire up sensors, and send their data over LoRa to a server and a web dashboard. I’ve put this together and tested it on real hardware.",
        tools: ["ESP32", "Arduino (C++)", "LoRa", "MPU6050"],
        meta: "sensor → server, live",
        hint: "tap the chart",
        Demo: SensorDemo,
    },
];

const num = (i: number) => String(i + 1).padStart(2, "0");
const letter = (i: number) => String.fromCharCode(65 + i);

/**
 * Five capabilities as one system, laid out the way the reference shows its
 * interception system: the one selected working in a wide viewport, and
 * under it a row of five cards, A to E, each with its name, what it is and
 * what it is done with. Selecting another card opens its demo in the
 * viewport from the top, the way a scanner draws a frame (about.css). On a
 * tablet or a phone the cards are a row to swipe.
 *
 * The list is a real tab list with a roving tabindex: Tab lands on the
 * selected one, the arrow keys (both pairs, since the list is vertical on a
 * laptop and a row on a phone), Home and End move along it, and selection
 * follows focus. Native `focusgroup` only moves along a row, so it is not
 * used. Panels that are not selected are hidden "until found", so the
 * browser's find-in-page still reaches their words and opens them.
 *
 * A demo mounts only once the section has been on screen, so the ones that
 * play once (the code typing itself, the trace, the reply) play while
 * someone is looking. Switching back to one starts it again.
 */
export default function About() {
    const root = useRef<HTMLDivElement>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const panels = useRef<(HTMLDivElement | null)[]>([]);
    const [active, setActive] = useState(0);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setShown(true);
                io.disconnect();
            },
            { threshold: 0.3 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Hidden "until found" rather than plainly hidden; find-in-page opening one selects its tab.
    useEffect(() => {
        const cleanups = panels.current.map((panel, i) => {
            if (!panel) return () => {};
            if (i !== active) panel.setAttribute("hidden", "until-found");
            const onMatch = () => setActive(i);
            panel.addEventListener("beforematch", onMatch);
            return () => panel.removeEventListener("beforematch", onMatch);
        });
        return () => cleanups.forEach((stop) => stop());
    }, [active]);

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const last = services.length - 1;
        const next =
            event.key === "ArrowDown" || event.key === "ArrowRight"
                ? (active + 1) % services.length
                : event.key === "ArrowUp" || event.key === "ArrowLeft"
                  ? (active + last) % services.length
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? last
                      : -1;
        if (next < 0) return;
        event.preventDefault();
        select(next);
        tabs.current[next]?.focus();
    };

    const select = (i: number) => {
        setActive(i);
        // On a phone the row of tabs scrolls; bring the chosen one into view without moving the page.
        tabs.current[i]?.scrollIntoView({ block: "nearest", inline: "nearest", container: "nearest" } as ScrollIntoViewOptions);
    };

    return (
        <Section id="about" index="03" title="What I do" meta={`${services.length} demos`} wide>
            <div ref={root} className="sys">
                <div role="tablist" aria-label="What I do" onKeyDown={onKeyDown} className="sys-tabs scroll-fade">
                    {services.map((service, i) => (
                        <button
                            key={service.title}
                            ref={(node) => {
                                tabs.current[i] = node;
                            }}
                            type="button"
                            role="tab"
                            id={`sys-tab-${i}`}
                            aria-selected={i === active}
                            // Named by its title alone; the description on the card is read in the panel instead.
                            aria-labelledby={`sys-name-${i}`}
                            tabIndex={i === active ? 0 : -1}
                            onClick={() => select(i)}
                            // Selection follows focus, however focus got there.
                            onFocus={() => i !== active && select(i)}
                            className="sys-tab"
                        >
                            <span className="label sys-tab-num">{letter(i)}.</span>
                            <span id={`sys-name-${i}`} className="sys-tab-title">
                                {service.title}
                            </span>
                            <span aria-hidden="true" className="sys-tab-desc">
                                {service.desc}
                            </span>
                            {/* Non-breaking spaces keep each tool's name whole ("Tailwind CSS"). */}
                            <span aria-hidden="true" className="label sys-tab-tools">
                                {service.tools.map((tool) => tool.replaceAll(" ", " ")).join(" · ")}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="sys-panels">
                    {services.map((service, i) => {
                        const { Demo } = service;
                        const on = i === active;
                        return (
                            <div
                                key={service.title}
                                ref={(node) => {
                                    panels.current[i] = node;
                                }}
                                role="tabpanel"
                                aria-labelledby={`sys-tab-${i}`}
                                hidden={!on}
                                className="sys-panel"
                            >
                                <div className="sys-panel-inner">
                                    <div className="sys-view viewport">
                                        <p aria-hidden="true" className="sys-view-head label">
                                            <span>
                                                Fig {num(i)} <span className="text-[var(--fg-dim)]">/ {service.meta}</span>
                                            </span>
                                            <span className="text-[var(--accent)]">
                                                <span className="pulse-dot mr-1.5 inline-block h-1.5 w-1.5 bg-[var(--accent)] align-middle" />
                                                {service.hint}
                                            </span>
                                        </p>
                                        {/* A working piece of interface, with its own borders and controls. */}
                                        <div className="sys-demo" data-ui>
                                            {on && shown && (
                                                // A demo that breaks is replaced by a notice, in its own panel only.
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
                                            )}
                                        </div>
                                        {on && <span aria-hidden="true" className="sys-scan" />}
                                    </div>
                                    {/* The card shows these; here they are read out with the panel. */}
                                    <div className="sr-only">
                                        <p>{service.desc}</p>
                                        <p>Tools: {service.tools.join(", ")}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Section>
    );
}

"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
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

/* Held only on a screen with room for the list beside the viewport, and only where motion is welcome. */
const LIVE = "(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)";
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Five capabilities as the reference shows its interceptor's specs: a
 * lettered list down the left, A. to E. with the letters in green, and the
 * picture large beside it, here a working demo in a viewport. On a laptop
 * the section holds still for a screen of scroll per capability and the
 * scroll moves the selection down the list: the one on show opens out to
 * its description and tools, the rest wait at 60%, and a green line along
 * its edge fills as the page scrolls through its stretch. Choosing one
 * goes to its stretch. Elsewhere, and with motion turned down, the same
 * list and viewport sit still and choosing one selects it.
 *
 * The list is a real tab list with a roving tabindex: Tab lands on the
 * selected one, the arrow keys (both pairs), Home and End move along it,
 * and selection follows focus. Panels that are not selected are hidden
 * "until found", so the browser's find-in-page still reaches their words.
 *
 * A demo mounts only once the section has been on screen, so the ones that
 * play once (the code typing itself, the trace, the reply) play while
 * someone is looking. Switching back to one starts it again.
 */
export default function About() {
    const root = useRef<HTMLDivElement>(null);
    const track = useRef<HTMLDivElement>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const panels = useRef<(HTMLDivElement | null)[]>([]);
    const [active, setActive] = useState(0);
    const [shown, setShown] = useState(false);
    const held = useRef(false);

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

    // On the held stage the scroll chooses: the capability whose stretch it is, and how far through it (--fill).
    useEffect(() => {
        const el = track.current;
        const stage = root.current;
        if (!el || !stage) return;
        const live = window.matchMedia(LIVE);
        const n = services.length;
        let frame = 0;
        const update = () => {
            frame = 0;
            if (!live.matches) return;
            const sticky = parseFloat(getComputedStyle(stage).top) || 0;
            const r = el.getBoundingClientRect();
            const at = clamp((sticky - r.top) / Math.max(1, r.height - stage.offsetHeight)) * n;
            const i = Math.min(n - 1, Math.floor(at));
            setActive(i);
            stage.style.setProperty("--fill", clamp(at - i).toFixed(3));
        };
        const request = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        const sync = () => {
            held.current = live.matches;
            el.toggleAttribute("data-live", live.matches);
            if (!live.matches) stage.style.removeProperty("--fill");
            request();
        };
        sync();
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
        live.addEventListener("change", sync);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", request);
            window.removeEventListener("resize", request);
            live.removeEventListener("change", sync);
        };
    }, []);

    const select = (i: number) => {
        const el = track.current;
        const stage = root.current;
        if (held.current && el && stage) {
            // Held: go to the capability's stretch, and the scroll selects it.
            const sticky = parseFloat(getComputedStyle(stage).top) || 0;
            const span = el.offsetHeight - stage.offsetHeight;
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - sticky + (span * (i + 0.05)) / services.length, behavior: "instant" });
            return;
        }
        setActive(i);
    };

    // Hidden "until found" rather than plainly hidden; find-in-page opening one selects it.
    useEffect(() => {
        const cleanups = panels.current.map((panel, i) => {
            if (!panel) return () => {};
            if (i !== active) panel.setAttribute("hidden", "until-found");
            const onMatch = () => select(i);
            panel.addEventListener("beforematch", onMatch);
            return () => panel.removeEventListener("beforematch", onMatch);
        });
        return () => cleanups.forEach((stop) => stop());
        // select only reads refs; re-binding on `active` alone is enough.
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return (
        <Section id="about" index="03" title="What I do" meta={`${services.length} demos`} wide>
            <div ref={track} className="sys-track">
                <div ref={root} className="sys">
                    <div role="tablist" aria-label="What I do" aria-orientation="vertical" onKeyDown={onKeyDown} className="sys-tabs">
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
                                // Named by its title alone; the description is read in the panel instead.
                                aria-labelledby={`sys-name-${i}`}
                                tabIndex={i === active ? 0 : -1}
                                onClick={() => select(i)}
                                // Selection follows focus, however focus got there.
                                onFocus={() => i !== active && select(i)}
                                data-cursor="Run"
                                style={{ "--k": i } as CSSProperties}
                                className="sys-tab"
                            >
                                <span className="sys-tab-head">
                                    <span className="sys-tab-num label">{letter(i)}.</span>
                                    <span id={`sys-name-${i}`} className="sys-tab-title">
                                        {service.title}
                                    </span>
                                </span>
                                {/* Opens out under the title while this one is on show. */}
                                <span aria-hidden="true" className="sys-tab-more">
                                    <span className="sys-tab-inner">
                                        <span className="sys-tab-desc">{service.desc}</span>
                                        {/* Non-breaking spaces keep each tool's name whole ("Tailwind CSS"). */}
                                        <span className="label sys-tab-tools">{service.tools.map((tool) => tool.replaceAll(" ", " ")).join(" · ")}</span>
                                    </span>
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
                                        <div className="sys-demo" data-ui data-cursor="Try it">
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
                                    {/* The list shows these; here they are read out with the panel. */}
                                    <div className="sr-only">
                                        <p>{service.desc}</p>
                                        <p>Tools: {service.tools.join(", ")}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* A way out of the held scene. */}
                    <a href="#certificates" className="scene-skip label" data-scramble>
                        Skip <span aria-hidden="true">↓</span>
                    </a>
                </div>
            </div>
        </Section>
    );
}

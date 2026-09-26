"use client";

import { useEffect, useId, useRef, useState } from "react";

/*
 * This site's own hero twice, on the same coordinates: the wireframe it
 * started as and the design it became. A slider wipes between the two, so
 * every box in the wireframe lands exactly on the thing it turned into.
 *
 * Every wireframe stroke is a path with pathLength="1", so one CSS rule
 * draws them all regardless of their real length.
 */
const X0 = 40;
const X1 = 600;
const GUTTER = 8;
const COL = (X1 - X0 - GUTTER * 11) / 12;
const PX = X0 + 7 * (COL + GUTTER) - 70; // portrait's left edge
const TITLE_X = X0 + 3 * (COL + GUTTER);

const r = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}v${-h}`;
const d = (i: number) => ({ "--delay": `${i}ms` }) as React.CSSProperties;

// Frame 181 in colour: this demo greys it through its own SVG filter, so it keeps the original.
const PORTRAIT = `/_next/image?url=${encodeURIComponent("/frames/still-full.jpg")}&w=640&q=75`;
const serif = { fontFamily: "var(--font-cormorant)" };

/*
 * Each picture comes in two shapes, and the panel's own shape picks one (a
 * size container query, so there is no measuring and no flash of the wrong
 * one). A phone's panel is taller than it is wide: there the desktop hero
 * would shrink to a strip with empty bands above and below, so it gets the
 * hero as a phone shows it, on the phone's 4-column grid.
 *
 * `overflow="visible"` plus an oversized ground rect fills whatever
 * letterbox is left with the picture's own background.
 */
// .wf-wide / .wf-tall swap in globals.css, on the panel's aspect ratio.
const WIDE = "wf-wide absolute inset-0 h-full w-full";
const TALL = "wf-tall absolute inset-0 h-full w-full";
const GROUND = { x: -2000, y: -2000, width: 5000, height: 5000 };
const sans = { fontFamily: "var(--font-geist)" };
const mono = { fontFamily: "var(--font-geist-mono)" };

function Wireframe() {
    // No vector-effect="non-scaling-stroke" here: it measures dashes in screen
    // pixels while pathLength normalises in user units, so any scale other
    // than 1 leaves every drawn stroke short of its end.
    const stroke = { fill: "none", stroke: "var(--fg-muted)", strokeWidth: 1 } as const;
    const block = { fill: "var(--fg-faint)" };

    return (
        <svg viewBox="0 0 640 400" overflow="visible" className={WIDE} aria-hidden="true">
            <rect {...GROUND} fill="var(--surface-card)" />
            {Array.from({ length: 12 }, (_, i) => (
                <rect key={i} className="fade-in" style={d(i * 30)} x={X0 + i * (COL + GUTTER)} y={0} width={COL} height={400} fill="var(--gold)" fillOpacity={0.06} />
            ))}

            <rect className="fade-in" style={d(350)} x={X0} y={22} width={58} height={8} {...block} />
            {[0, 1, 2, 3].map((i) => (
                <rect key={i} className="fade-in" style={d(380 + i * 40)} x={X1 - 128 + i * 34} y={23} width={24} height={6} {...block} />
            ))}
            <path className="draw" style={d(300)} pathLength={1} d="M0 48H640" {...stroke} />

            <path className="draw" style={d(500)} pathLength={1} d={r(PX, 48, 640 - PX, 262)} {...stroke} />
            <path className="draw" style={d(800)} pathLength={1} d={`M${PX} 48L640 310M640 48L${PX} 310`} {...stroke} strokeOpacity={0.4} />

            <rect className="fade-in" style={d(880)} x={X0} y={171} width={108} height={6} {...block} />
            <rect className="fade-in" style={d(900)} x={X0} y={186} width={272} height={34} fill="var(--fg-soft)" />
            <rect className="fade-in" style={d(1000)} x={X0} y={236} width={92} height={7} {...block} />
            <path className="draw" style={d(1050)} pathLength={1} d={r(X0, 256, 62, 18)} {...stroke} />
            <rect className="fade-in" style={d(1100)} x={X0 + 76} y={263} width={44} height={5} {...block} />

            <path className="draw" style={d(1150)} pathLength={1} d={`M${X0} 292H${X0 + 7 * (COL + GUTTER) - GUTTER}`} {...stroke} />
            {[0, 1, 2].map((i) => (
                <rect key={i} className="fade-in" style={d(1250 + i * 60)} x={X0 + i * 108} y={304} width={70} height={5} {...block} />
            ))}

            <path className="draw" style={d(1350)} pathLength={1} d="M0 336H640" {...stroke} />
            <rect className="fade-in" style={d(1450)} x={X0} y={354} width={12} height={5} fill="var(--gold)" />
            <rect className="fade-in" style={d(1500)} x={TITLE_X} y={350} width={90} height={20} fill="var(--fg-soft)" />

            <g className="fade-in" style={{ ...d(1650), ...mono }} fill="var(--gold)" fontSize={10}>
                <path d={`M${X0 + COL} 392V384M${X0 + COL + GUTTER} 392V384M${X0 + COL} 388H${X0 + COL + GUTTER}`} stroke="var(--gold)" strokeWidth={1} />
                <text x={X0 + COL + GUTTER + 6} y={392}>24</text>
                <text x={X1} y={392} textAnchor="end">12 col · 1280</text>
            </g>
        </svg>
    );
}

function Design({ id }: { id: string }) {
    return (
        <svg viewBox="0 0 640 400" overflow="visible" className={WIDE} aria-hidden="true">
            <defs>
                <filter id={`${id}-grey`}>
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <linearGradient id={`${id}-fade-x`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#0d1011" />
                    <stop offset="0.45" stopColor="#0d1011" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={`${id}-fade-y`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0.6" stopColor="#0d1011" stopOpacity="0" />
                    <stop offset="1" stopColor="#0d1011" />
                </linearGradient>
            </defs>
            <rect {...GROUND} fill="#0d1011" />

            {/* Header */}
            <text x={X0} y={31} fontSize={9} fontWeight={500} fill="var(--fg)" style={sans}>
                Fadhlan Bani
            </text>
            {["Work", "About", "Writing", "Contact"].map((label, i) => (
                <text key={label} x={X1 - 128 + i * 34} y={29} fontSize={6.5} fill="var(--fg-muted)" style={sans}>
                    {label}
                </text>
            ))}
            <line x1={0} x2={640} y1={48} y2={48} stroke="var(--rule)" />

            {/* Portrait, treated the way the live hero treats it */}
            <image href={PORTRAIT} x={PX} y={48} width={640 - PX} height={262} preserveAspectRatio="xMidYMin slice" filter={`url(#${id}-grey)`} />
            <rect x={PX} y={48} width={640 - PX} height={262} fill="var(--cloak-bright)" opacity={0.6} style={{ mixBlendMode: "color" }} />
            <rect x={PX} y={48} width={640 - PX} height={262} fill={`url(#${id}-fade-x)`} />
            <rect x={PX} y={48} width={640 - PX} height={262} fill={`url(#${id}-fade-y)`} />

            {/* Text */}
            <text x={X0} y={177} fontSize={7} fill="var(--fg-muted)" style={sans}>
                Developer &amp; designer from Indonesia
            </text>
            <text x={X0} y={219} fontSize={52} fontWeight={500} fill="var(--fg)" style={serif}>
                Fadhlan Bani
            </text>
            <text x={X0} y={242} fontSize={7.5} fill="var(--fg-soft)" style={sans}>
                A learner and a builder.
            </text>
            <rect x={X0} y={256} width={62} height={18} fill="var(--fg)" />
            <text x={X0 + 31} y={267.5} fontSize={7} textAnchor="middle" fill="#0d1011" style={sans}>
                Email me
            </text>
            <text x={X0 + 76} y={267.5} fontSize={7} fill="var(--fg-soft)" textDecoration="underline" style={sans}>
                See my work
            </text>

            {/* Facts */}
            <line x1={X0} x2={X0 + 7 * (COL + GUTTER) - GUTTER} y1={292} y2={292} stroke="var(--rule-strong)" />
            {[
                ["Based in", "Indonesia"],
                ["Focus", "Software, AI, IoT, UI"],
                ["Stack", "Next.js, React, TS"],
            ].map(([label, value], i) => (
                <g key={label} style={sans}>
                    <text x={X0 + i * 108} y={303} fontSize={5.5} fill="var(--fg-dim)">
                        {label}
                    </text>
                    <text x={X0 + i * 108} y={313} fontSize={6.5} fill="var(--fg-soft)">
                        {value}
                    </text>
                </g>
            ))}

            {/* Next section */}
            <line x1={0} x2={640} y1={336} y2={336} stroke="var(--rule)" />
            <text x={X0} y={360} fontSize={7} fill="var(--gold)" style={mono}>
                01
            </text>
            <text x={TITLE_X} y={369} fontSize={24} fontWeight={500} fill="var(--fg)" style={serif}>
                Work
            </text>
        </svg>
    );
}


/*
 * The phone hero, down to its buttons: 360 wide, gutters of 20, four columns
 * with 16 between. Drawn nearly square so the panel on a phone stays short.
 */
const MH = 340;
const MX0 = 20;
const MX1 = 340;
const MGUTTER = 16;
const MCOL = (MX1 - MX0 - MGUTTER * 3) / 4;
const MLINKS = [
    { label: "Work", x: 212, w: 17 },
    { label: "About", x: 238, w: 21 },
    { label: "Writing", x: 268, w: 27 },
    { label: "Contact", x: 304, w: 32 },
];
const MLINE = { text: "A learner and a builder.", w: 124 };
const MFACTS = [
    { label: "Based in", value: "Indonesia", lw: 29, vw: 41 },
    { label: "Focus", value: "Software, AI, IoT, UI design", lw: 19, vw: 128 },
];
const PORTRAIT_SQUARE = `/_next/image?url=${encodeURIComponent("/frames/still-square.jpg")}&w=640&q=75`;

function WireframeTall() {
    const stroke = { fill: "none", stroke: "var(--fg-muted)", strokeWidth: 1 } as const;
    const block = { fill: "var(--fg-faint)" };

    return (
        <svg viewBox={`0 0 360 ${MH}`} overflow="visible" className={TALL} aria-hidden="true">
            <rect {...GROUND} fill="var(--surface-card)" />
            {Array.from({ length: 4 }, (_, i) => (
                <rect key={i} className="fade-in" style={d(i * 60)} x={MX0 + i * (MCOL + MGUTTER)} y={0} width={MCOL} height={MH} fill="var(--gold)" fillOpacity={0.06} />
            ))}

            <rect className="fade-in" style={d(350)} x={MX0} y={13} width={58} height={8} {...block} />
            {MLINKS.map((l, i) => (
                <rect key={l.label} className="fade-in" style={d(380 + i * 40)} x={l.x} y={15} width={l.w} height={5} {...block} />
            ))}
            <path className="draw" style={d(300)} pathLength={1} d="M0 32H360" {...stroke} />

            <path className="draw" style={d(500)} pathLength={1} d={r(0, 32, 360, 150)} {...stroke} />
            <path className="draw" style={d(800)} pathLength={1} d="M0 32L360 182M360 32L0 182" {...stroke} strokeOpacity={0.4} />

            <rect className="fade-in" style={d(880)} x={MX0} y={166} width={148} height={6} {...block} />
            <rect className="fade-in" style={d(900)} x={MX0} y={182} width={192} height={30} fill="var(--fg-soft)" />
            <rect className="fade-in" style={d(1000)} x={MX0} y={223} width={MLINE.w} height={6} {...block} />
            <path className="draw" style={d(1200)} pathLength={1} d={r(MX0, 243, 70, 22)} {...stroke} />
            <rect className="fade-in" style={d(1250)} x={100} y={252} width={48} height={5} {...block} />

            <path className="draw" style={d(1300)} pathLength={1} d={`M${MX0} 278H${MX1}`} {...stroke} />
            {MFACTS.map((f, i) => (
                <g key={f.label} className="fade-in" style={d(1350 + i * 60)}>
                    <rect x={MX0} y={291 + i * 17} width={f.lw} height={5} {...block} />
                    <rect x={95} y={290 + i * 17} width={f.vw} height={6} {...block} />
                </g>
            ))}
            <g className="fade-in" style={{ ...d(1500), ...mono }} fill="var(--gold)" fontSize={7.5}>
                <path d={`M${MX0 + MCOL} 336V329M${MX0 + MCOL + MGUTTER} 336V329M${MX0 + MCOL} 332.5H${MX0 + MCOL + MGUTTER}`} stroke="var(--gold)" strokeWidth={1} />
                <text x={MX0 + MCOL + MGUTTER + 5} y={336}>16</text>
                <text x={MX1} y={336} textAnchor="end">4 col · 390</text>
            </g>
        </svg>
    );
}

function DesignTall({ id }: { id: string }) {
    return (
        <svg viewBox={`0 0 360 ${MH}`} overflow="visible" className={TALL} aria-hidden="true">
            <defs>
                <filter id={`${id}-m-grey`}>
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <linearGradient id={`${id}-m-fade`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0.3" stopColor="#0d1011" stopOpacity="0" />
                    <stop offset="1" stopColor="#0d1011" />
                </linearGradient>
                <linearGradient id={`${id}-m-sides`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0.04" stopColor="#0d1011" />
                    <stop offset="0.2" stopColor="#0d1011" stopOpacity="0" />
                    <stop offset="0.8" stopColor="#0d1011" stopOpacity="0" />
                    <stop offset="0.96" stopColor="#0d1011" />
                </linearGradient>
                <clipPath id={`${id}-m-clip`}>
                    <rect x={0} y={32} width={360} height={150} />
                </clipPath>
            </defs>
            <rect {...GROUND} fill="#0d1011" />

            {/* Header */}
            <text x={MX0} y={21} fontSize={9.5} fontWeight={500} fill="var(--fg)" style={sans}>
                Fadhlan Bani
            </text>
            {MLINKS.map((l) => (
                <text key={l.label} x={l.x} y={20.5} fontSize={7.5} fill="var(--fg-muted)" style={sans}>
                    {l.label}
                </text>
            ))}
            <line x1={0} x2={360} y1={32} y2={32} stroke="var(--rule)" />

            {/* Portrait: the square crop a phone loads, framed from the hair to the chin */}
            <g clipPath={`url(#${id}-m-clip)`}>
                <image href={PORTRAIT_SQUARE} x={30} y={-4} width={300} height={300} filter={`url(#${id}-m-grey)`} />
                <rect x={0} y={32} width={360} height={150} fill="var(--cloak-bright)" opacity={0.6} style={{ mixBlendMode: "color" }} />
                <rect x={0} y={32} width={360} height={150} fill={`url(#${id}-m-sides)`} />
                <rect x={0} y={32} width={360} height={150} fill={`url(#${id}-m-fade)`} />
            </g>
            <text x={MX1} y={46} fontSize={7} textAnchor="end" fill="var(--fg-muted)" style={mono}>
                Frame 181 / 181
            </text>

            {/* Text, riding up over the portrait's faded edge */}
            <text x={MX0} y={172} fontSize={8.5} fill="var(--fg-muted)" style={sans}>
                Developer &amp; designer from Indonesia
            </text>
            <text x={MX0} y={210} fontSize={38} fontWeight={500} fill="var(--fg)" style={serif}>
                Fadhlan Bani
            </text>
            <text x={MX0} y={229} fontSize={10.5} fill="var(--fg-soft)" style={sans}>
                {MLINE.text}
            </text>
            <rect x={MX0} y={243} width={70} height={22} fill="var(--fg)" />
            <text x={MX0 + 35} y={257.5} fontSize={8.5} textAnchor="middle" fill="#0d1011" style={sans}>
                Email me
            </text>
            <text x={100} y={257.5} fontSize={8.5} fill="var(--fg-soft)" textDecoration="underline" style={sans}>
                See my work
            </text>

            {/* Facts, label beside value, as a phone shows them */}
            <line x1={MX0} x2={MX1} y1={278} y2={278} stroke="var(--rule-strong)" />
            {MFACTS.map((f, i) => (
                <g key={f.label} style={sans}>
                    <text x={MX0} y={296 + i * 17} fontSize={7} fill="var(--fg-dim)">
                        {f.label}
                    </text>
                    <text x={95} y={296 + i * 17} fontSize={8.5} fill="var(--fg-soft)">
                        {f.value}
                    </text>
                </g>
            ))}
        </svg>
    );
}

export default function WireframeDemo() {
    const id = useId().replace(/:/g, "");
    const [pos, setPos] = useState(100);
    const touched = useRef(false);
    const boxRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);

    /** Put the divider under the pointer. */
    const take = (clientX: number) => {
        const box = boxRef.current?.getBoundingClientRect();
        if (!box) return;
        touched.current = true;
        setPos(Math.min(100, Math.max(0, ((clientX - box.left) / box.width) * 100)));
    };

    // An opening sweep shows what the slider does: wireframe, then design,
    // then settle in the middle. It stops the moment someone takes over.
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const t = setTimeout(() => setPos(50), 0);
            return () => clearTimeout(t);
        }
        const keys = [
            [0, 100],
            [1600, 100],
            [2600, 18],
            [3500, 18],
            [4400, 55],
        ];
        const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            if (touched.current) return;
            // A rAF timestamp is the frame's start time and can land a little
            // before the performance.now() taken above; clamp so t is never
            // negative (k would be 0 and keys[-1] undefined).
            const t = Math.max(0, now - start);
            const k = Math.max(1, keys.findIndex(([at]) => at > t));
            if (keys[keys.length - 1][0] <= t) {
                setPos(keys[keys.length - 1][1]);
                return;
            }
            const [t0, v0] = keys[k - 1];
            const [t1, v1] = keys[k];
            setPos(v0 + (v1 - v0) * ease((t - t0) / (t1 - t0)));
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        /*
         * The whole picture is the handle. With `touch-action: pan-y` a finger
         * moving up or down still scrolls the page (the browser takes it and
         * cancels the pointer), and a sideways one is ours. A mouse moves the
         * divider on press; a finger only once it has clearly gone sideways, or
         * on a tap. Browsers still deliver a move or two before they cancel a
         * vertical scroll, so without that check scrolling past the demo would
         * make the divider jump to wherever the finger was.
         */
        <div
            ref={boxRef}
            onPointerDown={(e) => {
                drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
                if (e.pointerType === "mouse") {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    take(e.clientX);
                }
            }}
            onPointerMove={(e) => {
                const d = drag.current;
                if (!d || d.id !== e.pointerId) return;
                if (!d.moved && e.pointerType !== "mouse") {
                    const dx = Math.abs(e.clientX - d.x);
                    const dy = Math.abs(e.clientY - d.y);
                    if (dx < 6 && dy < 6) return;
                    // Mostly vertical: a scroll, not a drag. Let it go.
                    if (dy >= dx) {
                        drag.current = null;
                        return;
                    }
                    e.currentTarget.setPointerCapture(e.pointerId);
                }
                d.moved = true;
                take(e.clientX);
            }}
            onPointerUp={(e) => {
                if (drag.current && !drag.current.moved) take(e.clientX);
                drag.current = null;
            }}
            onPointerCancel={() => (drag.current = null)}
            style={{ touchAction: "pan-y" }}
            className="relative aspect-[360/340] max-h-[24rem] w-full cursor-ew-resize select-none overflow-hidden [container-type:size] md:aspect-auto md:h-full md:max-h-none has-[input:focus-visible]:outline has-[input:focus-visible]:outline-1 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-[var(--gold)]"
        >
            <Design id={id} />
            <DesignTall id={id} />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
                <Wireframe />
                <WireframeTall />
            </div>

            <span
                className="pointer-events-none absolute left-3 top-3 border border-[var(--rule-strong)] bg-[var(--surface)]/80 px-1.5 py-0.5 font-mono text-[10px] text-[var(--fg-soft)] transition-opacity"
                style={{ opacity: pos > 14 ? 1 : 0 }}
            >
                wireframe
            </span>
            <span
                className="pointer-events-none absolute right-3 top-3 border border-[var(--rule-strong)] bg-[var(--surface)]/80 px-1.5 py-0.5 font-mono text-[10px] text-[var(--fg-soft)] transition-opacity"
                style={{ opacity: pos < 86 ? 1 : 0 }}
            >
                design
            </span>

            {/* The divider and its grip. */}
            <div className="pointer-events-none absolute inset-y-0 w-px bg-[var(--gold)]" style={{ left: `${pos}%` }}>
                <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-[var(--gold)] bg-[var(--surface)] font-mono text-xs text-[var(--gold)] md:h-7 md:w-7 md:text-[11px]">
                    ↔
                </span>
            </div>

            {/* Keyboard and screen readers get a real range input: arrow keys, Home, End. */}
            <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={pos}
                onKeyDown={() => (touched.current = true)}
                onChange={(e) => {
                    touched.current = true;
                    setPos(Number(e.target.value));
                }}
                aria-label="Compare the wireframe with the finished design"
                className="sr-only"
            />
        </div>
    );
}

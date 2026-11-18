"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { circle, cuboid, lines, liveWire, polyline, seg, stage, type V } from "../three/wire";

/*
 * The What I do demos' pictures in Three.js (About.tsx): each demo keeps its own words, numbers and controls, and
 * the part that shows what is happening is drawn here in 3D, from the demo's own state. Every scene is a canvas
 * over its place in the demo, one CSS pixel to a unit at the front, so what is drawn at the front lines up with the
 * page. Where WebGL is not there, the flat picture stays.
 */

// No depth fade, for what is drawn level with the page.
const FLAT: [number, number] = [1e5, 2e5];
const camOf = (h: number) => h / 2 / Math.tan((15 * Math.PI) / 180);

/**
 * Runs `make` once on a host div with a getter for the latest state, and redraws it when the state changes. `make`
 * returns the stage's controls, or null without WebGL; `onLive` hears whether it drew.
 */
function useScene<S>(state: S, make: (host: HTMLDivElement, get: () => S) => ReturnType<typeof stage>, onLive?: (live: boolean) => void) {
    const ref = useRef<HTMLDivElement>(null);
    const latest = useRef(state);
    const ctl = useRef<ReturnType<typeof stage>>(null);
    useEffect(() => {
        latest.current = state;
        ctl.current?.redraw();
    });
    useEffect(() => {
        const host = ref.current;
        if (!host) return;
        const c = make(host, () => latest.current);
        ctl.current = c;
        onLive?.(!!c);
        return () => {
            c?.stop();
            ctl.current = null;
        };
        // Built once; the state is read through `latest`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return ref;
}

/* ------------------------------------------------------------------ Code: the frames in load order */

/**
 * The 181 frames of the old head turn as slats round a turning reel: each lights as loadOrder() reaches it, the
 * first ones (enough to start the turn) in green, the rest in grey, and a marker stands at the newest.
 */
export function FrameReel({ loaded, total, rank, playable }: { loaded: number; total: number; rank: number[]; playable: number }) {
    const ref = useScene({ loaded }, (host, get) => {
        const reel = new THREE.Group();
        const dim = liveWire(total * 4 + 8, { color: "#3d4d43", fade: FLAT });
        const first = liveWire(total * 4, { fade: FLAT });
        const rest = liveWire(total * 4, { color: "#c2c2c2", fade: FLAT });
        reel.add(dim.mesh, first.mesh, rest.mesh);
        let R = 100, H = 120, shown = -1;
        const build = () => {
            const d = lines(), f = lines(), r = lines();
            const { loaded: n } = get();
            for (let k = 0; k < total; k++) {
                const a = (k / total) * Math.PI * 2;
                const x = Math.cos(a) * R, z = Math.sin(a) * R;
                const lit = rank[k + 1]! < n;
                const target = !lit ? d : rank[k + 1]! < playable ? f : r;
                seg(target, [x, -H / 2, z], [x, H / 2, z]);
            }
            // The rims, top and bottom.
            for (const y of [-H / 2 - 6, H / 2 + 6]) polyline(d, circle(R, 90, (a) => [Math.cos(a), y / R, Math.sin(a)]), true);
            dim.set(d);
            first.set(f);
            rest.set(r);
            shown = n;
        };
        return stage(
            host,
            ({ scene, w, h }) => {
                scene.add(reel);
                R = Math.min(w * 0.36, h * 0.32);
                H = h * 0.42;
                build();
            },
            (_dt, time) => {
                if (get().loaded !== shown) build();
                reel.rotation.set(0.32, time * 0.25, 0);
                return true;
            },
        );
    });
    return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}

/* ------------------------------------------------------------------ Systems: the trace's spans as blocks */

/**
 * Each span of the trace as a block standing back from its bar (the bar is the block's face, drawn by the page),
 * and the playhead as a plane through them. Reads the bars where the page has put them (`[data-bar]`).
 */
export function TraceBlocks({ t, total }: { t: number; total: number }) {
    const ref = useScene({ t }, (host, get) => {
        const blocks = liveWire(16 * 12, { color: "#808080", fade: FLAT });
        const lit = liveWire(16 * 12, { fade: FLAT });
        const head = liveWire(24, { fade: FLAT });
        let w = 1, h = 1, last = -1;
        return stage(
            host,
            ({ scene, w: W, h: H }) => {
                scene.add(blocks.mesh, lit.mesh, head.mesh);
                w = W;
                h = H;
                last = -1;
            },
            () => {
                const now = get().t;
                if (now === last) return false;
                last = now;
                const box = host.getBoundingClientRect();
                const b = lines(), g = lines();
                let left = 0, right = 0;
                host.parentElement?.querySelectorAll<HTMLElement>("[data-bar]").forEach((el) => {
                    const r = el.getBoundingClientRect();
                    const track = el.parentElement!.getBoundingClientRect();
                    left = track.left - box.left - w / 2;
                    right = track.right - box.left - w / 2;
                    if (r.width < 0.5) return;
                    const x0 = r.left - box.left - w / 2, x1 = x0 + r.width;
                    const y1 = h / 2 - (r.top - box.top), y0 = y1 - r.height;
                    const depth = r.height * 1.6 + 4;
                    cuboid(el.dataset.bar === "lit" ? g : b, [x0, y0, -depth], [x1, y1, 0]);
                });
                blocks.set(b);
                lit.set(g);
                // The playhead: a plane through the blocks at the time reached.
                const x = left + (right - left) * Math.min(1, now / total);
                const p = lines();
                const d = h * 0.18;
                polyline(p, [[x, -h / 2, 0], [x, h / 2, 0], [x, h / 2, -d], [x, -h / 2, -d]], true);
                for (let i = 1; i < 6; i++) seg(p, [x, -h / 2 + (h * i) / 6, 0], [x, -h / 2 + (h * i) / 6, -d]);
                head.set(p);
                return true;
            },
        );
    });
    return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}

/* ------------------------------------------------------------------ Hardware: the signal as a waterfall */

/**
 * The acceleration as a waterfall: the window on show at the front, where the page draws it, and the windows
 * before it standing back one behind another, so an impact is seen moving off into the distance. The fall
 * threshold is a plane through them all.
 */
export function SignalWaterfall({ n, value, window: win, yMax, threshold }: { n: number; value: (i: number) => number; window: number; yMax: number; threshold: number }) {
    const ROWS = 14;
    const STEP = 4;
    const ref = useScene({ n, value }, (host, get) => {
        const rows = liveWire(ROWS * win, { color: "#c2c2c2" });
        const plane = liveWire(64, { fade: FLAT });
        const group = new THREE.Group();
        group.add(rows.mesh, plane.mesh);
        let w = 1, h = 1, last = -1, dz = 20;
        const yOf = (v: number) => h / 2 - (1 - (Math.min(v, yMax) / yMax) * 0.95) * h;
        return stage(
            host,
            ({ scene, w: W, h: H }) => {
                scene.add(group);
                w = W;
                h = H;
                dz = h * 0.16;
                const cam = camOf(h);
                (rows.mesh.material as THREE.ShaderMaterial).uniforms.uFade.value.set(cam, cam + ROWS * dz * 1.1);
                last = -1;
            },
            () => {
                const { n: now, value: at } = get();
                if (now === last) return false;
                last = now;
                const l = lines();
                // The windows before the one on show (the page draws that one), further back the older they are.
                for (let k = 1; k <= ROWS; k++) {
                    const end = now - k * STEP;
                    const z = -k * dz;
                    let prev: V | null = null;
                    for (let i = 0; i < win; i++) {
                        const p: V = [(i / (win - 1)) * w - w / 2, yOf(at(end - win + 1 + i)), z];
                        if (prev) seg(l, prev, p);
                        prev = p;
                    }
                }
                rows.set(l);
                const p = lines();
                const y = yOf(threshold);
                const back = -ROWS * dz;
                polyline(p, [[-w / 2, y, 0], [w / 2, y, 0], [w / 2, y, back], [-w / 2, y, back]], true);
                for (let k = 2; k <= ROWS; k += 2) seg(p, [-w / 2, y, -k * dz], [w / 2, y, -k * dz]);
                plane.set(p);
                return true;
            },
        );
    });
    return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}

/* ------------------------------------------------------------------ AI: the tokens as blocks */

/**
 * The reply's tokens as a row of blocks seen from a little above: an empty footprint for each still to come, and
 * each token dropping into its place as it arrives, the newest white, the rest green.
 */
export function TokenBlocks({ count, total, streaming, onLive }: { count: number; total: number; streaming: boolean; onLive: (live: boolean) => void }) {
    const ref = useScene(
        { count, total, streaming },
        (host, get) => {
            const slots = liveWire(64 * 4, { color: "#2b332e", fade: FLAT });
            const done = liveWire(64 * 12);
            const fresh = liveWire(12, { color: "#e8e8e8" });
            const group = new THREE.Group();
            group.add(slots.mesh, done.mesh, fresh.mesh);
            const arrived: number[] = [];
            let w = 1, h = 1, clock = 0;
            return stage(
                host,
                ({ scene, w: W, h: H }) => {
                    scene.add(group);
                    w = W;
                    h = H;
                    const cam = camOf(h);
                    for (const m of [done.mesh, fresh.mesh]) (m.material as THREE.ShaderMaterial).uniforms.uFade.value.set(cam - h, cam + h);
                },
                (dt) => {
                    clock += dt;
                    const s = get();
                    // When each token came, for its drop.
                    if (s.count < arrived.length) arrived.length = s.count;
                    while (arrived.length < s.count) arrived.push(clock);
                    const n = Math.max(1, s.total);
                    const cell = w / n;
                    const size = Math.min(cell * 0.6, h * 0.42);
                    const floor = -h * 0.3;
                    const sl = lines(), dn = lines(), fr = lines();
                    for (let i = 0; i < n; i++) {
                        const x = -w / 2 + cell * (i + 0.5);
                        const f: V[] = [[x - size / 2, floor, size / 2], [x + size / 2, floor, size / 2], [x + size / 2, floor, -size / 2], [x - size / 2, floor, -size / 2]];
                        if (i >= s.count) {
                            polyline(sl, f, true);
                            continue;
                        }
                        const age = Math.min(1, (clock - arrived[i]!) / 0.35);
                        const drop = (1 - age) ** 2 * h * 0.6;
                        const newest = i === s.count - 1 && s.streaming;
                        cuboid(newest ? fr : dn, [x - size / 2, floor + drop, -size / 2], [x + size / 2, floor + drop + size, size / 2]);
                    }
                    slots.set(sl);
                    done.set(dn);
                    fresh.set(fr);
                    group.rotation.x = 0.4;
                    return true;
                },
            );
        },
        onLive,
    );
    return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}

/* ------------------------------------------------------------------ Design: the divider as a scanning gate */

/**
 * The slider's divider as a gate standing into the picture: a frame at the divider, its sides running back, and
 * a line scanning down it, so the wireframe is seen to pass through it and come out as the design.
 */
export function ScanGate({ pos, onLive }: { pos: number; onLive: (live: boolean) => void }) {
    const ref = useScene(
        { pos },
        (host, get) => {
            const gate = liveWire(64, { fade: FLAT });
            const scan = liveWire(8, { color: "#e8e8e8", fade: FLAT });
            let w = 1, h = 1;
            return stage(
                host,
                ({ scene, w: W, h: H }) => {
                    scene.add(gate.mesh, scan.mesh);
                    w = W;
                    h = H;
                },
                (_dt, time) => {
                    const x = (get().pos / 100) * w - w / 2;
                    const d = Math.min(w, h) * 0.22;
                    const g = lines();
                    polyline(g, [[x, -h / 2, 0], [x, h / 2, 0]]);
                    // The gate's frame running back from the divider, with ribs.
                    polyline(g, [[x, h / 2 - 1, 0], [x, h / 2 - 1, -d], [x, -h / 2 + 1, -d], [x, -h / 2 + 1, 0]]);
                    for (let i = 1; i < 8; i++) seg(g, [x, -h / 2 + (h * i) / 8, 0], [x, -h / 2 + (h * i) / 8, -d * 0.35]);
                    gate.set(g);
                    // The scan running down the gate.
                    const y = h / 2 - ((time * 0.35) % 1) * h;
                    const s = lines();
                    seg(s, [x, y, 0], [x, y, -d]);
                    seg(s, [x - 6, y, 0], [x + 6, y, 0]);
                    scan.set(s);
                    return true;
                },
            );
        },
        onLive,
    );
    return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}

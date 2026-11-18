"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cuboid, lines, liveWire, polyline, seg, stage, type V } from "../three/wire";

/*
 * Two of the What I do demos' pictures in Three.js (About.tsx), the ones where depth says something: the trace's
 * spans as blocks with the playhead as a plane through them, and the sensor's past windows standing back as a
 * waterfall. Each demo keeps its own words, numbers and controls, and the picture is drawn here in 3D, from the demo's own state. Every scene is a canvas
 * over its place in the demo, one CSS pixel to a unit at the front, so what is drawn at the front lines up with the
 * page. Where WebGL is not there, the flat picture stays.
 */

// No depth fade, for what is drawn level with the page.
const FLAT: [number, number] = [1e5, 2e5];
const camOf = (h: number) => h / 2 / Math.tan((15 * Math.PI) / 180);

/**
 * Runs `make` once on a host div with a getter for the latest state, and redraws it when the state changes. `make`
 * returns the stage's controls, or null without WebGL.
 */
function useScene<S>(state: S, make: (host: HTMLDivElement, get: () => S) => ReturnType<typeof stage>) {
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
        return () => {
            c?.stop();
            ctl.current = null;
        };
        // Built once; the state is read through `latest`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return ref;
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

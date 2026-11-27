"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { circle, cuboid, lines, polyline, seg, stage, tick, wire, type V } from "./three/wire";

/*
 * What I do, drawn: one thin green wireframe per capability on one canvas that stays (About.tsx lays it over the
 * art area of the panel on show). Code as windows of code stacked into depth, Design as an artboard with its layers
 * lifted apart, Systems as servers and a database with data running between them, AI as a network with signals
 * passing through it, Hardware as a board with its chips and antenna. The one on show turns slowly and leans to the
 * pointer; changing capability, the old one sinks away and the new one rises in. Built about two units across.
 */

const DIM = "#3d8a5c";

function code() {
    const g = new THREE.Group();
    [-0.45, 0, 0.45].forEach((z, k) => {
        const l = lines();
        const x0 = -0.85 + k * 0.18, y0 = 0.55 - k * 0.18;
        polyline(l, [[x0, y0, z], [x0 + 1.5, y0, z], [x0 + 1.5, y0 - 1.05, z], [x0, y0 - 1.05, z]], true);
        seg(l, [x0, y0 - 0.13, z], [x0 + 1.5, y0 - 0.13, z]);
        // The title bar's three dots.
        for (let d = 0; d < 3; d++) polyline(l, circle(1, 8, (a) => [x0 + 0.08 + d * 0.06 + Math.cos(a) * 0.02, y0 - 0.065 + Math.sin(a) * 0.02, z]), true);
        const g2 = lines();
        // The code: lines of different lengths, indented as code is.
        [0.9, 0.6, 0.75, 0.45, 0.8, 0.35].forEach((w, r) => {
            const ind = [0, 0.12, 0.12, 0.24, 0.12, 0][r]!;
            const y = y0 - 0.28 - r * 0.12;
            seg(g2, [x0 + 0.1 + ind, y, z], [x0 + 0.1 + ind + w, y, z], 0, 1);
        });
        g.add(wire(l, { color: k === 2 ? undefined : DIM, fade: [1e5, 2e5] }), wire(g2, { pulse: k === 2 ? 1 : 0, opacity: k === 2 ? 1 : 0.6, fade: [1e5, 2e5] }));
    });
    return g;
}

function design() {
    const g = new THREE.Group();
    const W = 1.6, H = 1.1;
    const board = lines();
    polyline(board, [[-W / 2, -H / 2, 0], [W / 2, -H / 2, 0], [W / 2, H / 2, 0], [-W / 2, H / 2, 0]], true);
    // The layers, lifted off the artboard: the column grid, the blocks, the type.
    const grid = lines();
    for (let c = 0; c <= 12; c++) {
        const x = -W / 2 + (c / 12) * W;
        seg(grid, [x, -H / 2, 0.3], [x, H / 2, 0.3]);
    }
    const blocks = lines();
    cuboid(blocks, [-0.7, 0.05, 0.6], [0.1, 0.45, 0.6]);
    cuboid(blocks, [0.2, -0.45, 0.6], [0.7, 0.45, 0.6]);
    cuboid(blocks, [-0.7, -0.45, 0.6], [0.1, -0.05, 0.6]);
    const type = lines();
    [0.32, 0.2, 0.08].forEach((y, i) => seg(type, [-0.62, y, 0.9], [-0.62 + [0.6, 0.45, 0.5][i]!, y, 0.9], 0, 1));
    // Guides from the board's corners up through the layers.
    const guides = lines();
    for (const [x, y] of [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]]) seg(guides, [x, y, 0], [x, y, 0.9]);
    g.add(wire(board, { fade: [1e5, 2e5] }), wire(grid, { color: DIM, opacity: 0.7, fade: [1e5, 2e5] }), wire(blocks, { fade: [1e5, 2e5] }), wire(type, { pulse: 1, fade: [1e5, 2e5] }), wire(guides, { color: DIM, opacity: 0.5, fade: [1e5, 2e5] }));
    g.rotation.set(-0.5, 0.5, 0);
    return g;
}

function systems() {
    const g = new THREE.Group();
    const rack = lines();
    for (let k = 0; k < 3; k++) {
        const y = -0.5 + k * 0.32;
        cuboid(rack, [-0.95, y, -0.35], [-0.2, y + 0.26, 0.35]);
        for (let d = 0; d < 3; d++) seg(rack, [-0.88 + d * 0.06, y + 0.13, 0.35], [-0.86 + d * 0.06, y + 0.13, 0.35]);
    }
    // The database: a stack of discs.
    const db = lines();
    for (let k = 0; k <= 3; k++) polyline(db, circle(1, 32, (a) => [0.62 + Math.cos(a) * 0.3, -0.5 + k * 0.28, Math.sin(a) * 0.3]), true);
    for (const a of [0, Math.PI / 2, Math.PI, 1.5 * Math.PI]) seg(db, [0.62 + Math.cos(a) * 0.3, -0.5, Math.sin(a) * 0.3], [0.62 + Math.cos(a) * 0.3, 0.34, Math.sin(a) * 0.3]);
    // The data running between them, and up to a client.
    const flow = lines();
    polyline(flow, [[-0.2, 0.2, 0], [0.1, 0.2, 0], [0.1, -0.08, 0], [0.32, -0.08, 0]]);
    polyline(flow, [[-0.2, -0.36, 0], [0.32, -0.36, 0]]);
    polyline(flow, [[-0.57, 0.46, 0], [-0.57, 0.75, 0], [0.62, 0.75, 0], [0.62, 0.34, 0]]);
    g.add(wire(rack, { fade: [1e5, 2e5] }), wire(db, { fade: [1e5, 2e5] }), wire(flow, { pulse: 1, color: DIM, fade: [1e5, 2e5] }));
    g.rotation.set(0.35, -0.5, 0);
    return g;
}

function ai() {
    const g = new THREE.Group();
    const layers = [3, 5, 5, 2].map((n, li) => Array.from({ length: n }, (_, i): V => [-0.9 + li * 0.6, (i - (n - 1) / 2) * 0.32, Math.sin(i * 1.7 + li) * 0.25]));
    const nodes = lines();
    for (const layer of layers) for (const [x, y, z] of layer) polyline(nodes, circle(1, 16, (a) => [x + Math.cos(a) * 0.06, y + Math.sin(a) * 0.06, z]), true);
    const edges = lines();
    for (let li = 0; li < layers.length - 1; li++)
        for (const a of layers[li]!) for (const b of layers[li + 1]!) seg(edges, a, b, li / 3 + Math.random() * 0.1, (li + 1) / 3 + Math.random() * 0.1);
    g.add(wire(edges, { color: DIM, pulse: 1, opacity: 0.8, fade: [1e5, 2e5] }), wire(nodes, { fade: [1e5, 2e5] }));
    return g;
}

function hardware() {
    const g = new THREE.Group();
    const board = lines();
    cuboid(board, [-0.9, -0.03, -0.6], [0.9, 0.03, 0.6]);
    for (const [x, z] of [[-0.82, -0.52], [0.82, -0.52], [-0.82, 0.52], [0.82, 0.52]]) polyline(board, circle(1, 12, (a) => [x + Math.cos(a) * 0.04, 0.031, z + Math.sin(a) * 0.04]), true);
    const chips = lines();
    cuboid(chips, [-0.35, 0.03, -0.3], [0.15, 0.12, 0.2]);
    for (let p = 0; p < 6; p++) {
        const x = -0.31 + p * 0.08;
        seg(chips, [x, 0.04, -0.3], [x, 0.04, -0.38]);
        seg(chips, [x, 0.04, 0.2], [x, 0.04, 0.28]);
    }
    cuboid(chips, [0.35, 0.03, -0.45], [0.7, 0.09, -0.15]);
    cuboid(chips, [0.4, 0.03, 0.15], [0.65, 0.07, 0.4]);
    // The antenna: a coil off the board's edge.
    const coil: V[] = [];
    for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 10;
        coil.push([-0.9 - (i / 80) * 0.45, 0.1 + Math.sin(a) * 0.07, Math.cos(a) * 0.07]);
    }
    polyline(chips, coil);
    const traces = lines();
    polyline(traces, [[0.15, 0.031, -0.05], [0.28, 0.031, -0.05], [0.28, 0.031, -0.3], [0.35, 0.031, -0.3]]);
    polyline(traces, [[0.15, 0.031, 0.1], [0.3, 0.031, 0.1], [0.3, 0.031, 0.27], [0.4, 0.031, 0.27]]);
    polyline(traces, [[-0.35, 0.031, -0.05], [-0.9, 0.031, -0.05], [-0.9, 0.1, 0]]);
    g.add(wire(board, { color: DIM, fade: [1e5, 2e5] }), wire(chips, { fade: [1e5, 2e5] }), wire(traces, { pulse: 1, fade: [1e5, 2e5] }));
    g.rotation.set(0.75, -0.4, 0);
    return g;
}

const MODELS = [code, design, systems, ai, hardware];

/** The wireframe for each capability, `active` the one on show; lays itself over the element `target` points to. */
export default function SysScene({ active, target }: { active: number; target: () => HTMLElement | null }) {
    const ref = useRef<HTMLDivElement>(null);
    const want = useRef(active);
    const redraw = useRef<() => void>(() => {});

    useEffect(() => {
        want.current = active;
        redraw.current();
    }, [active]);

    useEffect(() => {
        const host = ref.current;
        // Not on a phone: it keeps few GPU contexts to spare (the browser reloaded the page when it ran short).
        if (!host || window.matchMedia("(max-width: 767px)").matches) return;
        const models = MODELS.map((make) => {
            const holder = new THREE.Group();
            const inner = make();
            holder.add(inner);
            holder.visible = false;
            inner.traverse((o) => (o.userData.base = ((o as THREE.LineSegments).material as THREE.ShaderMaterial | undefined)?.uniforms?.uOpacity?.value ?? 1));
            return { holder, inner, shown: 0 };
        });
        const root = new THREE.Group();
        models.forEach((m) => root.add(m.holder));
        let lean = 0, leanTo = 0;

        // Over the art area of the panel on show (all panels share one layout).
        const place = () => {
            const area = target();
            const parent = host.parentElement;
            if (!area || !parent) return;
            const a = area.getBoundingClientRect();
            const p = parent.getBoundingClientRect();
            Object.assign(host.style, { left: `${a.left - p.left}px`, top: `${a.top - p.top}px`, width: `${a.width}px`, height: `${a.height}px` });
        };
        place();
        const ctl = stage(
            host,
            ({ scene, w, h }) => {
                scene.add(root);
                root.scale.setScalar(Math.min(w * 0.3, h * 0.55));
            },
            (dt, time) => {
                const k = 1 - Math.exp(-dt * 5);
                models.forEach((m, i) => {
                    m.shown += ((i === want.current ? 1 : 0) - m.shown) * k;
                    if (Math.abs(m.shown - (i === want.current ? 1 : 0)) < 0.002) m.shown = i === want.current ? 1 : 0;
                    m.holder.visible = m.shown > 0.01;
                    // Rising in from below, sinking away.
                    m.holder.position.y = (1 - m.shown) * (i === want.current ? -0.35 : 0.35);
                    m.holder.scale.setScalar(0.85 + 0.15 * m.shown);
                    m.inner.traverse((o) => {
                        const u = ((o as THREE.LineSegments).material as THREE.ShaderMaterial | undefined)?.uniforms;
                        if (u?.uOpacity) u.uOpacity.value = (o.userData.base as number) * m.shown;
                    });
                });
                lean += (leanTo - lean) * (1 - Math.exp(-dt * 4));
                root.rotation.set(0.15, Math.sin(time * 0.3) * 0.35 + lean, 0);
                tick(root, time);
                return true;
            },
        );
        if (!ctl) return;
        redraw.current = ctl.redraw;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            leanTo = ((e.clientX / window.innerWidth) * 2 - 1) * 0.5;
        };
        const resize = new ResizeObserver(place);
        if (host.parentElement) resize.observe(host.parentElement);
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("resize", place);
        return () => {
            resize.disconnect();
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("resize", place);
            redraw.current = () => {};
            ctl.stop();
        };
    }, [target]);

    return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute z-[2]" />;
}

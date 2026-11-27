import * as THREE from "three";
import { box, circle, cuboid, lines, polyline, seg, wire, type Lines, type V } from "./wire";
import type { Plan } from "../iso/iso-kit";
import * as CV from "../figures/thumbs/cv-view";
import { LAYOUTS } from "../figures/thumbs/cv";
import * as SERA from "../figures/thumbs/sera-view";
import * as WEAR from "../figures/thumbs/wearable-view";

/*
 * Every 3D object the sections show (Showcase.tsx), as thin green wireframes: the three projects' machines (built
 * from the same sizes as their isometric drawings, figures/thumbs/*-view.ts, with x across, y towards the front and
 * z up there, x, z and y here), the five capabilities, the door of the essay, a certificate as a card and the globe.
 * Each returns the object and, for one that works on its own, a clock to drive it.
 */

export type Model = { root: THREE.Object3D; tick?: (time: number) => void };

const DIM = "#3d8a5c";

const RED = "#e5484d";
const at = (x: number, y: number, z: number): V => [x, z, y];

/** A plan's outline (rounded corners) at height z. */
function loop(l: Lines, p: Plan, z: number) {
    const pts: V[] = [];
    const r = Math.min(p.r, p.w / 2, p.d / 2);
    const corners: [number, number, number][] = [
        [p.x + p.w - r, p.y + r, -Math.PI / 2],
        [p.x + p.w - r, p.y + p.d - r, 0],
        [p.x + r, p.y + p.d - r, Math.PI / 2],
        [p.x + r, p.y + r, Math.PI],
    ];
    for (const [cx, cy, a0] of corners)
        for (let i = 0; i <= 4; i++) {
            const a = a0 + (i / 4) * (Math.PI / 2);
            pts.push(at(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z));
        }
    polyline(l, pts, true);
}

/** A rounded slab: its outline top and bottom and the four corner edges. */
function slab(l: Lines, p: Plan, z: number, h: number) {
    loop(l, p, z);
    loop(l, p, z + h);
    const r = Math.min(p.r, p.w / 2, p.d / 2);
    for (const [x, y] of [
        [p.x + r, p.y],
        [p.x + p.w - r, p.y],
        [p.x + r, p.y + p.d],
        [p.x + p.w - r, p.y + p.d],
        [p.x, p.y + p.d / 2],
        [p.x + p.w, p.y + p.d / 2],
    ])
        seg(l, at(x, y, z), at(x, y, z + h));
}

/** An upright cylinder at (x, y), from z up h. */
function post(l: Lines, x: number, y: number, r: number, z: number, h: number, ribs = 4) {
    for (const zz of [z, z + h]) polyline(l, circle(1, 24, (a) => at(x + Math.cos(a) * r, y + Math.sin(a) * r, zz)), true);
    for (let i = 0; i < ribs; i++) {
        const a = (i / ribs) * Math.PI * 2;
        seg(l, at(x + Math.cos(a) * r, y + Math.sin(a) * r, z), at(x + Math.cos(a) * r, y + Math.sin(a) * r, z + h));
    }
}

/** A flat rectangle on a face, given by its corners. */
const rect = (l: Lines, a: V, b: V, c: V, d: V) => polyline(l, [a, b, c, d], true);

type Part = { obj: THREE.Object3D; dir: THREE.Vector3 };
type Machine = { root: THREE.Group; parts: Part[]; size: [number, number]; tick: (time: number) => void };

/** Collects the parts of a model, each pushed out from `centre` when the machine comes apart. */
function assemble(centre: V, size: [number, number], list: THREE.Object3D[], tick: (time: number) => void): Machine {
    const root = new THREE.Group();
    const c = new THREE.Vector3(...centre);
    // Each part in a holder of its own: the part's own motion moves the part, coming apart moves the holder.
    const parts = list.map((obj) => {
        const holder = new THREE.Group();
        holder.add(obj);
        root.add(holder);
        const b = new THREE.Box3().setFromObject(obj);
        const dir = b.getCenter(new THREE.Vector3()).sub(c);
        if (dir.lengthSq() < 1) dir.set(0, 1, 0);
        return { obj: holder, dir: dir.normalize() };
    });
    root.position.set(-c.x, -c.y, -c.z);
    const pivot = new THREE.Group();
    pivot.add(root);
    return { root: pivot, parts, size, tick };
}

/* ------------------------------------------------------------------ the CV maker */

function cvModel(): Machine {
    const { BODY, BODY_TOP, FEET_H, SHEET, SHEET_OUT, DIAL, DIAL_R, DIAL_TOP, DETENTS } = CV;
    const body = lines();
    slab(body, BODY, FEET_H, BODY_TOP - FEET_H);
    // The slot across the top, the output lip on the front, a seam round the sides.
    seg(body, at(SHEET.x - 2, -0.6, BODY_TOP), at(SHEET.x + SHEET.w + 2, -0.6, BODY_TOP));
    seg(body, at(SHEET.x - 2, 0.6, BODY_TOP), at(SHEET.x + SHEET.w + 2, 0.6, BODY_TOP));
    const front = BODY.y + BODY.d;
    rect(body, at(-18, front, 6), at(18, front, 6), at(18, front, 7.2), at(-18, front, 7.2));
    loop(body, { ...BODY, x: BODY.x - 0.01, w: BODY.w + 0.02 }, FEET_H + 5);
    // A row of vents on the front, left of the dial.
    for (let i = 0; i < 6; i++) seg(body, at(-26 + i * 2, front, 12), at(-26 + i * 2, front, 16));

    const feet = lines();
    for (const [x, y] of [
        [BODY.x + 5, BODY.y + 5],
        [BODY.x + BODY.w - 5, BODY.y + 5],
        [BODY.x + 5, BODY.y + BODY.d - 5],
        [BODY.x + BODY.w - 5, BODY.y + BODY.d - 5],
    ])
        post(feet, x, y, 2.6, 0, FEET_H);

    const dial = lines();
    post(dial, DIAL[0], DIAL[1], DIAL_R, BODY_TOP, DIAL_TOP - BODY_TOP, 16);
    for (const a of DETENTS) seg(dial, at(DIAL[0] + Math.cos(a) * (DIAL_R + 1), DIAL[1] + Math.sin(a) * (DIAL_R + 1), BODY_TOP), at(DIAL[0] + Math.cos(a) * (DIAL_R + 2.4), DIAL[1] + Math.sin(a) * (DIAL_R + 2.4), BODY_TOP));
    const pointer = lines();
    seg(pointer, [0, 0, 0], [DIAL_R - 0.8, 0, 0]);
    const needle = wire(pointer);
    needle.position.set(DIAL[0], DIAL_TOP + 0.05, DIAL[1]);
    const dialGroup = new THREE.Group();
    dialGroup.add(wire(dial, { color: DIM }), needle);

    // The sheets, one per template, built standing in the slot with their foot at z 0; the one the dial picks rises out.
    const sheets = LAYOUTS.map((layout) => {
        const l = lines();
        const x0 = SHEET.x, top = SHEET.h;
        const on = (x: number, y: number): V => at(x0 + x, 0, top - y);
        rect(l, on(0, 0), on(SHEET.w, 0), on(SHEET.w, SHEET.h), on(0, SHEET.h));
        if (layout.panel) {
            const [x, y, w, h] = layout.panel;
            rect(l, on(x, y), on(x + w, y), on(x + w, y + h), on(x, y + h));
        }
        for (const [x, y, w, h] of layout.bars) {
            if (h > 1.5) rect(l, on(x, y), on(x + w, y), on(x + w, y + h), on(x, y + h));
            else seg(l, on(x, y + h / 2), on(x + w, y + h / 2));
        }
        for (const [x, y, w] of layout.rules ?? []) seg(l, on(x, y), on(x + w, y));
        const mesh = wire(l);
        mesh.visible = false;
        return mesh;
    });
    const sheetGroup = new THREE.Group();
    sheetGroup.add(...sheets);

    const tick = (time: number) => {
        // A sheet every 4.5 s: the dial turns to the next template, the sheet feeds up out of the slot and waits.
        const PERIOD = 4.5;
        const n = Math.floor(time / PERIOD);
        const u = (time % PERIOD) / PERIOD;
        const which = n % LAYOUTS.length;
        const prev = (which + LAYOUTS.length - 1) % LAYOUTS.length;
        const turn = Math.min(1, u / 0.15);
        const a = DETENTS[prev]! + (DETENTS[which]! - DETENTS[prev]!) * (turn * turn * (3 - 2 * turn));
        needle.rotation.y = -a;
        const feed = Math.min(1, Math.max(0, (u - 0.15) / 0.55));
        const out = SHEET_OUT * (feed * feed * (3 - 2 * feed));
        // The sheet's foot rises from below the slot; under the top of the body it is not drawn.
        const rise = BODY_TOP - SHEET.h + out;
        sheetGroup.position.y = rise;
        sheets.forEach((s, i) => {
            s.visible = i === which;
            (s.material as THREE.ShaderMaterial).uniforms.uClip.value.set(0, 1, 0, rise - BODY_TOP);
        });
    };
    const parts = [wire(body), wire(feet, { color: DIM }), dialGroup, sheetGroup];
    return assemble([0, 30, 0], [70, 82], parts, tick);
}

/* ------------------------------------------------------------------ S.E.R.A. */

function seraModel(): Machine {
    const { BASE, BASE_Z, BASE_TOP, CARD, CARD_FACE, CARD_TOP, CARD_H, POST, POST_TOP, LENS, BUBBLES, LINE_GAP, bubbleOf, flagLineY, heightOf } = SERA;
    const base = lines();
    slab(base, BASE, BASE_Z, BASE_TOP - BASE_Z);
    // The holder's groove the card stands in.
    seg(base, at(CARD.x - 1, CARD.y - 0.6, BASE_TOP), at(CARD.x + CARD.w + 1, CARD.y - 0.6, BASE_TOP));
    seg(base, at(CARD.x - 1, CARD_FACE + 0.6, BASE_TOP), at(CARD.x + CARD.w + 1, CARD_FACE + 0.6, BASE_TOP));
    const feet = lines();
    for (const [x, y] of [
        [BASE.x + 4, BASE.y + 4],
        [BASE.x + BASE.w - 4, BASE.y + 4],
        [BASE.x + 4, BASE.y + BASE.d - 4],
        [BASE.x + BASE.w - 4, BASE.y + BASE.d - 4],
    ])
        post(feet, x, y, 2, 0, BASE_Z);

    // The chat card: the bubbles on its face, theirs left and yours right, bars for the words.
    const card = lines();
    const bottom = CARD_TOP - CARD_H;
    slab(card, CARD, bottom, CARD_H);
    const on = (x: number, y: number): V => at(CARD.x + x, CARD_FACE + 0.05, CARD_TOP - y);
    rect(card, on(2, 2), on(9, 2), on(9, 5.4), on(2, 5.4));
    seg(card, on(11, 3.7), on(20, 3.7));
    for (const b of BUBBLES) {
        const { x, w, h } = bubbleOf(b);
        rect(card, on(x, b.y), on(x + w, b.y), on(x + w, b.y + h), on(x, b.y + h));
        b.lines.forEach((len, i) => {
            const y = b.y + 1.1 + i * LINE_GAP + 0.6;
            const x0 = b.side === "l" ? x + 1.5 : x + w - 1.5 - len;
            seg(card, on(x0, y), on(x0 + len, y));
        });
    }
    // The marks, one under each sentence that reads oddly, each coming on as the lens passes it.
    const marks = SERA.FLAGGED.map((b) => {
        const l = lines();
        const { x, w } = bubbleOf(b);
        const y = flagLineY(b);
        seg(l, on(x + 1, y), on(x + w - 1, y));
        polyline(l, circle(1, 12, (a) => on(x + w + 2.2 + Math.cos(a) * 0.9, y - 1.2 + Math.sin(a) * 0.9)), true);
        const mesh = wire(l, { color: RED });
        return { mesh, y };
    });
    const cardGroup = new THREE.Group();
    cardGroup.add(wire(card), ...marks.map((m) => m.mesh));

    // The post and the lens on its arm, which slides down the post.
    const postLines = lines();
    post(postLines, POST[0], POST[1], 1.8, BASE_TOP, POST_TOP - BASE_TOP, 6);
    polyline(postLines, circle(1, 16, (a) => at(POST[0] + Math.cos(a) * 3, POST[1] + Math.sin(a) * 3, POST_TOP)), true);
    const lens = lines();
    for (const r of [LENS.r, LENS.glass]) polyline(lens, circle(1, 40, (a) => at(LENS.x + Math.cos(a) * r, LENS.y, Math.sin(a) * r)), true);
    polyline(lens, circle(1, 40, (a) => at(LENS.x + Math.cos(a) * LENS.r, LENS.y + 1.2, Math.sin(a) * LENS.r)), true);
    seg(lens, at(LENS.x + LENS.r, LENS.y + 0.6, 0), at(POST[0] - 2.4, POST[1], 0));
    box(lens, 5, 4, 5, at(POST[0], POST[1], 0));
    const lensMesh = wire(lens);
    const lensGroup = new THREE.Group();
    lensGroup.add(lensMesh);

    const tick = (time: number) => {
        // Down the chat line by line in 7 s, then back to the top.
        const u = (time % 7) / 7;
        const local = 6 + Math.min(1, u / 0.85) * (CARD_H - 10);
        lensGroup.position.y = heightOf(local);
        for (const m of marks) m.mesh.visible = local > m.y - 1;
    };
    const parts = [wire(base, { color: DIM }), wire(feet, { color: DIM }), cardGroup, wire(postLines, { color: DIM }), lensGroup];
    return assemble([0, 40, 0], [60, 84], parts, tick);
}

/* ------------------------------------------------------------------ the wearable */

function wearableModel(): Machine {
    const { MAT, MAT_H, BODY, BOSSES, BOSS_R, CLIP_TOP, SHELL_H, FLOOR, LID_H, TOP, WALL, poseOf } = WEAR;
    // The mat, only the part under the case and where the cover lands.
    const mat = lines();
    const M: Plan = { x: -70, y: MAT.y, w: 210, d: MAT.d, r: 3 };
    slab(mat, M, -MAT_H, MAT_H);
    for (let x = M.x + 10; x < M.x + M.w - 2; x += 10) seg(mat, at(x, M.y, 0.01), at(x, M.y + M.d, 0.01));
    for (let y = M.y + 6; y < M.y + M.d - 2; y += 10) seg(mat, at(M.x, y, 0.01), at(M.x + M.w, y, 0.01));

    const clip = lines();
    slab(clip, { x: -40, y: -16, w: 66, d: 32, r: 6 }, 0, 1.4);
    slab(clip, { x: -34, y: -13, w: 62, d: 26, r: 3 }, 3.2, CLIP_TOP - 3.2);

    // The shell: walls, its floor, the four screw bosses; inside, the boards, the battery and the radio.
    const shell = lines();
    slab(shell, BODY, CLIP_TOP, SHELL_H);
    loop(shell, { x: BODY.x + WALL, y: BODY.y + WALL, w: BODY.w - WALL * 2, d: BODY.d - WALL * 2, r: BODY.r - WALL }, TOP);
    for (const [x, y] of BOSSES) post(shell, x, y, BOSS_R * 0.55, CLIP_TOP + FLOOR, SHELL_H - FLOOR - 1, 4);
    const inside = lines();
    const floor = CLIP_TOP + FLOOR;
    box(inside, 50, 7, 32, at(-12, -4, floor + 3.5)); // the battery
    box(inside, 28, 1.6, 22, at(26, 2, floor + 6)); // the ESP32-C3
    box(inside, 8, 2, 8, at(22, 0, floor + 7.8)); // its module can
    box(inside, 16, 2, 16, at(-12, 12, floor + 9)); // the RFM95W
    box(inside, 12, 1.2, 10, at(30, -16, floor + 5)); // the MPU6050
    // The antenna: a coil out of the top end.
    const coil: V[] = [];
    for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 12;
        coil.push(at(BODY.x - 2 - (i / 96) * 22, 2 + Math.cos(a) * 2.6, CLIP_TOP + 10 + Math.sin(a) * 2.6));
    }
    polyline(inside, coil);
    seg(inside, at(BODY.x, 2, CLIP_TOP + 10), at(BODY.x - 2, 2, CLIP_TOP + 10));
    const shellGroup = new THREE.Group();
    shellGroup.add(wire(shell), wire(inside, { color: DIM }));

    const screws = lines();
    for (const [x, y] of BOSSES) {
        post(screws, x, y, 1.6, TOP, 2, 6);
        seg(screws, at(x - 1.4, y, TOP + 2), at(x + 1.4, y, TOP + 2));
    }
    const screwMesh = wire(screws);

    // The front cover with the big emergency button and the power LED.
    const lid = lines();
    slab(lid, BODY, TOP, LID_H);
    const button = lines();
    post(button, 14, 0, 11, TOP + LID_H, 4, 12);
    post(button, 14, 0, 8, TOP + LID_H + 4, 1.5, 12);
    const led = lines();
    post(led, -30, 16, 1.6, TOP + LID_H, 1, 6);
    const lidGroup = new THREE.Group();
    lidGroup.add(wire(lid), wire(button, { color: RED }), wire(led, { color: "#7cf0a8" }));

    const tick = (time: number) => {
        // Taken apart and put back together, slowly: a beat shut, the parts lift, the cover hops over, a beat apart, back.
        const u = (time % 9) / 9;
        const k = u < 0.2 ? 0 : u < 0.45 ? (u - 0.2) / 0.25 : u < 0.7 ? 1 : u < 0.95 ? 1 - (u - 0.7) / 0.25 : 0;
        const e = k * k * (3 - 2 * k);
        const p = poseOf(e);
        shellGroup.position.set(...at(...p.shell));
        screwMesh.position.set(...at(...p.screws));
        lidGroup.position.set(...at(...p.lid));
    };
    const parts = [wire(mat, { color: DIM, opacity: 0.6 }), wire(clip, { color: DIM }), shellGroup, screwMesh, lidGroup];
    return assemble([30, 14, 0], [150, 96], parts, tick);
}


/* ------------------------------------------------------------------ the capabilities */

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


/* ------------------------------------------------------------------ the essay: a door being shut and bolted */

function door(): Model {
    const g = new THREE.Group();
    const frame = lines();
    cuboid(frame, [-0.75, -1.1, -0.08], [-0.65, 1.1, 0.08]);
    cuboid(frame, [0.65, -1.1, -0.08], [0.75, 1.1, 0.08]);
    cuboid(frame, [-0.75, 1.0, -0.08], [0.75, 1.1, 0.08]);
    cuboid(frame, [-1.2, -1.18, -0.5], [1.2, -1.1, 0.5]);
    const leaf = lines();
    cuboid(leaf, [0, -1.0, -0.03], [1.28, 0.98, 0.03]);
    cuboid(leaf, [0.15, 0.1, 0.03], [1.13, 0.85, 0.05]);
    cuboid(leaf, [0.15, -0.85, 0.03], [1.13, -0.05, 0.05]);
    const bolt = lines();
    cuboid(bolt, [1.0, -0.02, 0.05], [1.2, 0.06, 0.12]);
    polyline(bolt, circle(1, 16, (a) => [1.12 + Math.cos(a) * 0.05, -0.12 + Math.sin(a) * 0.05, 0.08]), true);
    const hinge = new THREE.Group();
    hinge.position.set(-0.65, 0, 0);
    const leafMesh = wire(leaf);
    const boltMesh = wire(bolt);
    hinge.add(leafMesh, boltMesh);
    g.add(wire(frame, { color: DIM }), hinge);
    const tick = (time: number) => {
        // Swinging shut and opening again, slowly.
        const u = (time % 8) / 8;
        const k = u < 0.4 ? u / 0.4 : u < 0.6 ? 1 : 1 - (u - 0.6) / 0.4;
        hinge.rotation.y = -(1 - k * k * (3 - 2 * k)) * 1.1;
    };
    return { root: g, tick };
}

/* ------------------------------------------------------------------ contact: the globe, signals arcing off Java */

function globe(): Model {
    const g = new THREE.Group();
    const R = 1.1;
    const grid = lines();
    for (let la = -60; la <= 60; la += 30) {
        const y = Math.sin((la * Math.PI) / 180), r = Math.cos((la * Math.PI) / 180);
        polyline(grid, circle(R, 72, (a) => [Math.cos(a) * r, y, Math.sin(a) * r]), true);
    }
    for (let lo = 0; lo < 180; lo += 30) {
        const c = Math.cos((lo * Math.PI) / 180), s = Math.sin((lo * Math.PI) / 180);
        polyline(grid, circle(R, 72, (a) => [Math.cos(a) * c, Math.sin(a), Math.cos(a) * s]), true);
    }
    const on = (lat: number, lon: number) => new THREE.Vector3().setFromSphericalCoords(R, ((90 - lat) * Math.PI) / 180, (lon * Math.PI) / 180);
    const arcs = lines();
    for (const [la, lo] of [[35, 139], [51, 0], [37, -122], [-33, 151], [1, 104]] as const) {
        const p = on(-6, 107), q = on(la, lo);
        const pts: V[] = [];
        for (let i = 0; i <= 40; i++) {
            const t = i / 40;
            const v = p.clone().lerp(q, t).normalize().multiplyScalar(R * (1 + Math.sin(t * Math.PI) * 0.3));
            pts.push([v.x, v.y, v.z]);
        }
        polyline(arcs, pts);
    }
    g.add(wire(grid, { color: DIM }), wire(arcs, { pulse: 1 }));
    return { root: g };
}

/* ------------------------------------------------------------------ a certificate, as a card with its scan on it */

function card(src?: string): Model {
    const g = new THREE.Group();
    const W = 2, H = 1.414;
    const edge = lines();
    cuboid(edge, [-W / 2, -H / 2, -0.04], [W / 2, H / 2, 0.04]);
    g.add(wire(edge));
    if (src) {
        // The scan, drawn down to what the stage shows before it goes to the GPU (a phone has little to spare).
        const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, color: new THREE.Color("#9fe0b8"), side: THREE.DoubleSide, depthWrite: false });
        const face = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.96, H * 0.96), mat);
        face.position.z = 0.045;
        face.userData.scan = true;
        g.add(face);
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        img.onload = () => {
            const k = Math.min(1, (window.innerWidth < 768 ? 640 : 1100) / Math.max(img.naturalWidth, img.naturalHeight));
            const c = document.createElement("canvas");
            c.width = Math.max(1, Math.round(img.naturalWidth * k));
            c.height = Math.max(1, Math.round(img.naturalHeight * k));
            c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
            const t = new THREE.CanvasTexture(c);
            t.colorSpace = THREE.SRGBColorSpace;
            t.generateMipmaps = false;
            t.minFilter = THREE.LinearFilter;
            mat.map = t;
            mat.needsUpdate = true;
            // The card takes the scan's own shape.
            const aspect = c.width / c.height;
            g.scale.set(Math.min(1, aspect / (W / H)), Math.min(1, W / H / aspect), 1);
        };
    }
    return { root: g };
}

/* ------------------------------------------------------------------ the registry */

const wrap = (make: () => THREE.Group): (() => Model) => () => ({ root: make() });
const machine = (make: () => Machine): (() => Model) => () => {
    const m = make();
    return { root: m.root, tick: m.tick };
};

export const MODELS = {
    cv: machine(cvModel),
    sera: machine(seraModel),
    wearable: machine(wearableModel),
    code: wrap(code),
    design: wrap(design),
    systems: wrap(systems),
    ai: wrap(ai),
    hardware: wrap(hardware),
    door,
    globe,
};
export { card };

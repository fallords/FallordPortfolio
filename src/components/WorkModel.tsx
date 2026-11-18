"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { box, circle, lines, polyline, seg, stage, wire, type Lines, type V } from "./three/wire";
import type { Plan } from "./iso/iso-kit";
import * as CV from "./figures/thumbs/cv-view";
import { LAYOUTS } from "./figures/thumbs/cv";
import * as SERA from "./figures/thumbs/sera-view";
import * as WEAR from "./figures/thumbs/wearable-view";

/*
 * The Work section's machines in Three.js, as thin green wireframes built from the same sizes as the isometric
 * drawings (figures/thumbs/*-view.ts): the CV maker's printer feeding out a CV in the template its dial points at,
 * S.E.R.A.'s reading stand with the lens sliding down the chat and marking the sentences that read oddly, the
 * wearable on its cutting mat opening and closing. Each turns slowly and leans to the pointer over its viewport.
 * WorkStage writes how far apart the machine is (`data-apart` on .ws-machine, 0 whole to 1 apart); the parts fly
 * out from the middle by that much.
 *
 * The figures' coordinates have x across, y towards the front and z up; here that is x, z and y.
 */

const RED = "#e5484d";
const DIM = "#4f6357";
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
type Model = { root: THREE.Group; parts: Part[]; size: [number, number]; tick: (time: number) => void };

/** Collects the parts of a model, each pushed out from `centre` when the machine comes apart. */
function assemble(centre: V, size: [number, number], list: THREE.Object3D[], tick: (time: number) => void): Model {
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

function cvModel(): Model {
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

function seraModel(): Model {
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

function wearableModel(): Model {
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

const MODELS = { cv: cvModel, sera: seraModel, wearable: wearableModel };

/** One project's machine in 3D, in the viewport WorkStage gives it. */
export default function WorkModel({ kind }: { kind: keyof typeof MODELS }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = ref.current;
        if (!host) return;
        const view = host.closest<HTMLElement>(".ws-view") ?? host;
        const machine = host.closest<HTMLElement>(".ws-machine");
        const model = MODELS[kind]();
        // Seen from a little above, three-quarters on.
        const tilt = kind === "wearable" ? 0.75 : 0.32;
        let lean = 0, leanTo = 0;

        const ctl = stage(
            host,
            ({ scene, w, h }) => {
                scene.add(model.root);
                // As large as the viewport allows, the turning width counted as its larger side.
                const [mw, mh] = model.size;
                const k = Math.min((w * 0.82) / mw, (h * 0.8) / mh);
                model.root.scale.setScalar(k);
                // Full strength on the near side of the machine, dimmer to its back.
                const cam = h / 2 / Math.tan((15 * Math.PI) / 180);
                const r = Math.max(mw, mh) * k * 0.5;
                model.root.traverse((o) => {
                    const u = ((o as THREE.LineSegments).material as THREE.ShaderMaterial | undefined)?.uniforms;
                    u?.uFade?.value.set(cam - r * 0.2, cam + r * 1.2);
                });
            },
            (dt, time) => {
                // Offset by 3 s, so that with motion turned down (time standing at 0) each machine stands mid-way: the sheet out, the lens on the chat, the case open.
                model.tick(time + 3);
                lean += (leanTo - lean) * (1 - Math.exp(-dt * 4));
                model.root.rotation.set(tilt, -0.6 + Math.sin(time * 0.25) * 0.35 + lean, 0);
                const apart = Number(machine?.dataset.apart) || 0;
                const reach = Math.max(...model.size) * 0.9;
                for (const p of model.parts) p.obj.position.copy(p.dir).multiplyScalar(apart * reach);
                // Gone (WorkStage hides it), nothing to draw.
                return !machine?.hasAttribute("data-gone");
            },
        );
        if (!ctl) return;

        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const r = view.getBoundingClientRect();
            leanTo = (((e.clientX - r.left) / r.width) * 2 - 1) * 0.6;
        };
        const onLeave = () => (leanTo = 0);
        view.addEventListener("pointermove", onMove);
        view.addEventListener("pointerleave", onLeave);
        return () => {
            view.removeEventListener("pointermove", onMove);
            view.removeEventListener("pointerleave", onLeave);
            ctl.stop();
        };
    }, [kind]);

    return <div ref={ref} aria-hidden="true" className="ws-model" />;
}

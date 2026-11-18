"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { box, circle, lines, polyline, seg, stage, wire, type V } from "./three/wire";
import { decode, shuffle } from "./motion/textfx";

/*
 * Held wherever motion is welcome and the screen is tall enough for the longest role: on a laptop or a tablet on its side
 * (down to 560px tall) the drum and the panel side by side, on a phone or an upright tablet the drum above the panel
 * (experience.css). Shorter screens get the plain log.
 */
const LIVE =
    "(min-width: 1024px) and (min-height: 560px) and (prefers-reduced-motion: no-preference), (max-width: 1023px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const FAINT = "#3a463f";
// The lines of the drum, the reticle and the gimbal, a step brighter than the faint dates.
const LINE = "#53675a";
// No depth fade: for what faces the screen.
const FLAT: [number, number] = [1e5, 2e5];

/** One date drawn as text on a transparent texture; `size` is the type size in CSS pixels. */
function dateTexture(text: string, size: number, font: string) {
    const k = 2;
    const c = document.createElement("canvas");
    const g = c.getContext("2d")!;
    const f = `500 ${size * k}px ${font}`;
    g.font = f;
    (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${-0.055 * size * k}px`;
    const w = Math.ceil(g.measureText(text).width + size * k * 0.2);
    c.width = w;
    c.height = Math.ceil(size * k * 1.25);
    g.font = f;
    (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${-0.055 * size * k}px`;
    g.fillStyle = "#fff";
    g.textBaseline = "middle";
    g.textAlign = "center";
    g.fillText(text, w / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return { tex, w: w / k, h: c.height / k };
}

/**
 * Drives the held Experience scene (Experience.tsx) and draws its middle in Three.js: a drum lying across the band
 * with every role's start date on its face, turning to the one whose stretch of scroll it is (green, the rest
 * faint), inside a reticle that turns with the scroll and a gimbal ring that leans round it. Around it, the role
 * whose stretch it is comes on: its row gets `data-active` (the panel shows it; its title flickers in, motion.css),
 * its name in the index lights, the counter reads its number, and its words settle out of jumbled letters. Nothing
 * is on show until the stage is halfway up the screen, so the first role comes in as the stage arrives. The drum
 * stands where the band is, so it follows the layout on any screen.
 */
export default function ExperienceDrum({ dates }: { dates: string[] }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = ref.current;
        const track = host?.closest<HTMLElement>(".xp-track");
        const stageEl = host?.parentElement;
        const band = stageEl?.querySelector<HTMLElement>(".xp-band");
        if (!host || !track || !stageEl || !band) return;
        const rows = [...track.querySelectorAll<HTMLElement>(".xp-row")];
        const names = [...track.querySelectorAll<HTMLElement>(".xp-index li")];
        const counter = track.querySelector<HTMLElement>("[data-xp-count]");
        const live = window.matchMedia(LIVE);
        const n = rows.length;
        let active = -2;
        let frame = 0;
        // What the scroll asks for; the drawing eases to it.
        let turnTo = 0;
        let reticleTo = 0;
        let flash = 0;

        // The drum's slots: twice the roles (at least ten), so the drum reads as round with the dates on the near half.
        const SLOTS = Math.max(10, n * 2);
        const STEP = (Math.PI * 2) / SLOTS;
        const root = new THREE.Group();
        const drum = new THREE.Group();
        const reticle = new THREE.Group();
        const gimbal = new THREE.Group();
        let labels: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; angle: number }[] = [];
        let turn = 0;
        let spin = 0;

        const build = ({ scene }: { scene: THREE.Scene }) => {
            // Clear what an earlier size built.
            for (const g of [drum, reticle, gimbal]) {
                g.traverse((o) => {
                    const m = o as THREE.Mesh;
                    m.geometry?.dispose();
                    const mat = m.material as THREE.MeshBasicMaterial | undefined;
                    mat?.map?.dispose();
                    mat?.dispose();
                });
                g.clear();
            }
            scene.add(root);
            root.add(reticle, gimbal, drum);

            // Placed on the band: its middle, its height a row of the drum.
            const s = stageEl.getBoundingClientRect();
            const b = band.getBoundingClientRect();
            const wide = window.innerWidth >= 1024;
            const unit = b.height || 80;
            const size = unit / 1.1;
            root.position.set(b.left + b.width / 2 - (s.left + s.width / 2), -(b.top + b.height / 2 - (s.top + s.height / 2)), 0);
            const R = unit / (2 * Math.sin(STEP / 2));
            const font = getComputedStyle(band).fontFamily || "sans-serif";

            // The dates, round the drum's axis (across the screen), later roles further round below.
            let half = 0;
            labels = dates.map((text, k) => {
                const t = dateTexture(text, size, font);
                half = Math.max(half, t.w / 2);
                const mat = new THREE.MeshBasicMaterial({ map: t.tex, transparent: true, depthWrite: false, color: FAINT });
                const mesh = new THREE.Mesh(new THREE.PlaneGeometry(t.w, t.h), mat);
                const angle = k * STEP;
                mesh.position.set(0, -R * Math.sin(angle), R * Math.cos(angle));
                mesh.rotation.x = angle;
                drum.add(mesh);
                return { mesh, angle };
            });
            drum.position.z = -R;
            half = Math.min(half + size * 0.4, b.width / 2 - 8);

            // The drum's frame: a ring at each end with a hub, ribs between the slots, ticks on the rims.
            const frameLines = lines();
            for (const x of [-half, half]) {
                polyline(frameLines, circle(R * 1.02, 96, (a) => [x / (R * 1.02), Math.cos(a), Math.sin(a)]), true);
                polyline(frameLines, circle(R * 0.18, 24, (a) => [x / (R * 0.18), Math.cos(a), Math.sin(a)]), true);
                for (let k = 0; k < SLOTS * 3; k++) {
                    const a = (k / (SLOTS * 3)) * Math.PI * 2;
                    const r1 = R * 1.02, r2 = R * (k % 3 ? 1.06 : 1.1);
                    seg(frameLines, [x, r1 * Math.cos(a), r1 * Math.sin(a)], [x, r2 * Math.cos(a), r2 * Math.sin(a)]);
                }
            }
            for (let k = 0; k < SLOTS; k++) {
                const a = (k + 0.5) * STEP;
                const p: V = [0, -R * Math.sin(a), R * Math.cos(a)];
                seg(frameLines, [-half, p[1], p[2]], [half, p[1], p[2]]);
            }
            seg(frameLines, [-half - size * 0.5, 0, 0], [half + size * 0.5, 0, 0]);
            const cam = (b.height ? s.height : 600) / 2 / Math.tan((15 * Math.PI) / 180);
            drum.add(wire(frameLines, { color: LINE, fade: [cam, cam + 2 * R] }));

            // The reticle: a ring facing the screen with a dotted ring inside it, four ticks and a green arc.
            const rr = (wide ? Math.min(window.innerWidth * 0.42, window.innerHeight * 0.64) : Math.min(window.innerWidth * 0.64, window.innerHeight * 0.26)) / 2;
            const ring = lines();
            polyline(ring, circle(rr, 160, (a) => [Math.cos(a), Math.sin(a), 0]), true);
            for (let k = 0; k < 140; k++) {
                const a = (k / 140) * Math.PI * 2;
                const r = rr * 0.89;
                seg(ring, [r * Math.cos(a), r * Math.sin(a), 0], [r * Math.cos(a + 0.006), r * Math.sin(a + 0.006), 0]);
            }
            for (let k = 0; k < 4; k++) {
                const a = (k * Math.PI) / 2;
                seg(ring, [rr * Math.cos(a), rr * Math.sin(a), 0], [rr * 0.9 * Math.cos(a), rr * 0.9 * Math.sin(a), 0]);
            }
            reticle.add(wire(ring, { color: LINE, fade: FLAT }));
            const arc = lines();
            polyline(arc, Array.from({ length: 13 }, (_, i) => {
                const a = Math.PI / 2 - (i / 12) * 0.32;
                return [rr * Math.cos(a), rr * Math.sin(a), 0] as V;
            }));
            reticle.add(wire(arc, { fade: FLAT }));

            // The gimbal: a second ring tilted into depth, with two pivots, leaning round as the drum turns.
            const g = lines();
            polyline(g, circle(rr * 0.97, 120, (a) => [Math.cos(a), Math.sin(a), 0]), true);
            box(g, rr * 0.05, rr * 0.05, rr * 0.05, [rr * 0.97, 0, 0]);
            box(g, rr * 0.05, rr * 0.05, rr * 0.05, [-rr * 0.97, 0, 0]);
            gimbal.add(wire(g, { color: LINE, opacity: 0.7, fade: [cam - rr * 0.2, cam + rr] }));
        };

        const ctl = stage(host, build, (dt) => {
            const before = turn + spin;
            const k = 1 - Math.exp(-dt * 5);
            turn += (turnTo - turn) * k;
            spin += (reticleTo - spin) * k;
            drum.rotation.x = -turn * STEP;
            reticle.rotation.z = -spin;
            gimbal.rotation.set(1.15, 0, 0);
            gimbal.rotateY(turn * 0.6 + 0.3);
            flash = Math.max(0, flash - dt * 3);
            for (const [k2, l] of labels.entries()) {
                const facing = Math.cos(l.angle - turn * STEP);
                const on = k2 === active;
                // The date coming on flickers in, as the panel's title does.
                const flicker = on && flash > 0 ? (Math.sin(flash * 60) > 0 ? 1 : 0.35) : 1;
                l.mesh.material.color.set(on ? "#19a352" : FAINT);
                l.mesh.material.opacity = Math.max(0, facing) ** 2 * flicker;
            }
            return Math.abs(turn + spin - before) > 1e-4 || flash > 0;
        });
        if (!ctl) return;

        const show = (index: number) => {
            if (index === active) return;
            active = index;
            flash = 1;
            rows.forEach((row, i) => row.toggleAttribute("data-active", i === index));
            names.forEach((name, i) => name.toggleAttribute("data-on", i === index));
            turnTo = Math.max(0, index);
            ctl.redraw();
            const row = rows[index];
            if (!row) return;
            if (counter) counter.textContent = String(index + 1).padStart(2, "0");
            row.querySelectorAll('[data-shuffle="active"]').forEach(shuffle);
            row.querySelectorAll(".xp-facts").forEach(decode);
        };

        const update = () => {
            frame = 0;
            if (!live.matches) return;
            const sticky = parseFloat(getComputedStyle(stageEl).top) || 0;
            const r = track.getBoundingClientRect();
            const p = clamp((sticky - r.top) / Math.max(1, r.height - stageEl.offsetHeight));
            reticleTo = (p * 135 * Math.PI) / 180;
            ctl.redraw();
            show(r.top > window.innerHeight * 0.45 ? -1 : Math.min(n - 1, Math.floor(p * n)));
        };
        const request = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        const sync = () => {
            track.toggleAttribute("data-live", live.matches);
            if (!live.matches) {
                // The log: every role in full, nothing on show.
                active = -2;
                rows.forEach((row) => row.removeAttribute("data-active"));
            }
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
            ctl.stop();
        };
    }, [dates]);

    return <div ref={ref} aria-hidden="true" className="xp-drum" />;
}

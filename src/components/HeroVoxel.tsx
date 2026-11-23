"use client";

import { useEffect, useRef, useState } from "react";
import { reportPortraitProgress } from "@/lib/portraitProgress";

/*
 * The data, made once, offline, from a short video of him turning his head
 * (public/hero/): each frame cut out, its depth estimated by a model, and
 * all of them cropped the same way, so his own small movements stay in.
 *  - voxel.json: the frames' grid and how many to a second (the whole
 *    clip, in the order it was filmed).
 *  - voxel-data.png: one cols x rows tile per frame; 0 where he is not,
 *    1..255 how near he is where he is.
 *  - voxel-photo.jpg: the cut-out frames in grey, in the same grid, larger:
 *    each voxel's brightness, and the detail on its face.
 *  - voxel-still.png: the front frame drawn as voxels, shown (blurred to a
 *    silhouette) only instead of the scene: motion turned down, no WebGL.
 */
type Manifest = { views: number; cols: number; rows: number; perRow: number; photo: [number, number]; front: number; fps: number; yaw: number[] };

const BOOT = {
    grid: [0, 0.9],
    outline: [0.15, 1.05],
    fill: [1.0, 1.35],
    flash: [1.05, 1.9],
} as const;

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (t: number, [a, b]: readonly [number, number]) => clamp((t - a) / (b - a));

function voxelShaders({ views, cols, rows, perRow }: Manifest) {
    const gridRows = Math.ceil(views / perRow);
    // Where a frame's cell is in an atlas laid out perRow frames to a row.
    const tile = /* glsl */ `
vec2 tileUv(float view, vec2 inTile) {
    vec2 at = vec2(mod(view, ${perRow}.0), floor(view / ${perRow}.0));
    return (at + inTile) / vec2(${perRow}.0, ${gridRows}.0);
}
`;
    const vertex = /* glsl */ `
// How much of its cell a particle fills: well apart, so the head reads as a cloud of points.
#define DOT 0.62
uniform sampler2D uData;
uniform sampler2D uPhoto;
uniform float uA, uB, uMix, uCell, uDepth, uReveal, uTime, uScan, uRowsShown, uScatter;
varying float vScat;
// The swipe simulation's state (see SIM_FRAG): where each voxel has been thrown to, and how it is moving.
uniform sampler2D uSimPos;
uniform sampler2D uSimVel;
uniform vec2 uSimSize;
uniform float uSimScale;
attribute float aIndex;
varying vec3 vGlitch;
attribute vec2 aCell;
attribute float aRand;
varying vec3 vNormal, vLit;
varying vec2 vLocal;
varying vec2 vCell;
varying float vLum, vRim, vNear, vScan, vPush;
${tile}
float cellOf(float view, vec2 c) {
    if (c.x < 0.0 || c.y < 0.0 || c.x > ${cols - 1}.0 || c.y > ${rows - 1}.0) return 0.0;
    return texture2D(uData, tileUv(view, (c + 0.5) / vec2(${cols}.0, ${rows}.0))).r;
}
float onOf(float v) { return step(0.5 / 255.0, v); }
float edgeOf(float view, vec2 c) {
    return 4.0 - onOf(cellOf(view, c + vec2(1.0, 0.0))) - onOf(cellOf(view, c - vec2(1.0, 0.0))) - onOf(cellOf(view, c + vec2(0.0, 1.0))) - onOf(cellOf(view, c - vec2(0.0, 1.0)));
}

void main() {
    // Between two frames every cell is morphed: its depth, its brightness and whether it is him at all, all blended.
    float a = cellOf(uA, aCell);
    float b = cellOf(uB, aCell);
    float onA = onOf(a);
    float onB = onOf(b);
    float presence = mix(onA, onB, uMix);
    float za = (a * 255.0 - 1.0) / 254.0;
    float zb = (b * 255.0 - 1.0) / 254.0;
    float z = onA * onB > 0.5 ? mix(za, zb, uMix) : (onA > 0.5 ? za : zb);
    vec2 inTile = (aCell + 0.5) / vec2(${cols}.0, ${rows}.0);
    float lum = mix(texture2D(uPhoto, tileUv(uA, inTile)).r, texture2D(uPhoto, tileUv(uB, inTile)).r, uMix);

    // Each voxel arrives at its own moment of the boot.
    float appear = smoothstep(aRand * 0.75, aRand * 0.75 + 0.25, uReveal);
    // Only what lies inside the frame: the rows below its foot are left out, so he is cut cleanly at the chest.
    float size = smoothstep(0.15, 0.85, presence) * appear * step(aCell.y, uRowsShown - 1.0);
    vRim = clamp(mix(edgeOf(uA, aCell), edgeOf(uB, aCell), uMix), 0.0, 1.0);

    vec3 p = position;
    float depth = (0.06 + z) * uDepth;
    vec3 world = vec3(
        (aCell.x - ${cols}.0 * 0.5 + 0.5 + p.x * DOT * size) * uCell,
        (${rows}.0 * 0.5 - aCell.y - 0.5 + p.y * DOT * size) * uCell,
        (p.z + 0.5) * depth * size
    );
    // Arriving voxels fly in from in front of the face.
    world.z += (1.0 - appear) * (0.6 + aRand * 1.4);
    // Alive: every voxel breathes a little in and out, and now and then a scan passes down the face, lifting what it crosses.
    float scan = exp(-pow((aCell.y / ${rows}.0 - uScan) * 16.0, 2.0));
    world.z += (sin(uTime * 2.1 + aRand * 31.0) * 0.012 + scan * 0.09) * size;
    // Thrown by the swipe (SIM_FRAG): the voxel stands where the simulation has carried it, stretched three times along
    // its flight and thinned to 46% while it moves, and fades with distance; back home it fades in.
    vec2 simUv = (vec2(mod(aIndex, uSimSize.x), floor(aIndex / uSimSize.x)) + 0.5) / uSimSize;
    vec4 simPos = texture2D(uSimPos, simUv);
    vec4 simVel = texture2D(uSimVel, simUv);
    vec3 vel = simVel.xyz * simVel.w;
    float speed = length(vel);
    float moving = smoothstep(0.0, 0.02 * uSimScale, speed);
    if (speed > 1e-5) {
        vec3 dir = vel / speed;
        vec3 shape = vec3(p.xy * DOT * size * uCell, 0.0);
        vec3 streak = (shape + dir * dot(shape, dir) * 2.0) * 0.46;
        world.xy += (streak.xy - shape.xy) * moving;
    }
    world += simPos.xyz;
    // Scrolled away from, the head comes apart: every particle drifts off on its own line and fades, into the field below.
    vec3 away = normalize(vec3(sin(aRand * 71.0), cos(aRand * 37.0), sin(aRand * 13.0) + 0.6));
    world += away * uScatter * uScatter * (2.0 + aRand * 3.0);
    vScat = uScatter;
    float lim = (1.0 + (aRand - 0.5) * 1.2);
    float near = 1.0 - clamp((length(simPos.xyz) - lim * 0.5 * uSimScale) / (lim * 1.06 * uSimScale - lim * 0.5 * uSimScale), 0.0, 1.0);
    float fast = speed / (0.05 * uSimScale);
    float seen = near * (1.0 - simPos.w) * min(mix(0.66, 1.0, clamp(fast / 0.5, 0.0, 1.0)), clamp((1.0 - fast) / 0.5, 0.0, 1.0));
    vGlitch = vec3(moving, step(0.6, aRand), 1.0 - mix(1.0, seen, step(1e-4, length(simPos.xyz) + simPos.w)));
    float push = 0.0;
    vPush = clamp(push * 2.5, 0.0, 1.0);

    vNormal = normal;
    vLit = normalize(normalMatrix * normal);
    vLocal = p.xy;
    vCell = aCell;
    vLum = lum;
    vNear = z;
    vScan = scan * size;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
}
`;
    const fragment = /* glsl */ `
uniform sampler2D uPhoto;
uniform vec3 uColor;
uniform float uA, uB, uMix, uOutline, uFlash, uRim, uAlpha, uDetail;
varying vec3 vNormal, vLit;
varying vec2 vLocal;
varying vec2 vCell;
varying float vLum, vRim, vNear, vScan, vPush;
varying vec3 vGlitch;
varying float vScat;
${tile}

void main() {
    float front = step(0.5, vNormal.z);
    // Each voxel is a round particle: only its face, cut to a disc (stretched with it when the swipe throws it).
    float r = length(vLocal);
    if (front < 0.5 || r > 0.5) discard;
    // Lit from in front, a little from the left and above: as he moves, the voxels' sides catch the light or fall into shade.
    float light = 0.55 + 0.45 * max(dot(vLit, normalize(vec3(-0.35, 0.45, 1.0))), 0.0);
    // The frames laid across the voxel faces, so each cell keeps the detail inside it.
    vec2 inTile = vec2((vCell.x + 0.5 + vLocal.x) / ${cols}.0, (vCell.y + 0.5 - vLocal.y) / ${rows}.0);
    float photo = mix(texture2D(uPhoto, tileUv(uA, inTile)).r, texture2D(uPhoto, tileUv(uB, inTile)).r, uMix);
    // Only a silhouette should read: the face's light and dark are mostly flattened away (uDetail of them is kept).
    float lum = mix(0.3, mix(vLum, photo, 0.7 * front), uDetail);
    float shade = (front > 0.5 ? 1.0 : (abs(vNormal.x) > 0.5 ? 0.42 : 0.3)) * light;
    vec3 col = uColor * (0.08 + 1.35 * lum) * shade + vec3(0.6, 1.0, 0.75) * pow(lum, 2.5) * 0.55 * front;
    // The silhouette's edge glows (strongest just after the flash), and the scan lights what it crosses.
    col += uColor * vRim * (0.9 + 1.6 * uRim) * front;
    col += (uColor * 0.9 + vec3(0.1, 0.25, 0.15)) * vScan * 0.55;
    // While the head is only an outline, each voxel is just its square's edge.
    float edge = step(0.4, max(abs(vLocal.x), abs(vLocal.y)));
    col = mix(col, (uColor * 1.5 + vec3(0.1, 0.25, 0.15)) * edge * front, uOutline);
    // The boot flash: every face lit at once, then the picture comes through.
    col = mix(col, uColor * 1.6 + vec3(0.35, 0.5, 0.4) * vNear, uFlash);
    // Voxels the pointer has pushed away light up, so they read as sparks scattering out of the haze.
    col = mix(col, uColor * 2.2 + vec3(0.25, 0.45, 0.3), vPush);
    // Peeled blocks catch the light in the site's greens: some the accent, some paler, a few flickering near-white.
    vec3 tint = vGlitch.y > 0.5 ? uColor * 2.2 : uColor * 1.5 + vec3(0.06, 0.15, 0.1);
    vec3 peeled = tint * (0.55 + 0.8 * photo);
    col = mix(col, peeled, clamp(vGlitch.x * 1.9, 0.0, 1.0));
    // Faint, like a projection: dimmer, and partly see-through (fully solid only in the flash, and where pushed).
    // Glowing like the particles further down the page: a bright core, a soft edge.
    col = col * 1.25 + vec3(0.45, 0.75, 0.55) * smoothstep(0.22, 0.0, r) * 0.5;
    float alpha = mix(mix(uAlpha, 1.0, uFlash), 1.0, max(vPush, vGlitch.x)) * (1.0 - vGlitch.z) * smoothstep(0.5, 0.3, r) * (1.0 - vScat * vScat);
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(col * 1.9, alpha);
}
`;
    return { vertex, fragment };
}

const POST_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const POST_FRAG = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D tHead;
uniform float uTime, uGlitch, uBarrel, uHaze;
uniform vec2 uTexel;
varying vec2 vUv;

float rnd(float x) { return fract(sin(x * 91.345) * 47453.5453); }

// A soft copy of the head's layer (colour and coverage): thirty taps on three rings round the point, wide enough that
// only the head's shape survives.
vec4 soft(vec2 uv) {
    vec4 sum = vec4(0.0);
    for (int i = 0; i < 10; i++) {
        float a = float(i) * 0.628319 + 0.3;
        vec2 d = vec2(cos(a), sin(a)) * uTexel;
        sum += texture2D(tHead, uv + d * 4.0) + texture2D(tHead, uv + d * 10.0) + texture2D(tHead, uv + d * 18.0);
    }
    return sum / 30.0;
}

void main() {
    // A curved screen: the picture bulges, so straight lines bow outwards.
    vec2 c = vUv * 2.0 - 1.0;
    vec2 uv = c * (1.0 + uBarrel * dot(c, c)) * 0.5 + 0.5;
    // Glitch: thin bands of the picture slipped sideways.
    float row = floor(uv.y * 56.0);
    float tick = floor(uTime * 14.0);
    float slip = step(1.0 - 0.3 * uGlitch, rnd(row + tick * 7.13));
    uv.x += slip * (rnd(row * 3.1 + tick) - 0.5) * 0.08 * uGlitch;
    float ca = 0.0012 + 0.006 * uGlitch;
    vec3 col = vec3(
        texture2D(tScene, uv + vec2(ca, 0.0)).r,
        texture2D(tScene, uv).g,
        texture2D(tScene, uv - vec2(ca, 0.0)).b
    );
    // The head alone is soft and glowing: its particles partly given over to a blurred copy, with a glow of it,
    // then laid over the sharp grid by how much of each point it covers.
    vec4 head = texture2D(tHead, uv);
    vec4 haze = soft(uv);
    // Peeled blocks are drawn solid (alpha near 1, the rest of the head is see-through): those stay sharp, out of the haze.
    float solid = smoothstep(0.62, 0.8, head.a);
    head = mix(head, haze, 0.4 * uHaze * (1.0 - solid));
    // The haze also laid on top as a glow, so the particles bloom.
    col = col * (1.0 - clamp(head.a, 0.0, 1.0)) + head.rgb + haze.rgb * 0.9 * uHaze;
    // Scan lines and a faint flicker, like a CRT feed.
    col *= 0.86 + 0.14 * step(0.5, fract(gl_FragCoord.y * 0.25));
    col *= 0.95 + 0.05 * rnd(floor(uTime * 30.0));
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) col = vec3(0.0);
    col *= 1.0 - 0.38 * dot(c, c);
    gl_FragColor = vec4(col, 1.0);
}
`;

/*
 * The swipe, simulated the way the reference simulates it: every voxel has its own offset and velocity, kept in two float
 * textures (one texel per voxel) and stepped 120 times a second. The pointer, moving, pushes the voxels within reach of
 * where it is on the face the way it moves, as hard as it moves; a pushed voxel that gets going keeps going (never slower
 * than a floor speed, the rest bled off by drag) until it is far enough out, then it is put back home, invisible, and
 * fades in. A click sends a ring out. The reference's constants, scaled by uScale from its voxel size to ours.
 */
const SIM_VERT = /* glsl */ `
void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const SIM_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uPos;
uniform sampler2D uVel;
uniform sampler2D uHome;
uniform vec2 uCursor;
uniform vec2 uCursorVel;
uniform vec2 uWaveOrigin;
uniform float uWaveProgress;
uniform float uScale;
uniform float uStep;
layout(location = 0) out highp vec4 outPos;
layout(location = 1) out highp vec4 outVel;

void main() {
    ivec2 at = ivec2(gl_FragCoord.xy);
    vec4 d = texelFetch(uPos, at, 0);
    vec4 m = texelFetch(uVel, at, 0);
    vec4 home = texelFetch(uHome, at, 0);
    float S = uScale;
    vec3 here = vec3(home.xy, 0.0) + d.xyz;
    // The push: from the pointer's motion, within 1.1 of it.
    float near = smoothstep(1.1 * S, 0.0, distance(here.xy, uCursor));
    float a = length(uCursorVel);
    float strength = smoothstep(0.0, 0.01 * S, a) * clamp(a, 0.0, 2.0 * S);
    vec3 force = vec3(uCursorVel / max(a, 1e-4), 0.0) * near * 0.45 * strength;
    // The ring a click sends out.
    vec2 fromWave = here.xy - uWaveOrigin;
    float h = length(fromWave);
    float ring = smoothstep(2.3 * S, 0.0, abs(h - uWaveProgress * 18.0 * S)) * (1.0 - uWaveProgress);
    force += vec3(fromWave / max(h, 1e-4), 0.0) * ring * 0.015 * S / uStep;
    m.xyz += force * uStep;
    float drag = 1.0 - min(0.85 * uStep, 0.98);
    float floorSpeed = 0.0075 * S;
    float x = length(m.xyz);
    m.w = max(m.w, step(floorSpeed, x));
    if (m.w > 0.0) {
        m.xyz = m.xyz / max(x, 1e-6) * max(x * drag, floorSpeed);
        d.xyz += m.xyz;
    } else {
        m.xyz *= drag;
    }
    float lim = (1.0 + (home.z - 0.5) * 1.2) * 1.06 * S;
    if (length(d.xyz) >= lim) {
        d = vec4(0.0, 0.0, 0.0, 1.0);
        m = vec4(0.0);
    } else {
        d.w = max(d.w - uStep / 0.16, 0.0);
    }
    outPos = d;
    outVel = m;
}
`;

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/** Resolves once the intro has lifted (or at once if there is none), so the boot is seen. */
function introLifted() {
    const html = document.documentElement;
    if (html.dataset.intro !== "show") return Promise.resolve();
    return new Promise<void>((resolve) => {
        const watch = new MutationObserver(() => {
            if (html.dataset.intro === "show") return;
            watch.disconnect();
            setTimeout(resolve, 450);
        });
        watch.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
    });
}

/**
 * The hero's portrait as the reference builds its own: his head in voxel
 * columns in front of a wireframe grid, on a curved, flickering screen,
 * moving the way he moved on film.
 *
 * When the intro lifts it boots: the grid comes up, the head is drawn as
 * the outlines of its voxels (turned three-quarters away), every voxel
 * flashes green and the picture comes through, and then the film runs:
 * every move is his own, at its own speed, each cell morphing from one
 * frame to the next, and at either end it plays back the other way, so it
 * never jumps. Over it a scan passes down his face now and then, the feed
 * glitches. Each voxel is drawn as a glowing particle, and as the hero is
 * scrolled away the particles drift apart and fade into the field below.
 *
 * Three.js, loaded only here, after the page; one canvas, paused while the
 * hero is off the screen or the tab is hidden. With motion turned down, or
 * where WebGL fails, a still silhouette stands in for it.
 */
export default function HeroVoxel({ className = "" }: { className?: string }) {
    const host = useRef<HTMLDivElement>(null);
    // The still silhouette is only for when the scene will not run (motion turned down, no WebGL); otherwise nothing shows
    // before the boot, and the still is never fetched.
    const [fallback, setFallback] = useState(false);

    useEffect(() => {
        const el = host.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            reportPortraitProgress(1);
            setFallback(true);
            return;
        }
        let stop = () => {};
        let cancelled = false;

        (async () => {
            const [THREE, manifest, dataImg, photoImg] = await Promise.all([
                import("three"),
                fetch("/hero/voxel.json").then((r) => r.json() as Promise<Manifest>),
                loadImage("/hero/voxel-data.png"),
                loadImage("/hero/voxel-photo.jpg"),
            ]);
            reportPortraitProgress(1);
            // Nothing is built until the intro has lifted, so the boot plays where it can be seen.
            await introLifted();
            if (cancelled) return;
            const { views, cols, rows, perRow } = manifest;
            const last = views - 1;

            // The data on the CPU too: which cells are ever him decides which voxels exist.
            const read = document.createElement("canvas");
            read.width = dataImg.width;
            read.height = dataImg.height;
            const rc = read.getContext("2d", { willReadFrequently: true });
            if (!rc) return;
            rc.drawImage(dataImg, 0, 0);
            const px = rc.getImageData(0, 0, read.width, read.height).data;
            const cells: number[] = [];
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    let ever = false;
                    for (let v = 0; v < views && !ever; v++) {
                        const gx = (v % perRow) * cols + x;
                        const gy = Math.floor(v / perRow) * rows + y;
                        ever = px[(gy * read.width + gx) * 4] > 0;
                    }
                    if (ever) cells.push(x, y);
                }
            }
            const count = cells.length / 2;

            const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
            const phone = window.matchMedia("(max-width: 767px)").matches;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.4 : 1.6));
            renderer.setClearColor(0x050505, 1);
            renderer.domElement.className = "hero-canvas";
            el.appendChild(renderer.domElement);

            const green = new THREE.Color("#19a352");
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
            camera.position.set(0, 0.2, 7.7);

            // The wall behind him: a wireframe grid, bowed by the screen's curve.
            const gridPts: number[] = [];
            const GW = 26;
            const GH = 16;
            const STEP = 0.48;
            for (let x = -GW / 2; x <= GW / 2 + 1e-6; x += STEP) gridPts.push(x, -GH / 2, 0, x, GH / 2, 0);
            for (let y = -GH / 2; y <= GH / 2 + 1e-6; y += STEP) gridPts.push(-GW / 2, y, 0, GW / 2, y, 0);
            const gridGeo = new THREE.BufferGeometry();
            gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridPts, 3));
            const gridMat = new THREE.LineBasicMaterial({ color: new THREE.Color("#7fd9a4"), transparent: true, opacity: 0 });
            const grid = new THREE.LineSegments(gridGeo, gridMat);
            grid.position.z = -2.2;
            scene.add(grid);

            // The window he is shown in (no longer drawn): the camera is fitted to it, and he is cut at the chest at its foot.
            // FRAME_Z is level with his face.
            const CELL = 3.4 / cols;
            const ROWS_SHOWN = Math.round(rows * 0.86);
            const FRAME_Z = 0.8;
            const boxW = cols * CELL + 0.12;
            const boxH = ROWS_SHOWN * CELL + 0.12;
            const boxCy = rows * 0.5 * CELL - (ROWS_SHOWN * CELL) / 2;

            // The head: one box per cell, instanced; where each one stands is worked out in the shader.
            const box = new THREE.BoxGeometry(1, 1, 1);
            const geo = new THREE.InstancedBufferGeometry();
            geo.index = box.index;
            geo.setAttribute("position", box.getAttribute("position"));
            geo.setAttribute("normal", box.getAttribute("normal"));
            geo.setAttribute("aCell", new THREE.InstancedBufferAttribute(new Float32Array(cells), 2));
            const rand = new Float32Array(count);
            for (let i = 0; i < count; i++) rand[i] = Math.random();
            geo.setAttribute("aRand", new THREE.InstancedBufferAttribute(rand, 1));
            geo.instanceCount = count;
            const index = new Float32Array(count);
            for (let i = 0; i < count; i++) index[i] = i;
            geo.setAttribute("aIndex", new THREE.InstancedBufferAttribute(index, 1));

            const dataTex = new THREE.Texture(dataImg);
            dataTex.flipY = false;
            dataTex.minFilter = dataTex.magFilter = THREE.NearestFilter;
            dataTex.generateMipmaps = false;
            dataTex.needsUpdate = true;
            const photoTex = new THREE.Texture(photoImg);
            photoTex.flipY = false;
            photoTex.minFilter = THREE.LinearFilter;
            photoTex.generateMipmaps = false;
            photoTex.needsUpdate = true;

            // The swipe simulation: one texel per voxel, two states to swap between.
            const SIM_W = 128;
            const SIM_H = Math.ceil(count / SIM_W);
            // The reference's voxel is about 0.09 across, ours CELL: its distances and speeds scale by the ratio.
            const SIM_SCALE = (3.4 / cols) / 0.09;
            const homes = new Float32Array(SIM_W * SIM_H * 4);
            for (let i = 0; i < count; i++) {
                homes[i * 4] = (cells[i * 2] - cols / 2 + 0.5) * (3.4 / cols);
                homes[i * 4 + 1] = (rows / 2 - cells[i * 2 + 1] - 0.5) * (3.4 / cols);
                homes[i * 4 + 2] = rand[i];
            }
            const homeTex = new THREE.DataTexture(homes, SIM_W, SIM_H, THREE.RGBAFormat, THREE.FloatType);
            homeTex.needsUpdate = true;
            const floatOk = renderer.extensions.has("EXT_color_buffer_float");
            const simTarget = () =>
                new THREE.WebGLRenderTarget(SIM_W, SIM_H, {
                    count: 2,
                    type: floatOk ? THREE.FloatType : THREE.HalfFloatType,
                    minFilter: THREE.NearestFilter,
                    magFilter: THREE.NearestFilter,
                    depthBuffer: false,
                    generateMipmaps: false,
                });
            let simRead = simTarget();
            let simWrite = simTarget();
            for (const t of [simRead, simWrite]) {
                renderer.setRenderTarget(t);
                renderer.setClearColor(0x000000, 0);
                renderer.clear();
            }
            renderer.setRenderTarget(null);
            renderer.setClearColor(0x050505, 1);
            const simMat = new THREE.ShaderMaterial({
                glslVersion: THREE.GLSL3,
                vertexShader: SIM_VERT,
                fragmentShader: SIM_FRAG,
                uniforms: {
                    uPos: { value: null },
                    uVel: { value: null },
                    uHome: { value: homeTex },
                    uCursor: { value: new THREE.Vector2(99, 99) },
                    uCursorVel: { value: new THREE.Vector2() },
                    uWaveOrigin: { value: new THREE.Vector2(99, 99) },
                    uWaveProgress: { value: 1 },
                    uScale: { value: SIM_SCALE },
                    uStep: { value: 1 / 120 },
                },
                depthTest: false,
                depthWrite: false,
            });
            const simScene = new THREE.Scene();
            simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat));
            const simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const simStep = () => {
                simMat.uniforms.uPos.value = simRead.textures[0];
                simMat.uniforms.uVel.value = simRead.textures[1];
                renderer.setRenderTarget(simWrite);
                renderer.render(simScene, simCam);
                [simRead, simWrite] = [simWrite, simRead];
            };

            const { vertex, fragment } = voxelShaders(manifest);
            const voxelMat = new THREE.ShaderMaterial({
                vertexShader: vertex,
                fragmentShader: fragment,
                transparent: true,
                uniforms: {
                    uData: { value: dataTex },
                    uPhoto: { value: photoTex },
                    uColor: { value: green },
                    uA: { value: 0 },
                    uB: { value: 1 },
                    uMix: { value: 0 },
                    uCell: { value: CELL },
                    uRowsShown: { value: ROWS_SHOWN },
                    uDepth: { value: 1.05 },
                    uReveal: { value: 0 },
                    uOutline: { value: 1 },
                    uFlash: { value: 0 },
                    uRim: { value: 0 },
                    uTime: { value: 0 },
                    uScan: { value: 2 },
                    uSimPos: { value: null },
                    uSimVel: { value: null },
                    uSimSize: { value: new THREE.Vector2(SIM_W, SIM_H) },
                    uSimScale: { value: SIM_SCALE },
                    uAlpha: { value: 0.95 },
                    uScatter: { value: 0 },
                    uDetail: { value: 0.1 },
                },
            });
            const head = new THREE.Mesh(geo, voxelMat);
            head.frustumCulled = false;
            const rig = new THREE.Group();
            rig.add(head);
            // The head is drawn on its own layer, so it alone can be blurred (see the screen pass).
            const headScene = new THREE.Scene();
            headScene.add(rig);

            // The screen: the scene drawn off-screen, then bowed, scanned and glitched.
            const target = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: false });
            const headTarget = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: true });
            const postMat = new THREE.ShaderMaterial({
                vertexShader: POST_VERT,
                fragmentShader: POST_FRAG,
                uniforms: {
                    tScene: { value: target.texture },
                    tHead: { value: headTarget.texture },
                    uTime: { value: 0 },
                    uGlitch: { value: 0 },
                    uBarrel: { value: 0.12 },
                    uHaze: { value: 1 },
                    uTexel: { value: new THREE.Vector2(1 / 1024, 1 / 1024) },
                },
                depthTest: false,
            });
            const post = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
            const postScene = new THREE.Scene();
            postScene.add(post);
            const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

            const fit = () => {
                const w = el.clientWidth;
                const h = el.clientHeight;
                renderer.setSize(w, h, false);
                const pr = renderer.getPixelRatio();
                target.setSize(Math.round(w * pr), Math.round(h * pr));
                headTarget.setSize(Math.round(w * pr), Math.round(h * pr));
                postMat.uniforms.uTexel.value.set(1 / Math.max(1, w), 1 / Math.max(1, h));
                const aspect = w / h;
                camera.aspect = aspect;
                // The camera stands back far enough for the whole frame to show: on a wide screen it takes at most three
                // quarters of the height and two fifths of the width (the words are either side); on a tall one most of the width.
                const wide = aspect > 1.05;
                camera.fov = wide ? 33 : 40;
                camera.updateProjectionMatrix();
                const tan = Math.tan(((camera.fov / 2) * Math.PI) / 180);
                const fitH = wide ? 0.76 : 0.62;
                const fitW = wide ? 0.4 : 0.86;
                const dist = Math.max(boxH / (2 * tan * fitH), boxW / (2 * tan * aspect * fitW));
                camera.position.set(0, 0, FRAME_Z + dist);
                // The frame in the middle of the stage, a little above it, where the name runs across the foot (more so on a phone, where the words sit below).
                const visH = 2 * tan * dist;
                const x = 0;
                const y = (wide ? 0.04 : 0.1) * visH - boxCy;
                rig.position.set(x, y, 0);
            };
            fit();
            const resize = new ResizeObserver(fit);
            resize.observe(el);

            // Where the pointer is, on a plane just in front of the face.
            const pointer = { x: 0, y: 0, active: false, last: 0 };
            const onMove = (e: PointerEvent) => {
                const r = el.getBoundingClientRect();
                pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
                pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
                pointer.active = e.pointerType === "mouse" || e.pointerType === "pen";
                pointer.last = performance.now();
            };
            window.addEventListener("pointermove", onMove, { passive: true });
            // A press on the face sends a ring out through the voxels (the wave, in the simulation).
            const onDown = (e: PointerEvent) => {
                if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
                onMove(e);
                pendingWave = true;
            };
            let pendingWave = false;
            window.addEventListener("pointerdown", onDown, { passive: true });
            const ray = new THREE.Raycaster();
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.9);
            const hit = new THREE.Vector3();
            const ndc = new THREE.Vector2();

            let visible = true;
            const io = new IntersectionObserver(([entry]) => {
                visible = entry.isIntersecting;
                if (visible) loop();
            });
            io.observe(el);

            el.setAttribute("data-live", "");
            const t0 = performance.now();
            // The film plays as it was shot, at its own speed, from the boot on; at either end it runs back the other way, so it never jumps.
            const fps = manifest.fps || 15;
            const PLAY_FROM = 1.6;
            // Slower than life: the film runs at this fraction of its own speed, the cells morphing across the longer gaps.
            const SPEED = 0.55;
            const local = new THREE.Vector3();
            let lastNow = 0;
            let simDebt = 0;
            let cursorOn = false;
            const cursorSmooth = new THREE.Vector2();
            const cursorPrev = new THREE.Vector2();
            let glitchUntil = 0;
            let nextGlitch = 0;
            let frame = 0;

            const render = (now: number) => {
                frame = 0;
                const t = (now - t0) / 1000;
                const u = voxelMat.uniforms;
                const boot = span(t, BOOT.grid) * (t < 0.9 ? (Math.random() < 0.85 ? 1 : 0.3) : 1);
                gridMat.opacity = 0.55 * boot;
                u.uReveal.value = span(t, BOOT.outline);
                u.uOutline.value = 1 - span(t, BOOT.fill);
                const flash = span(t, BOOT.flash);
                u.uFlash.value = flash < 0.12 ? flash / 0.12 : Math.pow(1 - (flash - 0.12) / 0.88, 2);
                u.uRim.value = clamp(1 - (t - 1.2) / 1.6) * (t > 1.05 ? 1 : 0);
                u.uTime.value = t;

                const played = Math.max(0, t - PLAY_FROM) * fps * SPEED;
                const cycle = played % (2 * last);
                const pos = cycle <= last ? cycle : 2 * last - cycle;
                const a = Math.min(last - 1, Math.floor(pos));
                u.uA.value = a;
                u.uB.value = a + 1;
                u.uMix.value = pos - a;
                // A scan down the face every five seconds or so.
                const scanT = ((t - 3.5) % 5.2) / 1.4;
                u.uScan.value = t > 3.5 && scanT < 1 ? scanT * 1.3 - 0.15 : 2;
                const pointing = pointer.active && now - pointer.last < 2500;
                // The pointer on the face's plane, in the head's own coordinates, smoothed, and how fast it moves there
                // (the reference's cursor velocity: per second, decaying fast once the pointer stops).
                const dt = Math.min(0.1, (now - (lastNow || now)) / 1000);
                lastNow = now;
                const sim = simMat.uniforms;
                let onFace = false;
                if (pointing && t > PLAY_FROM && Math.abs(pointer.x) <= 1 && Math.abs(pointer.y) <= 1) {
                    ray.setFromCamera(ndc.set(pointer.x, pointer.y), camera);
                    if (ray.ray.intersectPlane(plane, hit)) {
                        local.copy(hit);
                        head.worldToLocal(local);
                        onFace = true;
                    }
                }
                if (onFace && dt > 0) {
                    if (!cursorOn) {
                        cursorOn = true;
                        cursorSmooth.set(local.x, local.y);
                        cursorPrev.copy(cursorSmooth);
                    }
                    const follow = 1 - Math.exp(-60 * dt);
                    cursorSmooth.x += (local.x - cursorSmooth.x) * follow;
                    cursorSmooth.y += (local.y - cursorSmooth.y) * follow;
                    const mx = cursorSmooth.x - cursorPrev.x;
                    const my = cursorSmooth.y - cursorPrev.y;
                    if (mx * mx + my * my > 1e-8) sim.uCursorVel.value.set(mx / dt, my / dt);
                    else sim.uCursorVel.value.multiplyScalar(Math.exp(-15 * dt));
                    cursorPrev.copy(cursorSmooth);
                    sim.uCursor.value.copy(cursorSmooth);
                } else {
                    cursorOn = false;
                    sim.uCursorVel.value.set(0, 0);
                }
                if (pendingWave) {
                    pendingWave = false;
                    if (onFace) {
                        sim.uWaveOrigin.value.set(local.x, local.y);
                        sim.uWaveProgress.value = 0;
                    }
                }
                sim.uWaveProgress.value = Math.min(1, sim.uWaveProgress.value + dt / 1.2);
                // Fixed steps of 1/120 s, at most four a frame.
                simDebt = Math.min(simDebt + dt, 4 / 120);
                while (simDebt >= 1 / 120) {
                    simDebt -= 1 / 120;
                    simStep();
                }
                u.uSimPos.value = simRead.textures[0];
                u.uSimVel.value = simRead.textures[1];

                // Now and then the feed glitches; always across the flash.
                if (t > 4 && t > nextGlitch) {
                    glitchUntil = t + 0.12 + Math.random() * 0.25;
                    nextGlitch = t + 3 + Math.random() * 5;
                }
                const bootGlitch = t > 0.95 && t < 1.25 ? 1 : 0;
                postMat.uniforms.uGlitch.value = Math.max(bootGlitch, t < glitchUntil ? 0.6 + Math.random() * 0.4 : 0);
                postMat.uniforms.uTime.value = t;

                // As the hero scrolls away, the head comes apart.
                u.uScatter.value = clamp(-el.getBoundingClientRect().top / Math.max(1, el.clientHeight));

                // The grid, the head on a clear layer of its own, and the screen pass that joins them.
                renderer.setRenderTarget(target);
                renderer.render(scene, camera);
                renderer.setRenderTarget(headTarget);
                renderer.setClearColor(0x000000, 0);
                renderer.render(headScene, camera);
                renderer.setClearColor(0x050505, 1);
                renderer.setRenderTarget(null);
                renderer.render(postScene, postCam);
                if (visible && !document.hidden) loop();
            };
            function loop() {
                if (!frame && !cancelled) frame = requestAnimationFrame(render);
            }
            const onVis = () => !document.hidden && loop();
            document.addEventListener("visibilitychange", onVis);
            loop();

            stop = () => {
                cancelAnimationFrame(frame);
                io.disconnect();
                resize.disconnect();
                document.removeEventListener("visibilitychange", onVis);
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerdown", onDown);
                [box, geo, gridGeo, post.geometry].forEach((g) => g.dispose());
                [voxelMat, gridMat, postMat].forEach((m) => m.dispose());
                [dataTex, photoTex].forEach((tex) => tex.dispose());
                target.dispose();
                headTarget.dispose();
                simRead.dispose();
                simWrite.dispose();
                homeTex.dispose();
                simMat.dispose();
                renderer.dispose();
                // Let the GPU context go now, not whenever it is collected: phones allow only a few, and a page that kept
                // making new ones (the demos remount as their tabs change) ran out of memory and the browser reloaded it.
                renderer.forceContextLoss();
                renderer.domElement.remove();
            };
            if (cancelled) stop();
        })().catch(() => {
            // No WebGL, or the data did not load: the still silhouette instead, and the intro is not kept waiting.
            reportPortraitProgress(1);
            if (!cancelled) setFallback(true);
        });

        return () => {
            cancelled = true;
            stop();
        };
    }, []);

    return (
        <div ref={host} aria-hidden="true" className={className}>
            {fallback && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/hero/voxel-still.png" alt="" className="hero-still" decoding="async" />
            )}
        </div>
    );
}

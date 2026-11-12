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
uniform sampler2D uData;
uniform sampler2D uPhoto;
uniform float uA, uB, uMix, uCell, uDepth, uReveal, uTime, uScan, uPush, uRowsShown;
uniform vec2 uPointer;
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
        (aCell.x - ${cols}.0 * 0.5 + 0.5 + p.x * 0.84 * size) * uCell,
        (${rows}.0 * 0.5 - aCell.y - 0.5 + p.y * 0.84 * size) * uCell,
        (p.z + 0.5) * depth * size
    );
    // Arriving voxels fly in from in front of the face.
    world.z += (1.0 - appear) * (0.6 + aRand * 1.4);
    // Alive: every voxel breathes a little in and out, and now and then a scan passes down the face, lifting what it crosses.
    float scan = exp(-pow((aCell.y / ${rows}.0 - uScan) * 16.0, 2.0));
    world.z += (sin(uTime * 2.1 + aRand * 31.0) * 0.012 + scan * 0.09) * size;
    // The pointer pushes the voxels away: those near it scatter outwards and towards us, each by its own amount, and drift
    // back as it leaves (uPush eases in and out). Measured from each voxel's centre, so a box moves whole.
    vec2 centre = vec2(aCell.x - ${cols}.0 * 0.5 + 0.5, ${rows}.0 * 0.5 - aCell.y - 0.5) * uCell;
    vec2 away = centre - uPointer;
    float dist = length(away);
    float push = uPush * pow(max(0.0, 1.0 - dist / 0.75), 2.0) * (0.5 + aRand);
    world.xy += (dist > 1e-4 ? away / dist : vec2(0.0)) * push * 0.55;
    world.z += push * (0.4 + aRand * 0.8);
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
${tile}

void main() {
    float front = step(0.5, vNormal.z);
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
    // Faint, like a projection: dimmer, and partly see-through (fully solid only in the flash, and where pushed).
    gl_FragColor = vec4(col * 0.85, mix(mix(uAlpha, 1.0, uFlash), 1.0, vPush));
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
    // The head alone is blurred and hazy, as if half there: its sharp layer partly given over to a soft one, with a glow of it,
    // then laid over the sharp grid by how much of each point it covers.
    vec4 head = texture2D(tHead, uv);
    vec4 haze = soft(uv);
    head = mix(head, haze, 0.82 * uHaze);
    col = col * (1.0 - clamp(head.a, 0.0, 1.0)) + head.rgb + haze.rgb * 0.3 * uHaze;
    // Scan lines and a faint flicker, like a CRT feed.
    col *= 0.86 + 0.14 * step(0.5, fract(gl_FragCoord.y * 0.25));
    col *= 0.95 + 0.05 * rnd(floor(uTime * 30.0));
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) col = vec3(0.0);
    col *= 1.0 - 0.38 * dot(c, c);
    gl_FragColor = vec4(col, 1.0);
}
`;

const TRAIL_VERT = /* glsl */ `
attribute float aAge;
uniform float uPixel;
varying float vAge;
void main() {
    vAge = aAge;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uPixel * (1.0 - aAge * 0.8) * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
}
`;

const TRAIL_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
varying float vAge;
void main() {
    // Square points: voxels too.
    gl_FragColor = vec4(uColor * (1.4 - vAge), (1.0 - vAge) * uAlpha);
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
 * glitches, and a short trail of voxels follows the pointer.
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

            // The frame he stands in, like a camera's window: a darker pane, a hairline round it and bright corners. It is
            // drawn level with his face (FRAME_Z), so what stands nearer than his shoulders still sits inside it.
            const CELL = 3.4 / cols;
            const ROWS_SHOWN = Math.round(rows * 0.86);
            const FRAME_Z = 0.8;
            const boxW = cols * CELL + 0.12;
            const boxH = ROWS_SHOWN * CELL + 0.12;
            const boxCy = rows * 0.5 * CELL - (ROWS_SHOWN * CELL) / 2;
            const view = new THREE.Group();
            const pane = new THREE.Mesh(new THREE.PlaneGeometry(boxW, boxH), new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0 }));
            const hw = boxW / 2;
            const hh = boxH / 2;
            const edgeGeo = new THREE.BufferGeometry();
            edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute([-hw, -hh, 0, hw, -hh, 0, hw, -hh, 0, hw, hh, 0, hw, hh, 0, -hw, hh, 0, -hw, hh, 0, -hw, -hh, 0], 3));
            const edgeMat = new THREE.LineBasicMaterial({ color: green, transparent: true, opacity: 0 });
            const edge = new THREE.LineSegments(edgeGeo, edgeMat);
            // The corners: two thin bars each, a little outside the hairline.
            const cornerMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#3be38a"), transparent: true, opacity: 0 });
            const arm = 0.32;
            const bar = 0.022;
            const corners = new THREE.Group();
            for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]] as const) {
                const across = new THREE.Mesh(new THREE.PlaneGeometry(arm, bar), cornerMat);
                across.position.set(sx * (hw - arm / 2 + bar / 2), sy * (hh + bar / 2), 0.001);
                const down = new THREE.Mesh(new THREE.PlaneGeometry(bar, arm), cornerMat);
                down.position.set(sx * (hw + bar / 2), sy * (hh - arm / 2 + bar / 2), 0.001);
                corners.add(across, down);
            }
            view.add(pane, edge, corners);
            scene.add(view);

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
                    uPush: { value: 0 },
                    uPointer: { value: new THREE.Vector2(99, 99) },
                    uAlpha: { value: 0.6 },
                    uDetail: { value: 0.22 },
                },
            });
            const head = new THREE.Mesh(geo, voxelMat);
            head.frustumCulled = false;
            const rig = new THREE.Group();
            rig.add(head);
            // The head is drawn on its own layer, so it alone can be blurred (see the screen pass).
            const headScene = new THREE.Scene();
            headScene.add(rig);

            // A short trail of voxels after the pointer (or, with none, round the head).
            const TRAIL = 140;
            const trailPos = new Float32Array(TRAIL * 3);
            const trailAge = new Float32Array(TRAIL);
            for (let i = 0; i < TRAIL; i++) trailAge[i] = i / TRAIL;
            const trailGeo = new THREE.BufferGeometry();
            trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
            trailGeo.setAttribute("aAge", new THREE.BufferAttribute(trailAge, 1));
            const trailMat = new THREE.ShaderMaterial({
                vertexShader: TRAIL_VERT,
                fragmentShader: TRAIL_FRAG,
                uniforms: { uColor: { value: green }, uAlpha: { value: 0 }, uPixel: { value: 7 * renderer.getPixelRatio() } },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });
            const trail = new THREE.Points(trailGeo, trailMat);
            trail.frustumCulled = false;
            // The trail goes on top of everything, sharp, after the screen pass.
            const trailScene = new THREE.Scene();
            trailScene.add(trail);
            const history: { x: number; y: number; z: number }[] = Array.from({ length: TRAIL }, () => ({ x: 0, y: 0.6, z: 0.8 }));

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
                // The frame in the middle of the stage (a little above it on a phone, where the words sit below), a touch right on a wide screen.
                const visW = 2 * tan * dist * aspect;
                const visH = 2 * tan * dist;
                const x = wide ? visW * 0.06 : 0;
                const y = (wide ? -0.02 : 0.1) * visH - boxCy;
                rig.position.set(x, y, 0);
                view.position.set(x, y + boxCy, FRAME_Z);
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
            let glitchUntil = 0;
            let nextGlitch = 0;
            let frame = 0;

            const render = (now: number) => {
                frame = 0;
                const t = (now - t0) / 1000;
                const u = voxelMat.uniforms;
                const boot = span(t, BOOT.grid) * (t < 0.9 ? (Math.random() < 0.85 ? 1 : 0.3) : 1);
                gridMat.opacity = 0.55 * boot;
                // The frame comes up with the grid.
                (pane.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = 0.72 * boot;
                edgeMat.opacity = 0.5 * boot;
                cornerMat.opacity = boot;
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
                // Where the pointer is on the face's plane, in the head's own coordinates; the push eases in and out.
                let near = false;
                if (pointing) {
                    ray.setFromCamera(ndc.set(pointer.x, pointer.y), camera);
                    if (ray.ray.intersectPlane(plane, hit)) {
                        local.copy(hit);
                        head.worldToLocal(local);
                        u.uPointer.value.set(local.x, local.y);
                        near = Math.abs(pointer.x) <= 1 && Math.abs(pointer.y) <= 1;
                    }
                }
                u.uPush.value += ((near && t > PLAY_FROM ? 1 : 0) - u.uPush.value) * 0.08;

                // Now and then the feed glitches; always across the flash.
                if (t > 4 && t > nextGlitch) {
                    glitchUntil = t + 0.12 + Math.random() * 0.25;
                    nextGlitch = t + 3 + Math.random() * 5;
                }
                const bootGlitch = t > 0.95 && t < 1.25 ? 1 : 0;
                postMat.uniforms.uGlitch.value = Math.max(bootGlitch, t < glitchUntil ? 0.6 + Math.random() * 0.4 : 0);
                postMat.uniforms.uTime.value = t;

                // The trail: its head chases the pointer (or circles the face), the rest follows.
                const lead = history[0];
                let tx: number, ty: number, tz: number;
                if (pointing) {
                    ray.setFromCamera(ndc.set(pointer.x, pointer.y), camera);
                    ray.ray.intersectPlane(plane, hit);
                    tx = hit.x;
                    ty = hit.y;
                    tz = 0.9;
                } else {
                    tx = rig.position.x + Math.cos(t * 0.9) * 1.25;
                    ty = rig.position.y + 1.25 + Math.sin(t * 1.8) * 0.35;
                    tz = 0.6 + Math.sin(t * 0.9) * 0.8;
                }
                const fresh = { x: lead.x + (tx - lead.x) * 0.16, y: lead.y + (ty - lead.y) * 0.16, z: lead.z + (tz - lead.z) * 0.16 };
                history.pop();
                history.unshift(fresh);
                for (let i = 0; i < TRAIL; i++) {
                    const p = history[i];
                    const swirl = t * 4 + i * 0.35;
                    const r = 0.04 + i * 0.0012;
                    trailPos[i * 3] = p.x + Math.cos(swirl) * r;
                    trailPos[i * 3 + 1] = p.y + Math.sin(swirl) * r;
                    trailPos[i * 3 + 2] = p.z;
                }
                trailGeo.attributes.position.needsUpdate = true;
                trailMat.uniforms.uAlpha.value = 0.85 * span(t, [2.6, 3.4]);

                // The grid, the head on a clear layer of its own, the screen pass that joins them, then the trail on top.
                renderer.setRenderTarget(target);
                renderer.render(scene, camera);
                renderer.setRenderTarget(headTarget);
                renderer.setClearColor(0x000000, 0);
                renderer.render(headScene, camera);
                renderer.setClearColor(0x050505, 1);
                renderer.setRenderTarget(null);
                renderer.render(postScene, postCam);
                renderer.autoClear = false;
                renderer.render(trailScene, camera);
                renderer.autoClear = true;
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
                [box, geo, gridGeo, trailGeo, post.geometry].forEach((g) => g.dispose());
                view.traverse((o) => {
                    if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) o.geometry.dispose();
                });
                [pane.material, edgeMat, cornerMat].forEach((m) => m.dispose());
                [voxelMat, gridMat, trailMat, postMat].forEach((m) => m.dispose());
                [dataTex, photoTex].forEach((tex) => tex.dispose());
                target.dispose();
                headTarget.dispose();
                renderer.dispose();
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

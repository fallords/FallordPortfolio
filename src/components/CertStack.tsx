"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { lines, polyline, seg, stage, wire } from "./three/wire";

const ACCENT = new THREE.Color("#19a352");
const RAISED = new THREE.Color("#0d0f0e");
// No depth fade on the card's own lines: they lie on it.
const FLAT: [number, number] = [1e5, 2e5];

const CARD_FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uReady;
uniform float uWash;
uniform float uOpacity;
uniform vec3 uGreen;
uniform vec3 uGround;
uniform vec2 uInset;
varying vec2 vUv;
void main() {
    // The scan, inset on its card as the page pads it, grey and washed in green (all colour while pointed at).
    vec2 uv = (vUv - uInset) / (1.0 - 2.0 * uInset);
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    vec3 c = texture2D(uMap, clamp(uv, 0.0, 1.0)).rgb;
    float g = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 washed = g * mix(vec3(1.0), uGreen, 0.9);
    vec3 scan = mix(c, washed, uWash);
    gl_FragColor = linearToOutputTexel(vec4(mix(uGround, scan, inside * uReady), uOpacity));
}
`;

const CARD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * The certificates as a stack of cards in Three.js, over the place the scan has (Certifications.tsx): the one on
 * show flat in front, washed green with a field of crosses on it, the next ones queued behind it into depth.
 * When the slide changes the front card lifts away towards the viewer and the next comes up to take its place.
 * The stack leans to the pointer; pointed at or focused, the front card shows its colours. The page's own frame
 * buttons stay over it for pressing, reading and the keyboard; once the stack draws, the stage gets `data-3d` and
 * their flat scans step aside (certifications.css). Without WebGL nothing changes.
 */
export default function CertStack({ images, active }: { images: (string | undefined)[]; active: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const want = useRef(active);
    const kick = useRef<() => void>(() => {});

    useEffect(() => {
        want.current = active;
        kick.current();
    }, [active]);

    useEffect(() => {
        const host = ref.current;
        const stageEl = host?.closest<HTMLElement>(".cc-stage");
        if (!host || !stageEl) return;
        const n = images.length;
        const loader = new THREE.TextureLoader();
        const root = new THREE.Group();
        let pos = want.current;
        let wash = 1;
        let lean = 0, leanY = 0, pointX = 0, pointY = 0;
        let pointed = false;
        const cards: { group: THREE.Group; mat: THREE.ShaderMaterial; aspect: number; marks: THREE.LineSegments }[] = [];
        let W = 1, H = 1;

        // Each card: the scan on its ground, its outline with corner brackets, and the crosses (shown on the front one).
        const fit = (card: (typeof cards)[number]) => {
            // As large as the place allows with room for the queue behind it, keeping the scan's own shape.
            let w = W * 0.86, h = w / card.aspect;
            if (h > H * 0.86) {
                h = H * 0.86;
                w = h * card.aspect;
            }
            card.group.scale.set(w, h, 1);
        };
        const tex: THREE.Texture[] = [];
        images.forEach((src) => {
            const mat = new THREE.ShaderMaterial({
                vertexShader: CARD_VERT,
                fragmentShader: CARD_FRAG,
                uniforms: {
                    uMap: { value: null },
                    uReady: { value: 0 },
                    uWash: { value: 1 },
                    uOpacity: { value: 0 },
                    uGreen: { value: ACCENT },
                    uGround: { value: RAISED },
                    uInset: { value: new THREE.Vector2(0.02, 0.02) },
                },
                transparent: true,
                depthWrite: false,
            });
            const group = new THREE.Group();
            group.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat));
            // The outline and brackets are drawn on a unit card, so they scale with it.
            const edge = lines();
            polyline(edge, [[-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0]], true);
            const b = 0.06;
            for (const [x, y] of [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]) {
                seg(edge, [x * 1.04, y * 1.04, 0], [x * 1.04 - Math.sign(x) * b, y * 1.04, 0]);
                seg(edge, [x * 1.04, y * 1.04, 0], [x * 1.04, y * 1.04 - Math.sign(y) * b, 0]);
            }
            const outline = wire(edge, { opacity: 0.7, fade: FLAT });
            outline.position.z = 0.5;
            group.add(outline);
            const marks = wire(lines(), { color: "#ffffff", opacity: 0, fade: FLAT });
            marks.position.z = 1;
            group.add(marks);
            root.add(group);
            const card = { group, mat, aspect: 1.414, marks };
            cards.push(card);
            if (!src) return;
            loader.load(src, (t) => {
                t.colorSpace = THREE.SRGBColorSpace;
                t.anisotropy = 4;
                tex.push(t);
                mat.uniforms.uMap.value = t;
                mat.uniforms.uReady.value = 1;
                card.aspect = t.image.width / t.image.height || card.aspect;
                fit(card);
                crosses(card);
                ctl?.redraw();
            });
        });

        // The field of crosses, every 64px of the card as drawn, as the flat scans had (in unit-card coordinates).
        function crosses(card: (typeof cards)[number]) {
            const sx = card.group.scale.x, sy = card.group.scale.y;
            const l = lines();
            for (let x = 32; x < sx; x += 64)
                for (let y = 32; y < sy; y += 64) {
                    const u = x / sx - 0.5, v = 0.5 - y / sy;
                    seg(l, [u, v - 5 / sy, 0], [u, v + 5 / sy, 0]);
                    seg(l, [u - 5 / sx, v, 0], [u + 5 / sx, v, 0]);
                }
            card.marks.geometry.dispose();
            card.marks.geometry = new THREE.BufferGeometry();
            card.marks.geometry.setAttribute("position", new THREE.Float32BufferAttribute(l.pos, 3));
            card.marks.geometry.setAttribute("aT", new THREE.Float32BufferAttribute(l.t, 1));
        }

        const ctl = stage(
            host,
            ({ scene, w, h }) => {
                scene.add(root);
                W = w;
                H = h;
                // The front card down and to the left, so the queue behind has room above and to the right.
                root.position.set(-w * 0.05, -h * 0.05, 0);
                cards.forEach((c) => {
                    fit(c);
                    crosses(c);
                });
            },
            (dt) => {
                const before = pos + wash + lean + leanY;
                // The shortest way round to the slide on show.
                let d = want.current - pos;
                d -= Math.round(d / n) * n;
                const k = 1 - Math.exp(-dt * 4.5);
                pos += d * k;
                if (Math.abs(d) < 1e-4) pos = want.current;
                wash += ((pointed ? 0 : 1) - wash) * (1 - Math.exp(-dt * 8));
                lean += (pointX * 0.12 - lean) * (1 - Math.exp(-dt * 4));
                leanY += (pointY * 0.08 - leanY) * (1 - Math.exp(-dt * 4));
                root.rotation.set(leanY, lean, 0);
                cards.forEach((c, i) => {
                    // Where this card stands: 0 in front, 1.. behind, below 0 lifting away.
                    let k2 = i - pos;
                    k2 -= Math.round(k2 / n) * n;
                    const back = Math.max(0, k2);
                    const gone = Math.max(0, -k2);
                    c.group.position.set(back * W * 0.06 - gone * W * 0.04, back * H * 0.035 + gone * H * 0.12, -back * H * 0.22 + gone * H * 0.9);
                    c.group.rotation.set(-gone * 0.25, -back * 0.12, 0);
                    const seen = k2 < 0 ? Math.max(0, 1 - gone * 1.4) : Math.max(0, 1 - back * 0.3);
                    c.group.visible = seen > 0.01 && back < 3.5;
                    c.group.renderOrder = -Math.round(back * 10);
                    c.mat.uniforms.uOpacity.value = seen;
                    const front = Math.max(0, 1 - Math.abs(k2));
                    c.mat.uniforms.uWash.value = 1 - (1 - wash) * front;
                    (c.marks.material as THREE.ShaderMaterial).uniforms.uOpacity.value = 0.4 * front * wash;
                });
                return Math.abs(pos + wash + lean + leanY - before) > 1e-4;
            },
        );
        if (!ctl) return;
        kick.current = ctl.redraw;
        stageEl.setAttribute("data-3d", "");

        // Pointed at or focused: the front card in its own colours; the stack leans to the pointer over the stage.
        const onOver = (e: PointerEvent) => {
            pointed = !!(e.target as Element).closest?.(".cc-frame");
            ctl.redraw();
        };
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const r = host.getBoundingClientRect();
            pointX = ((e.clientX - r.left) / r.width) * 2 - 1;
            pointY = ((e.clientY - r.top) / r.height) * 2 - 1;
            ctl.redraw();
        };
        const onLeave = () => {
            pointed = false;
            pointX = pointY = 0;
            ctl.redraw();
        };
        const onFocus = () => {
            pointed = !!stageEl.querySelector(".cc-frame:focus-visible");
            ctl.redraw();
        };
        stageEl.addEventListener("pointerover", onOver);
        stageEl.addEventListener("pointermove", onMove);
        stageEl.addEventListener("pointerleave", onLeave);
        stageEl.addEventListener("focusin", onFocus);
        stageEl.addEventListener("focusout", onFocus);
        return () => {
            stageEl.removeEventListener("pointerover", onOver);
            stageEl.removeEventListener("pointermove", onMove);
            stageEl.removeEventListener("pointerleave", onLeave);
            stageEl.removeEventListener("focusin", onFocus);
            stageEl.removeEventListener("focusout", onFocus);
            stageEl.removeAttribute("data-3d");
            kick.current = () => {};
            tex.forEach((t) => t.dispose());
            ctl.stop();
        };
    }, [images]);

    return <div ref={ref} aria-hidden="true" className="cc-3d" />;
}

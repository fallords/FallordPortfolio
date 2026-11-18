"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/*
 * One field of glowing green particles behind every section after the hero, on one canvas fixed to the screen. As
 * the section across the middle of the screen changes, the particles come loose and re-form into that section's
 * shape: rolling ground under the statement, a double helix by the writing, a globe by the contact form. Where a
 * section has a 3D drawing of its own (the work bench, the drum, the demos, the certificates), they thin out into a
 * slow dust, so nothing competes with it. The pointer pushes them aside as it passes. Still under reduced motion.
 */

type Shape = "dust" | "ground" | "helix" | "globe";

// Which shape stands behind which section, and where on a wide screen (x: 0 the middle, 1 right of the words, 1.55 at the right edge).
const SECTIONS: { id: string; shape: Shape; x: number }[] = [
    { id: "brief", shape: "ground", x: 0 },
    { id: "work", shape: "dust", x: 0 },
    { id: "experience", shape: "dust", x: 0 },
    { id: "about", shape: "dust", x: 0 },
    { id: "certificates", shape: "dust", x: 0 },
    { id: "writing", shape: "helix", x: 1.55 },
    { id: "contact", shape: "globe", x: 1 },
];

/** A seeded random, so every visit draws the same shapes. */
function random(seed: number) {
    let s = seed;
    return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/** `n` points of a shape, about 5 units across, centred on the origin. */
function sample(shape: Shape, n: number): Float32Array {
    const out = new Float32Array(n * 3);
    const r = random(shape.length * 7919 + 13);
    const put = (i: number, x: number, y: number, z: number) => out.set([x, y, z], i * 3);
    for (let i = 0; i < n; i++) {
        if (shape === "dust") {
            put(i, (r() - 0.5) * 26, (r() - 0.5) * 14, -2 - r() * 10);
        } else if (shape === "ground") {
            // A field rolling away from the viewer, lower and wider than the screen.
            const x = (r() - 0.5) * 30, z = -r() * 16 + 2;
            const y = -2.3 + Math.sin(x * 0.45) * 0.45 + Math.sin(z * 0.7 + x * 0.2) * 0.35;
            put(i, x, y, z);
        } else if (shape === "helix") {
            // Two strands and the rungs between them.
            const H = 7, R = 1.35, turns = 3.2;
            const u = r();
            const a = u * turns * Math.PI * 2;
            const y = -H / 2 + u * H;
            if (r() < 0.78) {
                const off = r() < 0.5 ? 0 : Math.PI;
                const j = 0.06;
                put(i, Math.cos(a + off) * R + (r() - 0.5) * j, y + (r() - 0.5) * j, Math.sin(a + off) * R + (r() - 0.5) * j);
            } else {
                const step = Math.round(u * 40) / 40;
                const b = step * turns * Math.PI * 2;
                const t = r() * 2 - 1;
                put(i, Math.cos(b) * R * t, -H / 2 + step * H, Math.sin(b) * R * t);
            }
        } else {
            // The globe: mostly on its lines of latitude and longitude, some over its face, a few in arcs out from Java.
            const R = 2.5;
            const k = r();
            let lat: number, lon: number, rad = R;
            if (k < 0.35) {
                lat = (Math.round((r() - 0.5) * 6) / 6) * Math.PI;
                lon = r() * Math.PI * 2;
            } else if (k < 0.7) {
                lon = (Math.round(r() * 12) / 12) * Math.PI * 2;
                lat = (r() - 0.5) * Math.PI;
            } else if (k < 0.88) {
                lat = Math.asin(r() * 2 - 1);
                lon = r() * Math.PI * 2;
            } else {
                const ends = [[35, 139], [51, 0], [37, -122], [-33, 151], [1, 104]];
                const [la2, lo2] = ends[Math.floor(r() * ends.length)]!;
                const t = r();
                lat = ((-6 + (la2! + 6) * t) * Math.PI) / 180;
                lon = ((107 + (lo2! - 107) * t) * Math.PI) / 180;
                rad = R * (1 + Math.sin(t * Math.PI) * 0.3);
            }
            put(i, Math.cos(lat) * Math.cos(lon) * rad, Math.sin(lat) * rad, Math.cos(lat) * Math.sin(lon) * rad);
        }
    }
    return out;
}

const VERT = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aRand;
uniform float uMix;
uniform float uTime;
uniform float uSpin;
uniform vec3 uCentre;
uniform vec2 uPointer;
uniform float uPush;
uniform float uSize;
varying float vAlpha;
varying float vLift;

vec3 spin(vec3 p, vec3 c, float a) {
    vec3 q = p - c;
    float s = sin(a), k = cos(a);
    return c + vec3(q.x * k + q.z * s, q.y, -q.x * s + q.z * k);
}

void main() {
    // Each particle leaves a little later than the last, so a change runs through the field instead of jumping.
    float t = clamp(uMix * 1.5 - aRand * 0.5, 0.0, 1.0);
    float e = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(aFrom, spin(aTo, uCentre, uSpin), e);
    // Loose in the middle of the move, then drawn in.
    vec3 loose = vec3(sin(aRand * 91.0 + uTime), cos(aRand * 57.0 + uTime * 1.3), sin(aRand * 33.0 - uTime)) * 1.4;
    p += loose * sin(e * 3.14159);
    // Always breathing a little.
    p += vec3(sin(uTime * 0.6 + aRand * 40.0), cos(uTime * 0.5 + aRand * 23.0), sin(uTime * 0.4 + aRand * 11.0)) * 0.04;
    vec4 world = modelMatrix * vec4(p, 1.0);
    // The pointer pushes them aside, on the screen's plane.
    vec2 d = world.xy - uPointer;
    float f = exp(-dot(d, d) / 1.2) * uPush;
    world.xy += normalize(d + 1e-4) * f * 0.9;
    vLift = f;
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aRand * 0.8) / -mv.z;
    vAlpha = clamp(1.0 - (-mv.z - 6.0) / 18.0, 0.15, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
varying float vLift;
void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    // A soft glow with a bright core; pushed ones flare white.
    float glow = smoothstep(0.5, 0.0, r);
    float core = smoothstep(0.18, 0.0, r);
    vec3 col = mix(uColor, vec3(1.0), core * 0.5 + vLift * 0.6);
    gl_FragColor = vec4(col, (glow * 0.55 + core * 0.45) * vAlpha * uOpacity);
}
`;

export default function SectionScenes() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = ref.current;
        if (!host) return;
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
        } catch {
            return;
        }
        renderer.setClearColor(0x000000, 0);
        host.appendChild(renderer.domElement);
        const still = window.matchMedia("(prefers-reduced-motion: reduce)");
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0, 11);

        // Fewer on a phone, and fewer again on a device with few cores.
        const N = Math.round((window.innerWidth < 768 ? 7000 : 14000) * ((navigator.hardwareConcurrency || 8) <= 4 ? 0.6 : 1));
        const shapes = Object.fromEntries((["dust", "ground", "helix", "globe"] as Shape[]).map((s) => [s, sample(s, N)])) as Record<Shape, Float32Array>;
        const geo = new THREE.BufferGeometry();
        const from = new Float32Array(shapes.dust);
        const to = new Float32Array(shapes.dust);
        const rnd = random(5);
        const rand = new Float32Array(N).map(() => rnd());
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
        geo.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
        geo.setAttribute("aTo", new THREE.BufferAttribute(to, 3));
        geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
        const mat = new THREE.ShaderMaterial({
            vertexShader: VERT,
            fragmentShader: FRAG,
            uniforms: {
                uMix: { value: 1 },
                uTime: { value: 0 },
                uSpin: { value: 0 },
                uCentre: { value: new THREE.Vector3() },
                uPointer: { value: new THREE.Vector2(99, 99) },
                uPush: { value: 0 },
                uSize: { value: 30 },
                uColor: { value: new THREE.Color("#19a352") },
                uOpacity: { value: 0 },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const points = new THREE.Points(geo, mat);
        points.frustumCulled = false;
        scene.add(points);
        const u = mat.uniforms;

        const sections = SECTIONS.map((s) => ({ ...s, el: null as HTMLElement | null }));
        let w = 0, h = 0, wide = false, halfW = 6;
        let current = -2;
        let spin = 0;
        const shapeOf = (k: number): Shape => sections[k]?.shape ?? "dust";
        const placed = (k: number) => shapeOf(k) === "helix" || shapeOf(k) === "globe";
        // On a narrow screen the shape goes half off the right edge, behind the words as little as it can.
        const centreOf = (k: number) => new THREE.Vector3(!placed(k) ? 0 : wide ? sections[k]!.x * halfW * 0.55 : halfW * 0.85, 0, 0);
        /** The positions the shape for section `k` asks for, placed for this screen. */
        const targetOf = (k: number) => {
            const src = shapes[shapeOf(k)];
            const c = centreOf(k);
            const scale = placed(k) && !wide ? 0.8 : 1;
            const out = new Float32Array(src.length);
            for (let i = 0; i < src.length; i += 3) {
                out[i] = src[i]! * scale + c.x;
                out[i + 1] = src[i + 1]! * scale + c.y;
                out[i + 2] = src[i + 2]! * scale + c.z;
            }
            return out;
        };
        /** Where every particle is now (without its looseness), so a new move starts from there. */
        const settle = () => {
            const m = u.uMix.value as number;
            const c = u.uCentre.value as THREE.Vector3;
            const a = u.uSpin.value as number;
            const s = Math.sin(a), k = Math.cos(a);
            for (let i = 0; i < N; i++) {
                const t = Math.min(1, Math.max(0, m * 1.5 - rand[i]! * 0.5));
                const e = t * t * (3 - 2 * t);
                const j = i * 3;
                const qx = to[j]! - c.x, qz = to[j + 2]! - c.z;
                const tx = c.x + qx * k + qz * s, tz = c.z - qx * s + qz * k;
                from[j] = from[j]! + (tx - from[j]!) * e;
                from[j + 1] = from[j + 1]! + (to[j + 1]! - from[j + 1]!) * e;
                from[j + 2] = from[j + 2]! + (tz - from[j + 2]!) * e;
            }
        };
        const go = (k: number) => {
            settle();
            to.set(targetOf(k));
            (geo.attributes.aFrom as THREE.BufferAttribute).needsUpdate = true;
            (geo.attributes.aTo as THREE.BufferAttribute).needsUpdate = true;
            u.uCentre.value.copy(centreOf(k));
            spin = 0;
            u.uSpin.value = 0;
            u.uMix.value = still.matches ? 1 : 0;
            current = k;
        };

        const resize = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            wide = w >= 900;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, wide ? 1.5 : 1));
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
            u.uSize.value = 75 * renderer.getPixelRatio() * (h / 900);
            // Re-place the shape on show for the new screen.
            if (current >= -1) {
                to.set(targetOf(current));
                (geo.attributes.aTo as THREE.BufferAttribute).needsUpdate = true;
                u.uCentre.value.copy(centreOf(current));
            }
        };

        // The pointer on the plane through the origin, in world units; far away when there is none.
        let pointerX = 99, pointerY = 99, push = 0, pushTo = 0;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
            pointerX = ((e.clientX / w) * 2 - 1) * halfH * camera.aspect;
            pointerY = -((e.clientY / h) * 2 - 1) * halfH;
            pushTo = 1;
        };
        const onLeave = () => (pushTo = 0);

        let frame = 0, last = 0, time = 0, shown = 0;
        const loop = (now: number) => {
            frame = requestAnimationFrame(loop);
            const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
            last = now;
            const moving = !still.matches;
            if (moving) time += dt;
            // The section across the middle of the screen; none while the hero is up.
            const mid = h * 0.5;
            let k = -1;
            sections.forEach((s, i) => {
                s.el ??= document.getElementById(s.id);
                const r = s.el?.getBoundingClientRect();
                if (r && r.top < mid && r.bottom > mid) k = i;
            });
            if (k !== current) go(k);
            // Faint as dust, fuller as a shape; nothing over the hero.
            const target = k < 0 ? 0 : shapeOf(k) === "dust" ? 0.35 : wide ? 1 : 0.45;
            shown += (target - shown) * (moving ? 1 - Math.exp(-dt * 3) : 1);
            if (shown < 0.003 && target === 0) {
                shown = 0;
                renderer.clear();
                return;
            }
            if (moving) {
                u.uMix.value = Math.min(1, (u.uMix.value as number) + dt / 1.8);
                spin += dt * 0.12;
                u.uSpin.value = placed(k) ? spin : 0;
                push += (pushTo - push) * (1 - Math.exp(-dt * 6));
                // The camera leans a little towards the pointer.
                const k2 = 1 - Math.exp(-dt * 2);
                camera.position.x += ((pushTo ? pointerX * 0.03 : 0) - camera.position.x) * k2;
                camera.position.y += ((pushTo ? pointerY * 0.02 : 0) - camera.position.y) * k2;
                camera.lookAt(0, 0, 0);
            }
            u.uTime.value = time;
            u.uPointer.value.set(pointerX, pointerY);
            u.uPush.value = push;
            u.uOpacity.value = shown;
            renderer.render(scene, camera);
        };

        resize();
        frame = requestAnimationFrame(loop);
        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onLeave);
            geo.dispose();
            mat.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, []);

    return <div ref={ref} aria-hidden="true" className="section-scenes" />;
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { circle, edgesOf, lines, polyline, seg, wire, type Lines, type V } from "./three/wire";

/*
 * Behind every section after the hero, one thin green wireframe of its own, drawn on one canvas fixed to the screen
 * (one WebGL context for the whole page). The section across the middle of the screen has its figure on show; the
 * others fade out. The hero covers the canvas with its own stage. Turns with time and with the scroll through its
 * section, leans a little to the pointer; still under reduced motion.
 */

// Statement: a field of lines rolling like ground seen from low down (the wave is in the shader).
function terrain(): Lines {
    const l = lines();
    const X = 14, Z = 10, NX = 40, NZ = 20;
    for (let j = 0; j <= NZ; j++) {
        const z = -Z + (j / NZ) * Z * 2;
        polyline(l, Array.from({ length: NX + 1 }, (_, i) => [-X + (i / NX) * X * 2, 0, z] as V));
    }
    for (let i = 0; i <= NX; i += 2) {
        const x = -X + (i / NX) * X * 2;
        polyline(l, Array.from({ length: NZ + 1 }, (_, j) => [x, 0, -Z + (j / NZ) * Z * 2] as V));
    }
    return l;
}

// Work: solids nested in a cage, what gets built.
function polyhedra(): Lines {
    const l = lines();
    edgesOf(l, new THREE.IcosahedronGeometry(2.1, 1));
    edgesOf(l, new THREE.OctahedronGeometry(1.1));
    edgesOf(l, new THREE.BoxGeometry(3.4, 3.4, 3.4));
    return l;
}

// Experience: a gyroscope, the drum's reticle in three dimensions.
function gyro(): Lines {
    const l = lines();
    polyline(l, circle(2.4, 96, (a) => [Math.cos(a), Math.sin(a), 0]), true);
    polyline(l, circle(2.1, 96, (a) => [Math.cos(a), 0, Math.sin(a)]), true);
    polyline(l, circle(1.8, 96, (a) => [0, Math.cos(a), Math.sin(a)]), true);
    for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const r = i % 6 ? 2.75 : 2.6;
        seg(l, [Math.cos(a) * 2.9, Math.sin(a) * 2.9, 0], [Math.cos(a) * r, Math.sin(a) * r, 0]);
    }
    seg(l, [0, -3.2, 0], [0, 3.2, 0]);
    return l;
}

// What I do: a network of nodes, each tied to its nearest neighbours, signals running along the ties.
function network(): Lines {
    const l = lines();
    const n = 64;
    const pts: V[] = [];
    let s = 7;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const a = i * 2.39996;
        const k = 2.4 * (0.85 + rand() * 0.3);
        pts.push([Math.cos(a) * r * k, y * k, Math.sin(a) * r * k]);
    }
    const seen = new Set<string>();
    pts.forEach((p, i) => {
        pts.map((q, j) => [j, (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2] as const)
            .filter(([j]) => j !== i)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 3)
            .forEach(([j]) => {
                const key = i < j ? `${i}-${j}` : `${j}-${i}`;
                if (seen.has(key)) return;
                seen.add(key);
                const t = rand();
                seg(l, p, pts[j], t, t + 0.2);
            });
        // A small cross on each node.
        const c = 0.08;
        seg(l, [p[0] - c, p[1], p[2]], [p[0] + c, p[1], p[2]]);
        seg(l, [p[0], p[1] - c, p[2]], [p[0], p[1] + c, p[2]]);
    });
    return l;
}

// Certificates: a fanned stack of frames, a cross through each.
function cards(): Lines {
    const l = lines();
    for (let k = 0; k < 6; k++) {
        const a = (k - 2.5) * 0.16;
        const z = (k - 2.5) * 0.45;
        const at = (x: number, y: number): V => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
        const w = 1.5, h = 1.05;
        polyline(l, [at(-w, -h), at(w, -h), at(w, h), at(-w, h)], true);
        if (k === 5) {
            seg(l, at(-w, -h), at(w, h));
            seg(l, at(-w, h), at(w, -h));
        }
        for (let r = 0; r < 3; r++) seg(l, at(-w + 0.25, h - 0.35 - r * 0.22), at(-w + 0.25 + (r ? 1.4 : 2.2), h - 0.35 - r * 0.22));
    }
    return l;
}

// Writing: a double helix, words strung along it.
function helix(): Lines {
    const l = lines();
    const N = 220, H = 6.4, turns = 3.2, R = 1.3;
    const at = (i: number, off: number): V => {
        const a = (i / N) * turns * Math.PI * 2 + off;
        return [Math.cos(a) * R, -H / 2 + (i / N) * H, Math.sin(a) * R];
    };
    for (const off of [0, Math.PI]) polyline(l, Array.from({ length: N + 1 }, (_, i) => at(i, off)));
    for (let i = 0; i <= N; i += 10) seg(l, at(i, 0), at(i, Math.PI), i / N, i / N);
    return l;
}

// Contact: a globe, signals arcing between points on it.
function globe(): Lines {
    const l = lines();
    const R = 2.3;
    for (let la = -60; la <= 60; la += 30) {
        const y = Math.sin((la * Math.PI) / 180), r = Math.cos((la * Math.PI) / 180);
        polyline(l, circle(R, 96, (a) => [Math.cos(a) * r, y, Math.sin(a) * r]), true);
    }
    for (let lo = 0; lo < 180; lo += 30) {
        const c = Math.cos((lo * Math.PI) / 180), s = Math.sin((lo * Math.PI) / 180);
        polyline(l, circle(R, 96, (a) => [Math.cos(a) * c, Math.sin(a), Math.cos(a) * s]), true);
    }
    const on = (lat: number, lon: number) =>
        new THREE.Vector3().setFromSphericalCoords(R, ((90 - lat) * Math.PI) / 180, (lon * Math.PI) / 180);
    const arcs: [number, number, number, number][] = [
        [-6, 107, 35, 139], [-6, 107, 51, 0], [-6, 107, 37, -122], [-6, 107, 1, 104], [-6, 107, -33, 151],
    ];
    for (const [a1, o1, a2, o2] of arcs) {
        const p = on(a1, o1), q = on(a2, o2);
        const pts: V[] = [];
        for (let i = 0; i <= 48; i++) {
            const t = i / 48;
            const v = p.clone().lerp(q, t).normalize().multiplyScalar(R * (1 + Math.sin(t * Math.PI) * 0.28));
            pts.push([v.x, v.y, v.z]);
        }
        polyline(l, pts);
    }
    return l;
}

// Which figure stands behind which section; on a wide screen `side` puts it right (1) or left (-1) of the middle, clear of the section's own panel.
const SCENES = [
    { id: "brief", make: terrain, wave: 1, pulse: 0, spin: 0, side: 0 },
    { id: "work", make: polyhedra, wave: 0, pulse: 0, spin: 0.12, side: -1 },
    { id: "experience", make: gyro, wave: 0, pulse: 0, spin: 0.18, side: 1 },
    { id: "about", make: network, wave: 0, pulse: 1, spin: 0.08, side: 1 },
    { id: "certificates", make: cards, wave: 0, pulse: 0, spin: 0.1, side: -1 },
    { id: "writing", make: helix, wave: 0, pulse: 1, spin: 0.16, side: 1 },
    { id: "contact", make: globe, wave: 0, pulse: 1, spin: 0.07, side: 1 },
];

export default function SectionScenes() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = ref.current;
        if (!host) return;
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
        } catch {
            return;
        }
        renderer.setClearColor(0x000000, 0);
        host.appendChild(renderer.domElement);
        const still = window.matchMedia("(prefers-reduced-motion: reduce)");
                const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0, 11);

        const figures = SCENES.map((s) => {
            const mesh = wire(s.make(), { opacity: 0, wave: s.wave, pulse: s.pulse });
            const mat = mesh.material;
            mesh.visible = false;
            const group = new THREE.Group();
            group.add(mesh);
            scene.add(group);
            return { ...s, el: null as HTMLElement | null, group, mesh, mat, show: 0 };
        });

        let w = 0, h = 0, wide = false;
        const resize = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            wide = w >= 900;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, wide ? 1.5 : 1));
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            // On a wide screen the figure stands right of the words; on a narrow one, behind them, a little smaller.
            const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
            for (const f of figures) {
                if (f.wave) {
                    f.group.position.set(0, -3.4, -2);
                    f.group.rotation.set(0.32, 0, 0);
                } else {
                    f.group.position.set(wide ? f.side * halfW * 0.52 : 0, 0, 0);
                    f.group.scale.setScalar(wide ? 1 : 0.8);
                }
            }
            dirty = true;
        };

        let pointerX = 0, pointerY = 0;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            pointerX = (e.clientX / w) * 2 - 1;
            pointerY = (e.clientY / h) * 2 - 1;
        };

        let frame = 0, last = 0, time = 0, dirty = true, drawn = false;
        const loop = (now: number) => {
            frame = requestAnimationFrame(loop);
            const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
            last = now;
            const moving = !still.matches;
            if (moving) time += dt;
            const mid = h * 0.5;
            let any = false;
            for (const f of figures) {
                f.el ??= document.getElementById(f.id);
                const r = f.el?.getBoundingClientRect();
                const on = !!r && r.top < mid && r.bottom > mid;
                const target = on ? (wide ? 0.55 : 0.32) : 0;
                const before = f.show;
                f.show = moving ? f.show + (target - f.show) * (1 - Math.exp(-dt * 4)) : target;
                if (Math.abs(f.show - target) < 0.002) f.show = target;
                if (f.show !== before) dirty = true;
                f.mesh.visible = f.show > 0;
                if (!f.mesh.visible || !r) continue;
                any = true;
                f.mat.uniforms.uOpacity.value = f.show;
                f.mat.uniforms.uTime.value = time;
                // Turns with time and with the scroll through its section.
                const p = moving ? (mid - r.top) / Math.max(1, r.height) : 0.3;
                if (!f.wave) {
                    f.mesh.rotation.y = time * f.spin + p * 1.4;
                    f.mesh.rotation.x = 0.35 + p * 0.5;
                }
            }
            if (moving && any) {
                camera.position.x += (pointerX * 0.6 - camera.position.x) * (1 - Math.exp(-dt * 3));
                camera.position.y += (-pointerY * 0.4 - camera.position.y) * (1 - Math.exp(-dt * 3));
                camera.lookAt(0, 0, 0);
                dirty = true;
            }
            if (!any) {
                if (drawn) {
                    renderer.clear();
                    drawn = false;
                }
                return;
            }
            if (!dirty) return;
            dirty = moving;
            renderer.render(scene, camera);
            drawn = true;
        };

        const onScroll = () => {
            dirty = true;
        };
        resize();
        frame = requestAnimationFrame(loop);
        window.addEventListener("resize", resize);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", resize);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("pointermove", onMove);
            for (const f of figures) {
                f.mesh.geometry.dispose();
                f.mat.dispose();
            }
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, []);

    return <div ref={ref} aria-hidden="true" className="section-scenes" />;
}

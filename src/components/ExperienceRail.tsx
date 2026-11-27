"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { lines, seg, stage, tick, wire } from "./three/wire";
import { MODELS } from "./three/models";

/**
 * The roles in 3D along a rail, oldest on the left: each stands on its post over the rail as the object of its
 * kind of work, and the camera glides along the rail to the one on show (`active`), which comes forward, lit and
 * turning, while the rest wait dimmed. A signal runs along the rail. Still with motion turned down.
 */
export default function ExperienceRail({ models, active }: { models: (keyof typeof MODELS)[]; active: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const want = useRef(active);
    const kick = useRef<() => void>(() => {});
    useEffect(() => {
        want.current = active;
        kick.current();
    }, [active]);

    useEffect(() => {
        const host = ref.current;
        if (!host) return;
        const n = models.length;
        const GAP = 3.2;
        // Newest first in the list; oldest on the left along the rail.
        const xOf = (i: number) => (n - 1 - i) * GAP;
        const root = new THREE.Group();
        const rail = new THREE.Group();
        root.add(rail);

        const track = lines();
        const end = (n - 1) * GAP + GAP;
        seg(track, [-GAP, 0, 0], [end, 0, 0], 0, 1);
        seg(track, [-GAP, 0, 0.35], [end, 0, 0.35], 0, 1);
        for (let x = -GAP; x <= end; x += GAP / 8) seg(track, [x, 0, 0], [x, 0, 0.35]);
        rail.add(wire(track, { pulse: 1, color: "#3d8a5c" }));

        const stops = models.map((key, i) => {
            const post = lines();
            seg(post, [xOf(i), 0, 0.17], [xOf(i), 0.9, 0.17]);
            const postMesh = wire(post, { color: "#3d8a5c" });
            const m = MODELS[key]();
            const holder = new THREE.Group();
            holder.add(m.root);
            const box = new THREE.Box3().setFromObject(m.root);
            m.root.position.sub(box.getCenter(new THREE.Vector3()));
            const unit = 0.75 / (box.getBoundingSphere(new THREE.Sphere()).radius || 1);
            holder.position.set(xOf(i), 1.75, 0.17);
            rail.add(postMesh, holder);
            const mats: { m: THREE.ShaderMaterial; base: number }[] = [];
            holder.traverse((o) => {
                const mat = (o as THREE.LineSegments).material as THREE.ShaderMaterial | undefined;
                if (mat?.uniforms?.uOpacity) mats.push({ m: mat, base: mat.uniforms.uOpacity.value as number });
            });
            return { holder, unit, mats, model: m, shown: i === want.current ? 1 : 0, spin: i };
        });

        let x = xOf(want.current), s = 1;
        const ctl = stage(
            host,
            ({ scene, w, h }) => {
                scene.add(root);
                s = Math.min(h * 0.36, w < 768 ? w * 0.24 : w * 0.15);
                root.scale.setScalar(s);
                const cam = h / 2 / Math.tan((15 * Math.PI) / 180);
                root.traverse((o) => ((o as THREE.LineSegments).material as THREE.ShaderMaterial | undefined)?.uniforms?.uFade?.value.set(cam - 2 * s, cam + 6 * s));
            },
            (dt, time) => {
                const k = 1 - Math.exp(-dt * 3);
                x += (xOf(want.current) - x) * k;
                rail.position.set(-x, -1.1, 0);
                root.rotation.set(0.28, -0.32, 0);
                stops.forEach((st, i) => {
                    const on = i === want.current;
                    st.shown += ((on ? 1 : 0) - st.shown) * (1 - Math.exp(-dt * 5));
                    st.spin += dt * (0.2 + 0.6 * st.shown);
                    st.holder.rotation.set(0.2, st.spin, 0);
                    st.holder.scale.setScalar(st.unit * (0.75 + 0.45 * st.shown));
                    st.holder.position.z = 0.17 + st.shown * 0.6;
                    st.mats.forEach(({ m, base }) => (m.uniforms.uOpacity.value = base * (0.25 + 0.75 * st.shown)));
                    st.model.tick?.(time);
                });
                tick(root, time);
                return true;
            },
        );
        if (!ctl) return;
        kick.current = ctl.redraw;
        return () => {
            kick.current = () => {};
            ctl.stop();
        };
        // The roles are fixed for the page; built once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={ref} aria-hidden="true" className="absolute inset-0" />;
}

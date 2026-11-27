"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { stage, tick } from "./three/wire";
import { card } from "./three/models";

/**
 * The certificates as a ring of cards in 3D, the way WebGL carousels show a collection: every scan on a card stood
 * round a circle, the one on show at the front, full and lit, the rest turning away into the dark behind it. The
 * ring turns to `active`; dragging it across turns it by hand and lets it settle on the nearest card (`onPick`), and
 * pressing the front card opens it (`onOpen`). Still with motion turned down.
 */
export default function CertRing({ images, active, onPick, onOpen }: { images: (string | undefined)[]; active: number; onPick: (i: number) => void; onOpen: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const want = useRef(active);
    const pick = useRef(onPick);
    const open = useRef(onOpen);
    const kick = useRef<() => void>(() => {});
    useEffect(() => {
        want.current = active;
        pick.current = onPick;
        open.current = onOpen;
        kick.current();
    });

    useEffect(() => {
        const host = ref.current;
        if (!host) return;
        const n = images.length;
        const step = (Math.PI * 2) / n;
        const R = (n * 2.5) / (Math.PI * 2);
        const ring = new THREE.Group();
        const cards = images.map((src, i) => {
            const m = card(src);
            const holder = new THREE.Group();
            holder.add(m.root);
            holder.position.set(Math.sin(i * step) * R, 0, Math.cos(i * step) * R);
            holder.rotation.y = i * step;
            ring.add(holder);
            const mats: { m: THREE.Material & { opacity: number; uniforms?: Record<string, THREE.IUniform> }; base: number }[] = [];
            holder.traverse((o) => {
                const mat = (o as THREE.Mesh).material as (THREE.Material & { opacity: number; uniforms?: Record<string, THREE.IUniform> }) | undefined;
                if (mat) mats.push({ m: mat, base: mat.uniforms?.uOpacity ? (mat.uniforms.uOpacity.value as number) : 1 });
            });
            return { holder, mats };
        });
        const root = new THREE.Group();
        root.add(ring);
        let angle = -want.current * step, scale = 1, drag: { x: number; moved: number; id: number } | null = null, lean = 0, leanTo = 0;

        const ctl = stage(
            host,
            ({ scene, w, h }) => {
                scene.add(root);
                scale = Math.min(w < 768 ? w * 0.62 : w * 0.3, h * 0.5 * 1.414) / 2;
                root.scale.setScalar(scale);
                root.position.z = -R * scale;
                const cam = h / 2 / Math.tan((15 * Math.PI) / 180);
                cards.forEach((c) => c.mats.forEach(({ m }) => m.uniforms?.uFade?.value.set(cam - scale, cam + R * scale * 2)));
            },
            (dt, time) => {
                // Towards the card on show, the shortest way round, unless held by a drag.
                if (!drag) {
                    let d = -want.current * step - angle;
                    d -= Math.round(d / (Math.PI * 2)) * Math.PI * 2;
                    angle += d * (1 - Math.exp(-dt * 4));
                }
                lean += (leanTo - lean) * (1 - Math.exp(-dt * 4));
                ring.rotation.y = angle;
                root.rotation.set(0.12 + lean * 0.2, lean * 0.3, 0);
                cards.forEach((c, i) => {
                    // How far round from the front: 1 facing, -1 at the back.
                    const facing = Math.cos(i * step + angle);
                    const k = Math.max(0.08, (facing + 1) / 2) ** 2;
                    c.mats.forEach(({ m, base }) => {
                        if (m.uniforms?.uOpacity) m.uniforms.uOpacity.value = base * k;
                        else m.opacity = k;
                    });
                });
                tick(root, time);
                return true;
            },
        );
        if (!ctl) return;
        kick.current = ctl.redraw;

        const onDown = (e: PointerEvent) => {
            drag = { x: e.clientX, moved: 0, id: e.pointerId };
        };
        const onMove = (e: PointerEvent) => {
            if (e.pointerType === "mouse") {
                const r = host.getBoundingClientRect();
                leanTo = (e.clientX - r.left) / r.width - 0.5;
            }
            if (!drag || e.pointerId !== drag.id) return;
            const dx = e.clientX - drag.x;
            drag.x = e.clientX;
            drag.moved += Math.abs(dx);
            angle += dx * 0.006;
        };
        const onUp = (e: PointerEvent) => {
            if (!drag || e.pointerId !== drag.id) return;
            const moved = drag.moved;
            drag = null;
            // A press without a drag opens the card on show; a drag settles on the nearest card.
            if (moved < 6) open.current();
            else pick.current((((Math.round(-angle / step) % n) + n) % n));
        };
        const onLeave = () => (leanTo = 0);
        host.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        host.addEventListener("pointerleave", onLeave);
        return () => {
            host.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            host.removeEventListener("pointerleave", onLeave);
            cards.forEach((c) => c.holder.traverse((o) => ((o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined)?.map?.dispose()));
            kick.current = () => {};
            ctl.stop();
        };
        // The images are fixed for the page; built once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={ref} aria-hidden="true" className="ring-canvas" data-cursor="View" />;
}

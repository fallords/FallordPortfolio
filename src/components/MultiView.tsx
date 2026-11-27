"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { stage, tick } from "./three/wire";
import { MODELS, type Model } from "./three/models";

/**
 * Many small 3D stages on one canvas: the parent lays out its cards, each with an empty art area marked
 * `data-view="<i>"`, and this draws `models[i]` into that area (a viewport cut out of one canvas laid over the whole
 * parent, so the page keeps to one GPU context however many cards there are). Each object turns slowly on its own,
 * faster and leaning to the pointer while its card (`data-view-card="<i>"`) is pointed at. Still with motion turned
 * down. The parent must be positioned.
 */
export default function MultiView({ models }: { models: (keyof typeof MODELS)[] }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = ref.current;
        const parent = host?.parentElement;
        if (!host || !parent) return;
        const views = models.map((key) => {
            const scene = new THREE.Scene();
            const model: Model = MODELS[key]();
            const holder = new THREE.Group();
            holder.add(model.root);
            const box = new THREE.Box3().setFromObject(model.root);
            model.root.position.sub(box.getCenter(new THREE.Vector3()));
            holder.scale.setScalar(1 / (box.getBoundingSphere(new THREE.Sphere()).radius || 1));
            scene.add(holder);
            const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
            camera.position.set(0, 0, 3.6);
            // The depth fade, in this camera's units.
            holder.traverse((o) => ((o as THREE.LineSegments).material as THREE.ShaderMaterial | undefined)?.uniforms?.uFade?.value.set(2.6, 4.8));
            return { scene, camera, holder, model, spin: Math.random() * 6, speed: 0.3, lean: 0, tilt: 0 };
        });
        let hover = -1, px = 0, py = 0;

        const ctl = stage(
            host,
            () => {},
            (dt, time) => {
                const renderer = ctl!.renderer;
                const hr = host.getBoundingClientRect();
                renderer.setScissorTest(false);
                renderer.clear();
                renderer.setScissorTest(true);
                const f = 1 - Math.exp(-dt * 5);
                views.forEach((v, i) => {
                    const area = parent.querySelector<HTMLElement>(`[data-view="${i}"]`);
                    if (!area) return;
                    const r = area.getBoundingClientRect();
                    if (r.bottom < hr.top || r.top > hr.bottom || r.width < 2 || r.height < 2) return;
                    const on = i === hover;
                    v.speed += ((on ? 1.4 : 0.3) - v.speed) * f;
                    v.spin += dt * v.speed;
                    v.lean += ((on ? px * 0.5 : 0) - v.lean) * f;
                    v.tilt += ((on ? py * 0.3 : 0) - v.tilt) * f;
                    v.holder.rotation.set(0.25 + v.tilt, v.spin + v.lean, 0);
                    v.holder.scale.setScalar((v.holder.userData.s ??= v.holder.scale.x) * (1 + 0.08 * ((v.speed - 0.3) / 1.1)));
                    v.model.tick?.(time);
                    tick(v.holder, time);
                    v.camera.aspect = r.width / r.height;
                    // Fitting the object to the shorter side of its area.
                    v.camera.position.z = 3.6 / Math.min(1, v.camera.aspect);
                    v.camera.updateProjectionMatrix();
                    const x = r.left - hr.left, y = hr.bottom - r.bottom;
                    renderer.setViewport(x, y, r.width, r.height);
                    renderer.setScissor(x, y, r.width, r.height);
                    renderer.render(v.scene, v.camera);
                });
                renderer.setScissorTest(false);
                return false;
            },
        );
        if (!ctl) return;
        // Each view is drawn by hand above; the stage's own pass (an empty scene) must not clear them.
        ctl.renderer.autoClear = false;

        const onMove = (e: PointerEvent) => {
            const card = (e.target as Element).closest?.<HTMLElement>("[data-view-card]");
            hover = card ? Number(card.dataset.viewCard) : -1;
            if (card && e.pointerType === "mouse") {
                const r = card.getBoundingClientRect();
                px = (e.clientX - r.left) / r.width - 0.5;
                py = (e.clientY - r.top) / r.height - 0.5;
            }
        };
        const onLeave = () => (hover = -1);
        parent.addEventListener("pointermove", onMove);
        parent.addEventListener("pointerleave", onLeave);
        return () => {
            parent.removeEventListener("pointermove", onMove);
            parent.removeEventListener("pointerleave", onLeave);
            ctl.stop();
        };
        // The models are fixed for the page; built once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]" />;
}

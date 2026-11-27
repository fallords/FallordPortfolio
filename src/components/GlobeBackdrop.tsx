"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { stage, tick } from "./three/wire";
import { MODELS } from "./three/models";

/**
 * The globe behind the contact section, large and to the right, signals arcing out from Indonesia: it turns slowly
 * and leans towards the pointer, under the words. Still with motion turned down. The parent must be positioned.
 */
export default function GlobeBackdrop() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const host = ref.current;
        const section = host?.parentElement;
        if (!host || !section) return;
        const { root: globe } = MODELS.globe();
        const root = new THREE.Group();
        root.add(globe);
        let lean = 0, leanTo = 0, tilt = 0, tiltTo = 0;
        const ctl = stage(
            host,
            ({ scene, w, h }) => {
                scene.add(root);
                const wide = w >= 900;
                const r = wide ? Math.min(h * 0.55, w * 0.3) : Math.min(w * 0.55, h * 0.4);
                root.scale.setScalar(r / 1.1);
                root.position.set(wide ? w * 0.24 : w * 0.18, wide ? 0 : h * 0.18, 0);
                const cam = h / 2 / Math.tan((15 * Math.PI) / 180);
                root.traverse((o) => ((o as THREE.LineSegments).material as THREE.ShaderMaterial | undefined)?.uniforms?.uFade?.value.set(cam - r, cam + r));
            },
            (dt, time) => {
                const f = 1 - Math.exp(-dt * 3);
                lean += (leanTo - lean) * f;
                tilt += (tiltTo - tilt) * f;
                globe.rotation.set(0.35 + tilt, time * 0.15 + lean, 0);
                tick(root, time);
                return true;
            },
        );
        if (!ctl) return;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const r = section.getBoundingClientRect();
            leanTo = ((e.clientX - r.left) / r.width - 0.5) * 0.8;
            tiltTo = ((e.clientY - r.top) / r.height - 0.5) * 0.4;
        };
        section.addEventListener("pointermove", onMove);
        return () => {
            section.removeEventListener("pointermove", onMove);
            ctl.stop();
        };
    }, []);
    return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0" />;
}

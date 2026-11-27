"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import * as THREE from "three";
import { stage, tick } from "./three/wire";
import { MODELS, card, type Model } from "./three/models";
import "./showcase.css";

export type ShowcaseItem = {
    /** What the number button and the screen reader call it. */
    label: string;
    /** Which 3D object stands for it (three/models.ts), or a certificate's scan to show on a card. */
    model: keyof typeof MODELS | { card: string | undefined };
    /** The words beside it. */
    body: ReactNode;
};

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * One section's items, each as a large 3D object with its words beside it, the way the top WebGL portfolios show a
 * piece: the object fills its stage, turns slowly on its own and can be turned by dragging it (a finger moving up or
 * down still scrolls the page), and the numbers under it change the item, the old object sinking away as the new
 * one rises. Every six seconds the next comes on by itself, a green line on the numbers filling for its time; it
 * holds while the pointer or the keyboard is on the section or it is off the screen, and never with motion turned
 * down. The object leans towards the pointer. The numbers are a tab list (arrows, Home, End). One canvas per section, drawing only while on screen;
 * with motion turned down the object stands still; without WebGL the words stand alone.
 */
export default function Showcase({ items, label, flip = false }: { items: ShowcaseItem[]; label: string; flip?: boolean }) {
    const host = useRef<HTMLDivElement>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const [active, setActive] = useState(0);
    const want = useRef(0);
    const kick = useRef<() => void>(() => {});
    // The latest items, read when an object is built: a parent re-rendering (opening a dialog) must not rebuild the canvas.
    const latest = useRef(items);
    useEffect(() => {
        latest.current = items;
    });
    const count = items.length;
    const box = useRef<HTMLDivElement>(null);
    // Held still while the pointer or the keyboard is on it, or it is off the screen (WCAG 2.2.2); see the timer below.
    const [held, setHeld] = useState(false);
    const [seen, setSeen] = useState(false);

    useEffect(() => {
        const el = box.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.4 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        want.current = active;
        kick.current();
    }, [active]);

    useEffect(() => {
        const el = host.current;
        if (!el) return;
        const built: ({ model: Model; holder: THREE.Group; shown: number; base: Map<THREE.ShaderMaterial | THREE.MeshBasicMaterial, number> } | null)[] = Array.from({ length: count }, () => null);
        const root = new THREE.Group();
        let fit = 1, cam = 1, yaw = 0, pitch = 0.18, spin = 0, drag: { x: number; y: number; id: number } | null = null;
        // Leaning towards the pointer while it is over the section.
        let lean = 0, leanTo = 0, tilt = 0, tiltTo = 0;

        /** Builds an item's object the first time it is wanted, scaled to the stage and dimmed to start. */
        const build = (i: number) => {
            if (built[i]) return built[i]!;
            const m = latest.current[i]!.model;
            const model = typeof m === "string" ? MODELS[m]() : card(m.card);
            const holder = new THREE.Group();
            holder.add(model.root);
            const box = new THREE.Box3().setFromObject(model.root);
            const centre = box.getCenter(new THREE.Vector3());
            const radius = box.getBoundingSphere(new THREE.Sphere()).radius || 1;
            model.root.position.sub(centre);
            model.root.userData.unit = 1 / radius;
            const base = new Map<THREE.ShaderMaterial | THREE.MeshBasicMaterial, number>();
            holder.traverse((o) => {
                const m = (o as THREE.Mesh).material as THREE.ShaderMaterial | THREE.MeshBasicMaterial | undefined;
                if (!m || base.has(m)) return;
                base.set(m, "uniforms" in m && m.uniforms?.uOpacity ? (m.uniforms.uOpacity.value as number) : (o.userData.scan ? 1 : m.opacity));
            });
            root.add(holder);
            built[i] = { model, holder, shown: 0, base };
            return built[i]!;
        };

        const ctl = stage(
            el,
            ({ scene, w, h }) => {
                scene.add(root);
                fit = Math.min(w, h) * 0.45;
                cam = h / 2 / Math.tan((15 * Math.PI) / 180);
            },
            (dt, time) => {
                const k = 1 - Math.exp(-dt * 5);
                build(want.current);
                built.forEach((b, i) => {
                    if (!b) return;
                    const on = i === want.current;
                    b.shown += ((on ? 1 : 0) - b.shown) * k;
                    if (Math.abs(b.shown - (on ? 1 : 0)) < 0.002) b.shown = on ? 1 : 0;
                    b.holder.visible = b.shown > 0.01;
                    if (!b.holder.visible) return;
                    const s = fit * (b.model.root.userData.unit as number) * (0.85 + 0.15 * b.shown);
                    b.holder.scale.setScalar(s);
                    // Rising in from below, sinking away.
                    b.holder.position.y = (1 - b.shown) * fit * (on ? -0.35 : 0.35);
                    // Full strength on the near side of the object, dimmer to its back; then faded by how far it is on show.
                    for (const [m, v] of b.base) {
                        if ("uniforms" in m && m.uniforms?.uOpacity) {
                            m.uniforms.uOpacity.value = v * b.shown;
                            m.uniforms.uFade?.value.set(cam - fit, cam + fit * 1.2);
                        } else m.opacity = v * b.shown;
                    }
                    b.model.tick?.(time);
                });
                // Turning slowly on its own, and as far as it is dragged.
                if (!drag) spin += dt * 0.25;
                const f = 1 - Math.exp(-dt * 4);
                lean += (leanTo - lean) * f;
                tilt += (tiltTo - tilt) * f;
                root.rotation.set(pitch + tilt, yaw + spin + lean, 0);
                tick(root, time);
                return true;
            },
        );
        // Without WebGL the words stand alone (showcase.css).
        if (!ctl) {
            el.closest(".sc")?.setAttribute("data-flat", "");
            return;
        }
        kick.current = ctl.redraw;

        // Dragging turns it: across turns it round, up and down tilts it a little.
        const onDown = (e: PointerEvent) => {
            drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
        };
        const scene = el.closest<HTMLElement>(".sc") ?? el;
        const onLean = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const r = scene.getBoundingClientRect();
            leanTo = ((e.clientX - r.left) / r.width - 0.5) * 0.7;
            tiltTo = ((e.clientY - r.top) / r.height - 0.5) * 0.35;
        };
        const offLean = () => (leanTo = tiltTo = 0);
        scene.addEventListener("pointermove", onLean);
        scene.addEventListener("pointerleave", offLean);
        const onMove = (e: PointerEvent) => {
            if (!drag || e.pointerId !== drag.id) return;
            const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
            drag.x = e.clientX;
            drag.y = e.clientY;
            yaw += dx * 0.008;
            pitch = Math.max(-0.6, Math.min(0.9, pitch + dy * 0.005));
        };
        const onUp = () => (drag = null);
        el.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        return () => {
            el.removeEventListener("pointerdown", onDown);
            scene.removeEventListener("pointermove", onLean);
            scene.removeEventListener("pointerleave", offLean);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            built.forEach((b) => b?.holder.traverse((o) => ((o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined)?.map?.dispose()));
            kick.current = () => {};
            ctl.stop();
        };
    }, [count]);

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const last = items.length - 1;
        const next =
            e.key === "ArrowRight" || e.key === "ArrowDown"
                ? (active + 1) % items.length
                : e.key === "ArrowLeft" || e.key === "ArrowUp"
                  ? (active + last) % items.length
                  : e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? last
                      : -1;
        if (next < 0) return;
        e.preventDefault();
        setActive(next);
        tabs.current[next]?.focus();
    };

    return (
        <div
            ref={box}
            className="sc"
            data-flip={flip || undefined}
            data-paused={held || !seen || undefined}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHeld(false)}
        >
            <div className="sc-stage viewport">
                <div ref={host} aria-hidden="true" className="sc-canvas" data-cursor="Drag" />
                <p aria-hidden="true" className="sc-fig label">
                    Fig {pad(active)} <span className="text-[var(--fg-dim)]">/ {items[active]?.label}</span>
                </p>
                <p aria-hidden="true" className="sc-hint label">
                    Drag to turn
                </p>
            </div>

            <div className="sc-side">
                {items.map((item, i) => (
                    <div key={item.label} role="tabpanel" id={`${label}-panel-${i}`} aria-labelledby={`${label}-tab-${i}`} hidden={i !== active} className="sc-body">
                        {item.body}
                    </div>
                ))}

                {items.length > 1 && (
                    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="sc-nav label">
                        {items.map((item, i) => (
                            <button
                                key={item.label}
                                ref={(n) => {
                                    tabs.current[i] = n;
                                }}
                                type="button"
                                role="tab"
                                id={`${label}-tab-${i}`}
                                aria-controls={`${label}-panel-${i}`}
                                aria-selected={i === active}
                                aria-label={item.label}
                                tabIndex={i === active ? 0 : -1}
                                onClick={() => setActive(i)}
                                className="tabular-nums"
                            >
                                {pad(i)}
                            </button>
                        ))}
                        {/* The item's time: a green line filling; when it is full the next one comes on (showcase.css). */}
                        <span key={active} aria-hidden="true" className="sc-timer" onAnimationEnd={() => setActive((a) => (a + 1) % count)} />
                        <span className="sc-count tabular-nums">
                            {pad(active)} / {String(items.length).padStart(2, "0")}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

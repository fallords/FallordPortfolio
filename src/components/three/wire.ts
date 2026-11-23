import * as THREE from "three";

/*
 * The site's Three.js drawings in one hand: thin green wireframes (SectionScenes, the Experience drum, the Work
 * models, the What I do scenes, the certificate stack). Lines are built as plain arrays, then made into one
 * LineSegments each; `t` runs along a line (0..1) for signals that travel it.
 */

export type V = [number, number, number];
export type Lines = { pos: number[]; t: number[] };

export const GREEN = "#19a352";

export const lines = (): Lines => ({ pos: [], t: [] });

export const seg = (l: Lines, a: V, b: V, ta = 0, tb = 0) => {
    l.pos.push(...a, ...b);
    l.t.push(ta, tb);
};

export const polyline = (l: Lines, pts: V[], closed = false) => {
    const n = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < n; i++) seg(l, pts[i], pts[(i + 1) % pts.length], i / n, (i + 1) / n);
};

/** `n` points round a circle of radius `r`, `at` giving the unit point for an angle. */
export const circle = (r: number, n: number, at: (a: number) => V): V[] =>
    Array.from({ length: n }, (_, i) => at((i / n) * Math.PI * 2)).map((p) => p.map((v) => v * r) as V);

/** The hard edges of a solid, moved by `at` first (so boxes can be placed without a matrix). */
export const edgesOf = (l: Lines, g: THREE.BufferGeometry, at: V = [0, 0, 0]) => {
    const e = new THREE.EdgesGeometry(g).attributes.position.array;
    for (let i = 0; i < e.length; i += 6)
        seg(l, [e[i] + at[0], e[i + 1] + at[1], e[i + 2] + at[2]], [e[i + 3] + at[0], e[i + 4] + at[1], e[i + 5] + at[2]]);
    g.dispose();
};

/** A box's edges, centred on `at`. */
export const box = (l: Lines, w: number, h: number, d: number, at: V = [0, 0, 0]) => edgesOf(l, new THREE.BoxGeometry(w, h, d), at);

const VERT = /* glsl */ `
attribute float aT;
uniform float uTime;
uniform float uWave;
uniform vec2 uFade;
uniform vec4 uClip;
varying float vT;
varying float vFade;
varying float vClip;
void main() {
    vec3 p = position;
    p.y += uWave * (sin(p.x * 0.5 + uTime * 0.6) * 0.45 + sin(p.z * 0.75 - uTime * 0.45 + p.x * 0.2) * 0.35);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // Dimmer with distance from the camera, so a wireframe reads front from back.
    vFade = smoothstep(-uFade.y, -uFade.x, mv.z);
    vT = aT;
    // Which side of the clipping plane (in the mesh's own space) the point is on; below 0 is cut away.
    vClip = dot(p, uClip.xyz) + uClip.w;
    gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
uniform float uPulse;
varying float vT;
varying float vFade;
varying float vClip;
void main() {
    if (vClip < 0.0) discard;
    float pulse = uPulse * pow(1.0 - fract(vT - uTime * 0.12), 14.0);
    gl_FragColor = vec4(uColor * (1.0 + pulse), uOpacity * ((0.3 + 0.7 * vFade) + pulse * 1.5));
}
`;

/**
 * One wireframe: its lines in `color` at `opacity`, full from `fade[0]` away from the camera and dimmest from
 * `fade[1]` on; `pulse` sends signals along `t`, `wave` rolls it like ground.
 */
export function wire(l: Lines, { color = GREEN as THREE.ColorRepresentation, opacity = 1, fade = [6.6, 24] as [number, number], pulse = 0, wave = 0 } = {}) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(l.pos, 3));
    geo.setAttribute("aT", new THREE.Float32BufferAttribute(l.t, 1));
    const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uOpacity: { value: opacity },
            uTime: { value: 0 },
            uWave: { value: wave },
            uPulse: { value: pulse },
            uFade: { value: new THREE.Vector2(...fade) },
            // A plane (normal, offset) in the mesh's own space; what is under it is not drawn. None by default.
            uClip: { value: new THREE.Vector4(0, 0, 0, 1) },
        },
        transparent: true,
        depthWrite: false,
    });
    const mesh = new THREE.LineSegments(geo, mat);
    mesh.frustumCulled = false;
    return mesh;
}

/** Sets the clock on every wireframe under `root`. */
export const tick = (root: THREE.Object3D, time: number) =>
    root.traverse((o) => {
        const m = (o as THREE.LineSegments).material as THREE.ShaderMaterial | undefined;
        if (m?.uniforms?.uTime) m.uniforms.uTime.value = time;
    });

export const disposeAll = (root: THREE.Object3D) =>
    root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => {
            (x as THREE.MeshBasicMaterial).map?.dispose();
            x.dispose();
        });
    });

/**
 * A canvas filling `host`, with a perspective camera set so one world unit is one CSS pixel at z = 0 (so a drawing
 * can be sized from the layout). Draws `frame(dt, time)` only while the host is on screen; `frame` returns false
 * when nothing moved, and then nothing is drawn. Under reduced motion `time` stands still. Returns a stop function,
 * or null when WebGL is not there.
 */
export function stage(
    host: HTMLElement,
    setup: (s: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; w: number; h: number; still: boolean }) => void,
    frame: (dt: number, time: number) => boolean | void,
) {
    let renderer: THREE.WebGLRenderer;
    try {
        // No multisampling on a phone: four times the buffer memory for each canvas.
        renderer = new THREE.WebGLRenderer({ antialias: window.innerWidth >= 768, alpha: true, powerPreference: "low-power" });
    } catch {
        return null;
    }
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none";
    host.appendChild(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 10000);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let w = 0, h = 0, raf = 0, last = 0, time = 0, seen = false, dirty = true;

    const size = () => {
        w = Math.max(1, host.clientWidth);
        h = Math.max(1, host.clientHeight);
        // Sharp enough for thin lines, without filling a phone's whole pixel count several times over.
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.5));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.position.set(0, 0, h / 2 / Math.tan((camera.fov * Math.PI) / 360));
        camera.near = camera.position.z / 20;
        camera.far = camera.position.z * 20;
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        setup({ scene, camera, w, h, still: still.matches });
        dirty = true;
    };
    const loop = (now: number) => {
        raf = 0;
        if (!seen) return;
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
        last = now;
        if (!still.matches) time += dt;
        // Faded out or hidden (a scene that has handed over, SceneFlow), nothing to draw.
        if (host.checkVisibility && !host.checkVisibility({ opacityProperty: true, visibilityProperty: true })) {
            // Drawn again in full once it shows: what changed while it was hidden was never drawn.
            dirty = true;
            return;
        }
        if (frame(dt, time) !== false || dirty) {
            dirty = false;
            renderer.render(scene, camera);
        }
    };
    const resize = new ResizeObserver(size);
    resize.observe(host);
    const view = new IntersectionObserver(([e]) => {
        seen = e.isIntersecting;
        last = 0;
        if (seen && !raf) raf = requestAnimationFrame(loop);
    });
    view.observe(host);
    size();

    return {
        renderer,
        redraw: () => {
            dirty = true;
        },
        stop: () => {
            cancelAnimationFrame(raf);
            resize.disconnect();
            view.disconnect();
            disposeAll(scene);
            renderer.dispose();
            // Let the GPU context go now, not whenever it is collected: phones allow only a few, and a page that kept
            // making new ones (the demos remount as their tabs change) ran out of memory and the browser reloaded it.
            renderer.forceContextLoss();
            canvas.remove();
        },
    };
}

/** A box's twelve edges between two corners, without making a geometry (for drawings rebuilt every frame). */
export function cuboid(l: Lines, a: V, b: V) {
    const [x0, y0, z0] = a;
    const [x1, y1, z1] = b;
    for (const z of [z0, z1]) polyline(l, [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], true);
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) seg(l, [x, y, z0], [x, y, z1]);
}

/**
 * A wireframe whose lines change from frame to frame: room for `max` segments made once, `set` writes new ones
 * into it (anything past `max` is left off).
 */
export function liveWire(max: number, opts: Parameters<typeof wire>[1] = {}) {
    const empty = lines();
    empty.pos = new Array(max * 6).fill(0);
    empty.t = new Array(max * 2).fill(0);
    const mesh = wire(empty, opts);
    const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
    const t = mesh.geometry.attributes.aT as THREE.BufferAttribute;
    mesh.geometry.setDrawRange(0, 0);
    return {
        mesh,
        set(l: Lines) {
            const n = Math.min(max * 2, l.pos.length / 3);
            (pos.array as Float32Array).set(l.pos.slice(0, n * 3));
            (t.array as Float32Array).set(l.t.slice(0, n));
            pos.needsUpdate = true;
            t.needsUpdate = true;
            mesh.geometry.setDrawRange(0, n);
        },
    };
}

/** A colour from the page's own tokens (a CSS custom property on the root), for drawings that must match it. */
export const token = (name: string, fallback: string) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name}, ${fallback})`;
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return new THREE.Color().setStyle(c.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),[^)]*\)/, "rgb($1, $2, $3)"));
};

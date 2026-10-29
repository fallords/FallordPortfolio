import { extrude, fitProjection, iso, pathOf, pointsAt, type Plane, type Point3, type SolidPaths } from "../../iso/iso-kit";

/*
 * A panel door in its frame, for the essay about a door that has been
 * closed: it swings shut toward the reader and its barrel bolt is thrown
 * home into the keeper. The door and everything on it is rebuilt each frame
 * from here (it turns about its hinge); the room around it is static.
 *
 * Units are about 2 cm. The floor is z = 0, the wall's front face y = 0.
 */
export const WIDTH = 240;
export const HEIGHT = 180;

export const OPENING = { x0: -20, x1: 20, top: 88 };
export const WALL_T = 8;
export const WALL_H = 100;
export const CASING = { w: 5, proud: 1.6 };

/* The door: 40 wide, 3.5 thick, hung on the left jamb, opening toward the viewer. */
export const DOOR = { w: 40, t: 3.5, z0: 1, z1: 87 };
export const HINGE: Plane = [OPENING.x0, CASING.proud];
export const OPEN = (32 * Math.PI) / 180;

/* The bolt's travel, door-local: retracted it stops inside the barrel, thrown it reaches 4 into the keeper. */
const BOLT_TRAVEL = 7;
export const KNUCKLES: Array<[number, number]> = [
  [10, 18],
  [42, 50],
  [72, 80],
];

export const P = fitProjection(
  [
    [-62, -34, -3],
    [62, -34, -3],
    [-62, 34, -3],
    [62, 34, -3],
    [-60, 0, WALL_H],
    [60, 0, WALL_H],
    [-60, -WALL_T, WALL_H],
    [HINGE[0] + Math.cos(OPEN) * DOOR.w, HINGE[1] + Math.sin(OPEN) * DOOR.w, 0],
  ] as Point3[],
  WIDTH,
  HEIGHT,
  { pad: 10, azimuth: 62, elevation: 26 },
);

/** Door-local (u across from the hinge, v out of the front face, z up) to world, with the door turned by `theta`. */
const toWorld = (theta: number, u: number, v: number): Plane => [
  HINGE[0] + u * Math.cos(theta) - v * Math.sin(theta),
  HINGE[1] + u * Math.sin(theta) + v * Math.cos(theta),
];

/** A box on the door: u0..u1 across, v0..v1 out of the front face, z0..z1 up. */
const box = (theta: number, u0: number, u1: number, v0: number, v1: number, z0: number, z1: number): SolidPaths =>
  extrude([toWorld(theta, u0, v0), toWorld(theta, u1, v0), toWorld(theta, u1, v1), toWorld(theta, u0, v1)], z0, z1 - z0, P);

/** A rectangle drawn on the door's front face (v = 0). */
const faceRect = (theta: number, u0: number, u1: number, z0: number, z1: number, v = 0) => {
  const at = (u: number, z: number) => {
    const [x, y] = toWorld(theta, u, v);
    return iso([x, y, z], P);
  };
  return pathOf([at(u0, z0), at(u1, z0), at(u1, z1), at(u0, z1)], true);
};

const faceLine = (theta: number, u0: number, u1: number, z0: number, z1: number, v: number) => {
  const a = toWorld(theta, u0, v);
  const b = toWorld(theta, u1, v);
  return pathOf([iso([a[0], a[1], z0], P), iso([b[0], b[1], z1], P)]);
};

export const DOOR_SOLIDS = ["panel", "rose", "lever", "escutcheon", "plate", "bolt", "barrel", "knob"] as const;
export type DoorSolid = (typeof DOOR_SOLIDS)[number];

/**
 * Everything on the door at `theta` (0 shut, OPEN fully open) with the bolt
 * `thrown` 0..1. Painted in the order of DOOR_SOLIDS; the bolt goes before
 * its barrel so the barrel hides the length inside it.
 */
export function doorAt(theta: number, thrown: number) {
  const b = BOLT_TRAVEL * thrown;
  const solids: Record<DoorSolid, SolidPaths> = {
    panel: box(theta, 0, DOOR.w, -DOOR.t, 0, DOOR.z0, DOOR.z1),
    rose: box(theta, 32, 36, 0, 0.8, 43, 51),
    lever: box(theta, 25, 35, 0.8, 2.8, 46.2, 48.4),
    escutcheon: box(theta, 33, 35, 0, 0.6, 37.5, 41.5),
    plate: box(theta, 25, 37, 0, 0.6, 62, 67),
    bolt: box(theta, 27 + b, 37 + b, 0.9, 2, 63.9, 65.1),
    barrel: box(theta, 26, 36, 0.6, 2.4, 63.3, 65.7),
    knob: box(theta, 29 + b, 30.8 + b, 2.4, 4.6, 64, 65),
  };
  const lines = {
    // Each panel: the moulding round its edge and the raised field inside it.
    panels: [
      faceRect(theta, 6, 34, 52, 80),
      faceRect(theta, 8.4, 31.6, 54.4, 77.6),
      faceRect(theta, 6, 34, 10, 44),
      faceRect(theta, 8.4, 31.6, 12.4, 41.6),
    ].join(""),
    keyhole: faceLine(theta, 34, 34, 38.4, 40.2, 0.6),
  };
  const screws = pointsAt(
    ([
      [25.9, 62.9],
      [36.1, 62.9],
      [25.9, 66.1],
      [36.1, 66.1],
    ] as Plane[]).map(([u, z]) => {
      const [x, y] = toWorld(theta, u, 0.6);
      return [x, y, z] as Point3;
    }),
    P,
  );
  return { solids, lines, screws };
}

/** Below this angle the door is in its frame, so the right jamb, the head and the keeper paint over it. */
export const SHUT = 0.02;

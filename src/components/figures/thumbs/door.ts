import { cylinder, haloOf, pointsAt, segment, slabOf, type Plan, type Point3 } from "../../iso/iso-kit";
import { CASING, HINGE, KNUCKLES, OPENING, P, WALL_H, WALL_T } from "./door-view";

const slab = (plan: Plan, z: number, h: number, bevel = 0) => slabOf(plan, z, h, P, 2, bevel);
const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, bevel = 0) =>
  slab({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: 0 }, z0, z1 - z0, bevel);
const line = (a: Point3, b: Point3) => segment(a, b, P);

const FLOOR: Plan = { x: -62, y: -34, w: 124, d: 68, r: 1.5 };
const PLANK = 7.5;
const C = CASING;

/* Drawn before the door: the floor, the threshold, and everything left of the opening. */
export const EARLY_ART = {
  halo: haloOf(FLOOR, -3, 3, P),
  floor: slab(FLOOR, -3, 3, 0.4),
  planks: Array.from({ length: 8 }, (_, i) => FLOOR.y + PLANK * (i + 1))
    .map((y) => line([FLOOR.x, y, 0], [FLOOR.x + FLOOR.w, y, 0]))
    .join(""),
  // The planks' butt joints, staggered row to row.
  joints: Array.from({ length: 9 }, (_, i) => {
    const y = FLOOR.y + PLANK * i;
    const x = i % 2 ? 34 : -44;
    return line([x, y, 0], [x, y + PLANK, 0]);
  }).join(""),
  threshold: box(OPENING.x0, OPENING.x1, -WALL_T, C.proud, 0, 1, 0.2),
  wallLeft: box(-60, OPENING.x0, -WALL_T, 0, 0, WALL_H, 0.3),
  skirtingLeft: box(-60, OPENING.x0 - C.w - 1, 0, 1.2, 0, 6),
  plinthLeft: box(OPENING.x0 - C.w - 1, OPENING.x0, 0, C.proud + 0.6, 0, 9),
  casingLeft: box(OPENING.x0 - C.w, OPENING.x0, 0, C.proud, 9, OPENING.top + 5),
  hingeLeaves: KNUCKLES.map(([z0, z1]) => box(OPENING.x0 - 3.2, OPENING.x0 - 1.2, C.proud, C.proud + 0.4, z0, z1)),
};

/* The hinge barrels, in front of the door at its hinge edge; they turn about themselves, so they stay put. */
export const KNUCKLE_ART = KNUCKLES.map(([z0, z1]) => ({
  barrel: cylinder(HINGE[0], HINGE[1], 1.3, z0, z1 - z0, P, 14),
  pin: cylinder(HINGE[0], HINGE[1], 0.8, z1, 0.7, P, 10),
  joint: line([HINGE[0] - 1.3, HINGE[1], (z0 + z1) / 2], [HINGE[0] + 1.3, HINGE[1], (z0 + z1) / 2]),
}));

/*
 * Right of the opening and above it, plus the keeper the bolt goes into.
 * Painted twice by the live component: before the door while it stands
 * open in front of them, after it once it is shut in its frame.
 */
export const LATE_ART = {
  lintel: box(OPENING.x0, OPENING.x1, -WALL_T, 0, OPENING.top, WALL_H, 0.3),
  head: box(OPENING.x0 - C.w, OPENING.x1 + C.w, 0, C.proud, OPENING.top, OPENING.top + 5),
  headSeams: [
    line([OPENING.x0, C.proud, OPENING.top], [OPENING.x0, C.proud, OPENING.top + 5]),
    line([OPENING.x1, C.proud, OPENING.top], [OPENING.x1, C.proud, OPENING.top + 5]),
  ].join(""),
  wallRight: box(OPENING.x1, 60, -WALL_T, 0, 0, WALL_H, 0.3),
  skirtingRight: box(OPENING.x1 + C.w + 1, 60, 0, 1.2, 0, 6),
  plinthRight: box(OPENING.x1, OPENING.x1 + C.w + 1, 0, C.proud + 0.6, 0, 9),
  casingRight: box(OPENING.x1, OPENING.x1 + C.w, 0, C.proud, 9, OPENING.top),
  switchPlate: box(34, 40, 0, 0.6, 48, 58, 0.15),
  rocker: box(36, 38, 0.6, 1.5, 51, 55),
  switchScrews: pointsAt(
    [
      [37, 0.6, 49.4],
      [37, 0.6, 56.6],
    ],
    P,
  ),
  keeper: box(OPENING.x1 + 0.6, OPENING.x1 + 4.4, C.proud, C.proud + 2.3, 62.4, 66.6, 0.2),
  keeperScrews: pointsAt(
    [
      [OPENING.x1 + 2.5, C.proud + 2.3, 63.2],
      [OPENING.x1 + 2.5, C.proud + 2.3, 65.8],
    ],
    P,
  ),
};

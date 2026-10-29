import { cylinder, haloOf, knurl, planOutline, pointsAt, ring, segment, slabOf, iso, pathOf, type Plan, type Point3 } from "../../iso/iso-kit";
import { BODY, BODY_TOP, DETENTS, DIAL, DIAL_R, DIAL_TOP, FEET_H, P, SHEET } from "./cv-view";

const slab = (plan: Plan, z: number, h: number, steps = 4, bevel = 0) => slabOf(plan, z, h, P, steps, bevel);
const post = (x: number, y: number, r: number, z: number, h: number, steps = 20) => cylinder(x, y, r, z, h, P, steps);
const line = (a: Point3, b: Point3) => segment(a, b, P);
const join = (paths: string[]) => paths.join("");

/* The body is cut at the slot (y = 0) into a back and a front half, so the sheet can stand between them. */
const BACK: Plan = { x: BODY.x, y: BODY.y, w: BODY.w, d: -BODY.y, r: BODY.r };
const FRONT: Plan = { x: BODY.x, y: 0, w: BODY.w, d: BODY.y + BODY.d, r: BODY.r };
const Z0 = FEET_H;
const H = BODY_TOP - Z0;
const FRONT_FACE = BODY.y + BODY.d;
const SIDE = BODY.x + BODY.w;

/* Blank sheets waiting in the rear tray, leaning on its back guide. */
const TRAY_Y = -9;
const BLANKS = [0, 1, 2].map((i) => ({ x: SHEET.x - 1 + i * 0.4, y: TRAY_Y - 1.6 + i * 0.7 }));

/** A closed slot drawn on the front face (y = const), from x0 to x1 at height z, 1 tall. */
const slot = (x0: number, x1: number, z: number) =>
  pathOf(
    [
      [x0, z],
      [x1, z],
      [x1, z + 1],
      [x0, z + 1],
    ].map(([x, zz]) => iso([x!, FRONT_FACE, zz!], P)),
    true,
  );

export const CV_ART = {
  halo: haloOf(BODY, 0, 2, P),
  feet: [
    [BODY.x + 5, BODY.y + 5],
    [BODY.x + BODY.w - 5, BODY.y + 5],
    [BODY.x + 5, BODY.y + BODY.d - 5],
    [BODY.x + BODY.w - 5, BODY.y + BODY.d - 5],
  ].map(([x, y]) => post(x!, y!, 2.6, 0, Z0, 16)),
  back: slab(BACK, Z0, H, 4, 0.5),
  // Behind the slot, standing out of the back half: the rear tray's guide and the blank sheets in it.
  guide: slab({ x: SHEET.x - 3, y: TRAY_Y - 3.6, w: SHEET.w + 6, d: 1.4, r: 0.4 }, BODY_TOP, 24, 2),
  blanks: BLANKS.map(({ x, y }) => slab({ x, y, w: SHEET.w, d: 0.5, r: 0 }, BODY_TOP, SHEET.h * 0.7, 2)),
  trayMouth: planOutline({ x: SHEET.x - 2, y: TRAY_Y - 2.2, w: SHEET.w + 4, d: 3.2, r: 0.6 }, BODY_TOP, P, 2),
  slotLip: line([SHEET.x - 1.5, -0.6, BODY_TOP], [SHEET.x + SHEET.w + 1.5, -0.6, BODY_TOP]),
  front: slab(FRONT, Z0, H, 4, 0.5),
  // The slot's front lip and the roller you can just see in it.
  slotFront: line([SHEET.x - 1.5, 0.6, BODY_TOP], [SHEET.x + SHEET.w + 1.5, 0.6, BODY_TOP]),
  slotEnds: join([SHEET.x - 1.5, SHEET.x + SHEET.w + 1.5].map((x) => line([x, -0.6, BODY_TOP], [x, 0.6, BODY_TOP]))),
  seam: join([line([BODY.x + 2, FRONT_FACE, BODY_TOP - 4], [SIDE - 2, FRONT_FACE, BODY_TOP - 4]), line([SIDE, 2, BODY_TOP - 4], [SIDE, FRONT_FACE - 2, BODY_TOP - 4])]),
  vents: join([0, 1, 2, 3].map((i) => slot(BODY.x + 6, BODY.x + 24, Z0 + 3 + i * 2.4))),
  sideVents: join(
    [0, 1, 2].map((i) =>
      pathOf(
        [
          [-9 + i * 0, Z0 + 4 + i * 2.6],
          [9, Z0 + 4 + i * 2.6],
          [9, Z0 + 5 + i * 2.6],
          [-9, Z0 + 5 + i * 2.6],
        ].map(([y, z]) => iso([SIDE, y! + 3, z!], P)),
        true,
      ),
    ),
  ),
  screws: pointsAt(
    [
      [BODY.x + 3, FRONT_FACE, Z0 + 2.4],
      [SIDE - 3, FRONT_FACE, Z0 + 2.4],
    ],
    P,
  ),
  label: slab({ x: SIDE - 20, y: FRONT_FACE, w: 14, d: 0.4, r: 0.3 }, Z0 + 4, 7, 2),
  labelRules: join([0, 1, 2].map((i) => line([SIDE - 18, FRONT_FACE + 0.4, Z0 + 9 - i * 1.8], [SIDE - (i === 1 ? 12 : 8), FRONT_FACE + 0.4, Z0 + 9 - i * 1.8]))),
  // On top, in front of the slot: the template dial, the power key and its LED.
  dialBase: post(DIAL[0], DIAL[1], DIAL_R + 1.4, BODY_TOP, 0.8, 28),
  dial: post(DIAL[0], DIAL[1], DIAL_R, BODY_TOP + 0.8, DIAL_TOP - BODY_TOP - 0.8, 32),
  dialKnurl: knurl(DIAL[0], DIAL[1], DIAL_R, BODY_TOP + 1, DIAL_TOP, 36, P, 0.3),
  detents: join(
    DETENTS.map((a) => line([DIAL[0] + Math.cos(a) * (DIAL_R + 0.3), DIAL[1] + Math.sin(a) * (DIAL_R + 0.3), BODY_TOP + 0.8], [DIAL[0] + Math.cos(a) * (DIAL_R + 1.3), DIAL[1] + Math.sin(a) * (DIAL_R + 1.3), BODY_TOP + 0.8])),
  ),
  dialRing: ring(DIAL[0], DIAL[1], 1.2, DIAL_TOP, P, 16),
  key: post(-20, 8.5, 2.4, BODY_TOP, 1.2, 18),
  led: pointsAt([[-14.5, 8.5, BODY_TOP]], P),
  // The sheet itself: a thin slab in the slot, at rest (inside); the live part lifts it.
  sheet: slab({ x: SHEET.x, y: -SHEET.t / 2, w: SHEET.w, d: SHEET.t, r: 0 }, BODY_TOP - SHEET.h, SHEET.h, 2),
  // Everything above the slot, for the clip that hides the sheet's length still inside.
  above: slab({ x: SHEET.x - 0.5, y: -2, w: SHEET.w + 1, d: 2.6, r: 0 }, BODY_TOP, 200, 2).fill,
};

/*
 * The three layouts, in the sheet's own flat coordinates (x across 0..42,
 * y down 0..59.4): bars stand for set text, rules for the section lines.
 */
type Layout = { bars: Array<[number, number, number, number]>; rules: Array<[number, number, number]>; panel?: [number, number, number, number] };

const lines = (x: number, y: number, widths: number[], gap = 2.4, h = 0.9) => widths.map((w, i) => [x, y + i * gap, w, h] as [number, number, number, number]);

export const LAYOUTS: Layout[] = [
  // ATS Minimal: one column, name, contact, sections under plain rules.
  {
    bars: [
      [4, 4.5, 18, 2.6],
      ...lines(4, 9, [26], 0, 0.8),
      [4, 14.6, 9, 1.2],
      ...lines(4, 17.4, [33, 30, 22]),
      [4, 26.4, 11, 1.2],
      ...lines(4, 29.2, [30, 34, 27, 19]),
      [4, 40.6, 8, 1.2],
      ...lines(4, 43.4, [28, 31, 16]),
      [4, 52, 7, 1.2],
      ...lines(4, 54.6, [25], 0, 0.9),
    ],
    rules: [
      [4, 12.6, 38],
      [4, 24.4, 38],
      [4, 38.6, 38],
      [4, 50, 38],
    ],
  },
  // Modern Professional: a shaded side column for contact and skills, the experience beside it.
  {
    panel: [0, 0, 13, 59.4],
    bars: [
      [2.4, 5, 8, 1.6],
      ...lines(2.4, 10, [8, 7, 8.4, 6], 2.2, 0.7),
      [2.4, 22, 6, 1],
      ...lines(2.4, 25, [8, 6.4, 7.6], 2.2, 0.7),
      [16, 4.5, 20, 2.6],
      ...lines(16, 9, [14], 0, 0.8),
      [16, 14.6, 10, 1.2],
      ...lines(16, 17.4, [22, 20, 23, 15]),
      [16, 29, 10, 1.2],
      ...lines(16, 31.8, [21, 23, 17]),
      [16, 41.4, 8, 1.2],
      ...lines(16, 44.2, [20, 14]),
    ],
    rules: [
      [16, 12.6, 38],
      [16, 27, 38],
      [16, 39.4, 38],
    ],
  },
  // Graduate: centred name, education first, then projects.
  {
    bars: [
      [12, 4.5, 18, 2.6],
      [9, 9, 24, 0.8],
      [4, 14.6, 10, 1.2],
      ...lines(4, 17.4, [30, 24]),
      [4, 23.8, 9, 1.2],
      ...lines(4, 26.6, [33, 28, 31, 20]),
      [4, 38, 8, 1.2],
      ...lines(4, 40.8, [27, 30, 22]),
      [4, 49.4, 11, 1.2],
      ...lines(4, 52.2, [24, 29]),
    ],
    rules: [
      [4, 12.6, 38],
      [4, 22.2, 38],
      [4, 36.4, 38],
      [4, 47.8, 38],
    ],
  },
];

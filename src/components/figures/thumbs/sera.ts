import { cylinder, haloOf, segment, slabOf, type Plan, type Point3, type SolidPaths } from "../../iso/iso-kit";
import * as G from "../../iso/lathe.mjs";
import { BASE, BASE_TOP, BASE_Z, CARD, CARD_H, CARD_TOP, LENS, LENS_REST, P, POST, POST_TOP } from "./sera-view";

const slab = (plan: Plan, z: number, h: number, steps = 4, bevel = 0) => slabOf(plan, z, h, P, steps, bevel);
const post = (x: number, y: number, r: number, z: number, h: number, steps = 20) => cylinder(x, y, r, z, h, P, steps);
const line = (a: Point3, b: Point3) => segment(a, b, P);

/* The carriage rides the post; the arm reaches round in front of the card to the lens. */
const C = LENS_REST - 3.5;
const LENS_FRAME_REST = G.frameAlong([LENS.x, LENS.y, LENS_REST], [0, 1, 0]);
const SCREW_FRAME = G.frameAlong([POST[0] + 3, POST[1] + 1, C + 3.5], [1, 0, 0]);

export const SERA_ART = {
  halo: haloOf(BASE, 0, BASE_TOP, P),
  feet: [
    [BASE.x + 4, BASE.y + 4],
    [BASE.x + BASE.w - 4, BASE.y + 4],
    [BASE.x + 4, BASE.y + BASE.d - 4],
    [BASE.x + BASE.w - 4, BASE.y + BASE.d - 4],
  ].map(([x, y]) => post(x!, y!, 2.4, 0, BASE_Z, 16)),
  base: slab(BASE, BASE_Z, BASE_TOP - BASE_Z, 4, 0.6),
  groove: line([BASE.x + 4, BASE.y + BASE.d - 4, BASE_TOP], [BASE.x + BASE.w - 4, BASE.y + BASE.d - 4, BASE_TOP]),
  // The holder: a block with a slot, the panel standing in it, the card against the panel.
  block: slab({ x: -22, y: -8.4, w: 38, d: 6.8, r: 1 }, BASE_TOP, 4, 2, 0.3),
  panel: slab({ x: -20, y: -6.2, w: 34, d: 2.6, r: 1 }, BASE_TOP + 4, CARD_TOP + 4 - BASE_TOP - 4, 2, 0.3),
  card: slab(CARD, CARD_TOP - CARD_H, CARD_H, 2),
  ledge: slab({ x: -20, y: CARD.y, w: 34, d: 4.6, r: 0.8 }, BASE_TOP, 4.6, 2, 0.3),
  ledgeLip: line([-20, CARD.y + 4.6, BASE_TOP + 3.2], [14, CARD.y + 4.6, BASE_TOP + 3.2]),
  // The rail.
  collar: post(POST[0], POST[1], 3.2, BASE_TOP, 2, 20),
  post: post(POST[0], POST[1], 1.8, BASE_TOP + 2, POST_TOP - BASE_TOP - 2, 16),
  cap: post(POST[0], POST[1], 2.6, POST_TOP, 1.6, 18),
  // What moves, built with the lens at its rest height.
  carriage: slab({ x: POST[0] - 3.4, y: POST[1] - 3.4, w: 6.8, d: 9, r: 0.8 }, C, 7, 2, 0.3),
  screwShank: G.disc(0, 1.8, 0.9, SCREW_FRAME, P) as SolidPaths,
  screwKnob: G.disc(1.8, 3.2, 2, SCREW_FRAME, P) as SolidPaths,
  arm: slab({ x: LENS.x + LENS.r - 0.6, y: LENS.y - 0.9, w: POST[0] - 3.4 - (LENS.x + LENS.r - 0.6), d: 1.8, r: 0 }, C + 2.6, 1.8, 2),
  rimBack: G.circleOf(LENS_FRAME_REST, -0.6, LENS.r, P, 56) as string,
  rim: G.disc(-0.6, 0.6, LENS.r, LENS_FRAME_REST, P, { steps: 56 }) as SolidPaths,
  rimInner: G.circleOf(LENS_FRAME_REST, 0.6, LENS.glass, P, 48) as string,
  // The glass at rest: the clip the magnified card shows through.
  glass: G.circleOf(LENS_FRAME_REST, 0.6, LENS.glass, P, 48) as string,
};

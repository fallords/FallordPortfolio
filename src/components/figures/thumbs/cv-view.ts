import { fitProjection, lineOnTop, sideMatrix, type Plan, type Point3 } from "../../iso/iso-kit";

/*
 * The CV maker as the thing it ends in: a small printer that feeds an A4
 * sheet up out of its top slot with the CV already laid out on it. The dial
 * on top picks one of the app's three templates (ATS Minimal, Modern
 * Professional, Graduate), and each sheet comes out in the one it points at.
 * The A4 sheet keeps A4's proportions (210 × 297); the rest is in proportion
 * to it, not measured.
 */
export const WIDTH = 160;
export const HEIGHT = 252;

export const BODY: Plan = { x: -30, y: -15, w: 60, d: 30, r: 3 };
export const FEET_H = 2;
export const BODY_TOP = 20;
/* The output slot runs across the top at y = 0; the sheet stands in it. */
export const SHEET = { x: -21, w: 42, h: 59.4, t: 0.6 };
/* Shown, the sheet still has 4 of its length in the rollers. */
export const SHEET_OUT = SHEET.h - 4;

export const DIAL: [number, number] = [21, 8.5];
export const DIAL_R = 4.4;
export const DIAL_TOP = BODY_TOP + 2.4;
/* The three detents, one per template, seen from above. */
export const DETENTS = [-0.7, 0, 0.7].map((a) => a - Math.PI / 2);
export const TEMPLATES = ["ATS Minimal", "Modern Professional", "Graduate"] as const;

export const P = fitProjection(
  [
    [BODY.x, BODY.y, 0],
    [BODY.x + BODY.w, BODY.y, 0],
    [BODY.x, BODY.y + BODY.d, 0],
    [BODY.x + BODY.w, BODY.y + BODY.d, 0],
    [SHEET.x, 0, BODY_TOP + SHEET_OUT],
    [SHEET.x + SHEET.w, 0, BODY_TOP + SHEET_OUT],
    [-24, -9, BODY_TOP + 46],
  ] as Point3[],
  WIDTH,
  HEIGHT,
  { pad: 8, azimuth: 60, elevation: 24 },
);

/** The dial's pointer at `angle` (radians, seen from above). */
export const pointerAt = (angle: number) =>
  lineOnTop([DIAL[0] + Math.cos(angle) * 1.2, DIAL[1] + Math.sin(angle) * 1.2], [DIAL[0] + Math.cos(angle) * (DIAL_R - 0.8), DIAL[1] + Math.sin(angle) * (DIAL_R - 0.8)], DIAL_TOP + 0.05, P);

/* The sheet's face, drawn flat: local x across from its left edge, y down from its top, at rest (in the slot). */
export const SHEET_FACE = sideMatrix([SHEET.x, SHEET.t / 2], BODY_TOP, P, "left");

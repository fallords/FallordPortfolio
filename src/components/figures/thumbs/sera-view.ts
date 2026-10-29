import { fitProjection, iso, sideMatrix, type Flat, type Plan, type Point3 } from "../../iso/iso-kit";

/*
 * S.E.R.A. as a reading stand: a chat stands in a holder, and a lens on a
 * rail slides down it line by line. Where it passes a sentence that reads
 * oddly, a red mark appears beside it: the app reads a pasted chat and
 * marks the sentences that sound off, then explains why.
 */
export const WIDTH = 160;
export const HEIGHT = 252;

export const BASE: Plan = { x: -26, y: -14, w: 52, d: 28, r: 3 };
export const BASE_Z = 2;
export const BASE_TOP = 6;
/* The chat card: 30 × 58, its face at y = CARD_FACE, its top at CARD_TOP. */
export const CARD: Plan = { x: -18, y: -3.6, w: 30, d: 0.6, r: 0 };
export const CARD_FACE = CARD.y + CARD.d;
export const CARD_TOP = 68;
export const CARD_H = 58;
export const POST: [number, number] = [20, -2];
export const POST_TOP = 76;

/* The lens: its centre's x and y, radius, and the rest height it is built at. */
export const LENS = { x: -3, y: 3.8, r: 8.4, glass: 6.8 };
export const LENS_REST = 40;
export const MAGNIFY = 1.7;

/* Card-local y (down from the card's top) of the lens centre at height z, and back. */
export const localOf = (z: number) => CARD_TOP - z;
export const heightOf = (local: number) => CARD_TOP - local;

export const P = fitProjection(
  [
    [BASE.x, BASE.y, 0],
    [BASE.x + BASE.w, BASE.y, 0],
    [BASE.x, BASE.y + BASE.d, 0],
    [BASE.x + BASE.w, BASE.y + BASE.d, 0],
    [-20, -6, CARD_TOP + 4],
    [POST[0], POST[1], POST_TOP + 2],
    [LENS.x - LENS.r, LENS.y, heightOf(52) - LENS.r],
  ] as Point3[],
  WIDTH,
  HEIGHT,
  { pad: 8, azimuth: 60, elevation: 22 },
);

/* The card's face drawn flat: local x across from its left edge, y down from its top. */
export const CARD_FACE_MATRIX = sideMatrix([CARD.x, CARD_FACE], CARD_TOP, P, "left");

/** Where, on screen, the lens centre is and the card point straight behind it, with the lens at height z. */
export function lensCentres(z: number): { lens: Flat; card: Flat } {
  return { lens: iso([LENS.x, LENS.y + 0.4, z], P), card: iso([LENS.x, CARD_FACE, z], P) };
}

/*
 * The chat on the card, in its flat coordinates (x across 0..30, y down
 * 0..58): the header with S.E.R.A.'s mark, then bubbles, theirs on the left
 * and yours on the right; bars stand for the words. Two sentences get marked.
 */
export type Bubble = { side: "l" | "r"; y: number; lines: number[]; flag?: number };

export const BUBBLES: Bubble[] = [
  { side: "l", y: 8.6, lines: [16, 10] },
  { side: "r", y: 16, lines: [14] },
  { side: "l", y: 21.2, lines: [17, 15, 8], flag: 1 },
  { side: "r", y: 31, lines: [12, 9] },
  { side: "l", y: 38.2, lines: [15] },
  { side: "r", y: 43.4, lines: [16, 13], flag: 0 },
];

export const LINE_GAP = 2.2;
export const bubbleOf = (b: Bubble) => {
  const w = Math.max(...b.lines) + 3;
  const h = b.lines.length * LINE_GAP + 1.6;
  const x = b.side === "l" ? 2 : 28 - w;
  return { x, w, h };
};
/** Card-local y of a marked line's underline. */
export const flagLineY = (b: Bubble) => b.y + 1.1 + (b.flag ?? 0) * LINE_GAP + 1.05;
export const FLAGGED = BUBBLES.filter((b) => b.flag !== undefined);

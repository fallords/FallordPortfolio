import {
  cylinder,
  haloOf,
  insetPlan,
  pathOf,
  planOutline,
  pointsAt,
  ring,
  segment,
  slabOf,
  iso,
  type Plan,
  type Point3,
  type SolidPaths,
} from "../../iso/iso-kit";
import * as G from "../../iso/lathe.mjs";
import { BODY, BOSSES, BOSS_R, CLIP_TOP, FLOOR, LID_H, MAT, MAT_H, P, SHELL_H, TOP, WALL } from "./wearable-view";

const slab = (plan: Plan, z: number, h: number, steps = 4, bevel = 0) => slabOf(plan, z, h, P, steps, bevel);
const post = (x: number, y: number, r: number, z: number, h: number, steps = 20) => cylinder(x, y, r, z, h, P, steps);
const line = (a: Point3, b: Point3) => segment(a, b, P);
const poly = (points: Point3[]) => pathOf(points.map((point) => iso(point, P)));
const join = (paths: string[]) => paths.join("");
const dots = (points: Point3[]) => pointsAt(points, P);

/* ------------------------------------------------------------------ mat */

const GRID = 10;
const gridLines = () => {
  const lines: string[] = [];
  for (let x = MAT.x + 8; x < MAT.x + MAT.w - 2; x += GRID) lines.push(line([x, MAT.y, 0], [x, MAT.y + MAT.d, 0]));
  for (let y = MAT.y + 6; y < MAT.y + MAT.d - 2; y += GRID) lines.push(line([MAT.x, y, 0], [MAT.x + MAT.w, y, 0]));
  return join(lines);
};

export const MAT_ART = {
  halo: haloOf(MAT, -MAT_H, MAT_H, P),
  slab: slab(MAT, -MAT_H, MAT_H, 4),
  grid: gridLines(),
  shadow: haloOf(insetPlan(BODY, 2), 0, 0.1, P),
};

/* ----------------------------------------------------------------- clip */

const TONGUE: Plan = { x: -40, y: -16, w: 66, d: 32, r: 6 };
const MOUNT: Plan = { x: -34, y: -13, w: 62, d: 26, r: 3 };
const BARREL_FRAME = G.frameAlong([30, -16, 2.6], [0, 1, 0]);

export const CLIP_ART = {
  tongue: slab(TONGUE, 0, 1.4, 4, 0.3),
  ridges: join([-34, -30, -26, -22].map((x) => line([x, TONGUE.y + 4, 1.4], [x, TONGUE.y + TONGUE.d - 4, 1.4]))),
  barrel: G.disc(0, 32, 2.6, BARREL_FRAME, P) as SolidPaths,
  mount: slab(MOUNT, 3.2, CLIP_TOP - 3.2, 4, 0.3),
  mountScrews: dots([
    [MOUNT.x + 6, 0, CLIP_TOP],
    [MOUNT.x + MOUNT.w - 6, 0, CLIP_TOP],
  ]),
};

/* ---------------------------------------------------------------- shell */

/*
 * Drawn at rest (sitting on the clip). The far walls first, the parts inside,
 * then the near walls, so the rim hides what sits below it.
 */
const Z0 = CLIP_TOP;
const FLOOR_TOP = Z0 + FLOOR;
const IN = { x0: BODY.x + WALL, x1: BODY.x + BODY.w - WALL, y0: BODY.y + WALL, y1: BODY.y + BODY.d - WALL };
const wall = (plan: Plan) => slab(plan, Z0, SHELL_H, 2, 0.3);
const boss = ([x, y]: [number, number]) => post(x, y, BOSS_R, Z0, SHELL_H);
const bossHole = ([x, y]: [number, number]) => ring(x, y, 1.4, TOP, P, 16);

/* The antenna leaves the top end (−x) through an SMA bulkhead. */
const ANT_AT: Point3 = [BODY.x, 2, Z0 + 10];
const ANT_FRAME = G.frameAlong(ANT_AT, [-1, 0, 0]);

/* Boards, in the shell's own coordinates (the floor top is FLOOR_TOP). */
const ESP: Plan = { x: -37, y: -22, w: 18, d: 22.5, r: 0.8 };
const MPU: Plan = { x: -37, y: 4, w: 21, d: 16, r: 0.8 };
const RFM: Plan = { x: -15, y: -22, w: 16, d: 16, r: 0.4 };
const CELL: Plan = { x: 4, y: -22, w: 30, d: 40, r: 2.5 };
const TP: Plan = { x: 36, y: -8.5, w: 11, d: 17, r: 0.6 };
const PCB = 1.2;
const STANDOFF = 1.4;
const BOARD = FLOOR_TOP + STANDOFF;
const BOARD_TOP = BOARD + PCB;

/** A row of header pins as dots along one edge of a board. */
function pins(from: [number, number], to: [number, number], count: number, z: number): Point3[] {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1);
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, z] as Point3;
  });
}

/** A wire lying over the boards: up off one pad, across, and down onto the other. */
const wire = (a: Point3, b: Point3, lift = 1.6) =>
  poly([a, [a[0], a[1], a[2] + lift], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.max(a[2], b[2]) + lift * 1.4], [b[0], b[1], b[2] + lift], b]);

const ESP_PINS_R = pins([ESP.x + ESP.w - 1.3, ESP.y + 3], [ESP.x + ESP.w - 1.3, ESP.y + ESP.d - 3], 8, BOARD_TOP);
const ESP_PINS_L = pins([ESP.x + 1.3, ESP.y + 3], [ESP.x + 1.3, ESP.y + ESP.d - 3], 8, BOARD_TOP);
const MPU_PINS = pins([MPU.x + 3, MPU.y + 1.4], [MPU.x + MPU.w - 3, MPU.y + 1.4], 8, BOARD_TOP);
const RFM_PADS_L = pins([RFM.x + 0.6, RFM.y + 2], [RFM.x + 0.6, RFM.y + RFM.d - 2], 8, BOARD + 1.8);
const RFM_PADS_R = pins([RFM.x + RFM.w - 0.6, RFM.y + 2], [RFM.x + RFM.w - 0.6, RFM.y + RFM.d - 2], 8, BOARD + 1.8);
const CELL_TOP = FLOOR_TOP + 5.5;

export const SHELL_ART = {
  // Behind the top end wall.
  antenna: {
    nut: G.disc(0, 2.6, 4, ANT_FRAME, P) as SolidPaths,
    base: G.disc(2.6, 6, 3, ANT_FRAME, P) as SolidPaths,
    whip: G.disc(6, 20, 2.1, ANT_FRAME, P) as SolidPaths,
    tip: G.disc(20, 21.6, 2.5, ANT_FRAME, P) as SolidPaths,
    rings: join([9.5, 13, 16.5].map((s) => G.circleOf(ANT_FRAME, s, 2.1, P) as string)),
  },
  floor: slab(BODY, Z0, FLOOR, 6, 0.4),
  floorGrid: join([-6, 6].map((y) => line([IN.x0, y, FLOOR_TOP], [IN.x1, y, FLOOR_TOP]))),
  farBosses: [boss(BOSSES[0]!), boss(BOSSES[1]!), boss(BOSSES[2]!)],
  farWalls: [
    wall({ x: BODY.x + BOSS_R, y: BODY.y, w: BODY.w - BOSS_R * 2, d: WALL, r: 0 }),
    wall({ x: BODY.x, y: BODY.y + BOSS_R, w: WALL, d: BODY.d - BOSS_R * 2, r: 0 }),
  ],
  coax: poly([
    [RFM.x + 2.2, RFM.y + RFM.d - 2, BOARD + 2],
    [RFM.x + 2.2, 2, BOARD + 2.6],
    [-20, 2, FLOOR_TOP + 1],
    [IN.x0 + 1, 2, FLOOR_TOP + 1],
    [IN.x0, 2, Z0 + 10],
  ]),
  // The boards stand on short standoffs.
  esp: slab(ESP, BOARD, PCB, 4),
  espCan: slab({ x: ESP.x + 4, y: ESP.y + 7, w: 10, d: 10, r: 0.4 }, BOARD_TOP, 1.6, 4),
  espUsb: slab({ x: ESP.x + 5, y: ESP.y - 0.6, w: 8, d: 3.6, r: 1 }, BOARD_TOP, 2.6, 4),
  espPins: dots([...ESP_PINS_L, ...ESP_PINS_R]),
  mpu: slab(MPU, BOARD, PCB, 4),
  mpuChip: slab({ x: MPU.x + 8.5, y: MPU.y + 7, w: 4, d: 4, r: 0.2 }, BOARD_TOP, 0.9, 2),
  mpuHoles: join(
    [
      [MPU.x + 2.4, MPU.y + MPU.d - 2.4],
      [MPU.x + MPU.w - 2.4, MPU.y + MPU.d - 2.4],
    ].map(([x, y]) => ring(x!, y!, 1.2, BOARD_TOP, P, 14)),
  ),
  mpuPins: dots(MPU_PINS),
  rfm: slab(RFM, BOARD, 1.8, 2),
  rfmCan: slab(insetPlan(RFM, 2.2), BOARD + 1.8, 1.1, 2),
  rfmPads: dots([...RFM_PADS_L, ...RFM_PADS_R]),
  cell: slab(CELL, FLOOR_TOP, 5.5, 6, 0.8),
  cellLabel: planOutline(insetPlan(CELL, 5), CELL_TOP, P, 4),
  cellTab: slab({ x: CELL.x + CELL.w, y: 8, w: 3, d: 8, r: 0.3 }, FLOOR_TOP + 2, 1.2, 2),
  tp: slab(TP, BOARD, PCB, 4),
  tpChip: slab({ x: TP.x + 2.5, y: TP.y + 6, w: 3.6, d: 4.4, r: 0.2 }, BOARD_TOP, 0.8, 2),
  tpUsb: slab({ x: TP.x + TP.w - 4.6, y: -4.5, w: 4.6, d: 9, r: 1.4 }, BOARD_TOP, 3.2, 4),
  tpLeds: dots([
    [TP.x + 2, TP.y + 2, BOARD_TOP],
    [TP.x + 2, TP.y + TP.d - 2, BOARD_TOP],
  ]),
  // I2C to the sensor, SPI to the radio, the battery leads to the charger and its output to the ESP32.
  wires: join([
    ...[0, 1, 2, 3].map((i) => wire(ESP_PINS_R[4 + i]!, MPU_PINS[i]!)),
    ...[0, 1, 2, 3, 4, 5].map((i) => wire(ESP_PINS_R[i]!, RFM_PADS_L[i + 1]!, 1)),
    wire([CELL.x + CELL.w + 1.5, 10, FLOOR_TOP + 2.6], [TP.x + 1.5, TP.y + 9, BOARD_TOP], 1.2),
    wire([CELL.x + CELL.w + 1.5, 14, FLOOR_TOP + 2.6], [TP.x + 1.5, TP.y + 12, BOARD_TOP], 1.2),
    poly([
      [TP.x + 2.4, TP.y + TP.d - 1, BOARD_TOP],
      [TP.x + 2.4, IN.y1 - 2, BOARD_TOP + 1],
      [ESP.x + 2, IN.y1 - 2, FLOOR_TOP + 1],
      [ESP.x + 1.3, MPU.y + MPU.d + 1, FLOOR_TOP + 1],
      [ESP.x + 1.3, ESP.y + ESP.d - 3, BOARD_TOP],
    ]),
  ]),
  nearWalls: [
    wall({ x: BODY.x + BODY.w - WALL, y: BODY.y + BOSS_R, w: WALL, d: BODY.d - BOSS_R * 2, r: 0 }),
    wall({ x: BODY.x + BOSS_R, y: BODY.y + BODY.d - WALL, w: BODY.w - BOSS_R * 2, d: WALL, r: 0 }),
  ],
  nearBoss: boss(BOSSES[3]!),
  holes: join(BOSSES.map(bossHole)),
  // The USB-C cutout in the bottom end wall, which faces the camera.
  port: poly(
    Array.from({ length: 17 }, (_, i) => {
      const t = (i / 16) * Math.PI * 2;
      return [BODY.x + BODY.w, Math.cos(t) * 4.8, Z0 + 7.4 + Math.sin(t) * 1.6] as Point3;
    }),
  ),
  seam: line([BODY.x + BODY.w, BODY.y + BOSS_R, TOP - 1.2], [BODY.x + BODY.w, BODY.y + BODY.d - BOSS_R, TOP - 1.2]),
};

/* --------------------------------------------------------------- screws */

// Shut, each sits down its boss with its head in the cover's counterbore, out of sight.
export const SCREW_ART = BOSSES.map(([x, y]) => ({
  shank: post(x, y, 1.2, TOP - 4, 6.6, 12),
  head: post(x, y, 2.4, TOP + 2.6, 1.4, 16),
  slot: line([x - 1.7, y, TOP + 4], [x + 1.7, y, TOP + 4]),
}));

/* ------------------------------------------------------------------ lid */

const LID_Z = TOP;
const LID_TOP = LID_Z + LID_H;
const BUTTON: [number, number] = [14, 0];

export const LID_ART = {
  plate: slab(BODY, LID_Z, LID_H, 8, 0.9),
  groove: planOutline(insetPlan(BODY, 4), LID_TOP, P, 8),
  holes: join(BOSSES.map(([x, y]) => ring(x, y, 2.4, LID_TOP, P, 16))),
  screws: dots(BOSSES.map(([x, y]) => [x, y, LID_TOP] as Point3)),
  collar: post(BUTTON[0], BUTTON[1], 13, LID_TOP, 1.4, 40),
  cap: post(BUTTON[0], BUTTON[1], 10.4, LID_TOP + 1.4, 4.6, 40),
  capRim: ring(BUTTON[0], BUTTON[1], 7.6, LID_TOP + 6, P, 36),
  ledRim: post(-32, -18, 2.6, LID_TOP, 0.8, 16),
  led: dots([[-32, -18, LID_TOP + 0.8]]),
  grip: join([-40, -36.5, -33].map((x) => line([x, 4, LID_TOP], [x, 20, LID_TOP]))),
};

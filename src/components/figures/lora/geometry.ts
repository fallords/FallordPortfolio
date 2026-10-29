import {
  corners,
  cylinder,
  depthOf,
  haloOf,
  insetPlan,
  knurl,
  lineOnTop,
  onTop,
  pathOf,
  planOutline,
  pointsAt,
  radialTicks,
  ring,
  segment,
  sideArc,
  sideRing,
  sideSeam,
  slabOf,
  topTicks,
  type Flat,
  type Plan,
  type Point3,
  type SolidPaths,
} from "../../iso/iso-kit";
import * as G from "../../iso/lathe.mjs";
import {
  ADAPTER,
  ANTENNA,
  BASE,
  BASE_H,
  BELT,
  BOARD_Z,
  BRIDGE,
  BRIDGE_TOP,
  BUTTON_AT,
  BUTTON_R,
  BUZZER,
  BUZZER_R,
  BUZZER_TOP,
  COVER,
  DEVKIT,
  DIAL,
  DIAL_R,
  DIAL_TOP,
  FOOT_H,
  LATCH,
  LED_AT,
  P,
  PAD_PLAN,
  PAD_TOP,
  PCB,
  PHONE,
  PHONE_FRONT,
  PHONE_H,
  PHONE_Z,
  REST,
  RFM,
  ROD_R,
  ROD_TOP,
  ROD_XS,
  ROD_Y,
  RX_ANTENNA,
  RX_ANTENNA_TOP,
  SLED,
  SMA_AT,
  STAND,
  STAND_FOOT,
  STAND_FOOT_H,
  TRAY,
  TRAY_FLOOR,
  TRAY_TOP,
  WALL,
  WEAR,
  WEAR_FRONT,
  WEAR_H,
  WEAR_UP,
  at,
} from "./view";
import { DIAL_FROM, DIAL_SPAN, angleOf, onDial } from "./frame";
import { THRESHOLD } from "./model";

const slab = (plan: Plan, z: number, h: number, steps = 4, bevel = 0) => slabOf(plan, z, h, P, steps, bevel);
const post = (x: number, y: number, r: number, z: number, h: number, steps = 24, bevel = 0) => cylinder(x, y, r, z, h, P, steps, bevel);
const line = (a: Point3, b: Point3) => segment(a, b, P);
const join = (paths: string[]) => paths.join("");
const dots = (points: Point3[]) => pointsAt(points, P);
const nearFirst = <T>(items: T[], centre: (item: T) => Point3) => [...items].sort((a, b) => depthOf(centre(a), P) - depthOf(centre(b), P));

/** A rounded rectangle drawn on a vertical face: the y = const plane (x across) or the x = const plane (y across). */
function faceRect(face: "y" | "x", plane: number, a0: number, a1: number, z0: number, z1: number, r = 1) {
  const points: Flat[] = [];
  const arc = (ca: number, cz: number, from: number) => {
    for (let step = 0; step <= 4; step++) {
      const angle = from + (step / 4) * (Math.PI / 2);
      const a = ca + r * Math.cos(angle);
      const z = cz + r * Math.sin(angle);
      points.push(at(face === "y" ? [a, plane, z] : [plane, a, z]));
    }
  };
  arc(a1 - r, z1 - r, 0);
  arc(a0 + r, z1 - r, Math.PI / 2);
  arc(a0 + r, z0 + r, Math.PI);
  arc(a1 - r, z0 + r, Math.PI * 1.5);
  return pathOf(points, true);
}

/* ---------------------------------------------------------------- bench */

const FEET = nearFirst(corners(BASE, 20), ([x, y]) => [x, y, 0]);
const STRIP: Plan = { x: -142, y: BASE.y + BASE.d - 13, w: 112, d: 7, r: 1 };
const LABEL: Plan = { x: 62, y: 44, w: 34, d: 12, r: 2 };

export const BENCH = {
  halo: haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P),
  feet: FEET.map(([x, y]) => [post(x, y, 7, -BASE_H - FOOT_H, 1.6, 28), post(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, 28)]),
  slab: slab(BASE, -BASE_H, BASE_H, 9, 1.6),
  top: planOutline(BASE, 0, P, 9),
  groove: planOutline(insetPlan(BASE, 5), 0, P),
  screwRings: join(corners(BASE, 10).map(([x, y]) => ring(x, y, 2.2, 0, P, 16))),
  screws: dots(corners(BASE, 10).map(([x, y]) => [x, y, 0])),
  strip: slab(STRIP, 0, 0.6, 3),
  ticks: topTicks(STRIP.x + 4, STRIP.x + STRIP.w - 4, 4, 5, STRIP.y + 0.8, 0.6, [2, 3.6], P),
  label: slab(LABEL, 0, 0.8, 4),
  labelLine: planOutline(insetPlan(LABEL, 1.6), 0.8, P),
  labelRule: join([0, 1, 2].map((row) => onTop([[LABEL.x + 7, LABEL.y + 3.4 + row * 2.2], [LABEL.x + (row === 1 ? 20 : 27), LABEL.y + 3.4 + row * 2.2]], 0.8, P))),
  labelScrews: dots([
    [LABEL.x + 3.2, LABEL.y + LABEL.d / 2, 0.8],
    [LABEL.x + LABEL.w - 3.2, LABEL.y + LABEL.d / 2, 0.8],
  ]),
};

/* ---------------------------------------------------------- drop stand */

const RODS = nearFirst([...ROD_XS], (x) => [x, ROD_Y, 60]);

export const STAND_ART = {
  foot: slab(STAND_FOOT, 0, STAND_FOOT_H, 4, 0.8),
  footScrews: dots(corners(STAND_FOOT, 4).map(([x, y]) => [x, y, STAND_FOOT_H])),
  footRings: join(corners(STAND_FOOT, 4).map(([x, y]) => ring(x, y, 1.6, STAND_FOOT_H, P, 14))),
  pad: slab(PAD_PLAN, STAND_FOOT_H, PAD_TOP - STAND_FOOT_H, 6),
  padLine: planOutline(insetPlan(PAD_PLAN, 2), PAD_TOP, P),
  collars: RODS.map((x) => post(x, ROD_Y, 3.6, STAND_FOOT_H, 4, 24, 0.4)),
  rods: RODS.map((x) => post(x, ROD_Y, ROD_R, STAND_FOOT_H + 4, ROD_TOP - STAND_FOOT_H - 4, 18)),
  bridge: slab(BRIDGE, ROD_TOP, BRIDGE_TOP - ROD_TOP, 4, 0.8),
  bridgeSeam: sideSeam(BRIDGE, ROD_TOP + 3, P, 4),
  bridgeScrews: dots(ROD_XS.map((x) => [x, ROD_Y, BRIDGE_TOP])),
  bridgeRings: join(ROD_XS.map((x) => ring(x, ROD_Y, 2, BRIDGE_TOP, P, 14))),
  latchBase: post(LATCH[0], LATCH[1], 5.6, BRIDGE_TOP, 2.4, 28),
  knob: post(LATCH[0], LATCH[1], 4.6, BRIDGE_TOP + 2.4, 5, 28, 0.4),
  knobKnurl: knurl(LATCH[0], LATCH[1], 4.6, BRIDGE_TOP + 2.4, BRIDGE_TOP + 7.4, 30, P, 0.3),
  knobPointer: lineOnTop([LATCH[0] - 2.4, LATCH[1]], [LATCH[0] + 3.6, LATCH[1]], BRIDGE_TOP + 7.4, P),
};

/* The sled, its bushings, the belt and the wearable: built at the top, moved down by the drop. */
const SLED_Z = WEAR_UP + 2;
const SLED_H = 34;
const BUSHES = ROD_XS.flatMap((x) => [SLED_Z, SLED_Z + SLED_H - 8].map((z) => ({ x, z })));
const BUTTON_FRAME = G.frameAlong(BUTTON_AT, [0, 1, 0]);
const LED_FRAME = G.frameAlong(LED_AT, [0, 1, 0]);
const TOP = WEAR_UP + WEAR_H;
const FRONT_SCREWS: Point3[] = [
  [WEAR.x + 2.6, WEAR_FRONT, WEAR_UP + 2.6],
  [WEAR.x + WEAR.w - 2.6, WEAR_FRONT, WEAR_UP + 2.6],
  [WEAR.x + 2.6, WEAR_FRONT, TOP - 2.6],
  [WEAR.x + WEAR.w - 2.6, WEAR_FRONT, TOP - 2.6],
];
const SIDE = WEAR.x + WEAR.w;
const BELT_FACE = BELT.y + BELT.d;
const BELT_HOLES: Point3[] = [-128, -125.5, -99.5, -97].map((x) => [x, BELT_FACE, WEAR_UP + 19]);

export const SLED_ART = {
  bushesBack: BUSHES.filter(({ x }) => x === ROD_XS[0]).map(({ x, z }) => post(x, ROD_Y, 4, z, 8, 24, 0.4)),
  bushesFront: BUSHES.filter(({ x }) => x === ROD_XS[1]).map(({ x, z }) => post(x, ROD_Y, 4, z, 8, 24, 0.4)),
  // The seams go with their own bushings: the back ones must not be drawn over the wearable.
  seamsBack: join(BUSHES.filter(({ x }) => x === ROD_XS[0]).map(({ x, z }) => sideArc(x, ROD_Y, 4, z + 4, P, 18))),
  seamsFront: join(BUSHES.filter(({ x }) => x === ROD_XS[1]).map(({ x, z }) => sideArc(x, ROD_Y, 4, z + 4, P, 18))),
  plate: slab(SLED, SLED_Z, SLED_H, 3, 0.5),
  plateScrews: dots([
    [SLED.x + 3, SLED.y + SLED.d, SLED_Z + 4],
    [SLED.x + SLED.w - 3, SLED.y + SLED.d, SLED_Z + 4],
    [SLED.x + 3, SLED.y + SLED.d, SLED_Z + SLED_H - 4],
    [SLED.x + SLED.w - 3, SLED.y + SLED.d, SLED_Z + SLED_H - 4],
  ]),
  belt: slab(BELT, WEAR_UP + 14, 10, 3),
  beltStitch: join([WEAR_UP + 15.4, WEAR_UP + 22.6].map((z) => line([BELT.x, BELT_FACE, z], [BELT.x + BELT.w, BELT_FACE, z]))),
  beltHoles: dots(BELT_HOLES),
  body: slab(WEAR, WEAR_UP, WEAR_H, 6, 1),
  bodySeam: sideSeam(WEAR, TOP - 7, P, 6),
  bezel: faceRect("y", WEAR_FRONT, WEAR.x + 3, WEAR.x + WEAR.w - 3, WEAR_UP + 6, WEAR_UP + 28, 2),
  frontScrews: dots(FRONT_SCREWS),
  collar: G.disc(0, 0.8, BUTTON_R + 1.4, BUTTON_FRAME, P) as SolidPaths,
  button: G.disc(0.8, 3.2, BUTTON_R, BUTTON_FRAME, P) as SolidPaths,
  buttonFace: G.circleOf(BUTTON_FRAME, 3.2, BUTTON_R - 1.2, P) as string,
  ledRim: G.disc(0, 0.7, 1.6, LED_FRAME, P) as SolidPaths,
  led: pointsAt([[LED_AT[0], WEAR_FRONT + 0.8, LED_AT[2]]], P),
  switchPlate: slab({ x: SIDE, y: -3.4, w: 1.4, d: 6, r: 0.6 }, WEAR_UP + 24, 6, 3),
  switchNub: slab({ x: SIDE + 1.4, y: -2.2, w: 1.4, d: 2.2, r: 0.4 }, WEAR_UP + 25.6, 2.8, 3),
  port: faceRect("x", SIDE, -4, 2, WEAR_UP + 4, WEAR_UP + 7.4, 1.2),
  plug: slab({ x: SIDE, y: -3.4, w: 3.2, d: 4.8, r: 0.8 }, WEAR_UP + 4.3, 2.8, 3),
  antennaCollar: post(ANTENNA[0], ANTENNA[1], 2.6, TOP, 3, 20, 0.3),
  antenna: post(ANTENNA[0], ANTENNA[1], 1.5, TOP + 3, 11, 14),
  antennaTip: post(ANTENNA[0], ANTENNA[1], 1.9, TOP + 14, 1.6, 14, 0.3),
};

/* ------------------------------------------------------------- the meter */

/* The cable socket sticks out of the meter's front, where the camera sees the plug go in. */
const LUG: Plan = { x: DIAL[0] - 3, y: DIAL[1] + DIAL_R - 1, w: 6, d: 5.4, r: 1 };

export const DIAL_ART = {
  lug: slab(LUG, 2, 5, 3, 0.3),
  plug: G.disc(0, 3, 1.7, G.frameAlong([DIAL[0], LUG.y + LUG.d, 4.6], [0, 1, 0]), P) as SolidPaths,
  puck: post(DIAL[0], DIAL[1], DIAL_R, 0, DIAL_TOP, 64, 0.8),
  knurl: knurl(DIAL[0], DIAL[1], DIAL_R, DIAL_TOP - 3.4, DIAL_TOP, 84, P, 0.3),
  band: sideArc(DIAL[0], DIAL[1], DIAL_R, DIAL_TOP - 3.4, P, 40),
  bezel: ring(DIAL[0], DIAL[1], DIAL_R - 2.2, DIAL_TOP, P, 64),
  ticks: radialTicks(DIAL[0], DIAL[1], DIAL_R - 3, 14, 2, DIAL_TOP, [1.3, 2.8], P, DIAL_FROM, DIAL_SPAN),
  limit: lineOnTop(onDial(angleOf(THRESHOLD), DIAL_R - 2.4), onDial(angleOf(THRESHOLD), DIAL_R - 7.4), DIAL_TOP, P),
  hub: ring(DIAL[0], DIAL[1], 1.6, DIAL_TOP, P, 16),
};


/* -------------------------------------------------------------- receiver */

const XR = TRAY.x + TRAY.w;
const YF = TRAY.y + TRAY.d;
const WALLS = {
  back: { x: TRAY.x, y: TRAY.y, w: TRAY.w, d: WALL, r: 1 },
  left: { x: TRAY.x, y: TRAY.y, w: WALL, d: TRAY.d, r: 1 },
  right: { x: XR - WALL, y: TRAY.y, w: WALL, d: TRAY.d, r: 1 },
  front: { x: TRAY.x, y: YF - WALL, w: TRAY.w, d: WALL, r: 1 },
} satisfies Record<string, Plan>;
const BOSSES = corners(insetPlan(TRAY, WALL + 2.4), 0);
const DEV_TOP = BOARD_Z + PCB;
const PIN = 2.4;
const HEADER_BACK: Plan = { x: DEVKIT.x + 3, y: DEVKIT.y + 0.6, w: 25, d: 2, r: 0.3 };
const HEADER_FRONT: Plan = { x: DEVKIT.x + 3, y: DEVKIT.y + DEVKIT.d - 2.6, w: 25, d: 2, r: 0.3 };
const HEADER_TOP = DEV_TOP + 2;
const pinsOf = (header: Plan): Point3[] => Array.from({ length: 10 }, (_, i) => [header.x + 1.3 + i * PIN, header.y + header.d / 2, HEADER_TOP]);
const PINS_BACK = pinsOf(HEADER_BACK);
const PINS_FRONT = pinsOf(HEADER_FRONT);
const CAN: Plan = { x: DEVKIT.x + 14, y: DEVKIT.y + 3.6, w: 14, d: 8, r: 0.4 };
const RFM_TOP = BOARD_Z + 1.2;
const RFM_CAN: Plan = { x: RFM.x + 2.5, y: RFM.y + 2.5, w: 10, d: 10, r: 0.3 };
const PADS: Point3[] = Array.from({ length: 6 }, (_, j) => [RFM.x + 0.7, RFM.y + 2.2 + j * 2.1, RFM_TOP]);
const UFL: Point3 = [RFM.x + RFM.w - 1.6, RFM.y + 2, RFM_TOP + 1];
const SMA_FRAME = G.frameAlong(SMA_AT, [1, 0, 0]);
const KNUCKLE: Point3 = [RX_ANTENNA[0], RX_ANTENNA[1], SMA_AT[2]];

/** A jumper wire: up from its pin, over in an arc, down onto its pad. */
function jumper(from: Point3, to: Point3, lift: number): string {
  const points: Flat[] = [];
  for (let step = 0; step <= 16; step++) {
    const t = step / 16;
    const x = from[0] + (to[0] - from[0]) * t;
    const y = from[1] + (to[1] - from[1]) * t;
    const z = from[2] + (to[2] - from[2]) * t + Math.sin(t * Math.PI) * lift;
    points.push(at([x, y, z]));
  }
  return pathOf(points);
}

// SCK, MISO, MOSI, NSS, RST, DIO0 from the DevKit's back header to the module's left pads (thesis Table 2).
const SPI = [5, 6, 7, 8, 9, 4].map((pin, j) => ({ from: PINS_BACK[pin], to: PADS[j], lift: 5.5 + j * 0.7 }));
const BUZZER_LEADS = [0, 1].map((i) => ({
  from: [BUZZER[0] - 1.6 + i * 3.2, BUZZER[1] - BUZZER_R + 0.6, TRAY_FLOOR + 1.4] as Point3,
  to: PINS_FRONT[i + 1],
  lift: 4 + i,
}));

export const RECEIVER_ART = {
  halo: haloOf(TRAY, 0, TRAY_TOP, P),
  floor: slab(TRAY, 0, TRAY_FLOOR, 5, 0.4),
  back: slab(WALLS.back, TRAY_FLOOR, TRAY_TOP - TRAY_FLOOR, 3, 0.3),
  left: slab(WALLS.left, TRAY_FLOOR, TRAY_TOP - TRAY_FLOOR, 3, 0.3),
  right: slab(WALLS.right, TRAY_FLOOR, TRAY_TOP - TRAY_FLOOR, 3, 0.3),
  front: slab(WALLS.front, TRAY_FLOOR, TRAY_TOP - TRAY_FLOOR, 3, 0.3),
  floorLine: planOutline(insetPlan(TRAY, WALL), TRAY_FLOOR, P, 3),
  bosses: nearFirst(BOSSES, ([x, y]) => [x, y, 0]).map(([x, y]) => post(x, y, 2.4, TRAY_FLOOR, TRAY_TOP - TRAY_FLOOR - 1, 18)),
  bossHoles: join(BOSSES.map(([x, y]) => ring(x, y, 0.9, TRAY_TOP - 1, P, 12))),
  devkit: slab(DEVKIT, BOARD_Z, PCB, 2),
  standoffs: corners(DEVKIT, 1.6).map(([x, y]) => post(x, y, 1, TRAY_FLOOR, BOARD_Z - TRAY_FLOOR, 12)),
  headers: [slab(HEADER_BACK, DEV_TOP, 2, 2), slab(HEADER_FRONT, DEV_TOP, 2, 2)],
  pins: dots([...PINS_BACK, ...PINS_FRONT]),
  can: slab(CAN, DEV_TOP, 1.6, 2, 0.3),
  canLine: planOutline(insetPlan(CAN, 1), DEV_TOP + 1.6, P, 2),
  trace: join([0, 1, 2].map((i) => onTop([[CAN.x - 3, CAN.y + 1.6 + i * 2.4], [CAN.x - 0.8, CAN.y + 1.6 + i * 2.4]], DEV_TOP, P))),
  usb: slab({ x: DEVKIT.x - 1.4, y: DEVKIT.y + 5, w: 4.4, d: 5, r: 0.6 }, DEV_TOP, 2, 3),
  keys: [0, 1].map((i) => slab({ x: DEVKIT.x + 4 + i * 5, y: DEVKIT.y + 5.6, w: 2.4, d: 2.4, r: 0.4 }, DEV_TOP, 1, 2)),
  rfm: slab(RFM, BOARD_Z, 1.2, 2),
  rfmCan: slab(RFM_CAN, RFM_TOP, 1.8, 2, 0.3),
  rfmPads: dots([
    ...PADS,
    ...Array.from({ length: 6 }, (_, j) => [RFM.x + RFM.w - 0.7, RFM.y + 2.2 + j * 2.1, RFM_TOP] as Point3),
  ]),
  ufl: post(UFL[0], UFL[1], 0.9, RFM_TOP, 1, 10),
  pigtail: jumper([UFL[0], UFL[1], UFL[2]], [XR - WALL, SMA_AT[1], SMA_AT[2]], 2),
  jumpers: SPI.map(({ from, to, lift }) => jumper(from, to, lift)),
  leads: BUZZER_LEADS.map(({ from, to, lift }) => jumper(from, to, lift)),
  buzzer: post(BUZZER[0], BUZZER[1], BUZZER_R, TRAY_FLOOR, BUZZER_TOP - TRAY_FLOOR, 40, 0.6),
  buzzerSeam: sideArc(BUZZER[0], BUZZER[1], BUZZER_R, TRAY_FLOOR + 2.2, P, 28),
  buzzerRing: ring(BUZZER[0], BUZZER[1], BUZZER_R - 1.8, BUZZER_TOP, P, 36),
  buzzerHole: ring(BUZZER[0], BUZZER[1], 1.1, BUZZER_TOP, P, 16),
  smaNut: G.disc(0, 2, 3.2, SMA_FRAME, P) as SolidPaths,
  smaBody: G.disc(2, 4.6, 2.2, SMA_FRAME, P) as SolidPaths,
  knuckle: G.sphereOf(KNUCKLE, 2.6, P) as SolidPaths,
  sleeve: post(RX_ANTENNA[0], RX_ANTENNA[1], 3, KNUCKLE[2] + 2.2, 10, 24, 0.3),
  whip: post(RX_ANTENNA[0], RX_ANTENNA[1], 2.4, KNUCKLE[2] + 12.2, RX_ANTENNA_TOP - KNUCKLE[2] - 12.2, 20),
  whipRings: join(Array.from({ length: 7 }, (_, i) => sideArc(RX_ANTENNA[0], RX_ANTENNA[1], 2.4, KNUCKLE[2] + 18 + i * 7, P, 16))),
  whipTip: post(RX_ANTENNA[0], RX_ANTENNA[1], 2, RX_ANTENNA_TOP, 1.6, 16, 0.3),
  ledRing: sideRing([TRAY.x + 10, YF, 6.5], 1.5, "y", P, 16),
  led: pointsAt([[TRAY.x + 10, YF + 0.2, 6.5]], P),
  rfmLed: pointsAt([[RFM.x + 3, RFM.y + RFM.d - 1.6, RFM_TOP]], P),
};

/* The power: a 5 V adapter behind the receiver, its cable round to the back wall's USB-C port. */
const CABLE: Point3[] = [
  [ADAPTER.x, ADAPTER.y + 9, 3],
  [ADAPTER.x - 8, ADAPTER.y + 10, 1.2],
  [64, -51, 0.8],
  [44, -50.4, 0.8],
  [38, TRAY.y - 2, 3],
  [36, TRAY.y, 6],
];
export const POWER_ART = {
  adapter: slab(ADAPTER, 0, 14, 5, 0.8),
  adapterSeam: sideSeam(ADAPTER, 4, P, 5),
  adapterPlate: planOutline(insetPlan(ADAPTER, 3), 14, P, 4),
  adapterVents: join([0, 1, 2].map((i) => planOutline({ x: ADAPTER.x + 6, y: ADAPTER.y + 4 + i * 3, w: 12, d: 1.2, r: 0.6 }, 14, P, 3))),
  cable: (() => {
    const points: Flat[] = [];
    for (let i = 0; i < CABLE.length - 1; i++) {
      for (let step = 0; step < 8; step++) {
        const t = step / 8;
        const a = CABLE[i];
        const b = CABLE[i + 1];
        points.push(at([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]));
      }
    }
    points.push(at(CABLE[CABLE.length - 1]));
    return pathOf(points);
  })(),
};

/* The cover, set aside face down: its inside up, with the buzzer's sound holes and the LED window. */
const COVER_TOP = 2;
const COVER_RIM = 5;
const CX = COVER.x + COVER.w;
const CY = COVER.y + COVER.d;
export const COVER_ART = {
  plate: slab(COVER, 0, COVER_TOP, 5, 0.4),
  back: slab({ x: COVER.x, y: COVER.y, w: COVER.w, d: WALL, r: 1 }, COVER_TOP, COVER_RIM - COVER_TOP, 3, 0.3),
  left: slab({ x: COVER.x, y: COVER.y, w: WALL, d: COVER.d, r: 1 }, COVER_TOP, COVER_RIM - COVER_TOP, 3, 0.3),
  right: slab({ x: CX - WALL, y: COVER.y, w: WALL, d: COVER.d, r: 1 }, COVER_TOP, COVER_RIM - COVER_TOP, 3, 0.3),
  front: slab({ x: COVER.x, y: CY - WALL, w: COVER.w, d: WALL, r: 1 }, COVER_TOP, COVER_RIM - COVER_TOP, 3, 0.3),
  floorLine: planOutline(insetPlan(COVER, WALL), COVER_TOP, P, 3),
  posts: nearFirst(corners(insetPlan(COVER, WALL + 2.4), 0), ([x, y]) => [x, y, 0]).map(([x, y]) => post(x, y, 2.4, COVER_TOP, COVER_RIM - COVER_TOP, 18)),
  postHoles: join(corners(insetPlan(COVER, WALL + 2.4), 0).map(([x, y]) => ring(x, y, 0.9, COVER_RIM, P, 12))),
  holes: (() => {
    const out: Point3[] = [];
    const cx = COVER.x + 40;
    const cy = COVER.y + 22;
    for (let row = -2; row <= 2; row++) for (let col = -2; col <= 2; col++) if (row * row + col * col <= 5) out.push([cx + col * 2.6, cy + row * 2.6, COVER_TOP]);
    return dots(out);
  })(),
  window: ring(COVER.x + 12, COVER.y + 10, 1.6, COVER_TOP, P, 16),
};

/* ----------------------------------------------------------------- phone */

const LIP: Plan = { x: REST.x, y: PHONE_FRONT, w: REST.w, d: 2.4, r: 0.8 };
export const PHONE_ART = {
  halo: haloOf(STAND, 0, 4, P),
  stand: slab(STAND, 0, 4, 5, 0.8),
  standLine: planOutline(insetPlan(STAND, 2.2), 4, P, 4),
  rest: slab(REST, 4, 52, 3, 0.4),
  lip: slab(LIP, 4, 5, 3, 0.3),
  body: slab(PHONE, PHONE_Z, PHONE_H, 6, 0.8),
  keys: [0, 1].map((i) => slab({ x: PHONE.x + PHONE.w, y: PHONE.y + 0.8, w: 0.8, d: 1.8, r: 0.3 }, PHONE_Z + 36 - i * 8, 5, 2)),
  window: faceRect("y", PHONE_FRONT, PHONE.x + 2, PHONE.x + PHONE.w - 2, PHONE_Z + 4, PHONE_Z + PHONE_H - 5, 2),
  speaker: faceRect("y", PHONE_FRONT, PHONE.x + 11, PHONE.x + 17, PHONE_Z + PHONE_H - 3, PHONE_Z + PHONE_H - 2.2, 0.4),
  camera: pointsAt([[PHONE.x + 20, PHONE_FRONT, PHONE_Z + PHONE_H - 2.6]], P),
};

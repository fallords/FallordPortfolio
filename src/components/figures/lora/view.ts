import { iso, type Flat, type Plan, type Point3, type Projection } from "../../iso/iso-kit";

/*
 * World layout of the bench, in units of about one screen pixel at fit.
 * x runs left to right across the bench, y from the back to the front
 * (the front faces the viewer), z up. Everything below is one bench:
 *   left    a drop stand: the wearable clipped to a belt on a sled that
 *           falls along two rods onto a rubber pad, with a meter that
 *           reads the magnitude through the wearable's USB port
 *   middle  the receiver with its cover off, and the cover set aside
 *   right   the phone the staff read the dashboard on
 */
export const WIDTH = 600;
export const HEIGHT = 390;
const PAD = 22;
export const AZIMUTH = 50;

export const BASE: Plan = { x: -160, y: -66, w: 320, d: 132, r: 9 };
export const BASE_H = 9;
export const FOOT_H = 5;

/* The drop stand. The sled and everything on it is built at the top and moved down by `drop`. */
export const STAND_FOOT: Plan = { x: -140, y: -34, w: 56, d: 44, r: 3 };
export const STAND_FOOT_H = 7;
export const PAD_PLAN: Plan = { x: -126, y: -18, w: 28, d: 16, r: 4 };
export const PAD_TOP = STAND_FOOT_H + 3;
export const ROD_Y = -10;
export const ROD_XS = [-134, -90] as const;
export const ROD_R = 2.2;
export const ROD_TOP = 124;
export const BRIDGE: Plan = { x: -140, y: -16, w: 56, d: 12, r: 2.5 };
export const BRIDGE_TOP = ROD_TOP + 8;
export const LATCH: Flat = [-112, -10];

/* Wearable: a small walkie-talkie-shaped case, front (+y) at y = 6. */
export const WEAR: Plan = { x: -122, y: -6, w: 20, d: 12, r: 3 };
export const WEAR_FRONT = WEAR.y + WEAR.d;
export const WEAR_UP = 66;
export const WEAR_H = 38;
export const DROP = WEAR_UP - PAD_TOP;
export const SLED: Plan = { x: -131, y: -13, w: 38, d: 5, r: 1.2 };
export const BELT: Plan = { x: -131, y: -8.6, w: 38, d: 2.6, r: 0.8 };
export const BUTTON_AT: Point3 = [-112, WEAR_FRONT, WEAR_UP + 17];
export const BUTTON_R = 5;
export const LED_AT: Point3 = [-118, WEAR_FRONT, WEAR_UP + 30];
export const ANTENNA: Flat = [-117, 0];
export const PORT_AT: Point3 = [WEAR.x + WEAR.w, -1, WEAR_UP + 6];

/* The meter on the bench, face up, wired to the wearable's USB port. */
export const DIAL: Flat = [-62, 26];
export const DIAL_R = 15;
export const DIAL_TOP = 9;
export const DIAL_MAX = 70;

/* The receiver: the bottom half of its case, the cover set aside in front. */
export const TRAY: Plan = { x: 20, y: -46, w: 64, d: 44, r: 4 };
export const TRAY_FLOOR = 2;
export const TRAY_TOP = 11;
export const WALL = 2.4;
export const DEVKIT: Plan = { x: 26, y: -38, w: 30, d: 15, r: 0.8 };
export const BOARD_Z = 4;
export const PCB = 1.6;
export const RFM: Plan = { x: 62, y: -37, w: 15, d: 15, r: 0.6 };
export const BUZZER: Flat = [44, -14];
export const BUZZER_R = 6.5;
export const BUZZER_TOP = 13;
export const SMA_AT: Point3 = [TRAY.x + TRAY.w, -27, 7];
export const RX_ANTENNA: Flat = [90.5, -27];
export const RX_ANTENNA_TOP = 76;
export const COVER: Plan = { x: -12, y: 12, w: 64, d: 44, r: 4 };
export const ADAPTER: Plan = { x: 98, y: -60, w: 24, d: 16, r: 3 };

/* The phone on a stand, screen facing the viewer. */
export const STAND: Plan = { x: 104, y: 6, w: 40, d: 28, r: 4 };
export const REST: Plan = { x: 108, y: 10, w: 32, d: 3.6, r: 1.2 };
export const PHONE: Plan = { x: 110, y: 13.6, w: 28, d: 3.4, r: 2.6 };
export const PHONE_Z = 6;
export const PHONE_H = 56;
export const PHONE_FRONT = PHONE.y + PHONE.d;

/* Where the radio rings start: under the wearable's antenna, on the bench top. */
export const RADIO_FROM: Flat = [ANTENNA[0], ANTENNA[1]];
export const RADIO_REACH = 230;

function fit(points: Point3[]): Projection {
  const unit: Projection = { origin: [0, 0], scale: 1, azimuth: AZIMUTH };
  const flat = points.map((point) => iso(point, unit));
  const xs = flat.map(([x]) => x);
  const ys = flat.map(([, y]) => y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const up = Math.min(...ys);
  const down = Math.max(...ys);
  const scale = Math.min((WIDTH - PAD * 2) / (right - left), (HEIGHT - PAD * 2) / (down - up));
  return { origin: [WIDTH / 2 - ((left + right) / 2) * scale, HEIGHT / 2 - ((up + down) / 2) * scale], scale, azimuth: AZIMUTH };
}

const corners = ({ x, y, w, d }: Plan, z0: number, z1: number): Point3[] => {
  const out: Point3[] = [];
  for (const px of [x, x + w]) for (const py of [y, y + d]) for (const z of [z0, z1]) out.push([px, py, z]);
  return out;
};

export const P = fit([
  ...corners(BASE, -BASE_H - FOOT_H, 0),
  ...corners(BRIDGE, ROD_TOP, BRIDGE_TOP + 6),
  [RX_ANTENNA[0], RX_ANTENNA[1], RX_ANTENNA_TOP + 2],
  ...corners(ADAPTER, 0, 14),
]);

export const at = (point: Point3) => iso(point, P);

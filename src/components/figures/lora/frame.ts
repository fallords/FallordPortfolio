import { lineOnTop, pathOf, planOutline, ring, sideMatrix, type Flat, type Plane, type Point3 } from "../../iso/iso-kit";
import { BASE, BOARD_Z, DIAL, DIAL_MAX, DIAL_R, DIAL_TOP, P, PHONE, PHONE_FRONT, PHONE_H, PHONE_Z, PORT_AT, RADIO_FROM, RFM, WEAR, at } from "./view";

/*
 * What the live component redraws each frame. Kept apart from geometry.ts
 * so only this, the view and the kit core ship to the browser.
 */

/* The meter: 0 at −135°, the top of the scale (70 m/s²) at +135°, seen from above. */
export const DIAL_FROM = -Math.PI * 0.75;
export const DIAL_SPAN = Math.PI * 1.5;
export const angleOf = (value: number) => DIAL_FROM + (Math.max(0, Math.min(DIAL_MAX, value)) / DIAL_MAX) * DIAL_SPAN;
export const onDial = (angle: number, r: number): Plane => [DIAL[0] + Math.sin(angle) * r, DIAL[1] - Math.cos(angle) * r];
export const needleOf = (value: number, reach = DIAL_R - 4.2) => lineOnTop(onDial(angleOf(value) + Math.PI, 3), onDial(angleOf(value), reach), DIAL_TOP + 0.2, P);

/* The meter's cable, from the plug in the wearable's USB port to the lug on the meter. */
export const CABLE_FROM: Point3 = [WEAR.x + WEAR.w + 3.2, PORT_AT[1] - 1, PORT_AT[2] - 0.2];
export const CABLE_TO: Point3 = [DIAL[0], DIAL[1] + DIAL_R + 7.4, 4.6]; // the end of the plug in the socket

/** Catmull-Rom through the control points, so the cable hangs in one smooth curve. */
function curve(points: Point3[], per = 10): Flat[] {
  const out: Flat[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let step = 0; step < per; step++) {
      const t = step / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const point = [0, 1, 2].map(
        (axis) =>
          0.5 *
          (2 * p1[axis] +
            (-p0[axis] + p2[axis]) * t +
            (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t2 +
            (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t3),
      ) as Point3;
      out.push(at(point));
    }
  }
  out.push(at(points[points.length - 1]));
  return out;
}

/** The cable with the wearable `down` units below the top: it leaves the plug sideways, clears the stand's foot, lies on the bench round the meter's left, and goes into the socket on its front. */
export function cableOf(down: number) {
  const [x, y, z] = CABLE_FROM;
  const start: Point3 = [x, y, z - down];
  const slack = Math.max(0, 36 - down * 0.5);
  return pathOf(
    curve([
      start,
      [x + 5, y, start[2] - 3],
      [-80, 7, 9 + slack * 0.25],
      [-84, 22, 1.2],
      [-80, 40, 1.2],
      [-70, 49, 1.4],
      [CABLE_TO[0], CABLE_TO[1] + 3, CABLE_TO[2] - 0.4],
      CABLE_TO,
    ]),
  );
}

/* The radio rings spread over the bench top, clipped to it. */
export const BENCH_TOP = planOutline(BASE, 0, P, 9);
export const ringOf = (radius: number) => ring(RADIO_FROM[0], RADIO_FROM[1], Math.max(0.5, radius), 0.15, P, 96);

/* The phone's screen, drawn flat: local x across the phone (0 to 28), y down from its top edge. */
export const SCREEN_MATRIX = sideMatrix([PHONE.x, PHONE_FRONT], PHONE_Z + PHONE_H, P, "left");
export const SCREEN = { x: 2, y: 5, w: PHONE.w - 4, h: PHONE_H - 9 };

/** The RFM95W module's LED, which flashes as a packet comes in. */
export const RX_LED = at([RFM.x + 3, RFM.y + RFM.d - 1.6, BOARD_Z + 1.2]);

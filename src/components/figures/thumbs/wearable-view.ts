import { fitProjection, type Plan, type Point3 } from "../../iso/iso-kit";

/*
 * The wearable from the thesis on its own, taken apart: the case is the
 * size of a small walkie-talkie, clipped to the belt at the back, with the
 * big red emergency button and the power LED on the front, a stub antenna
 * at the top and the USB charging port at the bottom. Inside: an ESP32-C3,
 * the MPU6050, an RFM95W at 922 MHz, a 3.7 V LiPo and its TP4056 charger.
 * Sizes are close to the real parts in millimetres, not measured.
 *
 * It lies on its back on a cutting mat, top end (the antenna) to the left.
 * Taken apart, the shell lifts off its clip, the four screws rise out of
 * their bosses, and the front cover hops off and lands face up on the mat
 * beside it, so the boards inside are in plain view (a cover lifted
 * straight up would hide them from a camera above).
 */
export const WIDTH = 240;
export const HEIGHT = 180;

export const MAT: Plan = { x: -72, y: -46, w: 250, d: 92, r: 3 };
export const MAT_H = 2;

/* The belt clip, lying on the mat under the shell. */
export const CLIP_TOP = 5.2;

/* The case: 100 × 60, 18 deep, corners round at 6 where the screw bosses sit. */
export const BODY: Plan = { x: -50, y: -30, w: 100, d: 60, r: 6 };
export const SHELL_H = 18;
export const FLOOR = 2;
export const WALL = 2.4;
export const BOSS_R = 6;
export const BOSSES: Array<[number, number]> = [
  [BODY.x + BOSS_R, BODY.y + BOSS_R],
  [BODY.x + BODY.w - BOSS_R, BODY.y + BOSS_R],
  [BODY.x + BOSS_R, BODY.y + BODY.d - BOSS_R],
  [BODY.x + BODY.w - BOSS_R, BODY.y + BODY.d - BOSS_R],
];
export const LID_H = 4;
/* The rim, where the cover sits when the case is shut. */
export const TOP = CLIP_TOP + SHELL_H;

/* Apart: the shell up off the clip, the screws above their bosses, the cover on the mat to the right. */
const SHELL_LIFT = 10;
const SCREW_LIFT = 26;
const COVER_AWAY = 114;
const COVER_HOP = 44;

/** Where each layer is moved to, `apart` 0 (shut) to 1 (taken apart). */
export function poseOf(apart: number) {
  return {
    shell: [0, 0, SHELL_LIFT * apart] as Point3,
    screws: [0, 0, SCREW_LIFT * apart] as Point3,
    // Up, over and down onto the mat: the hop clears the screws on the way.
    lid: [COVER_AWAY * apart, 0, -TOP * apart + COVER_HOP * Math.sin(Math.PI * apart)] as Point3,
  };
}

export const P = fitProjection(
  [
    [MAT.x, MAT.y, -MAT_H],
    [MAT.x + MAT.w, MAT.y, -MAT_H],
    [MAT.x, MAT.y + MAT.d, -MAT_H],
    [MAT.x + MAT.w, MAT.y + MAT.d, -MAT_H],
    [BODY.x, BODY.y, TOP + SHELL_LIFT + 2],
    [BODY.x + BODY.w, BODY.y, TOP + SCREW_LIFT + 6],
    [BODY.x - 22, 2, CLIP_TOP + SHELL_LIFT + 10],
  ] as Point3[],
  WIDTH,
  HEIGHT,
  { pad: 8, azimuth: 32, elevation: 40 },
);

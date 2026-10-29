/*
 * The numbers the figure shows, all from the thesis (Fadhlan Bani Nugraha,
 * UNIKOM 2026) and its tests. Nothing here is tuned for looks:
 *   - the threshold is 23.1 m/s² (about 2.36 g), from Tsani and Mulyadi (2019)
 *   - at rest the wearable read 9.82 m/s², dropped it peaked at 58.25
 *   - a button press read 10.28, because nothing fell
 *   - the packet is <id>,<event>,<magnitude>, e.g. 1,JATUH,58.25
 *   - the receiver measured RSSI -52 dBm in the link test; "Dekat" (near) is -75 dBm or stronger
 *   - a fall sounds double beeps for 30 seconds, the button one long beep
 * What the thesis doesn't give (the exact beep rhythm, how long the radio
 * hop takes) is set to something plausible and kept short.
 */
export const THRESHOLD = 23.1;
export const REST_SMV = 9.82;
export const FALL_PEAK = 58.25;
export const BUTTON_SMV = 10.28;
export const RSSI = -52;
export const ALARM_S = 30;
export const DEVICE_ID = 1;

export type Kind = "fall" | "button";

export const rangeOf = (rssi: number) => (rssi >= -75 ? "Dekat" : rssi >= -90 ? "Menengah" : "Jauh");
export const packetOf = (kind: Kind) => `${DEVICE_ID},${kind === "fall" ? "JATUH" : "TOMBOL"},${(kind === "fall" ? FALL_PEAK : BUTTON_SMV).toFixed(2)}`;

/** Seconds from the trigger. */
export const FALL_S = 0.42; // the sled's free fall onto the pad
export const PRESS_S = 0.16; // the button travelling in and out
export const AIR_S = 0.55; // the packet's hop, drawn as rings crossing the bench
export const POST_S = 0.9; // HTTP POST to api.php, then the dashboard's next refresh
export const LONG_BEEP_S = 1.2;
export const RAISE_S = 1.6; // the sled winched back up before the next drop

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/**
 * The magnitude the wearable computes, √(ax² + ay² + az²), at `t` seconds
 * after the event started. In free fall it dips toward zero (nothing pushes
 * on the sensor), on impact it spikes to the measured peak, then rings down
 * to gravity again.
 */
export function smvAt(kind: Kind, t: number) {
  if (t < 0) return REST_SMV;
  if (kind === "button") {
    // The press nudges the case: a small bump to 10.28 and back.
    const bump = Math.sin(Math.min(1, t / PRESS_S) * Math.PI);
    return REST_SMV + (BUTTON_SMV - REST_SMV) * bump;
  }
  if (t < FALL_S) return REST_SMV * (1 - 0.82 * smooth(t / 0.08));
  const after = t - FALL_S;
  if (after < 0.03) return REST_SMV * 0.18 + (FALL_PEAK - REST_SMV * 0.18) * smooth(after / 0.03);
  const decay = Math.exp(-(after - 0.03) / 0.07);
  return REST_SMV + (FALL_PEAK - REST_SMV) * decay * Math.cos((after - 0.03) * 38);
}

/** How far the sled has dropped, 0 at the top to 1 on the pad (gravity: distance grows with t²). */
export const dropAt = (t: number) => (t <= 0 ? 0 : t >= FALL_S ? 1 : (t / FALL_S) ** 2);

/** When the wearable sends: the moment the magnitude crosses the threshold, or the press. */
export const sendAt = (kind: Kind) => (kind === "fall" ? FALL_S + 0.012 : PRESS_S * 0.5);

/** Is the buzzer sounding, `t` seconds after the receiver got the packet? */
export function buzzerOn(kind: Kind, t: number) {
  if (t < 0) return false;
  if (kind === "button") return t < LONG_BEEP_S;
  if (t >= ALARM_S) return false;
  const phase = t % 1;
  return phase < 0.12 || (phase > 0.22 && phase < 0.34);
}

/** How long the receiver's alarm runs for this kind of event. */
export const alarmOf = (kind: Kind) => (kind === "fall" ? ALARM_S : LONG_BEEP_S);

/** The dashboard's row for an event, in the staff's words (Indonesian, as on the real page). */
export const rowOf = (kind: Kind) => (kind === "fall" ? "Jatuh terdeteksi" : "Tombol darurat");

/** The readout before anything happens, rendered on the server. */
export const RESTING = `${REST_SMV.toFixed(2)} m/s² · ready`;

"use client";

import * as React from "react";
import { translateAlong } from "../../iso/iso-kit";
import { IsoFigure } from "../../iso/react/draw";
import { spring, useInView, useLoop, useReadout, type Spring } from "../../iso/react/live";
import { BENCH_TOP, RX_LED, SCREEN, SCREEN_MATRIX, cableOf, needleOf, ringOf } from "./frame";
import {
  AIR_S,
  FALL_PEAK,
  POST_S,
  RAISE_S,
  REST_SMV,
  RSSI,
  THRESHOLD,
  alarmOf,
  buzzerOn,
  dropAt,
  packetOf,
  rangeOf,
  sendAt,
  smvAt,
  type Kind,
} from "./model";
import { DROP, HEIGHT, P, RADIO_REACH, WIDTH } from "./view";

interface Props {
  bench: React.ReactNode;
  power: React.ReactNode;
  standBack: React.ReactNode;
  sled: React.ReactNode;
  dial: React.ReactNode;
  dialHub: React.ReactNode;
  receiverBack: React.ReactNode;
  buzzer: React.ReactNode;
  receiverFront: React.ReactNode;
  cover: React.ReactNode;
  phoneBack: React.ReactNode;
  phoneFront: React.ReactNode;
}

interface Event {
  kind: Kind;
  t0: number;
  posted: boolean;
}

/* The idle tour: a drop, its whole 30 s alarm, then a button press, and round again. */
const TOUR_FIRST = 1.6;
const TOUR_AFTER_FALL = 34;
const TOUR_AFTER_BUTTON = 8;
const QUIET_AFTER_USER = 14;
const RINGS = 3;
const RING_GAP = 0.12;

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const fixed = (value: number) => value.toFixed(2);
const clock = () => new Date().toLocaleTimeString("en-GB", { hour12: false });


export function LoraLive(props: Props) {
  const { anchor, say } = useReadout<HTMLDivElement>();
  const inView = useInView(anchor);
  const sledRef = React.useRef<SVGGElement>(null);
  const needleRef = React.useRef<SVGPathElement>(null);
  const peakRef = React.useRef<SVGPathElement>(null);
  const cableRef = React.useRef<SVGPathElement>(null);
  const ringRefs = React.useRef<(SVGPathElement | null)[]>([]);
  const buzzerRef = React.useRef<SVGGElement>(null);
  const rxLedRef = React.useRef<SVGCircleElement>(null);
  const screenRef = React.useRef<SVGGElement>(null);
  const statusRef = React.useRef<SVGTextElement>(null);
  const timeRef = React.useRef<SVGTextElement>(null);
  const fallsRef = React.useRef<SVGTextElement>(null);
  const buttonsRef = React.useRef<SVGTextElement>(null);
  const rangeRef = React.useRef<SVGTextElement>(null);

  const sim = React.useRef({
    clock: 0,
    ev: null as Event | null,
    drop: 0,
    raiseFrom: 0,
    raiseAt: 0,
    needle: { at: REST_SMV, rate: 0 } as Spring,
    peak: REST_SMV,
    falls: 0,
    buttons: 0,
    lastInput: -1e9,
    tourNext: TOUR_FIRST,
    tourKind: "fall" as Kind,
    shown: { drop: -1, needle: -1, peak: -1, lit: "", text: "" },
  });

  const trigger = React.useCallback((kind: Kind, byUser: boolean, calm = false) => {
    const s = sim.current;
    if (byUser) {
      s.lastInput = s.clock;
      s.tourNext = s.clock + QUIET_AFTER_USER;
    }
    // One packet at a time: wait until the last one has reached the receiver.
    if (s.ev && s.clock - s.ev.t0 < sendAt(s.ev.kind) + AIR_S + 0.1 && s.clock >= s.ev.t0 - 0.01) return;
    if (s.ev && s.clock < s.ev.t0) return;
    let t0 = s.clock;
    if (kind === "fall" && s.drop > 0) {
      // The sled is on the pad: winch it back up first.
      s.raiseFrom = s.drop;
      s.raiseAt = s.clock;
      t0 = s.clock + (calm ? 0 : RAISE_S * s.raiseFrom);
    }
    // Under reduced motion, jump straight to the end of the event's quick part.
    if (calm) t0 -= sendAt(kind) + AIR_S + POST_S + 0.01;
    s.ev = { kind, t0, posted: false };
  }, []);

  const tick = React.useCallback(
    (dt: number, calm: boolean) => {
      const s = sim.current;
      s.clock += dt;

      if (!calm && s.clock >= s.tourNext && s.clock - s.lastInput > QUIET_AFTER_USER) {
        trigger(s.tourKind, false);
        s.tourNext = s.clock + (s.tourKind === "fall" ? TOUR_AFTER_FALL : TOUR_AFTER_BUTTON);
        s.tourKind = s.tourKind === "fall" ? "button" : "fall";
      }

      const ev = s.ev;
      const t = ev ? s.clock - ev.t0 : Number.POSITIVE_INFINITY;

      // The sled: winched up before a drop, then falling under gravity onto the pad.
      if (ev && ev.kind === "fall") {
        if (t < 0) s.drop = s.raiseFrom * (1 - ease((s.clock - s.raiseAt) / (RAISE_S * s.raiseFrom)));
        else s.drop = dropAt(t);
      }

      // The magnitude, and the meter's needle following it on a stiff spring.
      const smv = ev && t >= 0 ? smvAt(ev.kind, t) : REST_SMV;
      if (ev && t >= 0 && t < dt * 1.5) s.peak = REST_SMV;
      if (ev && t >= 0) s.peak = Math.max(s.peak, smv);
      spring(s.needle, smv, dt, 1400, 46, calm);

      const tSend = ev ? sendAt(ev.kind) : 0;
      const tRx = tSend + AIR_S;
      const sinceRx = t - tRx;
      const alarm = ev ? alarmOf(ev.kind) : 0;
      const beeping = !!ev && sinceRx >= 0 && sinceRx < alarm && (calm || buzzerOn(ev.kind, sinceRx));

      // The packet reaches the server and the dashboard's next refresh shows it.
      if (ev && !ev.posted && sinceRx >= POST_S) {
        ev.posted = true;
        if (ev.kind === "fall") s.falls += 1;
        else s.buttons += 1;
        if (statusRef.current) statusRef.current.textContent = ev.kind === "fall" ? "JATUH" : "TOMBOL";
        if (timeRef.current) timeRef.current.textContent = clock();
        if (fallsRef.current) fallsRef.current.textContent = String(s.falls);
        if (buttonsRef.current) buttonsRef.current.textContent = String(s.buttons);
        if (rangeRef.current) rangeRef.current.textContent = `${rangeOf(RSSI)} ${RSSI} dBm`;
      }

      // Paint only what changed.
      if (Math.abs(s.drop - s.shown.drop) > 1e-4) {
        s.shown.drop = s.drop;
        sledRef.current?.setAttribute("transform", translateAlong(P, [0, 0, -s.drop * DROP]));
        cableRef.current?.setAttribute("d", cableOf(s.drop * DROP));
      }
      if (Math.abs(s.needle.at - s.shown.needle) > 0.005) {
        s.shown.needle = s.needle.at;
        needleRef.current?.setAttribute("d", needleOf(s.needle.at));
      }
      if (Math.abs(s.peak - s.shown.peak) > 0.005) {
        s.shown.peak = s.peak;
        peakRef.current?.setAttribute("d", needleOf(s.peak, 11.2));
      }

      for (let k = 0; k < RINGS; k++) {
        const node = ringRefs.current[k];
        if (!node) continue;
        const f = calm || !ev ? -1 : (t - tSend - k * RING_GAP) / AIR_S;
        if (f > 0 && f < 1) {
          node.setAttribute("d", ringOf(f * RADIO_REACH));
          node.style.opacity = String(0.85 * (1 - f) * Math.min(1, f * 6));
        } else if (node.style.opacity !== "0") node.style.opacity = "0";
      }

      // The one lit part: the wearable while its packet is in the air, then the buzzer while it sounds.
      const wearLit = !!ev && t >= tSend - 0.05 && t < tRx;
      const lit = `${wearLit ? "w" : ""}${beeping ? "b" : ""}${ev && sinceRx >= 0 && sinceRx < 0.18 ? "r" : ""}${ev?.posted && sinceRx < POST_S + 1.4 ? "s" : ""}`;
      if (lit !== s.shown.lit) {
        s.shown.lit = lit;
        const wear = sledRef.current?.querySelector(".lr-wear");
        wear?.toggleAttribute("data-lit", lit.includes("w"));
        sledRef.current?.toggleAttribute("data-send", lit.includes("w"));
        buzzerRef.current?.querySelector(".lr-buzzer")?.toggleAttribute("data-lit", lit.includes("b"));
        rxLedRef.current?.toggleAttribute("data-on", lit.includes("r"));
        screenRef.current?.toggleAttribute("data-new", lit.includes("s"));
      }

      // The readout: what the system is doing now, in its own numbers.
      let text = `${fixed(s.needle.at)} m/s² · ${s.drop > 0.5 ? "on the pad" : "ready"}`;
      if (ev && t < 0) text = "winching the sled up";
      else if (ev && t >= 0 && t < tSend) text = ev.kind === "fall" ? `${fixed(s.needle.at)} m/s² · falling` : "button pressed";
      else if (ev && t >= tSend && t < tRx) text = ev.kind === "fall" ? `${fixed(FALL_PEAK)} > ${THRESHOLD} → ${packetOf("fall")}` : `${packetOf("button")} → 922 MHz`;
      else if (ev && sinceRx >= 0 && sinceRx < alarm) text = ev.kind === "fall" ? `${RSSI} dBm · double beep ${Math.ceil(alarm - sinceRx)} s` : `${RSSI} dBm · one long beep`;
      if (text !== s.shown.text) {
        s.shown.text = text;
        say(text);
      }

      return true;
    },
    [say, trigger],
  );

  const kick = useLoop(tick, inView);

  const act = (kind: Kind) => {
    trigger(kind, true, typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    kick();
  };

  const onClick = (event: React.MouseEvent) => {
    const part = (event.target as Element).closest("[data-part]")?.getAttribute("data-part");
    if (part === "button") act("button");
    else if (part === "drop") act("fall");
  };

  const onKey = (event: React.KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (key === "d" || key === "enter") {
      event.preventDefault();
      act("fall");
    } else if (key === "b" || key === " ") {
      event.preventDefault();
      act("button");
    }
  };

  return (
    <div
      ref={anchor}
      className="lr"
      tabIndex={0}
      role="group"
      aria-label="Interactive figure. Press D to drop the wearable, B to press its emergency button."
      onClick={onClick}
      onKeyDown={onKey}
    >
      <IsoFigure
        width={WIDTH}
        height={HEIGHT}
        label="A test bench for a fall alert system: a wearable on a drop stand with a meter reading its acceleration, a receiver with its cover off and an antenna, and a phone showing the staff dashboard."
      >
        <defs>
          <clipPath id="lr-bench-top">
            <path d={BENCH_TOP} />
          </clipPath>
        </defs>
        {props.bench}
        <g clipPath="url(#lr-bench-top)">
          {Array.from({ length: RINGS }, (_, k) => (
            <path
              key={k}
              ref={(node) => {
                ringRefs.current[k] = node;
              }}
              className="iso-line lr-ring"
              data-tone="mid"
              d=""
              style={{ opacity: 0 }}
            />
          ))}
        </g>
        {props.power}
        {props.standBack}
        <g ref={sledRef}>{props.sled}</g>
        {props.dial}
        <path ref={peakRef} className="iso-line lr-peak" data-tone="mid" d={needleOf(REST_SMV, 11.2)} />
        <path ref={needleRef} className="iso-line lr-needle" data-tone="lit" d={needleOf(REST_SMV)} />
        {props.dialHub}
        {/* After the meter: the cable lies in front of it, into the socket on its front. */}
        <path ref={cableRef} className="iso-line lr-meter-cable" data-tone="lo" d={cableOf(0)} />
        {props.receiverBack}
        <g ref={buzzerRef}>{props.buzzer}</g>
        <circle ref={rxLedRef} className="lr-rx-led" r={0.85} cx={RX_LED[0]} cy={RX_LED[1]} />
        {props.receiverFront}
        {props.cover}
        {props.phoneBack}
        <g ref={screenRef} className="lr-screen" transform={SCREEN_MATRIX}>
          <rect className="lr-glass" x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={1.6} />
          <text className="lr-text" data-size="s" x={4.2} y={10.5}>
            Riwayat
          </text>
          <text ref={statusRef} className="lr-text" data-size="l" x={4.2} y={18}>
            —
          </text>
          <text ref={timeRef} className="lr-text" data-size="s" x={4.2} y={22.6}>
            --:--:--
          </text>
          <path className="lr-rule" d={`M4.2 25.4H${SCREEN.x + SCREEN.w - 2.2}`} />
          <text className="lr-text" data-size="s" x={4.2} y={30}>
            Jatuh
          </text>
          <text className="lr-text" data-size="s" x={15.2} y={30}>
            Tombol
          </text>
          <text ref={fallsRef} className="lr-text" data-size="xl" x={4.2} y={37.6}>
            0
          </text>
          <text ref={buttonsRef} className="lr-text" data-size="xl" x={15.2} y={37.6}>
            0
          </text>
          <path className="lr-rule" d={`M4.2 41H${SCREEN.x + SCREEN.w - 2.2}`} />
          <text ref={rangeRef} className="lr-text" data-size="s" x={4.2} y={45.6}>
            —
          </text>
        </g>
        {props.phoneFront}
      </IsoFigure>
    </div>
  );
}


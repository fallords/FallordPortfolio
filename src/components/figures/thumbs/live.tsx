"use client";

import * as React from "react";
import { IsoFigure } from "../../iso/react/draw";
import { useInView, useLoop } from "../../iso/react/live";
import { translateAlong, type SolidPaths, type Tone } from "../../iso/iso-kit";
import * as W from "./wearable-view";
import * as D from "./door-view";
import * as C from "./cv-view";
import * as S from "./sera-view";

/*
 * The two thumbnails on the Writing index. Each runs one slow loop while it
 * is on screen and holds its explaining pose under reduced motion: the
 * wearable taken apart, the door shut and bolted.
 */

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Where a looping timeline of [seconds, from, to] steps is at `t`. */
function along(steps: Array<[number, number, number]>, t: number) {
  const total = steps.reduce((sum, [seconds]) => sum + seconds, 0);
  let at = t % total;
  for (const [seconds, from, to] of steps) {
    if (at < seconds) return from + (to - from) * ease(at / seconds);
    at -= seconds;
  }
  return steps[steps.length - 1]![2];
}

/* ------------------------------------------------------------- wearable */

// Apart, together, apart again: the cover hops back on, the screws go down, the shell settles on the clip, then all of it comes off again.
const APART_POSE = W.poseOf(1);
const APART: Array<[number, number, number]> = [
  [3.4, 1, 1],
  [1.3, 1, 0],
  [2, 0, 0],
  [1.5, 0, 1],
];

export function WearableLive(props: { mat: React.ReactNode; clip: React.ReactNode; shell: React.ReactNode; screws: React.ReactNode; lid: React.ReactNode }) {
  const root = React.useRef<HTMLDivElement>(null);
  const shell = React.useRef<SVGGElement>(null);
  const screws = React.useRef<SVGGElement>(null);
  const lid = React.useRef<SVGGElement>(null);
  const clock = React.useRef(0);
  const inView = useInView(root);

  const pose = (apart: number) => {
    const at = W.poseOf(apart);
    shell.current?.setAttribute("transform", translateAlong(W.P, at.shell));
    screws.current?.setAttribute("transform", translateAlong(W.P, at.screws));
    lid.current?.setAttribute("transform", translateAlong(W.P, at.lid));
  };

  useLoop((dt, calm) => {
    if (calm) {
      pose(1);
      return false;
    }
    clock.current += dt;
    pose(along(APART, clock.current));
    return true;
  }, inView);

  return (
    <div ref={root}>
      <IsoFigure width={W.WIDTH} height={W.HEIGHT} label="The fall-alert wearable taken apart: belt clip, shell with its boards, four screws and the front cover with the red emergency button.">
        {props.mat}
        {props.clip}
        <g ref={shell} transform={translateAlong(W.P, APART_POSE.shell)}>
          {props.shell}
        </g>
        <g ref={screws} transform={translateAlong(W.P, APART_POSE.screws)}>
          {props.screws}
        </g>
        <g ref={lid} transform={translateAlong(W.P, APART_POSE.lid)}>
          {props.lid}
        </g>
      </IsoFigure>
    </div>
  );
}

/* ----------------------------------------------------------------- door */

// Open, swing shut, throw the bolt, hold, draw it, swing open: [seconds, angle from, angle to] and the bolt's own track.
const SWING: Array<[number, number, number]> = [
  [2.2, D.OPEN, D.OPEN],
  [1.3, D.OPEN, 0],
  [0.45, 0, 0],
  [3.4, 0, 0],
  [0.45, 0, 0],
  [1.5, 0, D.OPEN],
];
const BOLT: Array<[number, number, number]> = [
  [2.2, 0, 0],
  [1.3, 0, 0],
  [0.45, 0, 1],
  [3.4, 1, 1],
  [0.45, 1, 0],
  [1.5, 0, 0],
];

const TONES: Record<D.DoorSolid, Tone> = { panel: "hi", rose: "mid", lever: "mid", escutcheon: "mid", plate: "mid", bolt: "hi", barrel: "mid", knob: "mid" };

/** Rewrites a LiveSolid's paths in place. */
function paint(g: SVGGElement | undefined, paths: SolidPaths) {
  if (!g) return;
  const set = (selector: string, d: string) => g.querySelector(selector)?.setAttribute("d", d);
  set(".iso-fill", paths.fill);
  paths.shades.forEach((d, shade) => set(`.iso-shade[data-shade="${shade}"]`, d ?? ""));
  set(".iso-top", paths.top);
  set(".iso-crease", paths.crease);
  set(".iso-edge", paths.outline);
}

/** A solid whose paths are rewritten each frame: all four shade slots are always there, since which faces show changes as it turns. */
function LiveSolid({ paths, tone, lit, register }: { paths: SolidPaths; tone: Tone; lit?: boolean; register: (g: SVGGElement | null) => void }) {
  return (
    <g ref={register} className="iso-solid" data-lit={lit ? "" : undefined}>
      <path className="iso-fill" d={paths.fill} />
      {[0, 1, 2, 3].map((shade) => (
        <path key={shade} className="iso-shade" data-shade={shade} d={paths.shades[shade] ?? ""} />
      ))}
      <path className="iso-top" d={paths.top} />
      <path className="iso-line iso-crease" data-tone="faint" d={paths.crease} />
      <path className="iso-line iso-edge" data-tone={tone} d={paths.outline} />
    </g>
  );
}

const SHUT_POSE = D.doorAt(0, 1);

export function DoorLive(props: { early: React.ReactNode; late: React.ReactNode; knuckles: React.ReactNode }) {
  const root = React.useRef<HTMLDivElement>(null);
  const before = React.useRef<SVGGElement>(null);
  const after = React.useRef<SVGGElement>(null);
  const panels = React.useRef<SVGPathElement>(null);
  const keyhole = React.useRef<SVGPathElement>(null);
  const screws = React.useRef<Array<SVGCircleElement | null>>([]);
  const solids = React.useRef<Partial<Record<D.DoorSolid, SVGGElement>>>({});
  const register = (name: D.DoorSolid) => (g: SVGGElement | null) => {
    solids.current[name] = g ?? undefined;
  };
  const clock = React.useRef(0);
  const inView = useInView(root);

  const pose = (theta: number, thrown: number) => {
    const door = D.doorAt(theta, thrown);
    for (const name of D.DOOR_SOLIDS) paint(solids.current[name], door.solids[name]);
    panels.current?.setAttribute("d", door.lines.panels);
    keyhole.current?.setAttribute("d", door.lines.keyhole);
    door.screws.forEach(([x, y], index) => {
      screws.current[index]?.setAttribute("cx", String(x));
      screws.current[index]?.setAttribute("cy", String(y));
    });
    // Open, the door stands in front of the right jamb and the head; shut, it sits behind them in its frame.
    const shut = theta < D.SHUT;
    before.current?.setAttribute("display", shut ? "none" : "inline");
    after.current?.setAttribute("display", shut ? "inline" : "none");
  };

  useLoop((dt, calm) => {
    if (calm) {
      pose(0, 1);
      return false;
    }
    clock.current += dt;
    pose(along(SWING, clock.current), along(BOLT, clock.current));
    return true;
  }, inView);

  return (
    <div ref={root}>
      <IsoFigure width={D.WIDTH} height={D.HEIGHT} label="A panel door swinging shut in its frame, and its barrel bolt sliding home into the keeper.">
        {props.early}
        <g ref={before} display="none">
          {props.late}
        </g>
        <g>
          {D.DOOR_SOLIDS.slice(0, 1).map((name) => (
            <LiveSolid key={name} paths={SHUT_POSE.solids[name]} tone={TONES[name]} register={register(name)} />
          ))}
          <path ref={panels} className="iso-line" data-tone="lo" d={SHUT_POSE.lines.panels} />
          {D.DOOR_SOLIDS.slice(1).map((name) => (
            <LiveSolid key={name} paths={SHUT_POSE.solids[name]} tone={TONES[name]} lit={name === "bolt"} register={register(name)} />
          ))}
          <path ref={keyhole} className="iso-line" data-tone="lo" d={SHUT_POSE.lines.keyhole} />
          <g className="iso-dots" data-tone="mid">
            {SHUT_POSE.screws.map(([x, y], index) => (
              <circle key={index} ref={(node) => void (screws.current[index] = node)} cx={x} cy={y} r={0.35} />
            ))}
          </g>
        </g>
        {props.knuckles}
        <g ref={after}>{props.late}</g>
      </IsoFigure>
    </div>
  );
}

/* ------------------------------------------------------------------- cv */

// One template per sheet: turn the dial, feed the sheet up, hold it, let it go.
const SHEET_CYCLE = 6.4;
const DIAL_TURN = 0.7;
const FEED = 2.5;
const FADE_AT = 5.6;
const FADE = 0.6;

const cvPose = (t: number) => {
  const k = Math.floor(t / SHEET_CYCLE) % C.DETENTS.length;
  const at = t % SHEET_CYCLE;
  const from = C.DETENTS[(k + C.DETENTS.length - 1) % C.DETENTS.length]!;
  const angle = from + (C.DETENTS[k]! - from) * ease(at / DIAL_TURN);
  const rise = C.SHEET_OUT * ease((at - DIAL_TURN) / FEED);
  const shown = at < DIAL_TURN ? 0 : at < FADE_AT ? 1 : Math.max(0, 1 - (at - FADE_AT) / FADE);
  return { k, angle, rise, shown };
};

export function CvLive(props: { back: React.ReactNode; sheet: React.ReactNode; layouts: React.ReactNode; front: React.ReactNode; above: string }) {
  const root = React.useRef<HTMLDivElement>(null);
  const sheet = React.useRef<SVGGElement>(null);
  const pointer = React.useRef<SVGPathElement>(null);
  const clock = React.useRef(0);
  const clip = `cv-slot-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const inView = useInView(root);

  const pose = ({ k, angle, rise, shown }: ReturnType<typeof cvPose>) => {
    sheet.current?.setAttribute("transform", translateAlong(C.P, [0, 0, rise]));
    sheet.current?.setAttribute("opacity", String(shown));
    sheet.current?.querySelectorAll("[data-layout]").forEach((node) => node.setAttribute("display", node.getAttribute("data-layout") === String(k) ? "inline" : "none"));
    pointer.current?.setAttribute("d", C.pointerAt(angle));
  };

  useLoop((dt, calm) => {
    if (calm) {
      pose({ k: 0, angle: C.DETENTS[0]!, rise: C.SHEET_OUT, shown: 1 });
      return false;
    }
    clock.current += dt;
    pose(cvPose(clock.current));
    return true;
  }, inView);

  return (
    <div ref={root}>
      <IsoFigure width={C.WIDTH} height={C.HEIGHT} label="A small printer feeding an A4 sheet up out of its top slot with a CV laid out on it, and a dial on top that picks one of three templates.">
        <defs>
          <clipPath id={clip}>
            <path d={props.above} />
          </clipPath>
        </defs>
        {props.back}
        <g clipPath={`url(#${clip})`}>
          <g ref={sheet} transform={translateAlong(C.P, [0, 0, C.SHEET_OUT])}>
            {props.sheet}
            <g transform={C.SHEET_FACE}>{props.layouts}</g>
          </g>
        </g>
        {props.front}
        <path ref={pointer} className="iso-line" data-tone="hi" d={C.pointerAt(C.DETENTS[0]!)} />
      </IsoFigure>
    </div>
  );
}

/* ----------------------------------------------------------------- sera */

// Down the chat line by line, a pause at the bottom, back up with the marks cleared.
const SCAN: Array<[number, number, number]> = [
  [0.6, 6, 6],
  [5, 6, 52],
  [1.2, 52, 52],
  [2.2, 52, 6],
];
const SCAN_DOWN_ENDS = 0.6 + 5 + 1.2;
const SCAN_CYCLE = SCAN_DOWN_ENDS + 2.2;

export function SeraLive(props: { stand: React.ReactNode; face: React.ReactNode; front: React.ReactNode; lens: React.ReactNode; rimInner: string; glass: string }) {
  const root = React.useRef<HTMLDivElement>(null);
  const lens = React.useRef<SVGGElement>(null);
  const magnified = React.useRef<SVGGElement>(null);
  const clock = React.useRef(0);
  const clip = `sr-glass-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const inView = useInView(root);
  const rest = S.lensCentres(S.LENS_REST);

  const pose = (local: number, marked: (index: number) => boolean) => {
    const z = S.heightOf(local);
    const [dx, dy] = (() => {
      const now = S.lensCentres(z);
      return [now.card[0] - rest.card[0], now.card[1] - rest.card[1]];
    })();
    lens.current?.setAttribute("transform", translateAlong(S.P, [0, 0, z - S.LENS_REST]));
    // Inside the moving lens: the card, scaled about the point behind the glass's centre, so the glass shows it larger.
    magnified.current?.setAttribute(
      "transform",
      `translate(${rest.lens[0]} ${rest.lens[1]}) scale(${S.MAGNIFY}) translate(${-(rest.card[0] + dx)} ${-(rest.card[1] + dy)})`,
    );
    S.FLAGGED.forEach((_, index) =>
      root.current?.querySelectorAll(`[data-flag="${index}"]`).forEach((node) => (marked(index) ? node.setAttribute("data-on", "") : node.removeAttribute("data-on"))),
    );
  };

  useLoop((dt, calm) => {
    if (calm) {
      pose(S.flagLineY(S.FLAGGED[0]!), () => true);
      return false;
    }
    clock.current += dt;
    const at = clock.current % SCAN_CYCLE;
    const local = along(SCAN, clock.current);
    pose(local, (index) => at < SCAN_DOWN_ENDS && local >= S.flagLineY(S.FLAGGED[index]!));
    return true;
  }, inView);

  const start = S.flagLineY(S.FLAGGED[0]!);
  const startCard = S.lensCentres(S.heightOf(start)).card;
  return (
    <div ref={root}>
      <IsoFigure width={S.WIDTH} height={S.HEIGHT} label="A chat card in a reading stand, with a lens on a rail scanning down it and red marks appearing beside two sentences.">
        {props.stand}
        <g transform={S.CARD_FACE_MATRIX}>{props.face}</g>
        {props.front}
        <g ref={lens} transform={translateAlong(S.P, [0, 0, S.heightOf(start) - S.LENS_REST])}>
          <defs>
            <clipPath id={clip}>
              <path d={props.glass} />
            </clipPath>
          </defs>
          {props.lens}
          <g clipPath={`url(#${clip})`}>
            <path className="sr-glass" d={props.glass} />
            <g ref={magnified} transform={`translate(${rest.lens[0]} ${rest.lens[1]}) scale(${S.MAGNIFY}) translate(${-startCard[0]} ${-startCard[1]})`}>
              <g transform={S.CARD_FACE_MATRIX}>{props.face}</g>
            </g>
          </g>
          <path className="iso-line" data-tone="mid" d={props.rimInner} />
        </g>
      </IsoFigure>
    </div>
  );
}

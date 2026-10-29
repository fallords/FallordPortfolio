import * as React from "react";
import { Dots, Line, Solid } from "../../iso/react/draw";
import { CLIP_ART, LID_ART, MAT_ART, SCREW_ART, SHELL_ART } from "./wearable";
import { EARLY_ART, KNUCKLE_ART, LATE_ART } from "./door";
import { CV_ART, LAYOUTS } from "./cv";
import { SERA_ART } from "./sera";
import { BUBBLES, LINE_GAP, bubbleOf, flagLineY } from "./sera-view";
import { CvLive, DoorLive, SeraLive, WearableLive } from "./live";
import "../../iso/iso.css";
import "../lora/lora.css";
import "./thumbs.css";

/*
 * The static art of both thumbnails, built on the server and handed to the
 * live components as elements (each root keyed, as the kit asks).
 */

/** The fall-alert wearable from the thesis, taken apart on a cutting mat. */
export function WearableThumb() {
  const s = SHELL_ART;
  return (
    <div className="iso iso-thumb">
      <WearableLive
        mat={
          <g key="mat">
            <path className="iso-halo" d={MAT_ART.halo} />
            <Solid paths={MAT_ART.slab} tone="lo" crease="faint" inner={<Line d={MAT_ART.grid} tone="faint" />} />
            <path className="iso-halo" d={MAT_ART.shadow} />
          </g>
        }
        clip={
          <g key="clip">
            <Solid paths={CLIP_ART.tongue} tone="mid" crease="faint" inner={<Line d={CLIP_ART.ridges} tone="faint" />} />
            <Solid paths={CLIP_ART.barrel} tone="mid" crease="none" />
            <Solid paths={CLIP_ART.mount} tone="mid" crease="faint" />
            <Dots points={CLIP_ART.mountScrews} size={0.5} tone="mid" />
          </g>
        }
        shell={
          <g key="shell">
            <Solid paths={s.antenna.tip} tone="mid" crease="none" />
            <Solid paths={s.antenna.whip} tone="mid" crease="none" inner={<Line d={s.antenna.rings} tone="faint" />} />
            <Solid paths={s.antenna.base} tone="mid" crease="none" />
            <Solid paths={s.antenna.nut} tone="mid" crease="none" />
            <Solid paths={s.floor} tone="mid" crease="faint" />
            <Line d={s.floorGrid} tone="faint" />
            {s.farBosses.map((paths, index) => (
              <Solid key={`b${index}`} paths={paths} tone="mid" crease="none" />
            ))}
            {s.farWalls.map((paths, index) => (
              <Solid key={`w${index}`} paths={paths} tone="mid" crease="faint" />
            ))}
            <Solid paths={s.esp} tone="hi" crease="faint" />
            <Solid paths={s.espCan} tone="mid" crease="none" />
            <Solid paths={s.espUsb} tone="mid" crease="none" />
            <Dots points={s.espPins} size={0.4} tone="hi" />
            <Solid paths={s.rfm} tone="hi" crease="faint" />
            <Solid paths={s.rfmCan} tone="mid" crease="none" />
            <Dots points={s.rfmPads} size={0.35} tone="mid" />
            <Line d={s.coax} tone="mid" />
            <Solid paths={s.mpu} tone="hi" lit crease="faint" />
            <Solid paths={s.mpuChip} tone="hi" crease="none" />
            <Line d={s.mpuHoles} tone="lo" />
            <Dots points={s.mpuPins} size={0.4} tone="hi" />
            <Solid paths={s.cell} tone="hi" crease="faint" inner={<Line d={s.cellLabel} tone="faint" />} />
            <Solid paths={s.cellTab} tone="mid" crease="none" />
            <Solid paths={s.tp} tone="hi" crease="faint" />
            <Solid paths={s.tpChip} tone="mid" crease="none" />
            <Solid paths={s.tpUsb} tone="mid" crease="none" />
            <Dots points={s.tpLeds} size={0.45} tone="hi" />
            <Line d={s.wires} tone="lo" />
            {s.nearWalls.map((paths, index) => (
              <Solid key={`n${index}`} paths={paths} tone="mid" crease="faint" />
            ))}
            <Solid paths={s.nearBoss} tone="mid" crease="none" />
            <Line d={s.holes} tone="lo" />
            <Line d={s.port} tone="lo" />
            <Line d={s.seam} tone="faint" />
          </g>
        }
        screws={
          <g key="screws">
            {SCREW_ART.map((screw, index) => (
              <g key={index}>
                <Solid paths={screw.shank} tone="mid" crease="none" />
                <Solid paths={screw.head} tone="mid" crease="none" />
                <Line d={screw.slot} tone="lo" />
              </g>
            ))}
          </g>
        }
        lid={
          <g key="lid">
            <path className="iso-halo" d={LID_ART.plate.fill} />
            <Solid paths={LID_ART.plate} tone="mid" crease="faint" inner={<Line d={LID_ART.groove} tone="faint" />} />
            <Line d={LID_ART.holes} tone="lo" />
            <Dots points={LID_ART.screws} size={0.6} tone="mid" />
            <Line d={LID_ART.grip} tone="faint" />
            <Solid paths={LID_ART.ledRim} tone="mid" crease="none" />
            <circle className="lr-power" cx={LID_ART.led[0]![0]} cy={LID_ART.led[0]![1]} r={0.9} />
            <Solid paths={LID_ART.collar} tone="mid" crease="none" />
            <Solid paths={LID_ART.cap} tone="hi" crease="none" className="lr-button" inner={<Line d={LID_ART.capRim} tone="faint" />} />
          </g>
        }
      />
    </div>
  );
}

/** A panel door swinging shut in its frame and bolting, for the essay on a door that has been closed. */
export function DoorThumb() {
  const e = EARLY_ART;
  const l = LATE_ART;
  return (
    <div className="iso iso-thumb">
      <DoorLive
        early={
          <g key="early">
            <path className="iso-halo" d={e.halo} />
            <Solid paths={e.floor} tone="lo" crease="faint" inner={<Line d={e.planks + e.joints} tone="faint" />} />
            <Solid paths={e.threshold} tone="mid" crease="faint" />
            <Solid paths={e.wallLeft} tone="mid" crease="faint" />
            <Solid paths={e.skirtingLeft} tone="mid" crease="faint" />
            <Solid paths={e.plinthLeft} tone="mid" crease="faint" />
            <Solid paths={e.casingLeft} tone="mid" crease="faint" />
            {e.hingeLeaves.map((paths, index) => (
              <Solid key={index} paths={paths} tone="mid" crease="none" />
            ))}
          </g>
        }
        late={
          <g key="late">
            <Solid paths={l.lintel} tone="mid" crease="faint" />
            <Solid paths={l.wallRight} tone="mid" crease="faint" />
            <Solid paths={l.skirtingRight} tone="mid" crease="faint" />
            <Solid paths={l.plinthRight} tone="mid" crease="faint" />
            <Solid paths={l.casingRight} tone="mid" crease="faint" />
            <Solid paths={l.head} tone="mid" crease="faint" inner={<Line d={l.headSeams} tone="faint" />} />
            <Solid paths={l.switchPlate} tone="mid" crease="none" />
            <Solid paths={l.rocker} tone="mid" crease="none" />
            <Dots points={l.switchScrews} size={0.35} tone="mid" />
            <Solid paths={l.keeper} tone="mid" crease="none" />
            <Dots points={l.keeperScrews} size={0.35} tone="mid" />
          </g>
        }
        knuckles={
          <g key="knuckles">
            {KNUCKLE_ART.map((knuckle, index) => (
              <g key={index}>
                <Solid paths={knuckle.barrel} tone="mid" crease="none" inner={<Line d={knuckle.joint} tone="faint" />} />
                <Solid paths={knuckle.pin} tone="mid" crease="none" />
              </g>
            ))}
          </g>
        }
      />
    </div>
  );
}

/** The CV maker: a printer feeding out an A4 sheet in the template its dial points at. */
export function CvThumb() {
  const a = CV_ART;
  return (
    <div className="iso iso-thumb">
      <CvLive
        above={a.above}
        back={
          <g key="back">
            <path className="iso-halo" d={a.halo} />
            {a.feet.map((paths, index) => (
              <Solid key={index} paths={paths} tone="lo" crease="none" />
            ))}
            <Solid paths={a.back} tone="mid" crease="faint" />
            <Solid paths={a.guide} tone="mid" crease="faint" />
            {a.blanks.map((paths, index) => (
              <Solid key={`s${index}`} paths={paths} tone="lo" crease="none" />
            ))}
            <Line d={a.trayMouth} tone="lo" />
            <Line d={a.slotLip} tone="lo" />
          </g>
        }
        sheet={<Solid key="sheet" paths={a.sheet} tone="hi" lit crease="none" />}
        layouts={
          <g key="layouts">
            {LAYOUTS.map((layout, index) => (
              <g key={index} data-layout={index} display={index === 0 ? "inline" : "none"}>
                {layout.panel ? <rect className="cv-panel" x={layout.panel[0]} y={layout.panel[1]} width={layout.panel[2]} height={layout.panel[3]} /> : null}
                {layout.bars.map(([x, y, w, h], bar) => (
                  <rect key={bar} className="cv-bar" x={x} y={y} width={w} height={h} rx={Math.min(0.4, h / 2)} />
                ))}
                <path className="iso-line" data-tone="lo" d={layout.rules.map(([x0, y, x1]) => `M${x0} ${y}H${x1}`).join("")} />
              </g>
            ))}
          </g>
        }
        front={
          <g key="front">
            <Solid paths={a.front} tone="mid" crease="faint" inner={<Line d={a.seam} tone="faint" />} />
            <Line d={a.slotFront + a.slotEnds} tone="lo" />
            <Line d={a.vents + a.sideVents} tone="lo" />
            <Dots points={a.screws} size={0.45} tone="mid" />
            <Solid paths={a.label} tone="lo" crease="none" inner={<Line d={a.labelRules} tone="faint" />} />
            <Solid paths={a.key} tone="mid" crease="none" />
            <circle className="lr-power" cx={a.led[0]![0]} cy={a.led[0]![1]} r={0.7} />
            <Solid paths={a.dialBase} tone="lo" crease="none" />
            <Line d={a.detents} tone="mid" />
            <Solid paths={a.dial} tone="mid" crease="none" />
            <Line d={a.dialKnurl} tone="lo" />
            <Line d={a.dialRing} tone="lo" />
          </g>
        }
      />
    </div>
  );
}

/** S.E.R.A.: a lens scanning down a chat on a reading stand, marking the sentences that read oddly. */
export function SeraThumb() {
  const a = SERA_ART;
  let flag = 0;
  const face = (
    <g key="face">
      {/* The header with S.E.R.A.'s mark, and a rule under it. */}
      <rect className="cv-bar" x={2} y={2.4} width={6.6} height={1.8} rx={0.4} />
      <rect className="sr-mark" x={9.1} y={2.6} width={1.6} height={1.6} />
      <rect className="sr-chip" x={23.6} y={2.7} width={4.4} height={1.3} rx={0.3} />
      <path className="iso-line" data-tone="lo" d="M0 6.2H30" />
      {BUBBLES.map((bubble, index) => {
        const { x, w, h } = bubbleOf(bubble);
        const marked = bubble.flag !== undefined ? flag++ : undefined;
        return (
          <g key={index}>
            <rect className="sr-bubble" data-side={bubble.side} x={x} y={bubble.y} width={w} height={h} rx={1.2} />
            {bubble.lines.map((lw, line) => (
              <rect key={line} className="cv-bar" x={x + 1.5} y={bubble.y + 1.1 + line * LINE_GAP} width={lw} height={0.9} rx={0.3} />
            ))}
            {marked !== undefined ? (
              <g className="sr-flag" data-flag={marked}>
                <path className="sr-underline" d={`M${x + 1.5} ${flagLineY(bubble)}H${x + 1.5 + bubble.lines[bubble.flag!]!}`} />
                <rect className="sr-mark" x={bubble.side === "l" ? x + w + 0.8 : x - 2.4} y={bubble.y + h / 2 - 0.8} width={1.6} height={1.6} />
              </g>
            ) : null}
          </g>
        );
      })}
      {/* Where you paste the next chat. */}
      <rect className="sr-bubble" x={2} y={53.4} width={26} height={3.2} rx={0.8} />
      <rect className="cv-bar" x={24.4} y={54.3} width={2.6} height={1.4} rx={0.3} />
    </g>
  );
  return (
    <div className="iso iso-thumb">
      <SeraLive
        face={face}
        glass={a.glass}
        rimInner={a.rimInner}
        stand={
          <g key="stand">
            <path className="iso-halo" d={a.halo} />
            {a.feet.map((paths, index) => (
              <Solid key={index} paths={paths} tone="lo" crease="none" />
            ))}
            <Solid paths={a.base} tone="lo" crease="faint" inner={<Line d={a.groove} tone="faint" />} />
            <Solid paths={a.block} tone="mid" crease="faint" />
            <Solid paths={a.panel} tone="mid" crease="faint" />
            <Solid paths={a.card} tone="hi" lit crease="none" />
          </g>
        }
        front={
          <g key="front">
            <Solid paths={a.ledge} tone="mid" crease="faint" inner={<Line d={a.ledgeLip} tone="faint" />} />
            <Solid paths={a.collar} tone="mid" crease="none" />
            <Solid paths={a.post} tone="mid" crease="none" />
            <Solid paths={a.cap} tone="mid" crease="none" />
          </g>
        }
        lens={
          <g key="lens">
            <Solid paths={a.carriage} tone="mid" crease="faint" />
            <Solid paths={a.screwShank} tone="mid" crease="none" />
            <Solid paths={a.screwKnob} tone="mid" crease="none" />
            <Solid paths={a.arm} tone="mid" crease="none" />
            <Solid paths={a.rim} tone="hi" crease="none" />
          </g>
        }
      />
    </div>
  );
}

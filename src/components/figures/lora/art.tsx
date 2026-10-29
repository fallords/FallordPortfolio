import * as React from "react";
import { Dots, Line, Solid } from "../../iso/react/draw";
import { BENCH, COVER_ART, DIAL_ART, PHONE_ART, POWER_ART, RECEIVER_ART, SLED_ART, STAND_ART } from "./geometry";
import { LoraLive } from "./live";

/*
 * The static art, built on the server. Each group is handed to the live
 * component as an element, which paints them in order and moves the sled.
 * Every root carries a key (see the kit's note on large pages).
 */

const BENCH_ART = (
  <g key="bench">
    <path className="iso-halo" d={BENCH.halo} />
    {BENCH.feet.map((parts, index) => (
      <g key={index}>
        {parts.map((paths, part) => (
          <Solid key={part} paths={paths} tone={part ? "mid" : "lo"} crease="faint" />
        ))}
      </g>
    ))}
    <Solid paths={BENCH.slab} tone="mid" crease="faint" />
    <Line d={BENCH.groove} tone="lo" />
    <Line d={BENCH.screwRings} tone="lo" />
    <Dots points={BENCH.screws} size={0.5} tone="mid" />
    <Solid paths={BENCH.strip} tone="lo" crease="none" />
    <Line d={BENCH.ticks.minor} tone="lo" />
    <Line d={BENCH.ticks.major} tone="mid" />
    <Solid paths={BENCH.label} tone="lo" crease="none" />
    <Line d={BENCH.labelLine} tone="faint" />
    <Line d={BENCH.labelRule} tone="lo" free />
    <Dots points={BENCH.labelScrews} size={0.45} tone="mid" />
  </g>
);

const POWER = (
  <g key="power">
    <Line d={POWER_ART.cable} tone="mid" className="lr-cable" />
    <Solid paths={POWER_ART.adapter} tone="mid" crease="faint" inner={<Line d={POWER_ART.adapterSeam} tone="faint" />} />
    <Line d={POWER_ART.adapterPlate} tone="faint" />
    <Line d={POWER_ART.adapterVents} tone="lo" />
  </g>
);

const STAND_BACK = (
  <g key="stand-back" data-part="drop">
    <Solid paths={STAND_ART.foot} tone="mid" crease="faint" />
    <Line d={STAND_ART.footRings} tone="lo" />
    <Dots points={STAND_ART.footScrews} size={0.45} tone="mid" />
    <Solid paths={STAND_ART.pad} tone="lo" crease="lo" />
    <Line d={STAND_ART.padLine} tone="faint" />
    {STAND_ART.collars.map((paths, index) => (
      <Solid key={`c${index}`} paths={paths} tone="mid" crease="faint" />
    ))}
    {STAND_ART.rods.map((paths, index) => (
      <Solid key={`r${index}`} paths={paths} tone="mid" crease="none" />
    ))}
    <Solid paths={STAND_ART.bridge} tone="mid" crease="faint" inner={<Line d={STAND_ART.bridgeSeam} tone="faint" />} />
    <Line d={STAND_ART.bridgeRings} tone="lo" />
    <Dots points={STAND_ART.bridgeScrews} size={0.5} tone="mid" />
    <Solid paths={STAND_ART.latchBase} tone="mid" crease="faint" />
    <Solid paths={STAND_ART.knob} tone="mid" crease="faint" />
    <Line d={STAND_ART.knobKnurl} tone="lo" />
    <Line d={STAND_ART.knobPointer} tone="hi" />
  </g>
);

const SLED = (
  <g key="sled" data-part="drop">
    {SLED_ART.bushesBack.map((paths, index) => (
      <Solid key={`b${index}`} paths={paths} tone="mid" crease="faint" />
    ))}
    <Line d={SLED_ART.seamsBack} tone="faint" />
    <Solid paths={SLED_ART.plate} tone="mid" crease="faint" />
    <Dots points={SLED_ART.plateScrews} size={0.45} tone="mid" />
    <Solid paths={SLED_ART.belt} tone="lo" crease="lo" inner={<Line d={SLED_ART.beltStitch} tone="faint" dotted />} />
    <Dots points={SLED_ART.beltHoles} size={0.55} tone="lo" />
    <Solid paths={SLED_ART.body} tone="hi" crease="lo" className="lr-wear" inner={<Line d={SLED_ART.bodySeam} tone="faint" />} />
    <Line d={SLED_ART.bezel} tone="faint" />
    <Dots points={SLED_ART.frontScrews} size={0.45} tone="mid" />
    <Solid paths={SLED_ART.switchPlate} tone="mid" crease="faint" />
    <Solid paths={SLED_ART.switchNub} tone="hi" crease="faint" />
    <Line d={SLED_ART.port} tone="lo" />
    <Solid paths={SLED_ART.plug} tone="mid" crease="faint" />
    <Solid paths={SLED_ART.ledRim} tone="mid" crease="none" />
    <circle className="lr-led" cx={SLED_ART.led[0][0]} cy={SLED_ART.led[0][1]} r={0.75} />
    <g data-part="button" className="lr-press">
      <Solid paths={SLED_ART.collar} tone="mid" crease="faint" />
      <Solid paths={SLED_ART.button} tone="hi" crease="none" className="lr-button" inner={<Line d={SLED_ART.buttonFace} tone="faint" />} />
    </g>
    <Solid paths={SLED_ART.antennaCollar} tone="mid" crease="faint" />
    <Solid paths={SLED_ART.antenna} tone="mid" crease="none" />
    <Solid paths={SLED_ART.antennaTip} tone="mid" crease="faint" />
    {SLED_ART.bushesFront.map((paths, index) => (
      <Solid key={`f${index}`} paths={paths} tone="mid" crease="faint" />
    ))}
    <Line d={SLED_ART.seamsFront} tone="faint" />
  </g>
);

const DIAL = (
  <g key="dial">
    <path className="iso-halo" d={DIAL_ART.puck.fill} />
    <Solid paths={DIAL_ART.puck} tone="hi" crease="lo" inner={<Line d={DIAL_ART.band} tone="faint" />} />
    <Line d={DIAL_ART.knurl} tone="lo" />
    <Solid paths={DIAL_ART.lug} tone="mid" crease="faint" />
    <Solid paths={DIAL_ART.plug} tone="mid" crease="faint" />
    <Line d={DIAL_ART.bezel} tone="lo" />
    <Line d={DIAL_ART.ticks.minor} tone="lo" />
    <Line d={DIAL_ART.ticks.major} tone="mid" />
    <Line d={DIAL_ART.limit} tone="red" />
  </g>
);

const DIAL_HUB = <Line key="hub" d={DIAL_ART.hub} tone="mid" />;

const RECEIVER_BACK = (
  <g key="receiver-back">
    <path className="iso-halo" d={RECEIVER_ART.halo} />
    <Solid paths={RECEIVER_ART.floor} tone="mid" crease="faint" />
    <Line d={RECEIVER_ART.floorLine} tone="faint" />
    <Solid paths={RECEIVER_ART.back} tone="mid" crease="faint" />
    <Solid paths={RECEIVER_ART.left} tone="mid" crease="faint" />
    {RECEIVER_ART.bosses.map((paths, index) => (
      <Solid key={`o${index}`} paths={paths} tone="mid" crease="faint" />
    ))}
    <Line d={RECEIVER_ART.bossHoles} tone="lo" />
    {RECEIVER_ART.standoffs.map((paths, index) => (
      <Solid key={`s${index}`} paths={paths} tone="lo" crease="none" />
    ))}
    <Solid paths={RECEIVER_ART.devkit} tone="lo" crease="lo" />
    <Line d={RECEIVER_ART.trace} tone="lo" />
    {RECEIVER_ART.headers.map((paths, index) => (
      <Solid key={`h${index}`} paths={paths} tone="lo" crease="none" />
    ))}
    <Dots points={RECEIVER_ART.pins} size={0.42} tone="hi" />
    <Solid paths={RECEIVER_ART.can} tone="mid" crease="faint" />
    <Line d={RECEIVER_ART.canLine} tone="faint" />
    <Solid paths={RECEIVER_ART.usb} tone="mid" crease="faint" />
    {RECEIVER_ART.keys.map((paths, index) => (
      <Solid key={`k${index}`} paths={paths} tone="mid" crease="none" />
    ))}
    <Solid paths={RECEIVER_ART.rfm} tone="lo" crease="lo" />
    <Dots points={RECEIVER_ART.rfmPads} size={0.4} tone="hi" />
    <Solid paths={RECEIVER_ART.rfmCan} tone="mid" crease="faint" />
    <Solid paths={RECEIVER_ART.ufl} tone="mid" crease="none" />
    <Line d={RECEIVER_ART.pigtail} tone="mid" />
    {RECEIVER_ART.jumpers.map((d, index) => (
      <Line key={`j${index}`} d={d} tone="mid" />
    ))}
    {RECEIVER_ART.leads.map((d, index) => (
      <Line key={`l${index}`} d={d} tone="lo" />
    ))}
  </g>
);

const BUZZER = (
  <g key="buzzer">
    <Solid paths={RECEIVER_ART.buzzer} tone="hi" crease="lo" className="lr-buzzer" inner={<Line d={RECEIVER_ART.buzzerSeam} tone="faint" />} />
    <Line d={RECEIVER_ART.buzzerRing} tone="lo" />
    <Line d={RECEIVER_ART.buzzerHole} tone="mid" />
  </g>
);

const RECEIVER_FRONT = (
  <g key="receiver-front">
    <Solid paths={RECEIVER_ART.right} tone="mid" crease="faint" />
    <Solid paths={RECEIVER_ART.smaNut} tone="mid" crease="faint" />
    <Solid paths={RECEIVER_ART.smaBody} tone="mid" crease="faint" />
    <Solid paths={RECEIVER_ART.knuckle} tone="mid" crease="none" />
    <Solid paths={RECEIVER_ART.sleeve} tone="mid" crease="faint" />
    <Solid paths={RECEIVER_ART.whip} tone="lo" crease="none" inner={<Line d={RECEIVER_ART.whipRings} tone="faint" />} />
    <Solid paths={RECEIVER_ART.whipTip} tone="lo" crease="faint" />
    <Solid paths={RECEIVER_ART.front} tone="mid" crease="faint" />
    <Line d={RECEIVER_ART.ledRing} tone="lo" />
    <circle className="lr-power" cx={RECEIVER_ART.led[0][0]} cy={RECEIVER_ART.led[0][1]} r={0.8} />
  </g>
);

const COVER = (
  <g key="cover">
    <path className="iso-halo" d={COVER_ART.plate.fill} />
    <Solid paths={COVER_ART.plate} tone="mid" crease="faint" />
    <Line d={COVER_ART.floorLine} tone="faint" />
    <Solid paths={COVER_ART.back} tone="mid" crease="faint" />
    <Solid paths={COVER_ART.left} tone="mid" crease="faint" />
    {COVER_ART.posts.map((paths, index) => (
      <Solid key={index} paths={paths} tone="mid" crease="faint" />
    ))}
    <Line d={COVER_ART.postHoles} tone="lo" />
    <Dots points={COVER_ART.holes} size={0.7} tone="lo" />
    <Line d={COVER_ART.window} tone="lo" />
    <Solid paths={COVER_ART.right} tone="mid" crease="faint" />
    <Solid paths={COVER_ART.front} tone="mid" crease="faint" />
  </g>
);

const PHONE_BACK = (
  <g key="phone-back">
    <path className="iso-halo" d={PHONE_ART.halo} />
    <Solid paths={PHONE_ART.stand} tone="mid" crease="faint" />
    <Line d={PHONE_ART.standLine} tone="faint" />
    <Solid paths={PHONE_ART.rest} tone="mid" crease="faint" />
    <Solid paths={PHONE_ART.body} tone="mid" crease="faint" />
    {PHONE_ART.keys.map((paths, index) => (
      <Solid key={index} paths={paths} tone="mid" crease="none" />
    ))}
  </g>
);

const PHONE_FRONT = (
  <g key="phone-front">
    <Line d={PHONE_ART.window} tone="lo" />
    <Line d={PHONE_ART.speaker} tone="lo" />
    <Dots points={PHONE_ART.camera} size={0.6} tone="mid" />
    <Solid paths={PHONE_ART.lip} tone="mid" crease="faint" />
  </g>
);

export function LoraArt() {
  return (
    <LoraLive
      bench={BENCH_ART}
      power={POWER}
      standBack={STAND_BACK}
      sled={SLED}
      dial={DIAL}
      dialHub={DIAL_HUB}
      receiverBack={RECEIVER_BACK}
      buzzer={BUZZER}
      receiverFront={RECEIVER_FRONT}
      cover={COVER}
      phoneBack={PHONE_BACK}
      phoneFront={PHONE_FRONT}
    />
  );
}

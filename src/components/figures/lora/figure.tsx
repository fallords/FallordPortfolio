import { Plate } from "../../iso/react/draw";
import { LoraArt } from "./art";
import { ALARM_S, BUTTON_SMV, FALL_PEAK, RESTING, RSSI, THRESHOLD, packetOf, rangeOf } from "./model";
import "../../iso/iso.css";
import "./lora.css";

/** The fall alert system as one bench you can work: drop the wearable, or press its button. */
export function LoraFigure() {
  return (
    <div className="iso lr-figure">
      <Plate
        fig="Fig 1"
        title="Waist to phone"
        hint="Tap the wearable or its red button"
        readout={RESTING}
        keys={[
          { mark: "lit", label: "What is working right now" },
          { mark: "red", label: `The fall threshold, ${THRESHOLD} m/s²` },
          { mark: "dim", label: "The packet crossing the room at 922 MHz" },
        ]}
        caption={`The wearable on a drop stand, wired to a meter that reads the magnitude it computes. Dropped, it peaks at ${FALL_PEAK} m/s², above the ${THRESHOLD} threshold, and sends ${packetOf("fall")} over LoRa. The receiver hears it at ${RSSI} dBm (${rangeOf(RSSI)}, near), beeps twice over and over for ${ALARM_S} seconds, and posts the event to the server; the staff's phone shows it on its next refresh. The red button sends ${packetOf("button")} instead (${BUTTON_SMV} m/s², nothing fell) and one long beep. The numbers are from the thesis tests.`}
      >
        <LoraArt />
      </Plate>
    </div>
  );
}

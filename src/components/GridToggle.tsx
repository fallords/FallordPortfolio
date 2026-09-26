"use client";

import { TOGGLE_GRID_EVENT } from "./GridOverlay";

export default function GridToggle() {
    return (
        <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(TOGGLE_GRID_EVENT))}
            className="link hidden md:inline"
        >
            Show grid <kbd className="font-mono">G</kbd>
        </button>
    );
}

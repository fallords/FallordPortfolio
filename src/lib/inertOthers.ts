/**
 * For a dialog: makes everything else in <body> inert (it can't be clicked,
 * focused or read out), so Tab and a screen reader stay inside the dialog
 * instead of wandering onto the page behind it. `keep` must be a direct child
 * of <body>, as a portal or a top-level overlay is.
 *
 * Returns the undo. It only restores what it changed, so one dialog opened
 * over another leaves the first one's work in place.
 */
export default function inertOthers(keep: Element | null) {
    const others = [...document.body.children].filter(
        (el): el is HTMLElement => el !== keep && el instanceof HTMLElement && !el.inert
    );
    others.forEach((el) => (el.inert = true));
    return () => others.forEach((el) => (el.inert = false));
}

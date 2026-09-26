/*
 * How far the hero portrait has got with its first frames, 0 to 1, for the
 * intro screen to wait on. A module-level value rather than context: the
 * portrait and the intro sit in different parts of the tree, and only the
 * intro ever reads it.
 */
type Listener = (progress: number) => void;

let progress = 0;
const listeners = new Set<Listener>();

export function reportPortraitProgress(value: number) {
    progress = Math.max(progress, Math.min(1, value));
    listeners.forEach((listener) => listener(progress));
}

/** Calls `listener` now with the current value, then on every change. */
export function onPortraitProgress(listener: Listener) {
    listeners.add(listener);
    listener(progress);
    return () => {
        listeners.delete(listener);
    };
}

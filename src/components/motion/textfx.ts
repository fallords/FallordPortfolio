/*
 * The two ways the reference brings words in, done to the values of the
 * existing text nodes only, never to the nodes themselves, so React's hold
 * on them is untouched. Each one ends by putting the text back exactly as
 * it was, and an element already running is left to finish.
 *
 * `decode`: the letters settle left to right out of random glyphs, in about
 * half a second. For short monospaced readouts.
 *
 * `shuffle`: every word starts with its own letters jumbled, and each letter
 * finds its place at random as the time runs out. For running text, where
 * the words keep their length and the lines never move.
 */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_";

/** One frame of an effect: the node's letters (code points) at time t (0 to 1). */
type Step = (chars: string[], t: number, now: number, offset: number, total: number) => string;

const running = new Map<Element, () => void>();

function play(el: Element, duration: number, step: Step) {
    if (running.has(el)) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    const texts = nodes.map((n) => n.nodeValue ?? "");
    const chars = texts.map((text) => [...text]);
    const total = chars.reduce((sum, c) => sum + c.length, 0);
    if (!total) return;

    let frame = 0;
    const restore = () => {
        cancelAnimationFrame(frame);
        nodes.forEach((n, i) => (n.nodeValue = texts[i]));
        running.delete(el);
    };
    running.set(el, restore);
    const start = performance.now();
    const tick = (now: number) => {
        const t = (now - start) / duration;
        if (t >= 1) return restore();
        let at = 0;
        nodes.forEach((n, k) => {
            n.nodeValue = step(chars[k], t, now, at, total);
            at += chars[k].length;
        });
        frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
}

export function decode(el: Element) {
    play(el, 560, (chars, t, now, offset, total) => {
        const settled = Math.floor(t * total);
        const seed = Math.floor(now / 45);
        return chars
            .map((ch, j) => {
                const i = offset + j;
                return i < settled || !/[A-Za-z0-9]/.test(ch) ? ch : GLYPHS[(seed * 7 + i * 13) % GLYPHS.length];
            })
            .join("");
    });
}

/** A word's letters in a random order (Fisher–Yates). */
function jumble(word: string[]) {
    const out = word.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

export function shuffle(el: Element) {
    play(el, 750, (chars, t) => {
        let out = "";
        let word: string[] = [];
        const flush = () => {
            const mixed = jumble(word);
            word.forEach((ch, c) => (out += Math.random() < t ? ch : mixed[c]));
            word = [];
        };
        for (const ch of chars) {
            if (/\s/.test(ch)) {
                flush();
                out += ch;
            } else word.push(ch);
        }
        flush();
        return out;
    });
}

/** Puts every running text back at once (a route change, an unmount). */
export function finishAll() {
    [...running.values()].forEach((restore) => restore());
}

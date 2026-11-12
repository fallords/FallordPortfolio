import type { CSSProperties } from "react";

/*
 * Text cut into pieces that each rise out of their own mask (motion.css).
 * The cut is made here, on the server, so nothing is rewritten in the
 * browser: the pieces are in the HTML, the whole text is read out once from
 * a visually hidden copy, and the pieces are hidden from assistive tech.
 *
 * `Chars` is for a heading of one to three words (and the address in
 * Contact, one word); `Words` for anything longer. Each piece carries its
 * place in the order as --i, which the CSS turns into a stagger. It sits on
 * the mask, so both the rise inside it and the signal flicker on it
 * (motion.css, data-flicker) read the same order.
 */
const piece = (i: number) => ({ "--i": i }) as CSSProperties;

export function Chars({ text, start = 0 }: { text: string; start?: number }) {
    let i = start;
    return (
        <>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">
                {text.split(" ").map((word, w) => (
                    <span key={w}>
                        {w > 0 && " "}
                        {/* A word's letters never part across a line break. */}
                        <span className="whitespace-nowrap">
                            {[...word].map((ch) => (
                                <span key={i} className="split-m" style={piece(i++)}>
                                    <span>{ch}</span>
                                </span>
                            ))}
                        </span>
                    </span>
                ))}
            </span>
        </>
    );
}

export function Words({ text, className = "" }: { text: string; className?: string }) {
    return (
        <>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">
                {text.split(" ").map((word, i) => (
                    <span key={i}>
                        {i > 0 && " "}
                        <span className="split-m" style={piece(i)}>
                            <span className={className}>{word}</span>
                        </span>
                    </span>
                ))}
            </span>
        </>
    );
}

/*
 * A figure whose digits roll up to their value as it comes into view. Each
 * digit is a column of 0–9 twice over, stopped at the second run's value,
 * so even a 0 turns over once. Without scroll-driven animations, or with
 * motion turned down, the columns simply rest on their value.
 */
export function Roll({ value }: { value: string }) {
    let col = 0;
    return (
        <>
            <span className="sr-only">{value}</span>
            <span aria-hidden="true" className="roll">
                {[...value].map((ch, i) =>
                    /\d/.test(ch) ? (
                        <span key={i} className="roll-col">
                            <span className="roll-strip" style={{ "--d": ch, "--i": col++ } as CSSProperties}>
                                {Array.from({ length: 20 }, (_, n) => (
                                    <span key={n}>{n % 10}</span>
                                ))}
                            </span>
                        </span>
                    ) : (
                        <span key={i}>{ch}</span>
                    )
                )}
            </span>
        </>
    );
}

/*
 * A statement that fills from part-ink to full ink, word by word, as it
 * rises through the screen. It reads whole before it fills; the fill only
 * sets the pace.
 */
export function Fill({ text }: { text: string }) {
    return (
        <>
            {text.split(" ").map((word, i) => (
                <span key={i}>
                    {i > 0 && " "}
                    <span className="fill-w">{word}</span>
                </span>
            ))}
        </>
    );
}

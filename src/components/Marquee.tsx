import "./marquee.css";

const WORDS = ["Web apps", "AI tools", "Firmware", "UI design"];
/* Enough copies of the four words to stay wider than the screen at both ends of the travel. */
const COPIES = [0, 1, 2, 3];

function Mark() {
    return (
        <svg className="mq-mark" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="33" />
            <path d="M16 16l17 17M84 16L67 33M16 84l17-17M84 84L67 67" />
        </svg>
    );
}

function Row({ outline = false }: { outline?: boolean }) {
    return (
        <div className="mq-row" data-outline={outline || undefined}>
            <div className="mq-track">
                {COPIES.map((copy) =>
                    WORDS.map((word) => (
                        <span key={`${copy}-${word}`} className="mq-item">
                            {word}
                            <Mark />
                        </span>
                    ))
                )}
            </div>
        </div>
    );
}

/**
 * A band of the four things he builds, at the size of a title, between the
 * projects and the log. It is moved by the scroll and by nothing else: the
 * two rows slide past each other as the band crosses the screen (a
 * scroll-driven animation, so there is no script and nothing runs at rest),
 * and they lean into the scroll while it is fast (`--vel`, set by HudFrame).
 *
 * Decoration: the same words are said in the hero and in What I do, so it
 * is hidden from assistive tech. Without scroll-driven animations, or with
 * motion turned down, the rows simply sit there.
 */
export default function Marquee() {
    return (
        <div aria-hidden="true" className="mq" data-vel>
            <Row />
            <Row outline />
        </div>
    );
}

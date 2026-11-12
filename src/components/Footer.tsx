import { LocalStamp } from "./LocalTime";
import { Chars } from "./motion/Split";
import { EMAIL, SOCIALS } from "@/lib/site";
import "./footer.css";

/*
 * The page ends on a field of its green, the way the reference closes: a
 * hard cut from the dark, the ink turned black (footer.css swaps the
 * tokens), three columns of readouts headed in square brackets the way the
 * reference heads them ("[ Contact ]", its items lettered "a:" and "b:",
 * each link a row with its arrow at the far end), the date and time in
 * Indonesia stamped beside them under a three-square signal, and under it all the name
 * across the full width (its size is the row's width over the name's own
 * width-to-size ratio, 5.72 in Inter 500), rising letter by letter as the
 * page runs out.
 */
export default function Footer({ curtain = false }: { curtain?: boolean }) {
    return (
        // `curtain`: on the home page the footer waits under the page and is uncovered as the page ends (footer.css).
        <footer className="footer-field overflow-clip" data-curtain={curtain || undefined}>
            {/* The last row clears the home indicator on phones that have one. */}
            <div className="shell @container pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10 md:pt-14">
                <div className="grid-12 gap-y-8">
                    <div className="col-span-4 md:col-span-3">
                        <p className="label footer-head">[ Contact ]</p>
                        <ul className="label mt-3 grid gap-1.5">
                            <li className="footer-item">
                                <span aria-hidden="true" className="footer-key">
                                    a:
                                </span>
                                <a href={`mailto:${EMAIL}`} className="link" data-cursor="Write">
                                    {EMAIL}
                                </a>
                            </li>
                            <li className="footer-item">
                                <span aria-hidden="true" className="footer-key">
                                    b:
                                </span>
                                Indonesia, UTC+7
                            </li>
                        </ul>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                        <p className="label footer-head">[ Social ]</p>
                        <ul className="label mt-3 grid gap-1.5">
                            {SOCIALS.map((s) => (
                                <li key={s.label}>
                                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="footer-row" data-flick>
                                        {s.label} <span aria-hidden="true">↗</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                        <p className="label footer-head">[ Site ]</p>
                        <ul className="label mt-3 grid gap-1.5">
                            <li>
                                <a href="#top" className="footer-row" data-flick>
                                    Back to top <span aria-hidden="true">↑</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="col-span-4 md:col-span-3 md:text-right">
                        <p className="footer-stamp">
                            <span aria-hidden="true" className="footer-signal">
                                <i />
                                <i />
                                <i />
                            </span>
                            <span>©</span>
                            <LocalStamp className="contents" />
                        </p>
                        <p data-decode className="label mt-2">
                            Fadhlan Bani
                            <br />
                            Next.js · Inter · Geist Mono
                        </p>
                    </div>
                </div>
                <p aria-hidden="true" data-reveal="entry" data-vel className="footer-name display mt-14 whitespace-nowrap text-[calc(100cqw/5.8)] leading-[0.74] text-[var(--fg)] md:mt-20">
                    <Chars text="Fadhlan Bani" />
                </p>
            </div>
        </footer>
    );
}

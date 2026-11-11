import GridToggle from "./GridToggle";
import { Chars } from "./motion/Split";
import { EMAIL, SOCIALS } from "@/lib/site";
import "./footer.css";

/*
 * The page ends on a field of its green, the way the reference closes: a
 * hard cut from the dark, the ink turned black (footer.css swaps the
 * tokens), three columns of readouts in brackets, and under them the name
 * across the full width (its size is the row's width over the name's own
 * width-to-size ratio, 5.72 in Inter 500), rising letter by letter as the
 * page runs out.
 */
export default function Footer() {
    return (
        <footer className="footer-field overflow-clip">
            {/* The last row clears the home indicator on phones that have one. */}
            <div className="shell @container pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10 md:pt-14">
                <div className="grid-12 gap-y-8">
                    <div className="col-span-4 md:col-span-3">
                        <p className="label footer-head">(Contact)</p>
                        <a href={`mailto:${EMAIL}`} className="label link mt-3 inline-block">
                            {EMAIL}
                        </a>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                        <p className="label footer-head">(Social)</p>
                        <ul className="label mt-3 grid gap-1.5">
                            {SOCIALS.map((s) => (
                                <li key={s.label}>
                                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="link">
                                        {s.label} ↗
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                        <p className="label footer-head">(Site)</p>
                        <ul className="label mt-3 grid gap-1.5">
                            <li>
                                <a href="#top" className="link">
                                    Back to top ↑
                                </a>
                            </li>
                            <li>
                                <GridToggle />
                            </li>
                        </ul>
                    </div>
                    <p data-decode className="label col-span-4 md:col-span-3 md:text-right">
                        © {new Date().getFullYear()} Fadhlan Bani
                        <br />
                        Next.js · Inter · Geist Mono
                    </p>
                </div>
                <p aria-hidden="true" data-reveal="entry" className="display mt-14 whitespace-nowrap text-[calc(100cqw/5.8)] leading-[0.74] text-[var(--fg)] md:mt-20">
                    <Chars text="Fadhlan Bani" />
                </p>
            </div>
        </footer>
    );
}

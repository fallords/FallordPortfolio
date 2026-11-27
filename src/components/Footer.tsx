import { EMAIL, SOCIALS } from "@/lib/site";

/*
 * The page ends quietly, in the page's own dark: one row under a rule, the name and year on the left, the email,
 * the social links and the way back to the top on the right (stacked on a phone).
 */
export default function Footer() {
    return (
        <footer className="border-t border-[var(--rule)] bg-[var(--surface)]">
            {/* The row clears the home indicator on phones that have one. */}
            <div className="shell label flex flex-col gap-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-[var(--fg-dim)] md:flex-row md:items-center md:justify-between">
                <p>
                    <span className="text-[var(--fg)]">Fadhlan Bani</span> © {new Date().getFullYear()}
                </p>
                <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <li>
                        <a href={`mailto:${EMAIL}`} className="link" data-cursor="Write">
                            {EMAIL}
                        </a>
                    </li>
                    {SOCIALS.map((s) => (
                        <li key={s.label}>
                            <a href={s.href} target="_blank" rel="noopener noreferrer" className="link">
                                {s.label} <span aria-hidden="true">↗</span>
                            </a>
                        </li>
                    ))}
                    <li>
                        <a href="#top" className="link">
                            Back to top <span aria-hidden="true">↑</span>
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
    );
}

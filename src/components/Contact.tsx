import Section from "./Section";
import CopyEmail from "./CopyEmail";
import { EMAIL, SOCIALS } from "@/lib/site";

export default function Contact() {
    return (
        <Section
            id="contact"
            padding="py-16"
            title="Contact"
            intro={<>Want to work together, or just ask something? Send me an email.</>}
            className="bg-[var(--cloak)]"
        >
            <a
                href={`mailto:${EMAIL}`}
                // Sized to the screen so the address fits on one line down to
                // ~340px; below that it may break, but only after the "@".
                className="inline-block font-display text-[clamp(1.5rem,7vw,3.25rem)] font-bold leading-tight tracking-[-0.03em] text-[var(--fg)] underline decoration-[var(--rule-strong)] decoration-1 underline-offset-[0.2em] transition-colors hover:decoration-[var(--gold)]"
            >
                {EMAIL.split("@")[0]}@<wbr />
                {EMAIL.split("@")[1]}
            </a>

            <ul className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
                <li>
                    <CopyEmail />
                </li>
                {SOCIALS.map((s) => (
                    <li key={s.label}>
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className="link text-[var(--fg-muted)]">
                            {s.label} ↗
                        </a>
                    </li>
                ))}
            </ul>
        </Section>
    );
}

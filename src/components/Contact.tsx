import type { CSSProperties } from "react";
import Section from "./Section";
import CopyEmail from "./CopyEmail";
import ContactForm from "./ContactForm";
import GlobeBackdrop from "./GlobeBackdrop";
import { Chars } from "./motion/Split";
import { EMAIL, SOCIALS } from "@/lib/site";
import "./contact.css";

/*
 * The last chapter, big type over a 3D field the way launch pages close: the
 * globe turning behind, signals arcing out from Indonesia; over it the
 * address in green, rising letter by letter, and a short form that writes
 * the email for you and opens it in your mail app.
 */
export default function Contact() {
    const [name, host] = EMAIL.split("@");
    return (
        <Section id="contact" index="06" title="Contact" meta="Open to work" wide>
            {/* The globe turning behind the words (GlobeBackdrop); the words over it. */}
            <div className="relative">
                <GlobeBackdrop />
                <div className="relative z-[1] grid gap-12 lg:grid-cols-12 lg:gap-6">
                    <div className="min-w-0 lg:col-span-6">
                        <p className="max-w-[30rem] text-pretty text-[length:var(--step-lead)] leading-[1.3] text-[var(--fg)]">
                            Want to work together, or just ask something? Send me an email.
                        </p>
                        <a
                            data-reveal
                            data-cursor="Write"
                            aria-label={EMAIL}
                            style={{ "--step": "0.9%" } as CSSProperties}
                            href={`mailto:${EMAIL}`}
                            // Sized to the screen so the address fits on one line down to
                            // ~360px; below that it may break, but only after the "@".
                            className="contact-address display mt-8 inline-block leading-[1]"
                        >
                            <Chars text={`${name}@`} />
                            <wbr />
                            <Chars text={host} start={name.length + 1} />
                        </a>

                        <ul className="label mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
                            <li>
                                <CopyEmail />
                            </li>
                            {SOCIALS.map((s) => (
                                <li key={s.label}>
                                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="link text-[var(--fg)]">
                                        {s.label} ↗
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="contact-form-box min-w-0 lg:col-span-4 lg:col-start-9">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </Section>
    );
}

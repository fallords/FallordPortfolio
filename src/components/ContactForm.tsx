"use client";

import { useId, useState, type FormEvent } from "react";
import { EMAIL } from "@/lib/site";

/**
 * A short form that writes the email for you: your name and your message
 * become the subject and the body, and the button opens it in your own mail
 * app to send. Nothing is sent from this page and nothing is stored; there
 * is no server behind it. Only the message is required.
 */
export default function ContactForm() {
    const id = useId();
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!message.trim()) return;
        const subject = name.trim() ? `Hello from ${name.trim()}` : "Hello from your portfolio";
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message.trim())}`;
    };

    return (
        <form onSubmit={onSubmit} className="contact-form" aria-labelledby={`${id}-title`}>
            <p id={`${id}-title`} className="label text-[var(--fg)]">
                Write it here
            </p>
            <label htmlFor={`${id}-name`} className="label contact-label">
                Your name
            </label>
            <input id={`${id}-name`} name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="contact-input" />
            <label htmlFor={`${id}-message`} className="label contact-label">
                Message
            </label>
            <textarea
                id={`${id}-message`}
                name="message"
                required
                rows={4}
                aria-describedby={`${id}-note`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="contact-input resize-none"
            />
            <p id={`${id}-note`} className="contact-note">
                Opens in your mail app, ready to send.
            </p>
            <button type="submit" className="contact-send label">
                Write the email <span aria-hidden="true">→</span>
            </button>
        </form>
    );
}

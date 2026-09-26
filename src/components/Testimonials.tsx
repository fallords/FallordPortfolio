import Section from "./Section";

const testimonials = [
    {
        quote: "Fadhlan perfectly bridged the gap between our design team's wild ideas and the technical reality. The final product is a masterpiece.",
        author: "Ilham F.",
        role: "CEO, Forteza",
    },
    {
        quote: "Working with Fadhlan was a smooth experience from start to finish. He truly listened to what we needed and delivered something beyond our expectations.",
        author: "Anshar A.",
        role: "Stakeholder, PT Agni Persada",
    },
];

export default function Testimonials() {
    return (
        <Section index="05" title="What clients say">
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-9">
                {testimonials.map((t, i) => (
                    <figure key={t.author} className={`m-0 md:col-span-4 ${i % 2 ? "md:col-start-6" : ""}`}>
                        <blockquote className="font-serif text-xl font-medium leading-snug text-[var(--fg-soft)] md:text-[1.75rem]">
                            &ldquo;{t.quote}&rdquo;
                        </blockquote>
                        <figcaption className="mt-6 text-sm">
                            <span className="text-[var(--fg)]">{t.author}</span>
                            <span className="text-[var(--fg-dim)]"> · {t.role}</span>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </Section>
    );
}

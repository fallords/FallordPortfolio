import Section from "./Section";
import MultiView from "./MultiView";
import "./bento.css";

/*
 * Each capability carries the tools it is done with, so there is no separate
 * "Tools I use" list to cross-reference. All sixteen tools are here, each
 * under the one place it is used. `work` is where it was done, read off the
 * Work and Experience entries; nothing here is claimed that is not there.
 */
const services: { title: string; desc: string; tools: string[]; work: [string, string][] }[] = [
    {
        title: "Code",
        desc: "I write software in TypeScript, Python and C++: web apps and the servers behind them, tools built on AI models, and firmware for small boards.",
        tools: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        work: [
            ["Free AI CV Maker", "A Next.js app that lays a CV out on A4 pages as you type, saved as a PDF with selectable text."],
            ["S.E.R.A.", "A Flask app that reads pasted chats and screenshots and writes up the patterns in them."],
        ],
    },
    {
        title: "Design",
        desc: "Before I write any code, I work out the layout, the screens and what happens between them, usually in Figma.",
        tools: ["Figma"],
        work: [
            ["LMS Jabar", "Prototyped in Figma before it was built and deployed in Next.js."],
            ["Ministry of Transportation", "A redesign of the public website: new content, the agency's colours, a layout for every screen size."],
        ],
    },
    {
        title: "Systems",
        desc: "Behind the screens, I plan APIs and databases (with DFDs and ERDs), set up Linux servers, and test things properly before they go live.",
        tools: ["PHP", "MySQL", "Linux (Ubuntu, Apache)", "Vercel"],
        work: [
            ["LMS Jabar and Sipalawa", "Documented with DFDs and use case diagrams, built with cross-functional teams for government use."],
            ["Fall Alert Wearable", "The receiver posts every event to a PHP and MySQL server, and the staff see it on a web page."],
        ],
    },
    {
        title: "AI",
        desc: "Adding AI to a product: chat, text generation, reading images, and connecting to LLM APIs like Gemini.",
        tools: ["Python", "LLM APIs", "Google Gemini"],
        work: [
            ["S.E.R.A.", "Gemini reads both text and screenshots; if one model fails, it tries the next of four."],
            ["AI Evaluator, Outlier", "Tested AI models' responses for accuracy, relevance, instruction following and reasoning."],
        ],
    },
    {
        title: "Hardware",
        desc: "I program ESP32 boards in C++, wire up sensors, and send their data over LoRa to a server and a web dashboard. I’ve put this together and tested it on real hardware.",
        tools: ["ESP32", "Arduino (C++)", "LoRa", "MPU6050"],
        work: [
            ["Fall Alert Wearable", "An ESP32-C3 with an MPU6050 and a LoRa radio at 922 MHz; a fall over 23.1 m/s² raises the alarm."],
            ["Drop test", "Built and tested on real hardware: the drop test peaked at 58.25 m/s²."],
        ],
    },
];

/* The 3D object that stands for each capability (three/models.ts), in the same order. */
const MODEL = ["code", "design", "systems", "ai", "hardware"] as const;

/* The grid's shape on a wide screen: Code wide on the first row beside Design, the other three under them. */
const SPAN = ["lg:col-span-4", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];

/**
 * Five capabilities as a bento grid, the way product launch pages lay out features: each card has its own object
 * turning in 3D (one canvas over the whole grid, MultiView), which spins up and leans to the pointer while the card
 * is pointed at; under it what it is, where it was done and the tools. Cards rise in as the grid comes up.
 */
export default function About() {
    return (
        <Section id="about" index="03" title="What I do" meta={`${services.length} areas`} wide>
            <div className="relative grid gap-3 md:grid-cols-2 lg:grid-cols-6">
                {services.map((service, i) => (
                    <article key={service.title} data-view-card={i} className={`bento-card viewport enter-rise ${SPAN[i]}`}>
                        <div aria-hidden="true" data-view={i} className={`bento-art ${i === 0 ? "bento-art-wide" : ""}`} />
                        <div className="bento-text">
                            <p aria-hidden="true" className="label text-[var(--accent)]">
                                {String(i + 1).padStart(2, "0")}
                            </p>
                            <h3 className="display mt-1 text-[1.75rem] leading-[1] text-[var(--fg)]">{service.title}</h3>
                            <p className="mt-3 text-pretty text-sm leading-relaxed text-[var(--fg-soft)]">{service.desc}</p>
                            <p className="mt-3 text-pretty text-[13px] leading-relaxed text-[var(--fg-muted)]">
                                <span className="text-[var(--fg-dim)]">Done in </span>
                                {service.work.map(([name]) => name).join(", ")}
                            </p>
                            {/* Non-breaking spaces keep each tool's name whole ("Tailwind CSS"). */}
                            <p className="label mt-4 text-[var(--fg-dim)]">{service.tools.map((tool) => tool.replaceAll(" ", " ")).join(" · ")}</p>
                        </div>
                    </article>
                ))}
                <MultiView models={[...MODEL]} />
            </div>
        </Section>
    );
}

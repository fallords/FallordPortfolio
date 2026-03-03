"use client";


export default function Marquee() {
    const items = [
        "Next.js", "React", "TypeScript", "TailwindCSS", "Framer Motion",
        "Python", "Figma", "AI Integration", "REST APIs", "UI/UX Design"
    ];



    const MarqueeTrack = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
        <div className="shrink-0 flex items-center" aria-hidden={ariaHidden || undefined}>
            {items.map((item, i) => (
                <span key={i} className="flex items-center shrink-0">
                    <span className="hoverable font-heading font-bold uppercase tracking-tighter text-5xl md:text-8xl text-transparent [-webkit-text-stroke:2px_#555] px-4 shrink-0 transition-all duration-300 hover:text-white hover:[-webkit-text-stroke:0px] hover:scale-110 cursor-default inline-block">
                        {item}
                    </span>
                    <span className="text-zinc-700 text-2xl mx-2 select-none shrink-0">•</span>
                </span>
            ))}
        </div>
    );

    return (
        <section className="py-10 md:py-16 bg-black text-white overflow-hidden border-y border-white/5 relative">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

            <div
                className="inline-flex whitespace-nowrap animate-marquee"
                style={{ willChange: "transform" }}
            >
                <MarqueeTrack />
                <MarqueeTrack ariaHidden />
            </div>
        </section>
    );
}

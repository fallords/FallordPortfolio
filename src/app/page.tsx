import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Works, { PROJECT_COUNT } from "@/components/Works";
import Figures from "@/components/Figures";
import { experience } from "@/content/experience";
import { certifications } from "@/content/certifications";
import Experience from "@/components/Experience";
import About from "@/components/About";
import Certifications from "@/components/Certifications";
import Writing from "@/components/Writing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import ErrorBoundary from "@/components/ErrorBoundary";
import FallbackNotice from "@/components/FallbackNotice";

/*
 * The figures quoted by the held scene after Experience. Every one is read
 * from the page's own content, except two that are constants elsewhere: the
 * portrait's frame count (Portrait.tsx, TOTAL) and the wearable's fall
 * threshold and drop-test peak (Works.tsx, the thesis's own numbers).
 */
const since = experience.at(-1)?.start.slice(-4) ?? "";
const issuers = new Set(certifications.map((c) => c.issuer)).size;
const figures = [
    { name: "Projects", value: String(PROJECT_COUNT), caption: "Projects on this page. Two are live web apps; one is the wearable from my thesis." },
    { name: "Roles", value: String(experience.length), caption: `Roles since ${since}, from internships to contract work.` },
    { name: "Certificates", value: String(certifications.length), caption: `Certificates, from ${issuers} institutions.` },
    { name: "Frames", value: "181", caption: "Frames in the head turn at the top of this page." },
    { name: "Fall threshold", value: "23.1", unit: "m/s²", caption: "The jolt my wearable reads as a fall. In the drop test it peaked at 58.25." },
];

export default function Home() {
    return (
        <>
            <main>
                <Hero />
                <Statement />
                <Works />
                <Experience />
                <Figures items={figures} />
                {/* The two sections run in the browser; if one fails, it says so in its place and the rest stays. */}
                <ErrorBoundary
                    fallback={
                        <Section id="about" index="03" title="What I do">
                            <FallbackNotice message="This section couldn’t be shown just now." />
                        </Section>
                    }
                >
                    <About />
                </ErrorBoundary>
                <ErrorBoundary
                    fallback={
                        <Section id="certificates" index="04" title="Certificates">
                            <FallbackNotice message="The certificates couldn’t be shown just now." />
                        </Section>
                    }
                >
                    <Certifications />
                </ErrorBoundary>
                <Writing />
                <Contact />
            </main>
            <Footer />
        </>
    );
}

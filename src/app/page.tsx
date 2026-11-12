import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Works from "@/components/Works";
import DotField from "@/components/DotField";
import Experience from "@/components/Experience";
import About from "@/components/About";
import Certifications from "@/components/Certifications";
import Writing from "@/components/Writing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import ErrorBoundary from "@/components/ErrorBoundary";
import FallbackNotice from "@/components/FallbackNotice";

export default function Home() {
    return (
        <>
            {/* The page is a sheet over the footer: as it ends, it lifts off and the footer is found waiting under it (globals.css, .page-main). */}
            <main className="page-main">
                <ErrorBoundary fallback={null}>
                    <DotField />
                </ErrorBoundary>
                <Hero />
                <Statement />
                <Works />
                <Experience />
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
            <Footer curtain />
        </>
    );
}

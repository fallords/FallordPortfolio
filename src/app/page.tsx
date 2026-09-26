import Hero from "@/components/Hero";
import Works from "@/components/Works";
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
            <main>
                <Hero />
                <Works />
                {/* The two sections run in the browser; if one fails, it says so in its place and the rest stays. */}
                <ErrorBoundary
                    fallback={
                        <Section id="about" index="02" title="What I do">
                            <FallbackNotice message="This section couldn't be shown just now." />
                        </Section>
                    }
                >
                    <About />
                </ErrorBoundary>
                <ErrorBoundary
                    fallback={
                        <Section id="certificates" index="03" title="Certificates">
                            <FallbackNotice message="The certificates couldn't be shown just now." />
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

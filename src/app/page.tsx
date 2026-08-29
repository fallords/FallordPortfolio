import SequenceScroll from "@/components/SequenceScroll";
import GradientDivider from "@/components/GradientDivider";
import Works from "@/components/Works";
import About from "@/components/About";
import Services from "@/components/Services";
import Writing from "@/components/Writing";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-[var(--surface)] text-white selection:bg-white/20">
      <SequenceScroll />
      <div className="relative z-10 w-full bg-[var(--surface)]">
        <GradientDivider />
        <Works />
        {/*
         * Writing follows About because About ends with the certificates.
         * Coursework and essays are the same claim — what he has studied
         * outside the code — and they read better as one stretch than split
         * by the services pitch.
         */}
        <About />
        <Writing />
        <Services />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}

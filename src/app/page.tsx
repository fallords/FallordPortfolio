import SequenceScroll from "@/components/SequenceScroll";
import Works from "@/components/Works";
import About from "@/components/About";
import Services from "@/components/Services";
import Marquee from "@/components/Marquee";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-black text-white selection:bg-white/20">
      <SequenceScroll />
      <div className="relative z-10 w-full bg-[#0a0a0a]">
        <Works />
        <About />
        <Services />
        <Marquee />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}

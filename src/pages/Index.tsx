import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Fixtures } from "@/components/Fixtures";
import { Announcements } from "@/components/Announcements";
import { Membership } from "@/components/Membership";
import { FAQ } from "@/components/FAQ";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Fixtures />
      <Announcements />
      <Membership />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;

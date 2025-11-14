import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-stadium.jpg";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  const scrollToMembership = () => {
    const element = document.getElementById("membership");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sport-green-dark/90 via-sport-green/80 to-background/95" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Welcome to <span className="text-primary-foreground drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">Aztec Sports</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          Join the premier sports club where champions are made. Excellence, teamwork, and passion drive everything we do.
        </p>
        <Button
          size="lg"
          onClick={scrollToMembership}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow text-lg px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
        >
          Join Our Team
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

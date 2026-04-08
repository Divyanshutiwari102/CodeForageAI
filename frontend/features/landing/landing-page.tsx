import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/features/landing/hero-section";
import { FeaturesGrid } from "@/features/landing/features-grid";
import { StatsSection } from "@/features/landing/stats-section";
import { CTASection } from "@/features/landing/cta-section";
import { FooterSection } from "@/features/landing/footer-section";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <StatsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}

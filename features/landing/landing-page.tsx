import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/features/landing/hero-section";
import { FeaturesGrid } from "@/features/landing/features-grid";
import { PricingSection } from "@/features/landing/pricing-section";
import { StatsSection } from "@/features/landing/stats-section";
import { CTASection } from "@/features/landing/cta-section";
import { FooterSection } from "@/features/landing/footer-section";

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#f1f1f5" }}>
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <PricingSection />
      <StatsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}

import type React from "react";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { RecognitionSection } from "@/components/landing/recognition-section";
import { PossibilitySection } from "@/components/landing/possibility-section";
import { PromiseSection } from "@/components/landing/promise-section";
import { ProductReveal } from "@/components/landing/product-reveal";
import { TrustBadges } from "@/components/landing/trust-badges";
import { FaqSection } from "@/components/landing/faq-section";
import { LeadMagnet } from "@/components/landing/lead-magnet";
import { Footer1 } from "@/components/pro-blocks/landing-page/footers/footer-1";

export default function HomePage(): React.JSX.Element {
  return (
    <main className="min-h-dvh">
      <Navbar />
      <HeroSection />
      <RecognitionSection />
      <PossibilitySection />
      <PromiseSection />
      <ProductReveal />
      <TrustBadges />
      <FaqSection />
      <LeadMagnet />
      <Footer1 />
    </main>
  );
}

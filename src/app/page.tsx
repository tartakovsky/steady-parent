import type React from "react";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { RecognitionSection } from "@/components/landing/recognition-section";
import { PossibilitySection } from "@/components/landing/possibility-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { CourseCurriculumSection } from "@/components/landing/course-curriculum-section";
import { ProductReveal } from "@/components/landing/product-reveal";
import { AuthorityCarousel } from "@/components/landing/authority-carousel";
import { TestimonialsCarousel } from "@/components/landing/testimonials-carousel";
import { MarqueeTestimonials } from "@/components/landing/marquee-testimonials";
import { TrustBadges } from "@/components/landing/trust-badges";
import { FaqSection } from "@/components/landing/faq-section";
import { LeadMagnet } from "@/components/landing/lead-magnet";
import { Footer } from "@/components/landing/footer";
import { landingContent } from "@/content/landing/content";
import type { LandingContent } from "@/content/landing/content";

export default function HomePage(): React.JSX.Element {
  const content: LandingContent = landingContent;

  return (
    <main className="min-h-dvh">
      <Navbar />
      <HeroSection content={content.hero} />
      <RecognitionSection content={content.recognition} />
      <PossibilitySection content={content.possibility} />
      <SolutionSection content={content.solution} />
      <AuthorityCarousel content={content.authority} />
      <MarqueeTestimonials
        title={content.marqueeTestimonials.title}
        row1={content.marqueeTestimonials.row1}
        row2={content.marqueeTestimonials.row2}
      />
      <TestimonialsCarousel content={content.testimonials} />
      <ProductReveal content={content.product} />
      <CourseCurriculumSection content={content.curriculum} />
      <TrustBadges content={content.trustBadges} />
      <FaqSection content={content.faq} />
      <LeadMagnet content={content.leadMagnet} />
      <Footer />
    </main>
  );
}

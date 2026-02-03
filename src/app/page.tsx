import type React from "react";

import { Banner1 } from "@/components/pro-blocks/landing-page/banners/banner-1";
import { HeroSection } from "@/components/landing/hero-section";
import { RecognitionSection } from "@/components/landing/recognition-section";
import { PossibilitySection } from "@/components/landing/possibility-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { CommunitySection } from "@/components/landing/community-section";
import { CourseCurriculumSection } from "@/components/landing/course-curriculum-section";
import { ProductReveal } from "@/components/landing/product-reveal";
import { AuthorityCarousel } from "@/components/landing/authority-carousel";
import { TestimonialsCarousel } from "@/components/landing/testimonials-carousel";
import { MarqueeTestimonials } from "@/components/landing/marquee-testimonials";
import { TrustBadges } from "@/components/landing/trust-badges";
import { FaqSection } from "@/components/landing/faq-section";
import { LeadMagnet } from "@/components/landing/lead-magnet";
import { landingContent } from "@/content/landing/content";
import type { LandingContent } from "@/content/landing/content";

export default function HomePage(): React.JSX.Element {
  const content: LandingContent = landingContent;

  return (
    <main>
      <Banner1
        href="#course"
        labelBold="Cohort 3"
        label="Starts March 1 · Join now"
      />
      <HeroSection content={content.hero} />
      <RecognitionSection content={content.recognition} />
      <PossibilitySection content={content.possibility} />
      <SolutionSection content={content.solution} />
      <CommunitySection content={content.community} />
      <MarqueeTestimonials
        title={content.marqueeTestimonials.title}
        row1={content.marqueeTestimonials.row1}
        row2={content.marqueeTestimonials.row2}
      />
      <AuthorityCarousel content={content.authority} />
      <TestimonialsCarousel content={content.testimonials} />
      <ProductReveal content={content.product} />
      <CourseCurriculumSection content={content.curriculum} />
      <TrustBadges content={content.trustBadges} />
      <FaqSection content={content.faq} />
      <LeadMagnet content={content.leadMagnet} />
    </main>
  );
}

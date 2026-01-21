import type React from "react";

import { AuthorityCarousel } from "@/components/landing/authority-carousel";
import { ReelTestimonialsCarousel } from "@/components/landing/reel-testimonials-carousel";
import { landingContent } from "@/content/landing/content";
import { LandingNavbar } from "@/components/landing/sections/landing-navbar";
import { LandingHero } from "@/components/landing/sections/landing-hero";
import { TextBulletsSection } from "@/components/landing/sections/text-bullets-section";
import { ProductReveal } from "@/components/landing/sections/product-reveal";
import { LandingFaq } from "@/components/landing/sections/faq";
import { LeadMagnet } from "@/components/landing/sections/lead-magnet";
import { LandingFooter } from "@/components/landing/sections/footer";

export default function HomePage(): React.JSX.Element {
  return (
    <main className="min-h-dvh">
      <LandingNavbar
        ctaLabel={landingContent.cohort.primaryCtaLabel}
        ctaUrl={landingContent.cohort.primaryCtaUrl}
      />

      <LandingHero
        headline={landingContent.hero.headline}
        subheadline={landingContent.hero.subheadline}
        primaryCtaLabel={landingContent.hero.primaryCtaLabel}
        primaryCtaUrl={landingContent.cohort.primaryCtaUrl}
        secondaryCtaLabel={landingContent.hero.secondaryCtaLabel}
        trustBullets={landingContent.hero.trustBullets}
      />

      <TextBulletsSection
        eyebrow={landingContent.recognition.eyebrow}
        title={landingContent.recognition.title}
        bullets={landingContent.recognition.bullets}
        close={landingContent.recognition.close}
      />

      <TextBulletsSection
        eyebrow={landingContent.possibility.eyebrow}
        title={landingContent.possibility.title}
        bullets={landingContent.possibility.bullets}
      />

      <TextBulletsSection
        id="what"
        eyebrow={landingContent.promise.eyebrow}
        title={landingContent.promise.title}
        bullets={landingContent.promise.bullets}
      />

      <ProductReveal
        courseName={landingContent.cohort.courseName}
        startDateLabel={landingContent.cohort.startDateLabel}
        priceUsd={landingContent.cohort.priceUsd}
        communityValueLabel={landingContent.cohort.communityValueLabel}
        ctaLabel={landingContent.cohort.primaryCtaLabel}
        ctaUrl={landingContent.cohort.primaryCtaUrl}
      />

      <section className="py-10" aria-label="Based on the works of">
        <AuthorityCarousel items={landingContent.authority} />
      </section>

      <section className="py-10" aria-label="What other parents say">
        <ReelTestimonialsCarousel items={landingContent.testimonials} />
      </section>

      <div id="inside" />

      <LandingFaq id="faq" items={landingContent.faq} />
      <LeadMagnet
        title={landingContent.leadMagnet.title}
        description={landingContent.leadMagnet.description}
        submitLabel={landingContent.leadMagnet.submitLabel}
        formActionUrl={landingContent.leadMagnet.formActionUrl}
      />
      <LandingFooter />
    </main>
  );
}


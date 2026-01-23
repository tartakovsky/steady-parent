"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowUpRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import Image from "next/image";
import Link from "next/link";

interface HeroBadgeContent {
  /** Short bold label, max 3 words. */
  label: string;
  /** Supporting text, max 4 words. */
  detail: string;
}

interface HeroCta {
  /** Button label, max 4 words. */
  label: string;
  /** Destination URL. */
  href: string;
}

interface HeroContent {
  /** Main eyebrow badge content. */
  badge: HeroBadgeContent;
  /** Hero headline, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Optional bullet list. */
  bullets: readonly string[];
  /** Primary CTA. */
  primaryCta: HeroCta;
  /** Secondary CTA. */
  secondaryCta: HeroCta;
  /** Optional hero image URL. */
  imageUrl?: string;
  /** Image alt text. */
  imageAlt: string;
}

const heroContent: HeroContent = {
  badge: {
    label: "What's new",
    detail: "Just shipped v2.0",
  },
  title: "Solve your user's main problem",
  body:
    "Follow with one or two sentences that expand on your value proposition and focus on key benefits.",
  bullets: ["Responsive design", "Customizable templates", "AI-powered insights"],
  primaryCta: {
    label: "Get started",
    href: "#",
  },
  secondaryCta: {
    label: "Learn more",
    href: "#",
  },
  imageUrl: "https://ui.shadcn.com/placeholder.svg",
  imageAlt: "Hero section visual",
};

export function HeroSection() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-6 lg:gap-8">
          <div className="section-title-gap-xl flex flex-col">
            <Tagline variant="link">
              <span className="size-1.5 rounded-full bg-green-500" />
              <span className="hidden lg:inline">{heroContent.badge.label} · </span>
              <span className="lg:text-muted-foreground">
                {heroContent.badge.detail}
              </span>
              <ArrowUpRight />
            </Tagline>
            <h1 id="hero-heading" className="heading-xl">
              {heroContent.title}
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              {heroContent.body}
            </p>
            {heroContent.bullets.length > 0 ? (
              <div className="flex flex-col gap-2">
                {heroContent.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <Check className="text-primary size-5" />
                    <span className="text-muted-foreground leading-5 font-medium">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={heroContent.primaryCta.href}>
                {heroContent.primaryCta.label}
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={heroContent.secondaryCta.href}>
                {heroContent.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </div>
        {heroContent.imageUrl ? (
          <div className="w-full flex-1">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={heroContent.imageUrl}
                alt={heroContent.imageAlt}
                fill
                priority
                className="h-full w-full rounded-xl object-cover"
              />
            </AspectRatio>
          </div>
        ) : null}
      </div>
    </section>
  );
}

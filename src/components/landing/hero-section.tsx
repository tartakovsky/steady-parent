"use client";

import type React from "react";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { FieldDescription } from "@/components/ui/field";
import type { HeroContent } from "@/content/landing/types";

interface HeroSectionProps {
  content: HeroContent;
}

const HERO_IMAGE_WIDTH = 1382;
const HERO_IMAGE_HEIGHT = 720;

export function HeroSection({ content }: HeroSectionProps): React.JSX.Element {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex w-full max-w-2xl flex-1 flex-col gap-6 lg:max-w-none lg:gap-8">
          <div className="section-title-gap-xl flex flex-col">
            <Tagline>{content.eyebrow}</Tagline>
            <h1 id="hero-heading" className="heading-xl">
              {content.title}
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty whitespace-pre-line">
              {content.body}
            </p>
            {content.bullets.length > 0 ? (
              <div className="flex flex-col gap-2">
                {content.bullets.map((bullet) => (
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
          <div className="flex w-full flex-col items-center gap-2 lg:w-fit lg:flex-row lg:items-center lg:gap-4">
            <Button asChild size="lg" className="h-14 px-10 text-lg">
              <a href={content.primaryCta.href}>{content.primaryCta.label}</a>
            </Button>
            <FieldDescription className="text-center text-sm leading-tight">
              Starts March 1st
            </FieldDescription>
          </div>
        </div>
        {typeof content.imageUrl === "string" && content.imageUrl.length > 0 ? (
          <div className="w-full max-w-2xl flex-1 lg:max-w-none">
            <Image
              src={content.imageUrl}
              alt={content.imageAlt}
              width={HERO_IMAGE_WIDTH}
              height={HERO_IMAGE_HEIGHT}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full rounded-xl object-contain"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

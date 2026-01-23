"use client";

import type React from "react";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Check, ArrowUpRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import type { HeroContent } from "@/content/landing/types";

interface HeroSectionProps {
  content: HeroContent;
}

export function HeroSection({ content }: HeroSectionProps): React.JSX.Element {
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
              <span className="hidden lg:inline">{content.badge.label} · </span>
              <span className="lg:text-muted-foreground">
                {content.badge.detail}
              </span>
              <ArrowUpRight />
            </Tagline>
            <h1 id="hero-heading" className="heading-xl">
              {content.title}
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
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
          <div className="flex gap-2">
            <Button asChild>
              <Link href={content.primaryCta.href}>
                {content.primaryCta.label}
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={content.secondaryCta.href}>
                {content.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </div>
        {content.imageUrl ? (
          <div className="w-full flex-1">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={content.imageUrl}
                alt={content.imageAlt}
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

"use client";

import type React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface LandingHeroProps {
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  trustBullets: readonly string[];
}

export function LandingHero({
  headline,
  subheadline,
  primaryCtaLabel,
  primaryCtaUrl,
  secondaryCtaLabel,
  trustBullets,
}: LandingHeroProps): React.JSX.Element {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="text-muted-foreground text-sm">Next cohort</div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {headline}
          </h1>
          <p className="text-muted-foreground text-lg leading-8">{subheadline}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href={primaryCtaUrl}>{primaryCtaLabel}</Link>
            </Button>
            <a href="#inside" className="text-sm font-medium underline underline-offset-4">
              {secondaryCtaLabel}
            </a>
          </div>
          <ul className="text-muted-foreground space-y-2 text-sm" aria-label="Key points">
            {trustBullets.map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>
        </div>

        <div className="bg-muted aspect-video w-full rounded-xl" aria-hidden="true" />
      </div>
    </section>
  );
}


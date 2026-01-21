import type React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface ProductRevealProps {
  id?: string;
  courseName: string;
  startDateLabel: string;
  priceUsd: number;
  communityValueLabel: string;
  ctaLabel: string;
  ctaUrl: string;
}

export function ProductReveal({
  id,
  courseName,
  startDateLabel,
  priceUsd,
  communityValueLabel,
  ctaLabel,
  ctaUrl,
}: ProductRevealProps): React.JSX.Element {
  return (
    <section id={id} className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <Card>
          <CardHeader>
            <div className="text-muted-foreground text-sm">Product reveal</div>
            <div className="text-2xl font-semibold">{courseName}</div>
            <div className="text-muted-foreground">{startDateLabel}</div>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div className="space-y-3">
              <div className="text-4xl font-semibold">${priceUsd}</div>
              <div className="text-muted-foreground">{communityValueLabel}</div>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• Cohort based format with clear weekly focus</li>
                <li>• Skool community included</li>
                <li>• Practical scripts and next steps for hard moments</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="w-full">
                <Link href={ctaUrl}>{ctaLabel}</Link>
              </Button>
              <p className="text-muted-foreground text-sm">
                Join the waitlist to get launch details and early access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}


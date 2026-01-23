"use client";

import { Shield, Zap, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TrustBadgeItem {
  /** Icon component. */
  icon: LucideIcon;
  /** Item title, max 6 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
}

interface TrustBadgesContent {
  /** List of trust items. */
  items: readonly TrustBadgeItem[];
}

const trustBadgesContent: TrustBadgesContent = {
  items: [
    {
      icon: RotateCcw,
      title: "30-Day Money Back",
      body: "Not satisfied? Get a full refund within 30 days, no questions asked.",
    },
    {
      icon: Zap,
      title: "Instant Access",
      body: "Start learning immediately after purchase with instant digital delivery.",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      body: "Your payment is protected with industry-standard encryption.",
    },
  ],
};

export function TrustBadges() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {trustBadgesContent.items.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="bg-muted flex size-14 items-center justify-center rounded-xl">
                <badge.icon className="text-primary size-7" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-foreground text-base font-semibold">
                  {badge.title}
                </p>
                <p className="text-muted-foreground text-sm">
                  {badge.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

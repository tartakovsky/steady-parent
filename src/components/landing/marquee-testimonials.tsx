"use client";

import type React from "react";

import { AutoMarquee } from "@/components/ui/auto-marquee";
import type { MarqueeTestimonialItem } from "@/content/landing/types";

interface MarqueeTestimonialsProps {
  title: string;
  row1: readonly MarqueeTestimonialItem[];
  row2: readonly MarqueeTestimonialItem[];
}

function FeedbackCard({ item }: { item: MarqueeTestimonialItem }): React.JSX.Element {
  const stars: string = "★★★★★".slice(0, item.stars);

  return (
    <div className="bg-card text-card-foreground w-[22rem] max-w-[80vw] rounded-[2rem] border px-7 py-6">
      <div className="text-foreground text-sm font-semibold leading-none">
        <span>{item.name}</span>
        <span className="text-muted-foreground font-medium">
          {`, ${item.eyebrow}`}
        </span>
      </div>
      <p className="text-foreground mt-4 text-xl font-semibold leading-snug">
        “{item.text}”
      </p>
      <div className="mt-4 flex items-center gap-1 text-sm leading-none">
        <span className="text-primary">{stars}</span>
      </div>
    </div>
  );
}

export function MarqueeTestimonials({
  title,
  row1,
  row2,
}: MarqueeTestimonialsProps): React.JSX.Element {
  return (
    <section className="bg-background py-8 md:py-10" aria-label={title}>
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 overflow-hidden">
          <AutoMarquee direction="left" speed={32} gapClassName="gap-6 pr-6">
            {row1.map((item) => (
              <FeedbackCard key={`${item.name}-${item.text}`} item={item} />
            ))}
          </AutoMarquee>

          <AutoMarquee direction="right" speed={32} gapClassName="gap-6 pr-6">
            {row2.map((item) => (
              <FeedbackCard key={`${item.name}-${item.text}`} item={item} />
            ))}
          </AutoMarquee>
        </div>
      </div>
    </section>
  );
}


"use client";

import type React from "react";

import { AutoMarquee } from "@/components/ui/auto-marquee";
import type { MarqueeTestimonialItem } from "@/content/landing/types";
import { Star } from "lucide-react";

interface MarqueeTestimonialsProps {
  title: string;
  row1: readonly MarqueeTestimonialItem[];
  row2: readonly MarqueeTestimonialItem[];
}

function Stars({ value }: { value: MarqueeTestimonialItem["stars"] }): React.JSX.Element {
  const clamped: number = Math.max(0, Math.min(5, value));
  const fullCount: number = Math.floor(clamped);
  const hasHalf: boolean = clamped - fullCount >= 0.5;
  const emptyCount: number = 5 - fullCount - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${clamped} out of 5 stars`}>
      {Array.from({ length: fullCount }).map((_, idx) => (
        <Star
          key={`full-${idx}`}
          className="size-4 text-primary"
          fill="currentColor"
        />
      ))}
      {hasHalf ? (
        <span className="relative inline-block size-4" aria-hidden="true">
          <Star className="absolute inset-0 size-4 text-primary" />
          <span className="absolute inset-0 w-1/2 overflow-hidden">
            <Star className="size-4 text-primary" fill="currentColor" />
          </span>
        </span>
      ) : null}
      {Array.from({ length: emptyCount }).map((_, idx) => (
        <Star key={`empty-${idx}`} className="size-4 text-primary" />
      ))}
    </span>
  );
}

function renderQuote(
  text: string,
): { node: React.ReactNode; wrapInOuterQuotes: boolean } {
  const marker = "(It is now!)";
  const idx = text.indexOf(marker);
  if (idx < 0) return { node: text, wrapInOuterQuotes: true };

  const quoted = text.replace(marker, "").trim();
  return {
    wrapInOuterQuotes: false,
    node: (
      <>
        <span>“{quoted}”</span>{" "}
        <span className="text-primary font-semibold">It is now!</span>
      </>
    ),
  };
}

function FeedbackCard({ item }: { item: MarqueeTestimonialItem }): React.JSX.Element {
  const quote = renderQuote(item.text);

  return (
    <div className="bg-card text-card-foreground w-[22rem] max-w-[80vw] rounded-[2rem] border px-7 py-6">
      <div className="text-foreground text-sm font-semibold leading-none">
        <span>{item.name}</span>
        <span className="text-muted-foreground font-medium">
          {`, ${item.eyebrow}`}
        </span>
      </div>
      <p className="text-foreground mt-4 text-xl font-semibold leading-snug">
        {quote.wrapInOuterQuotes ? <>“{quote.node}”</> : quote.node}
      </p>
      <div className="mt-4 flex items-center gap-1 text-sm leading-none">
        <Stars value={item.stars} />
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
          <AutoMarquee direction="left" speed={38} gapClassName="gap-6 pr-6">
            {row1.map((item) => (
              <FeedbackCard key={`${item.name}-${item.text}`} item={item} />
            ))}
          </AutoMarquee>

          <AutoMarquee direction="right" speed={38} gapClassName="gap-6 pr-6">
            {row2.map((item) => (
              <FeedbackCard key={`${item.name}-${item.text}`} item={item} />
            ))}
          </AutoMarquee>
        </div>
      </div>
    </section>
  );
}


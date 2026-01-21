"use client";

import type React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ContentCarousel } from "@/components/carousel/content-carousel";
import type { AuthorityItem } from "@/content/landing/content";

export interface AuthorityCarouselProps {
  items: readonly AuthorityItem[];
}

function AuthorityCard({ item }: { item: AuthorityItem }): React.JSX.Element {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageSrc}
          alt={item.imageAlt}
          className="size-16 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <div className="font-semibold">{item.name}</div>
          <div className="text-muted-foreground text-sm">{item.credentials}</div>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-6">{item.description}</CardContent>
    </Card>
  );
}

export function AuthorityCarousel({ items }: AuthorityCarouselProps): React.JSX.Element {
  return (
    <section aria-label="Authority" className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <ContentCarousel
          items={items}
          itemClassName="basis-[85%] sm:basis-1/2 lg:basis-1/3"
          renderCard={(item) => <AuthorityCard item={item} />}
        />
      </div>
    </section>
  );
}


"use client";

import Image from "next/image";
import type React from "react";

import { ContentCarousel } from "@/components/carousel/content-carousel";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import type { AuthorityContent } from "@/content/landing/types";

interface AuthorityCarouselProps {
  content: AuthorityContent;
}

export function AuthorityCarousel({
  content,
}: AuthorityCarouselProps): React.JSX.Element {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <Tagline>{content.eyebrow}</Tagline>
          <h2 className="heading-lg text-foreground">{content.title}</h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            {content.body}
          </p>
        </div>

        <ContentCarousel
          items={content.cards}
          className="w-full"
          contentClassName="w-full overflow-visible"
          itemClassName="flex-shrink-0 !w-[80vw] sm:!w-[60vw] md:!w-[40vw] lg:!w-[33vw]"
          spaceBetween={16}
          showArrows
          renderCard={(item) => (
            <div className="flex h-full flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
              <div className="flex items-center gap-4">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full border">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          )}
        />
      </div>
    </section>
  );
}

"use client";

import type React from "react";

import Image from "next/image";

import { ContentCarousel } from "@/components/carousel/content-carousel";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Blockquote } from "@/components/ui/blockquote";
import { Button } from "@/components/ui/button";
import type { AboutCarouselContent } from "@/content/landing/types";

interface AboutCarouselSectionProps {
  content: AboutCarouselContent;
}

export function AboutCarouselSection({
  content,
}: AboutCarouselSectionProps): React.JSX.Element {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-4xl">
        <div className="flex flex-col gap-4">
          <Tagline>{content.eyebrow}</Tagline>
          <h2 className="heading-lg text-foreground">{content.title}</h2>
          <p className="text-muted-foreground text-lg/8 text-pretty whitespace-pre-line">
            {content.body}
          </p>
          <div className="flex flex-col gap-4 text-muted-foreground text-base/7">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="container-padding-x mx-auto mt-10 max-w-7xl">
        <ContentCarousel
          items={content.images}
          className="w-full"
          contentClassName="w-full overflow-visible"
          itemClassName="flex-shrink-0 !w-[80vw] sm:!w-[60vw] md:!w-[40vw] lg:!w-[33vw]"
          spaceBetween={16}
          showArrows
          renderCard={(item) => (
            <div className="flex items-center justify-center">
              <div className="w-full overflow-hidden rounded-xl aspect-square">
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  width={1200}
                  height={1200}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 40vw, (min-width: 640px) 60vw, 80vw"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          )}
        />
      </div>

      <div className="container-padding-x mx-auto mt-10 max-w-4xl">
        <div className="flex flex-col gap-6">
          <Blockquote>{content.quote}</Blockquote>
          <Button asChild className="w-fit">
            <a href={content.cta.href}>{content.cta.label}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

"use client";

import * as React from "react";

import Image from "next/image";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ContentCarousel } from "@/components/carousel/content-carousel";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

import type { TestimonialsContent } from "@/content/landing/types";

interface TestimonialsCarouselProps {
  content: TestimonialsContent;
}

function TestimonialVideo({
  src,
  poster,
}: {
  src: string;
  poster: string;
}): React.JSX.Element {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  return (
    <>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        controls
        playsInline
        preload="metadata"
        loop
        poster={poster}
        src={src}
        onPlay={() => { setIsPlaying(true); }}
        onPause={() => { setIsPlaying(false); }}
        onEnded={() => { setIsPlaying(false); }}
      />
      {!isPlaying ? (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center"
          onClick={() => {
            void videoRef.current?.play();
          }}
          aria-label="Play video"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-6"
              fill="currentColor"
            >
              <path d="M8 5.5v13l11-6.5-11-6.5z" />
            </svg>
          </span>
        </button>
      ) : null}
    </>
  );
}

export function TestimonialsCarousel({
  content,
}: TestimonialsCarouselProps): React.JSX.Element {
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
          itemClassName="flex-shrink-0 !w-[72vw] sm:!w-[52vw] md:!w-[36vw] lg:!w-[28vw]"
          spaceBetween={16}
          showArrows
          renderCard={(item) => (
            <div className="flex h-full flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
              <div className="relative overflow-hidden rounded-lg border">
                <AspectRatio ratio={9 / 16}>
                  {item.media.kind === "video" ? (
                    <TestimonialVideo
                      src={item.media.src}
                      poster={item.media.poster}
                    />
                  ) : (
                    <Image
                      src={item.media.src}
                      alt={item.media.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 28vw, (min-width: 768px) 36vw, (min-width: 640px) 52vw, 72vw"
                    />
                  )}
                </AspectRatio>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </section>
  );
}

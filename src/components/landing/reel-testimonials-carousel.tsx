"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ContentCarousel } from "@/components/carousel/content-carousel";
import { MediaDialog, type MediaDialogMedia } from "@/components/carousel/media-dialog";
import type { TestimonialItem } from "@/content/landing/content";

export interface ReelTestimonialsCarouselProps {
  items: readonly TestimonialItem[];
}

function toDialogMedia(item: TestimonialItem): MediaDialogMedia {
  const media = item.media;
  if (media.kind === "video") {
    return media.posterSrc === undefined
      ? { kind: "video", src: media.src }
      : { kind: "video", src: media.src, posterSrc: media.posterSrc };
  }
  if (media.kind === "image") {
    return { kind: "image", src: media.src, alt: media.alt };
  }
  return { kind: "none" };
}

function ReelTestimonialCard({
  item,
  onOpen,
}: {
  item: TestimonialItem;
  onOpen: () => void;
}): React.JSX.Element {
  const media = item.media;
  const isVideo = media.kind === "video";
  const isImage = media.kind === "image";

  const aspectClass = (() => {
    if (media.kind === "video") {
      if (media.aspectRatio === "9:16") return "aspect-[9/16]";
      if (media.aspectRatio === "4:3") return "aspect-[4/3]";
      return "aspect-video";
    }
    if (media.kind === "image") {
      if (media.aspectRatio === "3:4") return "aspect-[3/4]";
      if (media.aspectRatio === "4:3") return "aspect-[4/3]";
      if (media.aspectRatio === "16:9") return "aspect-video";
      return "aspect-square";
    }
    return "aspect-video";
  })();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="h-full w-full text-left"
      aria-label={`Open testimonial from ${item.personName}`}
    >
      <Card className="h-full overflow-hidden">
        <div className={`bg-muted relative w-full ${aspectClass} max-h-[320px]`}>
          {isVideo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.posterSrc ?? "/placeholder.svg"}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.src}
              alt={media.alt}
              className="h-full w-full object-cover"
            />
          ) : null}
          {!isVideo && !isImage ? null : null}
        </div>
        <CardContent className="p-4">
          <div className="text-sm font-semibold">{item.personName}</div>
          {item.quote !== undefined && item.quote !== "" ? (
            <div className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-6">
              {item.quote}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </button>
  );
}

export function ReelTestimonialsCarousel({
  items,
}: ReelTestimonialsCarouselProps): React.JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null);

  const active = useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  return (
    <section aria-label="Testimonials" className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <ContentCarousel
          items={items}
          itemClassName="basis-[58%] sm:basis-1/4 lg:basis-1/5"
          renderCard={(item) => {
            return (
              <ReelTestimonialCard
                item={item}
                onOpen={() => {
                  setOpenId(item.id);
                }}
              />
            );
          }}
        />
      </div>

      <MediaDialog
        open={openId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setOpenId(null);
          }
        }}
        title={active?.personName ?? "Testimonial"}
        media={active ? toDialogMedia(active) : { kind: "none" }}
      />
    </section>
  );
}


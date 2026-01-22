"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
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

  return (
    <button
      type="button"
      onClick={onOpen}
      className="block h-full w-full text-left"
      aria-label={`Open testimonial from ${item.personName}`}
    >
      {/* Card fills the slide; slide width is set via itemClassName on the carousel */}
      <Card className="relative aspect-[9/16] h-full w-full overflow-hidden">
        <div className="bg-muted absolute inset-0">
          {isVideo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.posterSrc ?? "/placeholder.svg"}
              alt=""
              className="block h-full w-full object-cover"
            />
          ) : null}
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.src}
              alt={media.alt}
              className="block h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="from-background/80 via-background/40 to-background/0 bg-gradient-to-t px-4 pb-4 pt-10">
            <div className="text-sm font-semibold leading-5">{item.personName}</div>
            {item.quote !== undefined && item.quote !== "" ? (
              <div className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
                {item.quote}
              </div>
            ) : null}
          </div>
        </div>
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
    <section aria-label="Testimonials" className="py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4">
        <ContentCarousel
          items={items}
          itemClassName="!w-[min(44vw,168px)] sm:!w-[180px] lg:!w-[300px] xl:!w-[340px]"
          spaceBetween={16}
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


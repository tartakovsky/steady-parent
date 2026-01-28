"use client";

import * as React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Mousewheel } from "swiper/modules";
import "swiper/css";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ContentCarouselItem {
  id: string;
}

export interface ContentCarouselProps<TItem extends ContentCarouselItem> {
  items: readonly TItem[];
  renderCard: (item: TItem) => React.ReactNode;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  spaceBetween?: number;
  showArrows?: boolean;
}

export function ContentCarousel<TItem extends ContentCarouselItem>({
  items,
  renderCard,
  className,
  contentClassName,
  itemClassName,
  spaceBetween,
  showArrows = false,
}: ContentCarouselProps<TItem>): React.JSX.Element {
  const swiperRef = React.useRef<SwiperType | null>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const syncArrowState = React.useCallback((swiper: SwiperType) => {
    setCanScrollPrev(!swiper.isBeginning);
    setCanScrollNext(!swiper.isEnd);
  }, []);

  return (
    <div className={cn("group relative overflow-x-hidden", className)}>
      {showArrows ? (
        <>
          {canScrollPrev ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "absolute top-1/2 left-2 z-10 size-9 -translate-y-1/2 rounded-full bg-background/70 opacity-0 shadow-sm backdrop-blur transition",
                "hover:bg-accent focus-visible:opacity-100 group-hover:opacity-100",
              )}
              onClick={() => {
                swiperRef.current?.slidePrev();
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-4" />
            </Button>
          ) : null}
          {canScrollNext ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "absolute top-1/2 right-2 z-10 size-9 -translate-y-1/2 rounded-full bg-background/70 opacity-0 shadow-sm backdrop-blur transition",
                "hover:bg-accent focus-visible:opacity-100 group-hover:opacity-100",
              )}
              onClick={() => {
                swiperRef.current?.slideNext();
              }}
              aria-label="Next slide"
            >
              <ChevronRight className="size-4" />
            </Button>
          ) : null}
        </>
      ) : null}
      <Swiper
        modules={[Mousewheel, Keyboard]}
        slidesPerView={"auto"}
        spaceBetween={spaceBetween ?? 16}
        speed={260}
        centeredSlides={false}
        threshold={0}
        longSwipes={false}
        longSwipesMs={0}
        longSwipesRatio={0.02}
        shortSwipes={true}
        resistance={false}
        resistanceRatio={0}
        edgeSwipeDetection={"prevent"}
        edgeSwipeThreshold={24}
        freeMode={false}
        mousewheel={{
          forceToAxis: true,
          releaseOnEdges: false,
          sensitivity: 0.6,
          thresholdDelta: 6,
        }}
        keyboard={{ enabled: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          if (showArrows) syncArrowState(swiper);
        }}
        onAfterInit={(swiper) => {
          if (showArrows) syncArrowState(swiper);
        }}
        onResize={(swiper) => {
          if (showArrows) syncArrowState(swiper);
        }}
        onSlideChange={(swiper) => {
          if (showArrows) syncArrowState(swiper);
        }}
        onTouchEnd={(swiper) => {
          const diff = swiper.touches.diff;
          if (diff === 0) return;
          if (diff < 0) {
            if (!swiper.isEnd) swiper.slideNext();
            return;
          }
          if (diff > 0) {
            if (!swiper.isBeginning) swiper.slidePrev();
          }
          if (showArrows) syncArrowState(swiper);
        }}
        className={contentClassName}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className={itemClassName}>
            {renderCard(item)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

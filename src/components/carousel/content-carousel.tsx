"use client";

import * as React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Mousewheel, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Swiper as SwiperType } from "swiper";

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
}

export function ContentCarousel<TItem extends ContentCarouselItem>({
  items,
  renderCard,
  className,
  contentClassName,
  itemClassName,
  spaceBetween,
}: ContentCarouselProps<TItem>): React.JSX.Element {
  const prevRef = React.useRef<HTMLButtonElement | null>(null);
  const nextRef = React.useRef<HTMLButtonElement | null>(null);
  const swiperRef = React.useRef<SwiperType | null>(null);
  const [navReady, setNavReady] = React.useState(false);

  React.useEffect(() => {
    setNavReady(true);
  }, []);

  React.useEffect(() => {
    const swiper = swiperRef.current;
    if (swiper === null) return;
    if (prevRef.current === null || nextRef.current === null) return;

    swiper.params.navigation = {
      ...(typeof swiper.params.navigation === "object" ? swiper.params.navigation : {}),
      prevEl: prevRef.current,
      nextEl: nextRef.current,
    };
    swiper.navigation.init();
    swiper.navigation.update();
  }, [navReady]);

  return (
    <div
      className={cn("relative w-full", className)}
      style={{ overscrollBehaviorX: "contain" }}
    >
      <Swiper
        modules={[Navigation, Mousewheel, Keyboard]}
        slidesPerView={"auto"}
        spaceBetween={spaceBetween ?? 16}
        speed={260}
        centeredSlides={false}
        threshold={0}
        longSwipes={false}
        longSwipesMs={0}
        longSwipesRatio={0.02}
        shortSwipes={true}
        // Do not allow "pulling" past edges; this helps avoid Chrome back/forward gestures.
        resistance={false}
        resistanceRatio={0}
        // Prevent edge swipe from triggering browser navigation.
        edgeSwipeDetection={"prevent"}
        edgeSwipeThreshold={24}
        // Tight, frame-based snap behavior:
        freeMode={false}
        // Prevent trackpad wheel from scrolling the page and avoid weird inertia:
        mousewheel={{
          forceToAxis: true,
          releaseOnEdges: false,
          sensitivity: 0.6,
          thresholdDelta: 6,
        }}
        keyboard={{ enabled: true }}
        navigation={false}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onTouchEnd={(swiper) => {
          // Force "any drag commits to next/prev slide" behavior.
          // Swiper's default thresholds can still snap back on small mouse drags.
          const diff = swiper.touches.diff;
          if (diff === 0) return;

          // Use raw touch diff to decide direction (avoids odd typing/lint issues with swipeDirection).
          // diff > 0 => user dragged towards the right (go to previous), diff < 0 => next.
          if (diff < 0) {
            if (!swiper.isEnd) swiper.slideNext();
            return;
          }
          if (diff > 0) {
            if (!swiper.isBeginning) swiper.slidePrev();
          }
        }}
        className={cn("w-full overflow-hidden", contentClassName)}
      >
        {items.map((item) => (
          <SwiperSlide
            key={item.id}
            className={cn(itemClassName ?? "w-auto")}
          >
            {renderCard(item)}
          </SwiperSlide>
        ))}
      </Swiper>

      <Button
        ref={prevRef}
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full"
        aria-label="Previous"
        type="button"
      >
        ‹
      </Button>
      <Button
        ref={nextRef}
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full"
        aria-label="Next"
        type="button"
      >
        ›
      </Button>
    </div>
  );
}


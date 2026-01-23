"use client";

import * as React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Mousewheel } from "swiper/modules";
import "swiper/css";
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
  const swiperRef = React.useRef<SwiperType | null>(null);

  return (
    <div className={className}>
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

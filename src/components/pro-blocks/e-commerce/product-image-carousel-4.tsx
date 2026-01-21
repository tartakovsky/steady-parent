"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface ProductImageCarousel4Props {
  images: string[];
  productName: string;
  className?: string;
}

export default function ProductImageCarousel4({
  images,
  productName,
  className,
}: ProductImageCarousel4Props) {
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  const [thumbApi, setThumbApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onThumbClick = React.useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi],
  );

  React.useEffect(() => {
    if (!mainApi) return;

    const onSelect = () => {
      setSelectedIndex(mainApi.selectedScrollSnap());
      thumbApi?.scrollTo(mainApi.selectedScrollSnap());
    };

    onSelect();
    mainApi.on("select", onSelect);

    return () => {
      mainApi.off("select", onSelect);
    };
  }, [mainApi, thumbApi]);

  return (
    <div className={cn("flex flex-col gap-3 lg:flex-row", className)}>
      {/* Thumbnails */}
      <Carousel
        setApi={setThumbApi}
        opts={{
          containScroll: "keepSnaps",
          dragFree: true,
        }}
        orientation="horizontal"
        className="order-2 w-full lg:order-1 lg:w-16 lg:flex-shrink-0"
      >
        <CarouselContent className="-ml-2 lg:-mt-2 lg:ml-0 lg:flex-col">
          {images.map((image, index) => (
            <CarouselItem
              key={index}
              className="basis-1/5 pl-2 lg:basis-full lg:pt-2 lg:pl-0"
              onClick={() => onThumbClick(index)}
            >
              <div
                className={cn(
                  "relative aspect-square cursor-pointer overflow-hidden border-2 transition-all lg:aspect-[4/5]",
                  index === selectedIndex
                    ? "border-primary"
                    : "hover:border-muted-foreground/50 border-transparent",
                )}
              >
                <Image
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Main Image */}
      <Carousel setApi={setMainApi} className="order-1 w-full lg:order-2">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={image}
                  alt={`${productName} image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface ProductImageCarousel1Props {
  images: string[];
  productName: string;
  className?: string;
}

export default function ProductImageCarousel1({
  images,
  productName,
  className,
}: ProductImageCarousel1Props) {
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
    <div className={cn("flex flex-col gap-3", className)}>
      <Carousel setApi={setMainApi} className="group w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-square w-full overflow-hidden">
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
        <CarouselPrevious
          className="bg-background/70 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="Previous image"
        />
        <CarouselNext
          className="bg-background/70 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="Next image"
        />
      </Carousel>

      <Carousel
        setApi={setThumbApi}
        opts={{
          containScroll: "keepSnaps",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {images.map((image, index) => (
            <CarouselItem
              key={index}
              className="basis-1/5 pl-2"
              onClick={() => onThumbClick(index)}
            >
              <div
                className={cn(
                  "relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
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
    </div>
  );
}

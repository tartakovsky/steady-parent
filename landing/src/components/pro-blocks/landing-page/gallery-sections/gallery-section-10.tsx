"use client";

import * as React from "react";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function GallerySection9() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const images = [
    { alt: "First image", src: "https://ui.shadcn.com/placeholder.svg" },
    { alt: "Second image", src: "https://ui.shadcn.com/placeholder.svg" },
    { alt: "Third image", src: "https://ui.shadcn.com/placeholder.svg" },
    { alt: "Fourth image", src: "https://ui.shadcn.com/placeholder.svg" },
    { alt: "Fifth image", src: "https://ui.shadcn.com/placeholder.svg" },
    { alt: "Sixth image", src: "https://ui.shadcn.com/placeholder.svg" },
  ];

  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
          <Tagline>Gallery section</Tagline>
          <h2 className="heading-lg text-foreground">
            Showcase your product with a gallery of images
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            This section is a great way to showcase your product with a gallery
            of images. Showcase your product in a more engaging way.
          </p>
        </div>
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="mb-12 w-full"
        >
          <CarouselContent className="-mr-3">
            {images.map((image, index) => {
              const selectedSnapIndex = current - 1;
              const indexOfSlideToMakeDim =
                count > 0 ? (selectedSnapIndex + 1) % count : -1;

              return (
                <CarouselItem
                  key={index}
                  className={cn(
                    "pl-4",
                    "basis-10/12",
                    index === indexOfSlideToMakeDim && count > 1
                      ? "opacity-50"
                      : "",
                  )}
                >
                  <div className="relative aspect-square md:aspect-video">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="h-full w-full object-cover"
                    />
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="absolute right-0 -bottom-16 hidden gap-2 md:flex">
            <CarouselPrevious className="static top-0 bottom-0 h-10 w-10 translate-y-0" />
            <CarouselNext className="static top-0 bottom-0 h-10 w-10 translate-y-0" />
          </div>
          <div className="absolute right-0 -bottom-12 left-0 py-4 md:right-auto md:-bottom-16">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-2 w-2 rounded-full",
                    current === index + 1 ? "bg-primary" : "bg-muted",
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
}

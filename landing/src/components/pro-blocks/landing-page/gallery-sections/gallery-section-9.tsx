"use client";

import * as React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
          <CarouselContent className="-ml-2 md:-ml-4">
            {images.map((image, index) => (
              <CarouselItem key={index} className="pl-3 md:pl-6 lg:basis-1/3">
                <AspectRatio ratio={1 / 1}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="h-full w-full object-cover"
                  />
                </AspectRatio>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute top-1/2 -left-4 hidden h-10 w-10 -translate-y-1/2 md:flex" />
          <CarouselNext className="absolute top-1/2 -right-4 hidden h-10 w-10 -translate-y-1/2 md:flex" />
          <div className="absolute right-0 -bottom-12 left-0 py-4">
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

"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function GallerySection12() {
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
        <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
          <div className="mb-4 break-inside-avoid">
            <AspectRatio ratio={4 / 3}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Gallery image 1"
                fill
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
          <div className="mb-4 break-inside-avoid">
            <AspectRatio ratio={3 / 4}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Gallery image 2"
                fill
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
          <div className="mb-4 break-inside-avoid">
            <AspectRatio ratio={16 / 9}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Gallery image 3"
                fill
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
          <div className="mb-4 break-inside-avoid">
            <AspectRatio ratio={1 / 1}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Gallery image 4"
                fill
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
          <div className="mb-4 break-inside-avoid">
            <AspectRatio ratio={4 / 5}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Gallery image 5"
                fill
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
          <div className="mb-4 break-inside-avoid">
            <AspectRatio ratio={3 / 2}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Gallery image 6"
                fill
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
          <div className="mb-4 break-inside-avoid">
            <AspectRatio ratio={2 / 3}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Gallery image 7"
                fill
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
          <div className="mb-4 break-inside-avoid">
            <AspectRatio ratio={5 / 4}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Gallery image 8"
                fill
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
          <div className="mb-4 break-inside-avoid">
            <AspectRatio ratio={4 / 3}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Gallery image 9"
                fill
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
}

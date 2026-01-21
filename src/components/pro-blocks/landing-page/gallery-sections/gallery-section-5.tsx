"use client";

import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function GallerySection5() {
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
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative col-span-1 aspect-square md:col-span-2 md:aspect-[16/9] md:min-h-auto lg:aspect-auto">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="First image"
              fill
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative aspect-square">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Second image"
              fill
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative aspect-square">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Third image"
              fill
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative aspect-square">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Fourth image"
              fill
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative aspect-square">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Fourth image"
              fill
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

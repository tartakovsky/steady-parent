"use client";

import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function X404Section2() {
  return (
    <section
      className="bg-background section-padding-y relative flex flex-col items-center overflow-hidden"
      aria-labelledby="error-title"
    >
      <div className="container-padding-x container flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-6 lg:gap-8">
          <div className="section-title-gap-xl flex flex-col">
            <Tagline>404 Section</Tagline>

            <h1 id="error-title" className="heading-xl">
              Page not found
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Sorry, we couldn't find the page you're looking for. Please check
              the URL or navigate back home.
            </p>
          </div>

          <div className="flex gap-2 md:w-auto">
            <Button>Go back home</Button>
            <Button variant="secondary">Contact support</Button>
          </div>
        </div>

        <div className="w-full flex-1">
          <AspectRatio ratio={1 / 1}>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="404 illustration"
              fill
              className="h-full w-full rounded-xl object-cover"
              priority
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}

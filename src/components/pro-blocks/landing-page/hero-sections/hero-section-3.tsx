"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function HeroSection3() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="order-2 w-full flex-1 lg:order-1">
          <AspectRatio ratio={1 / 1}>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Hero section visual"
              fill
              priority
              className="h-full w-full rounded-xl object-cover"
            />
          </AspectRatio>
        </div>
        <div className="order-1 flex flex-1 flex-col gap-6 lg:order-2 lg:gap-8">
          <div className="section-title-gap-xl flex flex-col items-center text-center lg:items-start lg:text-left">
            <Tagline variant="link">
              <span className="size-1.5 rounded-full bg-green-500" />
              <span className="hidden lg:inline">What's new · </span>
              <span className="lg:text-muted-foreground">
                Just shipped v2.0
              </span>
              <ArrowUpRight />
            </Tagline>
            <h1 id="hero-heading" className="heading-xl">
              Solve your user's main problem
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Follow with one or two sentences that expand on your value
              proposition and focus on key benefits.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 lg:justify-start">
            <Button>Get started</Button>
            <Button variant="secondary">Learn more</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

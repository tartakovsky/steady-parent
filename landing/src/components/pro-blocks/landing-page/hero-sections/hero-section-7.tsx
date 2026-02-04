"use client";

import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function HeroSection7() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center">
        <div className="mb-4 flex w-full justify-center md:mb-6 lg:justify-start">
          <Tagline variant="link">
            <span className="size-1.5 rounded-full bg-green-500" />
            <span className="hidden lg:inline">What's new · </span>
            <span className="lg:text-muted-foreground">Just shipped v2.0</span>
            <ArrowUpRight />
          </Tagline>
        </div>
        <div className="mb-12 flex gap-12 md:mb-16 lg:gap-16">
          <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-start lg:gap-16 lg:text-left">
            <h1 id="hero-heading" className="heading-xl flex-1">
              Solve your customer's main problem
            </h1>
            <div className="flex w-full max-w-md flex-1 flex-col gap-6">
              <p className="text-muted-foreground text-lg/8 text-pretty">
                Follow with one or two sentences that expand on your value
                proposition and focus on key benefits.
              </p>

              <div className="flex justify-center gap-2 lg:justify-start">
                <Button>Get started</Button>
                <Button variant="secondary">Learn more</Button>
              </div>
            </div>
          </div>
        </div>
        <AspectRatio ratio={16 / 9}>
          <Image
            src="https://ui.shadcn.com/placeholder.svg"
            alt="Hero section visual"
            fill
            priority
            className="h-full w-full rounded-xl object-cover"
          />
        </AspectRatio>
      </div>
    </section>
  );
}

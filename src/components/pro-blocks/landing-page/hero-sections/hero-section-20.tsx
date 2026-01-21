"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import Image from "next/image";

export function HeroSection20() {
  return (
    <section
      className="bg-background pt-12 md:pt-16"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto mb-12 flex max-w-7xl flex-col items-center gap-12 lg:gap-16">
        <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center gap-6 text-center lg:gap-8">
          <div className="section-title-gap-xl flex flex-col items-center text-center">
            <Tagline variant="link">
              <span className="size-1.5 rounded-full bg-green-500" />
              <span className="hidden lg:inline">What's new · </span>
              <span className="lg:text-muted-foreground">
                Just shipped v2.0
              </span>
              <ArrowUpRight />
            </Tagline>
            <h1 id="hero-heading" className="heading-xl">
              Solve your customer's main problem
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Follow with one or two sentences that expand on your value
              proposition and focus on key benefits.
            </p>
          </div>
          <Button
            className="md:flex-1"
            aria-label="Get started with our service"
          >
            Get started
            <ArrowRight />
          </Button>
        </div>
      </div>
      <div className="bg-muted relative w-full py-12">
        <div className="container-padding-x mx-auto max-w-7xl">
          <AspectRatio ratio={16 / 9}>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Hero Section"
              fill
              className="h-full w-full rounded-xl object-cover"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}

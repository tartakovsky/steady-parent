"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import Image from "next/image";

export function HeroSection16() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:gap-16">
        <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center gap-6 text-center lg:gap-8">
          <div className="section-title-gap-xl flex flex-col items-center text-center">
            <Tagline>Hero Section</Tagline>
            <h1 id="hero-heading" className="heading-xl">
              Solve your customer's main problem
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Follow with one or two sentences that expand on your value
              proposition. Focus on key benefits and address why users should
              take action now.
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

        <div className="grid-col-1 grid w-full gap-4 lg:grid-cols-5">
          <div className="relative col-span-1 hidden lg:col-span-3 lg:block">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Hero Section"
              fill
              className="h-full w-full rounded-xl object-cover"
            />
          </div>
          <div className="relative col-span-1 aspect-square lg:col-span-2">
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Hero Section"
              fill
              className="h-full w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

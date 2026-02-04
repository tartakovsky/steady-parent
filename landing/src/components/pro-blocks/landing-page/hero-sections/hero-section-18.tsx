"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Button } from "@/components/ui/button";

export function HeroSection18() {
  return (
    <section
      className="bg-background flex min-h-screen items-center justify-center"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:gap-16">
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
              proposition. Focus on key benefits and address why users should
              take action now.
            </p>
          </div>
          <Button>
            Get started
            <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}

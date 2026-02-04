"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export default function HeroSection21() {
  return (
    <section
      className="section-padding-y relative flex min-h-svh items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source
          src="https://www.shadcndesign.com/videos/academy-looped.mp4"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 z-0 bg-black/80" />
      <div className="container-padding-x relative z-1 mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center gap-6 text-center lg:gap-8">
          <div className="section-title-gap-xl flex flex-col items-center text-center">
            <Tagline variant="white">Hero Section</Tagline>
            <h1 id="hero-heading" className="heading-xl text-white">
              Solve your customer's main problem
            </h1>
            <p className="text-lg/8 text-pretty text-white/80">
              Follow with one or two sentences that expand on your value
              proposition and focus on key benefits.
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

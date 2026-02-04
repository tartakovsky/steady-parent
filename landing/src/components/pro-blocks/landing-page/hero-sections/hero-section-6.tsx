"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export default function HeroSection6() {
  return (
    <section
      className="section-padding-y relative overflow-hidden bg-[url('https://ui.shadcn.com/placeholder.svg')] bg-cover bg-center"
      aria-labelledby="hero-heading"
    >
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

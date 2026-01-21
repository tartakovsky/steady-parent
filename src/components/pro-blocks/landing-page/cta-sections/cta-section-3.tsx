"use client";

import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
export function CtaSection3() {
  return (
    <section
      className="md:bg-background bg-primary"
      aria-labelledby="cta-heading"
    >
      <div className="container-padding-x bg-primary mx-auto max-w-7xl py-16 md:rounded-xl md:p-16">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-8 md:max-w-full lg:flex-row lg:gap-16">
          <div className="w-full flex-1">
            <AspectRatio ratio={1}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="CTA section image"
                fill
                className="rounded-xl object-cover"
              />
            </AspectRatio>
          </div>
          <div className="flex flex-1 flex-col items-center gap-8 md:gap-10 lg:items-start">
            <div className="section-title-gap-lg mx-auto flex flex-col items-center text-center lg:items-start lg:text-left">
              <Tagline className="text-primary-foreground">CTA Section</Tagline>
              <h2
                id="cta-heading"
                className="heading-lg text-primary-foreground"
              >
                Action-driving headline that creates urgency
              </h2>
              <p className="text-primary-foreground/80 text-lg/8 text-pretty">
                Add one or two compelling sentences that reinforce your main
                value proposition and overcome final objections.
              </p>
            </div>
            <Button
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/80"
              aria-label="Get started with our service"
            >
              Get started
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

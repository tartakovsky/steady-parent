"use client";

import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function CtaSection5() {
  return (
    <section
      className="md:bg-background bg-primary py-0 lg:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="md:container-padding-x mx-auto max-w-7xl">
        <div className="bg-primary w-full overflow-hidden rounded-xl pt-16 lg:pl-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-between gap-4 px-6 text-center lg:max-w-full lg:items-start lg:gap-8 lg:px-0 lg:pb-16 lg:text-left">
              <div className="section-title-gap-lg flex flex-col items-center text-center lg:items-start lg:text-left">
                <Tagline className="text-primary-foreground/80">
                  CTA Section
                </Tagline>
                <h2
                  id="cta-heading"
                  className="heading-lg text-primary-foreground"
                >
                  Action-driving headline that creates urgency
                </h2>
              </div>
              <div className="flex flex-col items-center gap-6 lg:items-start">
                <p className="text-primary-foreground/80 text-lg/8 text-pretty">
                  Add one or two compelling sentences that reinforce your main
                  value proposition and overcome final objections.
                </p>
                <Button
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/80"
                  aria-label="Get started with our service"
                >
                  Get started <ArrowRight />
                </Button>
              </div>
            </div>
            <div className="w-full flex-1 pl-6 lg:pl-0">
              <AspectRatio ratio={4 / 3}>
                <Image
                  src="https://ui.shadcn.com/placeholder.svg"
                  alt="CTA section image"
                  fill
                  className="h-full w-full rounded-tl-lg object-cover"
                />
              </AspectRatio>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

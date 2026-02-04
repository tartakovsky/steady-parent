"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FeatureSection4() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-8">
          <div className="section-title-gap-lg flex flex-col">
            <Tagline>Feature section</Tagline>
            <h2 className="heading-lg text-foreground">
              Show your solution's impact on user success
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Explain in one or two concise sentences how your solution
              transforms users' challenges into positive outcomes.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <Check className="text-primary size-5" />
                <span className="text-muted-foreground leading-5 font-medium">
                  Responsive design
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Check className="text-primary size-5" />
                <span className="text-muted-foreground leading-5 font-medium">
                  Customizable templates
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Check className="text-primary size-5" />
                <span className="text-muted-foreground leading-5 font-medium">
                  AI-powered insights
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full gap-2 md:w-auto">
            <Button>Get access</Button>
            <Button variant="secondary">Learn more</Button>
          </div>
        </div>

        <div className="w-full flex-1">
          <AspectRatio ratio={1 / 1}>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Feature section image"
              fill
              className="rounded-xl object-cover"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}

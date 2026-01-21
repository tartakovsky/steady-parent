"use client";

import { Button } from "@/components/ui/button";
import { Rocket, ChartArea } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FeatureSection6() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Tagline>Feature section</Tagline>
            <h2 className="text-foreground heading-lg">
              Show your solution's impact on user success
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Explain in one or two concise sentences how your solution
              transforms users' challenges into positive outcomes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
            <div className="flex flex-col gap-5">
              <div className="bg-background flex h-10 w-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
                <ChartArea className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-foreground font-semibold">
                  Benefit driven title
                </h3>
                <p className="text-muted-foreground">
                  Shortly describe how this feature solves a specific user
                  problem.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="bg-background flex h-10 w-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
                <Rocket className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-foreground font-semibold">
                  Benefit driven title
                </h3>
                <p className="text-muted-foreground">
                  Shortly describe how this feature solves a specific user
                  problem.
                </p>
              </div>
            </div>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <Button>Get access</Button>
            <Button variant="secondary">Learn more</Button>
          </div>
        </div>

        <div className="w-full flex-1">
          <AspectRatio ratio={1}>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Hero image"
              fill
              className="h-full w-full rounded-xl object-cover"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}

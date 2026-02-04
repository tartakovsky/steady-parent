"use client";

import { Rocket, ChartArea, ChartColumnIncreasing } from "lucide-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FeatureSection15() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="order-2 w-full flex-1 lg:order-1">
            <AspectRatio ratio={4 / 5}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Feature section image"
                fill
                className="rounded-xl object-cover"
              />
            </AspectRatio>
          </div>

          <div className="order-1 flex flex-1 flex-col gap-10 md:gap-12 lg:order-2">
            <div className="section-title-gap-lg flex flex-col">
              <Tagline>Feature section</Tagline>
              <h2 className="heading-lg text-foreground">
                Show your solution's impact on user success
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-col gap-5 md:flex-row">
                <ChartArea className="text-primary size-6 shrink-0 stroke-2 md:mt-1" />
                <div className="space-y-2">
                  <h3 className="text-foreground heading-sm">
                    Benefit driven feature title
                  </h3>
                  <p className="text-muted-foreground text-base/7 text-pretty">
                    Shortly describe how this feature solves a specific user
                    problem. Focus on benefits not on technical details.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-5 md:flex-row">
                <ChartColumnIncreasing className="text-primary size-6 shrink-0 stroke-2 md:mt-1" />
                <div className="space-y-2">
                  <h3 className="text-foreground heading-sm">
                    Benefit driven feature title
                  </h3>
                  <p className="text-muted-foreground text-base/7 text-pretty">
                    Shortly describe how this feature solves a specific user
                    problem. Focus on benefits not on technical details.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-5 md:flex-row">
                <Rocket className="text-primary size-6 shrink-0 stroke-2 md:mt-1" />
                <div className="space-y-2">
                  <h3 className="text-foreground heading-sm">
                    Benefit driven feature title
                  </h3>
                  <p className="text-muted-foreground text-base/7 text-pretty">
                    Shortly describe how this feature solves a specific user
                    problem. Focus on benefits not on technical details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

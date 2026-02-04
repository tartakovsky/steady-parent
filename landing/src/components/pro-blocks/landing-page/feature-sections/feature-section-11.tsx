"use client";

import { Rocket, ChartArea, ChartColumnIncreasing } from "lucide-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FeatureSection11() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
          <Tagline>Feature section</Tagline>
          <h2 className="heading-lg text-foreground">
            Show your solution's impact on user success
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            Explain in one or two concise sentences how your solution transforms
            users' challenges into positive outcomes.
          </p>
        </div>
        <div className="w-full flex-1">
          <AspectRatio ratio={16 / 9}>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Feature section image"
              fill
              className="rounded-xl object-cover"
            />
          </AspectRatio>
        </div>
        <div className="grid grid-cols-1 gap-8 md:gap-6 lg:grid-cols-3">
          <div className="flex flex-col items-center gap-4 text-center sm:gap-5 md:flex-row md:items-start md:text-left">
            <div className="bg-background flex h-10 w-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
              <Rocket className="text-primary h-5 w-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground font-semibold">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem. Focus on benefits not on technical details.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 text-center sm:gap-5 md:flex-row md:items-start md:text-left">
            <div className="bg-background flex h-10 w-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
              <ChartColumnIncreasing className="text-primary h-5 w-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground font-semibold">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem. Focus on benefits not on technical details.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 text-center sm:gap-5 md:flex-row md:items-start md:text-left">
            <div className="bg-background flex h-10 w-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
              <ChartArea className="text-primary h-5 w-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground font-semibold">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem. Focus on benefits not on technical details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

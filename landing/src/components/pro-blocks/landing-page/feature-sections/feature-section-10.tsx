"use client";

import {
  Rocket,
  ArrowRight,
  ChartArea,
  ChartColumnIncreasing,
} from "lucide-react";
import Link from "next/link";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FeatureSection10() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex flex-col items-start lg:max-w-xl lg:items-center lg:text-center">
          <Tagline>Feature section</Tagline>
          <h2 className="heading-lg text-foreground">
            Show your solution's impact on user success
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            Explain in one or two concise sentences how your solution transforms
            users' challenges into positive outcomes.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          <div className="flex flex-col gap-6">
            <div className="bg-background flex size-12 shrink-0 items-center justify-center rounded-md border shadow-xs">
              <ChartArea className="text-primary size-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground heading-sm">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem. Focus on benefits not on technical details.
              </p>
            </div>
            <Link
              href="#"
              className="text-primary hover:text-primary/90 group flex items-center gap-2 font-medium"
            >
              Learn more
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-background flex size-12 shrink-0 items-center justify-center rounded-md border shadow-xs">
              <ChartColumnIncreasing className="text-primary size-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground heading-sm">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem. Focus on benefits not on technical details.
              </p>
            </div>
            <Link
              href="#"
              className="text-primary hover:text-primary/90 group flex items-center gap-2 font-medium"
            >
              Learn more
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-background flex size-12 shrink-0 items-center justify-center rounded-md border shadow-xs">
              <Rocket className="text-primary size-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground heading-sm">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem. Focus on benefits not on technical details.
              </p>
            </div>
            <Link
              href="#"
              className="text-primary hover:text-primary/90 group flex items-center gap-2 font-medium"
            >
              Learn more
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

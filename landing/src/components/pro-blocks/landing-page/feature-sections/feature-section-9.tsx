"use client";

import { Rocket } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FeatureSection9() {
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
              <Rocket className="text-primary size-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground font-semibold tracking-tight">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
              <Rocket className="text-primary size-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground font-semibold tracking-tight">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
              <Rocket className="text-primary size-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground font-semibold tracking-tight">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
              <Rocket className="text-primary size-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground font-semibold tracking-tight">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

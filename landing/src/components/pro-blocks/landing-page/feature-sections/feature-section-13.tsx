"use client";

import { Check } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FeatureSection13() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10 md:gap-16 lg:flex-row">
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
          </div>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
          <div className="flex gap-4">
            <Check className="text-primary mt-0 size-6 shrink-0 md:mt-1" />
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground heading-sm">Feature title 1</h3>
              <p className="text-muted-foreground text-pretty">
                Explain how this feature addresses a specific user need or
                challenges.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Check className="text-primary mt-0 size-6 shrink-0 md:mt-1" />
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground heading-sm">Feature title 2</h3>
              <p className="text-muted-foreground text-pretty">
                Explain how this feature addresses a specific user need or
                challenges.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Check className="text-primary mt-0 size-6 shrink-0 md:mt-1" />
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground heading-sm">Feature title 3</h3>
              <p className="text-muted-foreground text-pretty">
                Explain how this feature addresses a specific user need or
                challenges.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Check className="text-primary mt-0 size-6 shrink-0 md:mt-1" />
            <div className="flex flex-col gap-2">
              <h3 className="text-foreground heading-sm">Feature title 4</h3>
              <p className="text-muted-foreground text-pretty">
                Explain how this feature addresses a specific user need or
                challenges.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Check className="text-primary mt-0 size-6 shrink-0 md:mt-1" />
            <div className="flex flex-col gap-1">
              <h3 className="text-foreground heading-sm">Feature title 5</h3>
              <p className="text-muted-foreground text-pretty">
                Explain how this feature addresses a specific user need or
                challenges.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Check className="text-primary mt-0 size-6 shrink-0 md:mt-1" />
            <div className="flex flex-col gap-1">
              <h3 className="text-foreground heading-sm">Feature title 6</h3>
              <p className="text-muted-foreground text-pretty">
                Explain how this feature addresses a specific user need or
                challenges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

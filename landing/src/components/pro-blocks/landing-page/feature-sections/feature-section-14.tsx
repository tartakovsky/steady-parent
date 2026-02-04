"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FeatureSection14() {
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
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-6">
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <AspectRatio ratio={4 / 3}>
                <Image
                  src="https://ui.shadcn.com/placeholder.svg"
                  alt="Card image"
                  fill
                  className="rounded-xl object-cover"
                />
              </AspectRatio>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-foreground heading-sm">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem. Focus on user's benefits not on technical details.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <AspectRatio ratio={4 / 3}>
                <Image
                  src="https://ui.shadcn.com/placeholder.svg"
                  alt="Card image"
                  fill
                  className="rounded-xl object-cover"
                />
              </AspectRatio>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-foreground heading-sm">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem. Focus on user's benefits not on technical details.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <AspectRatio ratio={4 / 3}>
                <Image
                  src="https://ui.shadcn.com/placeholder.svg"
                  alt="Card image"
                  fill
                  className="rounded-xl object-cover"
                />
              </AspectRatio>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-foreground heading-sm">
                Benefit driven feature title
              </h3>
              <p className="text-muted-foreground text-pretty">
                Shortly describe how this feature solves a specific user
                problem. Focus on user's benefits not on technical details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

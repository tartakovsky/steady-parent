"use client";

import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FeatureSection7() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-2xl flex-col gap-12">
        <div className="flex flex-1 flex-col gap-8">
          <div className="section-title-gap-lg flex flex-col">
            <Tagline>Feature section</Tagline>
            <h2 className="heading-lg text-foreground">
              Show your solution's impact on user success
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Explain in one or two concise sentences how your solution
              transforms users' challenges into positive outcomes. Focus on the
              end benefits that matter most to your target audience. Keep it
              clear and compelling.
            </p>
          </div>
          <div className="flex gap-2">
            <Button>Get access</Button>
            <Button variant="secondary">Learn more</Button>
          </div>
        </div>
        <div className="w-full flex-1">
          <AspectRatio ratio={4 / 3}>
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

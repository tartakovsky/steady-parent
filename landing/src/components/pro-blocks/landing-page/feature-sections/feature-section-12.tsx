"use client";

import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FeatureSection12() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-12">
          <div className="flex flex-col gap-8">
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
            <div className="flex w-full gap-2 md:w-auto">
              <Button>Get access</Button>
              <Button variant="secondary">Learn more</Button>
            </div>
          </div>
          <div className="md:border-border flex flex-col gap-6 md:border-l md:border-l-2 md:px-6">
            <blockquote className="text-foreground font-medium md:text-lg">
              "This is a customer testimonial that supports the feature text
              above. Lorem ipsum dolor sit amet, consectetur adipiscing elit
              interdum hendrerit ex vitae sodales."
            </blockquote>
            <div className="flex flex-row items-center gap-4">
              <Avatar className="size-10">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="Lando Norris"
                />
              </Avatar>
              <div className="flex flex-col">
                <p className="text-foreground font-medium">Lando Norris</p>
                <p className="text-muted-foreground text-pretty">
                  Product Designer
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex-1">
          <AspectRatio ratio={1}>
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

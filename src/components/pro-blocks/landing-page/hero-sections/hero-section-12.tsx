"use client";

import { Button } from "@/components/ui/button";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function HeroSection12() {
  return (
    <section className="bg-background" aria-labelledby="hero-heading">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-stretch gap-0 lg:flex-row lg:gap-16">
        <div className="md:section-padding-y flex flex-1 flex-col items-center justify-between gap-10 pt-16 pb-12 text-center lg:items-start lg:text-left">
          <div className="section-title-gap-xl flex flex-col items-center text-center lg:items-start lg:text-left">
            <Tagline variant="link">
              <span className="size-1.5 rounded-full bg-green-500" />
              <span className="hidden lg:inline">What's new · </span>
              <span className="lg:text-muted-foreground">
                Just shipped v2.0
              </span>
              <ArrowUpRight />
            </Tagline>
            <h1 id="hero-heading" className="heading-xl">
              Solve your user's main problem
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Follow with one or two sentences that expand on your value
              proposition and focus on key benefits.
            </p>
            <Button className="mt-2">Get started</Button>
          </div>
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:size-9 *:data-[slot=avatar]:ring-2">
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <p className="text-muted-foreground font-medium">
              Loved by{" "}
              <span className="text-foreground font-semibold">10,000+</span>{" "}
              designers
            </p>
          </div>
        </div>

        <div className="relative aspect-square w-full flex-1 lg:aspect-[4/5]">
          <Image
            src="https://ui.shadcn.com/placeholder.svg"
            alt="Hero section visual"
            fill
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

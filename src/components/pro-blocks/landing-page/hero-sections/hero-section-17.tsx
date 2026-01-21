"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import Image from "next/image";

const images = [
  "https://ui.shadcn.com/placeholder.svg",
  "https://ui.shadcn.com/placeholder.svg",
  "https://ui.shadcn.com/placeholder.svg",
  "https://ui.shadcn.com/placeholder.svg",
  "https://ui.shadcn.com/placeholder.svg",
  "https://ui.shadcn.com/placeholder.svg",
  "https://ui.shadcn.com/placeholder.svg",
  "https://ui.shadcn.com/placeholder.svg",
];

export function HeroSection17() {
  return (
    <section
      className="bg-background section-padding-y relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto mb-12 flex max-w-7xl flex-col items-center gap-12 md:mb-16 lg:gap-16">
        <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center gap-6 text-center lg:gap-8">
          <div className="section-title-gap-xl flex flex-col items-center text-center">
            <Tagline variant="link">
              <span className="size-1.5 rounded-full bg-green-500" />
              <span className="hidden lg:inline">What's new · </span>
              <span className="lg:text-muted-foreground">
                Just shipped v2.0
              </span>
              <ArrowUpRight />
            </Tagline>
            <h1 id="hero-heading" className="heading-xl">
              Solve your customer's main problem
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Follow with one or two sentences that expand on your value
              proposition and focus on key benefits.
            </p>
          </div>
          <Button
            className="md:flex-1"
            aria-label="Get started with our service"
          >
            Get started
            <ArrowRight />
          </Button>
        </div>
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="animate-infinite-scroll flex w-max gap-4">
          {[...images, ...images].map((src, index) => (
            <div
              key={`image-${index}`}
              className="relative aspect-square w-[240px] flex-shrink-0 md:w-[400px]"
            >
              <Image
                src={src}
                alt={`Hero Section ${(index % images.length) + 1}`}
                fill
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes infinite-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50%));
          }
        }

        .animate-infinite-scroll {
          animation: infinite-scroll 40s linear infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  );
}

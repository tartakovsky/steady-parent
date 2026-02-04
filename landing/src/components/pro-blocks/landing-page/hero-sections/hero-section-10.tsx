"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import Image from "next/image";
import { PlaceholderLogoBuzzsnap } from "@/components/pro-blocks/placeholder-logo-buzzsnap";
import { PlaceholderLogoDashstar } from "@/components/pro-blocks/placeholder-logo-dashstar";
import { PlaceholderLogoEditly } from "@/components/pro-blocks/placeholder-logo-editly";
import { PlaceholderLogoGeoaura } from "@/components/pro-blocks/placeholder-logo-geoaura";
import { PlaceholderLogoNanodea } from "@/components/pro-blocks/placeholder-logo-nanodea";

const logosData = [
  {
    id: 1,
    component: PlaceholderLogoBuzzsnap,
    alt: "Buzzsnap logo",
  },
  {
    id: 2,
    component: PlaceholderLogoDashstar,
    alt: "Dashstar logo",
  },
  {
    id: 3,
    component: PlaceholderLogoEditly,
    alt: "Editly logo",
  },
  {
    id: 4,
    component: PlaceholderLogoGeoaura,
    alt: "Geoaura logo",
  },
  {
    id: 5,
    component: PlaceholderLogoNanodea,
    alt: "Nanodea logo",
  },
];

export function HeroSection10() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:gap-16">
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
        <AspectRatio ratio={16 / 9}>
          <Image
            src="https://ui.shadcn.com/placeholder.svg"
            alt="Hero Section"
            fill
            priority
            className="h-full w-full rounded-xl object-cover"
          />
        </AspectRatio>
        <div className="flex flex-col items-center gap-8">
          <p className="text-muted-foreground text-center">
            Loved by 20K+ creators, including teams at:
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:gap-x-12">
            {logosData.map((logo) => {
              const LogoComponent = logo.component;

              return (
                <LogoComponent
                  key={logo.id}
                  className="text-foreground dark:text-foreground h-8 w-auto"
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

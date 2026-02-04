"use client";

import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Button } from "@/components/ui/button";

export function HeaderSection12() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="page-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:gap-6 lg:text-left">
          <Tagline>Header section</Tagline>
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-12">
            <h1 id="page-heading" className="heading-xl text-foreground flex-1">
              Header section title
            </h1>
            <div className="flex flex-1 flex-col items-center gap-6 text-center md:gap-8 lg:items-start lg:text-left">
              <p
                className="text-muted-foreground text-center text-lg/8 text-pretty lg:text-left"
                aria-description="page description"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit interdum
                hendrerit ex vitae sodales.
              </p>
              <div className="flex gap-2">
                <Button>Get started</Button>
                <Button variant="secondary">Explore more</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

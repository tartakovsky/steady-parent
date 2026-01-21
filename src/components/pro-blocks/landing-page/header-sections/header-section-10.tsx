"use client";

import { Button } from "@/components/ui/button";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function HeaderSection10() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="page-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col items-stretch gap-6 sm:items-start md:gap-8">
          <div className="section-title-gap-xl flex max-w-xl flex-col items-center text-center sm:items-start sm:text-left">
            <Tagline>Header section</Tagline>
            <h1 id="page-heading" className="heading-xl text-foreground">
              Header section title
            </h1>
            <p
              className="text-muted-foreground text-lg/8 text-pretty"
              aria-description="page description"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit interdum
              hendrerit ex vitae sodales.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button>Get started</Button>
            <Button variant="secondary">Explore more</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

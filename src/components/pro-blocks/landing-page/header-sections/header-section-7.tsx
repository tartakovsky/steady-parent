"use client";

import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function HeaderSection7() {
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
            <p
              className="text-muted-foreground flex-1 text-lg/8 text-pretty"
              aria-description="page description"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit interdum
              hendrerit ex vitae sodales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

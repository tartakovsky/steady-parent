"use client";

import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function HeaderSection3() {
  return (
    <section
      className="section-padding-y bg-neutral-950"
      aria-labelledby="page-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="section-title-gap-xl mx-auto flex max-w-xl flex-1 flex-col items-center text-center">
          <div className="section-title-gap-xl flex flex-col items-center">
            <Tagline className="text-white/80">Header section</Tagline>
            <h1 id="page-heading" className="heading-xl text-white">
              Header section title
            </h1>
            <p
              className="text-lg/8 text-pretty text-white/80"
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

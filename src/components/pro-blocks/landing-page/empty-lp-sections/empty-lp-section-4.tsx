"use client";

import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function EmptyLpSection4() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:gap-16">
          <div className="flex flex-col items-center gap-4 text-center md:gap-5 lg:items-start lg:text-left">
            <Tagline>Empty section</Tagline>
            <div className="flex flex-col gap-4 lg:flex-row lg:gap-12">
              <h2 className="heading-lg text-foreground flex-1">
                Empty landing page section
              </h2>
              <p className="text-muted-foreground flex-1 text-lg/8 text-pretty">
                Feel free to utilize this section as a foundational starting
                point, where you can add your content below.
              </p>
            </div>
          </div>
          <div className="border-border bg-muted w-full flex-1 border border-dashed p-6 text-center">
            Replace this div with your content
          </div>
        </div>
      </div>
    </section>
  );
}

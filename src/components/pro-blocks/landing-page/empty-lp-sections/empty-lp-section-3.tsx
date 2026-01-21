"use client";

import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function EmptyLpSection3() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg flex max-w-xl flex-col">
            <Tagline>Empty section</Tagline>
            <h2 className="heading-lg text-foreground">
              Empty landing page section
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Feel free to utilize this section as a foundational starting
              point, where you can add your content below.
            </p>
          </div>
          <div className="border-border bg-muted w-full flex-1 border border-dashed p-6 text-center">
            Replace this div with your content
          </div>
        </div>
      </div>
    </section>
  );
}

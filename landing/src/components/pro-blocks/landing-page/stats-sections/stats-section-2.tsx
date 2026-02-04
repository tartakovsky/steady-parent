"use client";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function StatsSection2() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg flex max-w-2xl flex-col">
            <Tagline>Stats section</Tagline>
            <h2 className="heading-lg text-foreground">
              Data-driven highlights that showcase impact
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Add a concise value statement that explains how your metrics
              demonstrate success and growth. Focus on transformation and
              measurable outcomes.
            </p>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            <div className="flex flex-col gap-2 md:gap-3">
              <p className="text-foreground heading-md">124%</p>
              <p className="text-muted-foreground text-pretty">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              <p className="text-foreground heading-md">88%</p>
              <p className="text-muted-foreground text-pretty">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              <p className="text-foreground heading-md">25%</p>
              <p className="text-muted-foreground text-pretty">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function StatsSection7() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-start gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-8">
          <div className="section-title-gap-lg flex flex-col">
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
        </div>

        <div className="w-full flex-1">
          <div className="grid grid-cols-1 gap-6 gap-y-8 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h3 className="text-foreground heading-md">256K</h3>
              <p className="text-muted-foreground text-pretty">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-foreground heading-md">142%</h3>
              <p className="text-muted-foreground text-pretty">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-foreground heading-md">$34.7M</h3>
              <p className="text-muted-foreground text-pretty">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-foreground heading-md">98.5%</h3>
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

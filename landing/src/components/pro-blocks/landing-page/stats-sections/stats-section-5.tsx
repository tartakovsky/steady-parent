"use client";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function StatsSection5() {
  return (
    <section className="section-padding-y relative overflow-hidden bg-[url('https://ui.shadcn.com/placeholder.svg')] bg-cover bg-center">
      <div className="absolute inset-0 z-0 bg-black/80" />
      <div className="container-padding-x relative z-1 mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:gap-12">
          <div className="section-title-gap-lg flex max-w-2xl flex-col">
            <Tagline className="text-white/80">Stats section</Tagline>
            <h2 className="heading-lg text-white">
              Data-driven highlights that showcase impact
            </h2>
            <p className="text-lg/8 text-pretty text-white/80">
              Add a concise value statement that explains how your metrics
              demonstrate success and growth. Focus on transformation and
              measurable outcomes.
            </p>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            <div className="flex flex-col gap-2 md:gap-3">
              <p className="heading-md text-white">124%</p>
              <p className="text-pretty text-white/80">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              <p className="heading-md text-white">88%</p>
              <p className="text-pretty text-white/80">
                Each stat should include a bold numerical figure followed by a
                brief, compelling description.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              <p className="heading-md text-white">25%</p>
              <p className="text-pretty text-white/80">
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

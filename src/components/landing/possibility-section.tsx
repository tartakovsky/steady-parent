"use client";

import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function PossibilitySection() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center gap-4">
          <Tagline>What if...</Tagline>
          <h2 className="heading-xl text-foreground">
            A powerful statement about the transformed future
          </h2>
        </div>
      </div>
    </section>
  );
}

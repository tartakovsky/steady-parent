"use client";

import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

interface PossibilityContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
}

const possibilityContent: PossibilityContent = {
  eyebrow: "What if...",
  title: "A powerful statement about the transformed future",
};

export function PossibilitySection() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center gap-4">
          <Tagline>{possibilityContent.eyebrow}</Tagline>
          <h2 className="heading-xl text-foreground">
            {possibilityContent.title}
          </h2>
        </div>
      </div>
    </section>
  );
}

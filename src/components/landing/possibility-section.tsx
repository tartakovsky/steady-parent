"use client";

import type React from "react";

import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import type { PossibilityContent } from "@/content/landing/types";

interface PossibilitySectionProps {
  content: PossibilityContent;
}

export function PossibilitySection({
  content,
}: PossibilitySectionProps): React.JSX.Element {
  return (
    <section className="bg-primary section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <Tagline className="text-foreground/70">
            {content.eyebrow}
          </Tagline>
          <h2 className="heading-xl text-foreground">
            {content.title}
          </h2>
        </div>
      </div>
    </section>
  );
}

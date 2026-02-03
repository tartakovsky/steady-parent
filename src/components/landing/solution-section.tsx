"use client";

import type React from "react";

import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import type { SolutionContent } from "@/content/landing/types";

interface SolutionSectionProps {
  content: SolutionContent;
}

export function SolutionSection({
  content,
}: SolutionSectionProps): React.JSX.Element {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-4xl">
        <div className="flex flex-col gap-4">
          <Tagline>{content.eyebrow}</Tagline>
          <h2 className="heading-lg text-foreground">{content.title}</h2>
          <p className="text-muted-foreground text-lg/8 text-pretty whitespace-pre-line">
            {content.body}
          </p>
        </div>
      </div>
    </section>
  );
}


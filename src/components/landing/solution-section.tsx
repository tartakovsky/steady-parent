"use client";

import type React from "react";

import Image from "next/image";

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
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex w-full flex-1 flex-col gap-4">
          <Tagline>{content.eyebrow}</Tagline>
          <h2 className="heading-lg text-foreground">{content.title}</h2>
          <p className="text-muted-foreground text-lg/8 text-pretty whitespace-pre-line">
            {content.body}
          </p>
        </div>

        {typeof content.imageUrl === "string" && content.imageUrl.length > 0 ? (
          <div className="w-full flex-1">
            <Image
              src={content.imageUrl}
              alt={content.imageAlt}
              width={900}
              height={900}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full object-contain"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}


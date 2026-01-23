"use client";

import type React from "react";

import { Check } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import type { RecognitionContent } from "@/content/landing/types";

interface RecognitionSectionProps {
  content: RecognitionContent;
}

export function RecognitionSection({
  content,
}: RecognitionSectionProps): React.JSX.Element {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-8">
          <div className="section-title-gap-lg flex flex-col">
            <Tagline>{content.eyebrow}</Tagline>
            <h2 className="heading-lg text-foreground">
              {content.title}
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              {content.body}
            </p>
            {content.bullets.length > 0 ? (
              <div className="flex flex-col gap-3">
                {content.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-2">
                    <Check className="text-primary size-5" />
                    <span className="text-muted-foreground leading-5 font-medium">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {content.imageUrl ? (
          <div className="w-full flex-1">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={content.imageUrl}
                alt={content.imageAlt}
                fill
                className="rounded-xl object-cover"
              />
            </AspectRatio>
          </div>
        ) : null}
      </div>
    </section>
  );
}

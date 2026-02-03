"use client";

import type React from "react";

import { Check } from "lucide-react";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import type { RecognitionContent } from "@/content/landing/types";

interface RecognitionSectionProps {
  content: RecognitionContent;
}

const SECTION_IMAGE_WIDTH = 1200;
const SECTION_IMAGE_HEIGHT = 900;

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
            <p className="text-muted-foreground text-lg/8 text-pretty whitespace-pre-line">
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

        {typeof content.imageUrl === "string" && content.imageUrl.length > 0 ? (
          <div className="w-full flex-1">
            <Image
              src={content.imageUrl}
              alt={content.imageAlt}
              width={SECTION_IMAGE_WIDTH}
              height={SECTION_IMAGE_HEIGHT}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full rounded-xl object-contain"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

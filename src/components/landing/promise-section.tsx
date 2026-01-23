"use client";

import { Check } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

interface PromiseContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Optional bullet list. */
  bullets: readonly string[];
  /** Optional image URL. */
  imageUrl?: string;
  /** Image alt text. */
  imageAlt: string;
}

const promiseContent: PromiseContent = {
  eyebrow: "What you get",
  title: "Show your solution's impact on user success",
  body:
    "Explain in one or two concise sentences how your solution transforms users' challenges into positive outcomes.",
  bullets: ["Responsive design", "Customizable templates", "AI-powered insights"],
  imageUrl: "https://ui.shadcn.com/placeholder.svg",
  imageAlt: "Feature section image",
};

export function PromiseSection() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-8">
          <div className="section-title-gap-lg flex flex-col">
            <Tagline>{promiseContent.eyebrow}</Tagline>
            <h2 className="heading-lg text-foreground">
              {promiseContent.title}
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              {promiseContent.body}
            </p>
            {promiseContent.bullets.length > 0 ? (
              <div className="flex flex-col gap-3">
                {promiseContent.bullets.map((bullet) => (
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

        {promiseContent.imageUrl ? (
          <div className="w-full flex-1">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={promiseContent.imageUrl}
                alt={promiseContent.imageAlt}
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

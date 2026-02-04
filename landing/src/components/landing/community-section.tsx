"use client";

import type React from "react";

import { Check, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import type { CommunityContent } from "@/content/landing/types";

interface CommunitySectionProps {
  content: CommunityContent;
}

export function CommunitySection({
  content,
}: CommunitySectionProps): React.JSX.Element {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto max-w-4xl">
        <div className="flex flex-col gap-10">
          <div className="section-title-gap-lg flex flex-col">
            <Tagline>{content.eyebrow}</Tagline>
            <h2 className="heading-lg text-foreground">{content.title}</h2>
            <p className="text-muted-foreground text-lg/8 text-pretty whitespace-pre-line">
              {content.body}
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <h3 className="text-foreground heading-sm">
                {content.leftListTitle}
              </h3>
              <div className="flex flex-col gap-3">
                {content.leftListItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <HelpCircle className="text-muted-foreground size-5 shrink-0" />
                    <span className="text-muted-foreground text-sm italic leading-6">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <h3 className="text-foreground heading-sm">
                {content.rightListTitle}
              </h3>
              <div className="flex flex-col gap-3">
                {content.rightListItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="text-primary size-5 shrink-0" />
                    <span className="text-muted-foreground leading-6 font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 text-center">
            <p className="text-muted-foreground text-sm">{content.footer}</p>
            <Button asChild size="lg" className="h-12 px-10 text-base">
              <a href={content.cta.href}>{content.cta.label}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import type { LeadMagnetContent } from "@/content/landing/types";

interface LeadMagnetProps {
  content: LeadMagnetContent;
}

export function LeadMagnet({ content }: LeadMagnetProps): React.JSX.Element {
  return (
    <section
      className="bg-primary section-padding-y"
      aria-labelledby="lead-magnet-heading"
    >
      <div className="mx-auto max-w-xl px-6">
        <div className="flex flex-col gap-8">
          <div className="section-title-gap-lg flex max-w-xl flex-col">
            <Tagline className="text-foreground/70">
              {content.eyebrow}
            </Tagline>
            <h2
              id="lead-magnet-heading"
              className="heading-lg text-foreground"
            >
              {content.title}
            </h2>
            <p className="text-foreground/70 text-lg/8 text-pretty">
              {content.body}
            </p>
          </div>

          <form
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
            }}
            aria-label="Lead magnet signup form"
          >
            <Input
              id="lead-email"
              placeholder={content.inputPlaceholder}
              type="email"
              required
              aria-required="true"
              aria-label="Email address"
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              {content.buttonLabel}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

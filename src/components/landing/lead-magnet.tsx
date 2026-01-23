"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

interface LeadMagnetContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Input placeholder text. */
  inputPlaceholder: string;
  /** Button label, max 4 words. */
  buttonLabel: string;
}

const leadMagnetContent: LeadMagnetContent = {
  eyebrow: "Free resource",
  title: "Get the free cheat sheet",
  body: "Enter your email and get instant access to our exclusive guide.",
  inputPlaceholder: "Enter your email",
  buttonLabel: "Get access",
};

export function LeadMagnet() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="lead-magnet-heading"
    >
      <div className="mx-auto max-w-xl px-6">
        <div className="flex flex-col items-center gap-8">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <Tagline>{leadMagnetContent.eyebrow}</Tagline>
            <h2 id="lead-magnet-heading" className="heading-lg">
              {leadMagnetContent.title}
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              {leadMagnetContent.body}
            </p>
          </div>

          <form
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Lead magnet signup form"
          >
            <Input
              id="lead-email"
              placeholder={leadMagnetContent.inputPlaceholder}
              type="email"
              required
              aria-required="true"
              aria-label="Email address"
              className="flex-1"
            />
            <Button type="submit">
              {leadMagnetContent.buttonLabel}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

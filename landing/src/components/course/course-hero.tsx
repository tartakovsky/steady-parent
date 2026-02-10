"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { FieldDescription } from "@/components/ui/field";

interface CourseHeroProps {
  eyebrow: string;
  title: string;
  body: string;
  bullets: readonly string[];
}

export function CourseHero({
  eyebrow,
  title,
  body,
  bullets,
}: CourseHeroProps): React.JSX.Element {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="hero-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex w-full max-w-2xl flex-1 flex-col gap-6 lg:max-w-none lg:gap-8">
          <div className="section-title-gap-xl flex flex-col">
            <Tagline>{eyebrow}</Tagline>
            <h1 id="hero-heading" className="heading-xl">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty whitespace-pre-line">
              {body}
            </p>
            {bullets.length > 0 ? (
              <div className="flex flex-col gap-2">
                {bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <Check className="text-primary size-5" />
                    <span className="text-muted-foreground leading-5 font-medium">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <form
              className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
              }}
              aria-label="Course waitlist signup"
            >
              <Input
                placeholder="Your email"
                type="email"
                required
                className="min-h-14 flex-1 text-lg md:text-lg"
              />
              <Button type="submit" size="lg" className="h-14 px-10 text-lg">
                Reserve your spot
              </Button>
            </form>
            <FieldDescription className="text-sm leading-tight">
              No charge. We'll notify you when the course launches.
            </FieldDescription>
          </div>
        </div>
      </div>
    </section>
  );
}

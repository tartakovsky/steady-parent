"use client";

import { Button } from "@/components/ui/button";

export function CtaSection2() {
  return (
    <section
      className="bg-primary section-padding-y"
      aria-labelledby="cta-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex w-full flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
          <h2
            id="cta-heading"
            className="text-primary-foreground heading-lg max-w-lg text-pretty"
          >
            Action-driving headline that creates urgency
          </h2>
          <div className="align-right flex flex-col gap-3 md:flex-row">
            <Button
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground order-last md:order-first"
              aria-label="Learn more about our service"
            >
              Learn more
            </Button>
            <Button
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/80"
              aria-label="Get started with our service"
            >
              Get started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

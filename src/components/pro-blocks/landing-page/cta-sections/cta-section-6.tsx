"use client";

import { Button } from "@/components/ui/button";

export function CtaSection6() {
  return (
    <section className="bg-background" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl">
        <div className="bg-primary px-6 py-16 sm:rounded-xl md:p-16">
          <div className="flex w-full flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
            <div className="section-title-gap-sm flex max-w-xl flex-col">
              <h2
                id="cta-heading"
                className="heading-md text-primary-foreground"
              >
                Action-driving headline that creates urgency
              </h2>
              <p className="text-primary-foreground/80 text-lg/8 text-pretty">
                Add one or two compelling sentences that reinforce your main
                value proposition and overcome final objections.
              </p>
            </div>
            <div className="align-right flex flex-col gap-3 md:flex-row">
              <Button
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/80"
                aria-label="Get started with our service"
              >
                Get started
              </Button>
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                aria-label="Learn more about our service"
              >
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function LeadMagnet() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="lead-magnet-heading"
    >
      <div className="mx-auto max-w-xl px-6">
        <div className="flex flex-col items-center gap-8">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <Tagline>Free resource</Tagline>
            <h2 id="lead-magnet-heading" className="heading-lg">
              Get the free cheat sheet
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Enter your email and get instant access to our exclusive guide.
            </p>
          </div>

          <form
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Lead magnet signup form"
          >
            <Input
              id="lead-email"
              placeholder="Enter your email"
              type="email"
              required
              aria-required="true"
              aria-label="Email address"
              className="flex-1"
            />
            <Button type="submit">
              Get access
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

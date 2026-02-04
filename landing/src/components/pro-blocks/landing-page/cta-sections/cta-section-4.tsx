"use client";

import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import Image from "next/image";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
export function CtaSection4() {
  return (
    <section
      className="bg-background py-16 lg:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-6 lg:gap-8">
          <div className="section-title-gap-lg flex flex-col">
            <Tagline className="text-muted-foreground">CTA Section</Tagline>
            <h2 id="cta-heading" className="heading-lg text-foreground">
              Action-driving headline that creates urgency
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Add one or two compelling sentences that reinforce your main value
              proposition and overcome final objections.
            </p>
          </div>
          <form
            className="flex w-full flex-col gap-3 md:max-w-sm md:flex-row"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Email signup form"
          >
            <Field className="flex-1">
              <FieldLabel htmlFor="cta-email" className="sr-only">
                Email
              </FieldLabel>
              <InputGroup className="h-12 md:h-auto">
                <InputGroupInput
                  id="cta-email"
                  placeholder="Email"
                  type="email"
                  required
                  aria-required="true"
                  aria-label="Enter your email"
                />
              </InputGroup>
            </Field>
            <Button
              type="submit"
              aria-label="Start using our service for free"
              className="h-12 md:h-auto"
            >
              Start for free
            </Button>
          </form>
        </div>
        <div className="w-full flex-1">
          <AspectRatio ratio={4 / 3}>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="CTA section image"
              fill
              className="h-full w-full rounded-xl object-cover"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}

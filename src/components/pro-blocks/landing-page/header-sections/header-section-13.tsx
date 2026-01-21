"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function HeaderSection13() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="page-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <div className="section-title-gap-xl mx-auto flex max-w-xl flex-col items-center text-center">
            <Tagline>Header section</Tagline>
            <h1 id="page-heading" className="heading-xl text-foreground">
              Header section title
            </h1>
            <p
              className="text-muted-foreground text-lg/8 text-pretty"
              aria-description="page description"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit interdum
              hendrerit ex vitae sodales.
            </p>
          </div>
          <form
            className="flex w-full max-w-sm flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Email signup form"
          >
            <Field className="flex-1">
              <FieldLabel htmlFor="header13-email" className="sr-only">
                Email
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="header13-email"
                  placeholder="Your email"
                  type="email"
                  required
                  aria-required="true"
                />
              </InputGroup>
            </Field>
            <Button>
              Sign up
              <ArrowRight />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

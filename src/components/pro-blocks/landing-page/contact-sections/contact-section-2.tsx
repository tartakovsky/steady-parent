"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";

export function ContactSection2() {
  return (
    <section className="bg-background" aria-labelledby="contact-heading">
      <div className="flex flex-col md:flex-row md:gap-0">
        <div className="flex flex-1 items-center justify-center px-6 py-16 md:py-24">
          <div className="flex max-w-md flex-col gap-10 md:gap-12">
            <div className="section-title-gap-lg mx-auto flex flex-col">
              <Tagline>Contact Section</Tagline>
              <h1 id="contact-heading" className="heading-lg">
                Get in touch
              </h1>
              <p className="text-muted-foreground text-lg/8 text-pretty">
                Write one or two welcoming sentences that encourage contact and
                include your response time commitment.
              </p>
            </div>

            <form
              className="flex flex-col"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Contact form"
            >
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Name"
                      required
                      aria-required="true"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      required
                      aria-required="true"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="message">Message</FieldLabel>
                    <Textarea
                      id="message"
                      placeholder="Type your message"
                      className="min-h-[106px]"
                      required
                      aria-required="true"
                    />
                  </Field>

                  <Field orientation="horizontal">
                    <Checkbox id="privacy" required aria-required="true" />
                    <FieldLabel
                      htmlFor="privacy"
                      className="text-muted-foreground inline leading-tight font-normal"
                    >
                      By selecting this you agree to our{" "}
                      <Link href="#" className="text-foreground underline">
                        Privacy Policy
                      </Link>
                      .
                    </FieldLabel>
                  </Field>

                  <Field>
                    <Button type="submit" className="w-full">
                      Send message
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </form>
          </div>
        </div>

        <Separator className="block md:hidden" />

        <div className="md:bg-muted/40 flex flex-1 flex-col items-center justify-center px-6 py-16 md:py-24">
          <div className="flex flex-col gap-8 md:gap-12">
            <Link
              href="#"
              className="flex cursor-pointer flex-col items-center gap-5 md:flex-row md:items-start"
            >
              <div className="bg-background flex h-10 w-10 items-center justify-center rounded-md border shadow-xs">
                <Phone className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1 text-center md:text-left">
                <h3 className="text-card-foreground text-base leading-6 font-semibold">
                  Call us
                </h3>
                <span className="text-muted-foreground text-base underline">
                  +1 400 500 600
                </span>
              </div>
            </Link>

            <Link
              href="#"
              className="flex cursor-pointer flex-col items-center gap-5 md:flex-row md:items-start"
            >
              <div className="bg-background flex h-10 w-10 items-center justify-center rounded-md border shadow-xs">
                <Mail className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1 text-center md:text-left">
                <h3 className="text-card-foreground text-base leading-6 font-semibold">
                  Write an email
                </h3>
                <span className="text-muted-foreground text-base underline">
                  hello@example.com
                </span>
              </div>
            </Link>

            <Link
              href="#"
              className="flex cursor-pointer flex-col items-center gap-5 md:flex-row md:items-start"
            >
              <div className="bg-background flex h-10 w-10 items-center justify-center rounded-md border shadow-xs">
                <MapPin className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1 text-center md:text-left">
                <h3 className="text-card-foreground text-base leading-6 font-semibold">
                  Visit our office
                </h3>
                <span className="text-muted-foreground text-base underline">
                  192 Griffin Street, Gilbert, AZ 32521
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

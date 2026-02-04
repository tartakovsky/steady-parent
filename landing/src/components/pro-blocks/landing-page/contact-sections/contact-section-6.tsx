"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState } from "react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import {
  SiFacebook,
  SiInstagram,
  SiGithub,
  SiDribbble,
} from "@icons-pack/react-simple-icons";

export function ContactSection6() {
  const [agreed, setAgreed] = useState(false);

  return (
    <section
      className="bg-background flex min-h-screen flex-col gap-8 py-16 md:gap-0 md:py-0 lg:flex-row"
      aria-labelledby="contact-heading"
    >
      <div className="container-padding-x flex-1 items-center justify-center md:p-0 md:py-24">
        <div className="mx-auto flex max-w-md flex-col gap-10 md:gap-12">
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
                    required
                    aria-required="true"
                  />
                </Field>

                <Field orientation="horizontal">
                  <Checkbox
                    id="privacy"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                    required
                    aria-required="true"
                  />
                  <FieldLabel
                    htmlFor="privacy"
                    className="text-muted-foreground inline text-sm leading-none font-normal"
                  >
                    By selecting this you agree to our{" "}
                    <Link href="#" className="text-primary underline">
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

      <div className="md:bg-muted/40 flex-1 items-center justify-center px-6 md:px-0 md:py-24">
        <div className="mx-auto flex max-w-md flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-foreground heading-sm">Visit our offices</h2>
              <p className="text-muted-foreground text-base text-pretty">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit interdum
                hendrerit ex vitae sodales.
              </p>
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <h3 className="text-card-foreground text-base font-semibold">
                  New Mexico
                </h3>
                <p className="text-muted-foreground text-base whitespace-pre-line">
                  4140 Parker Rd. Allentown New Mexico, 31134
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <h3 className="text-card-foreground text-base font-semibold">
                  Hawaii
                </h3>
                <p className="text-muted-foreground text-base whitespace-pre-line">
                  1901 Thornridge Cir. Shiloh Hawaii, 81063
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-foreground heading-sm">Email us</h2>
              <p className="text-muted-foreground text-base text-pretty">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit interdum
                hendrerit ex vitae sodales.
              </p>
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <h3 className="text-card-foreground text-base font-semibold">
                  Sales
                </h3>
                <Link
                  href="mailto:sales@example.com"
                  className="text-muted-foreground text-base underline"
                >
                  sales@example.com
                </Link>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <h3 className="text-card-foreground text-base font-semibold">
                  Careers
                </h3>
                <Link
                  href="mailto:careers@example.com"
                  className="text-muted-foreground text-base underline"
                >
                  careers@example.com
                </Link>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-6">
            <h2 className="text-foreground heading-sm">Follow us</h2>
            <div className="flex flex-row gap-5">
              <Link
                href="#"
                className="text-foreground transition-all duration-300 hover:scale-110"
              >
                <SiFacebook className="size-5" />
              </Link>

              <Link
                href="#"
                className="text-foreground transition-all duration-300 hover:scale-110"
              >
                <SiInstagram className="size-5" />
              </Link>

              <Link
                href="#"
                className="text-foreground transition-all duration-300 hover:scale-110"
              >
                <SiGithub className="size-5" />
              </Link>

              <Link
                href="#"
                className="text-foreground transition-all duration-300 hover:scale-110"
              >
                <SiDribbble className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

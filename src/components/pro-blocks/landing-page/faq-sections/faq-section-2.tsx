"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

export function FaqSection2() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="faq-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="section-title-gap-lg flex flex-1 flex-col">
            <Tagline>FAQ section</Tagline>
            <h1 id="faq-heading" className="heading-lg text-foreground">
              Frequently asked questions
            </h1>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              We've compiled the most important information to help you get the
              most out of your experience. Can't find what you're looking for?{" "}
              <Link href="#" className="text-primary underline">
                Contact us.
              </Link>
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-foreground heading-sm">General</h2>
              <Accordion
                type="single"
                collapsible
                aria-label="General FAQ items"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    What is shadcn/ui?
                  </AccordionTrigger>
                  <AccordionContent>Content goes here</AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    What is shadcn/ui kit for Figma?
                  </AccordionTrigger>
                  <AccordionContent>Content goes here</AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    I'm not familiar with shadcn/ui. Can I still use this kit?
                  </AccordionTrigger>
                  <AccordionContent>Content goes here</AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    Can I create multi-brand design systems with this UI kit?
                  </AccordionTrigger>
                  <AccordionContent>Content goes here</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-foreground heading-sm">Billing</h2>
              <Accordion
                type="single"
                collapsible
                aria-label="Billing FAQ items"
              >
                <AccordionItem value="billing-1">
                  <AccordionTrigger className="text-left">
                    What is shadcn/ui?
                  </AccordionTrigger>
                  <AccordionContent>Content goes here</AccordionContent>
                </AccordionItem>

                <AccordionItem value="billing-2">
                  <AccordionTrigger className="text-left">
                    What is shadcn/ui kit for Figma?
                  </AccordionTrigger>
                  <AccordionContent>Content goes here</AccordionContent>
                </AccordionItem>

                <AccordionItem value="billing-3">
                  <AccordionTrigger className="text-left">
                    I'm not familiar with shadcn/ui. Can I still use this kit?
                  </AccordionTrigger>
                  <AccordionContent>Content goes here</AccordionContent>
                </AccordionItem>

                <AccordionItem value="billing-4">
                  <AccordionTrigger className="text-left">
                    Can I create multi-brand design systems with this UI kit?
                  </AccordionTrigger>
                  <AccordionContent>Content goes here</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

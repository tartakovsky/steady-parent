"use client";

import type React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import type { FaqContent } from "@/content/landing/types";

interface FaqSectionProps {
  content: FaqContent;
}

export function FaqSection({ content }: FaqSectionProps): React.JSX.Element {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="faq-heading"
    >
      <div className="container-padding-x mx-auto max-w-3xl">
        <div className="flex flex-col gap-10">
          <div className="section-title-gap-lg flex flex-col">
            <Tagline>{content.eyebrow}</Tagline>
            <h2 id="faq-heading" className="heading-lg text-foreground">
              {content.title}
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              {content.body}
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {content.sections.map((section) => (
              <div key={section.title} className="flex flex-col gap-2">
                <h3 className="text-foreground heading-sm">{section.title}</h3>
                <Accordion
                  type="single"
                  collapsible
                  aria-label={`${section.title} FAQ items`}
                >
                  {section.items.map((item, index) => (
                    <AccordionItem
                      key={`${section.title}-${item.question}`}
                      value={`${section.title}-${index + 1}`}
                    >
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

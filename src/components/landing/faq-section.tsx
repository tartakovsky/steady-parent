"use client";

import type React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

interface FaqItem {
  /** Question text, max 12 words. */
  question: string;
  /** Answer text. */
  answer: string;
}

interface FaqSectionGroup {
  /** Group title. */
  title: string;
  /** FAQ items within the group. */
  items: readonly FaqItem[];
}

interface FaqContent {
  /** Eyebrow text, max 5 words. */
  eyebrow: string;
  /** Section title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** FAQ groups. */
  sections: readonly FaqSectionGroup[];
}

const faqContent: FaqContent = {
  eyebrow: "FAQ section",
  title: "Frequently asked questions",
  body:
    "We've compiled the most important information to help you get the most out of your experience. Can't find what you're looking for?",
  sections: [
    {
      title: "General",
      items: [
        { question: "What is shadcn/ui?", answer: "Content goes here" },
        {
          question: "What is shadcn/ui kit for Figma?",
          answer: "Content goes here",
        },
        {
          question: "I'm not familiar with shadcn/ui. Can I still use this kit?",
          answer: "Content goes here",
        },
        {
          question: "Can I create multi-brand design systems with this UI kit?",
          answer: "Content goes here",
        },
      ],
    },
    {
      title: "Billing",
      items: [
        { question: "What is shadcn/ui?", answer: "Content goes here" },
        {
          question: "What is shadcn/ui kit for Figma?",
          answer: "Content goes here",
        },
        {
          question: "I'm not familiar with shadcn/ui. Can I still use this kit?",
          answer: "Content goes here",
        },
        {
          question: "Can I create multi-brand design systems with this UI kit?",
          answer: "Content goes here",
        },
      ],
    },
  ],
};

export function FaqSection(): React.JSX.Element {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="faq-heading"
    >
      <div className="container-padding-x mx-auto max-w-3xl">
        <div className="flex flex-col gap-10">
          <div className="section-title-gap-lg flex flex-col">
            <Tagline>{faqContent.eyebrow}</Tagline>
            <h2 id="faq-heading" className="heading-lg text-foreground">
              {faqContent.title}
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              {faqContent.body}
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {faqContent.sections.map((section) => (
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

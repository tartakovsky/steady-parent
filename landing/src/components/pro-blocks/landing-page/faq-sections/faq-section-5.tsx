"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import Link from "next/link";

const faqData = [
  {
    category: "general",
    label: "General",
    items: [
      {
        question: "What is shadcn/ui?",
        answer:
          "Shadcn/ui is a popular, open-source UI component library for React that focuses on flexibility and customization. It provides a set of accessible, customizable components that you can use to build modern web applications.",
      },
      {
        question: "What is shadcn/ui kit for Figma?",
        answer:
          "The shadcn/ui kit for Figma is a comprehensive design resource that mirrors the components and styling of the shadcn/ui library, helping designers create consistent interfaces.",
      },
      {
        question: "Is this suitable for beginners?",
        answer:
          "Yes, absolutely! The components are designed to be intuitive and easy to use, even if you're new to React or design systems.",
      },
    ],
  },
  {
    category: "features",
    label: "Features",
    items: [
      {
        question: "Can I customize the components?",
        answer:
          "Yes, customization is a core feature. You can easily modify styles, behaviors, and themes to match your brand's unique design requirements.",
      },
      {
        question: "Does it support dark mode?",
        answer:
          "Yes, the library and kit come with built-in support for dark mode, making it easy to implement theme switching in your application.",
      },
      {
        question: "Are the components accessible?",
        answer:
          "Accessibility is a top priority. The components follow WAI-ARIA patterns to ensure they are usable by everyone.",
      },
    ],
  },
  {
    category: "license",
    label: "License",
    items: [
      {
        question: "Is it free to use?",
        answer:
          "Yes, shadcn/ui is open source and free to use in both personal and commercial projects.",
      },
      {
        question: "Do I need to credit the author?",
        answer:
          "While not strictly required by the license, crediting the author is always appreciated and helps support the community.",
      },
    ],
  },
];

export function FaqSection5() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="faq-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-4xl flex-col gap-10 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
          <Tagline>FAQ section</Tagline>
          <h1 id="faq-heading" className="heading-lg text-foreground">
            Frequently asked questions
          </h1>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            Find answers to common questions about our platform. If you need
            further assistance, feel free to reach out to our team.
          </p>
        </div>

        <Tabs
          defaultValue="general"
          className="flex w-full flex-col items-center"
        >
          <TabsList className="mb-4 h-auto w-full flex-col justify-center gap-2 bg-transparent p-0 sm:mb-8 sm:w-auto sm:flex-row">
            {faqData.map((tab) => (
              <TabsTrigger
                key={tab.category}
                value={tab.category}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted text-muted-foreground hover:text-foreground w-full rounded-full border border-transparent px-6 py-2.5 text-base font-medium transition-all data-[state=active]:shadow-sm sm:w-auto"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {faqData.map((tab) => (
            <TabsContent
              key={tab.category}
              value={tab.category}
              className="animate-in fade-in-50 slide-in-from-bottom-2 mt-0 w-full duration-300"
            >
              <Accordion type="single" collapsible className="w-full">
                {tab.items.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card mb-4 rounded-xl border px-6 py-2 last:mb-0 last:border-b-1"
                  >
                    <AccordionTrigger className="[&[data-state=open]]:text-primary text-left text-base font-medium hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-4 flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <Link href="#" className="text-primary font-medium hover:underline">
              Contact our support
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

const faqItems = [
  {
    question: "What is shadcn/ui?",
    answer:
      "The shadcn/ui is a popular, open-source UI component library for React that focuses on flexibility and customization. It provides a set of accessible, customizable components that you can use to build modern web applications.",
  },
  {
    question: "What is shadcn/ui kit for Figma?",
    answer:
      "The shadcn/ui kit for Figma is our comprehensive design kit that brings the shadcn/ui components into the Figma environment. It allows designers to create interfaces using shadcn/ui components directly in Figma, ensuring consistency between design and development.",
  },
  {
    question: "I'm not familiar with shadcn/ui. Can I still use this kit?",
    answer:
      "Absolutely! Our kit is intuitive and comes with documentation to help you get started, regardless of your familiarity with Figma or shadcn/ui.",
  },
  {
    question: "Can I create multi-brand design systems with this UI kit?",
    answer:
      "Yes! Our kit is designed with multi-brand support in mind. You can easily create and manage multiple styles for different brands within a single design system using Figma variables.",
  },
  {
    question: "How will this kit save me time?",
    answer:
      "By providing pre-built, customizable components and templates, you can skip the repetitive setup work and focus on the unique aspects of your design. Our comprehensive asset library and pre-built screens also help speed up your workflow. What is more you can also save time on development and use shadcn/ui React library to code your designed interfaces.",
  },
];

export function FaqSection4() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="faq-heading"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex max-w-full flex-col items-start text-left md:max-w-xl md:items-center md:text-center">
          <Tagline>FAQ section</Tagline>
          <h1 id="faq-heading" className="heading-lg text-foreground">
            Frequently asked questions
          </h1>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            We've compiled the most important information to help you. Can't
            find what you're looking for?{" "}
            <Link href="#" className="text-primary underline">
              Contact us.
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-6 md:gap-8" role="list">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border-border flex flex-col gap-2 border-t pt-6 md:flex-row md:gap-6 md:pt-8"
              role="listitem"
            >
              <h2 className="text-foreground heading-sm flex-1">
                {item.question}
              </h2>
              <p className="text-muted-foreground flex-1 text-base/7">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

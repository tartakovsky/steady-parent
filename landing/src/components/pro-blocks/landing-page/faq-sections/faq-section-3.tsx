"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
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
  {
    question: "How does this improve my collaboration with developers?",
    answer:
      "Our components are built to closely match the shadcn/ui library, significantly reducing misinterpretations and implementation errors. This leads to smoother handoffs and fewer back-and-forths between design and development teams.",
  },
];

export function FaqSection3() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="faq-heading"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex w-full flex-col gap-12 md:gap-16">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="section-title-gap-lg flex max-w-xl flex-col items-center text-center md:items-start md:text-left">
              <Tagline>FAQ section</Tagline>
              <h1 id="faq-heading" className="heading-lg text-foreground">
                Frequently asked questions
              </h1>
              <p className="text-muted-foreground text-lg/8 text-pretty">
                We've compiled the most important information to help you get
                the most out of your experience.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Button variant="outline" aria-label="Contact our support team">
                Contact us
                <ArrowUpRight />
              </Button>
              <Button variant="outline" aria-label="View documentation">
                View documentation
                <ArrowUpRight />
              </Button>
            </div>
          </div>

          <div
            className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2"
            role="list"
          >
            {faqItems.map((item, index) => (
              <div key={index} className="flex flex-col gap-3" role="listitem">
                <h3 className="text-card-foreground heading-sm">
                  {item.question}
                </h3>
                <p className="text-muted-foreground text-base/7">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

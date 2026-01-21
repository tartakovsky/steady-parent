"use client";

import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Blocks, ChartArea, Pencil } from "lucide-react";
import type { ReactElement } from "react";

type ComparisonItem = {
  icon: ReactElement;
  feature: string;
  our: {
    title: string;
    body: string;
  };
  theirs: {
    title: string;
    body: string;
  };
};

const ITEMS: ComparisonItem[] = [
  {
    icon: <ChartArea className="text-primary size-5" />,
    feature: "Analytics & Reporting",
    our: {
      title: "Our product",
      body: "Actionable dashboards, exportable reports, and real‑time insights out of the box.",
    },
    theirs: {
      title: "Their product",
      body: "Basic charts with limited filtering. Exports and real‑time updates not included.",
    },
  },
  {
    icon: <Blocks className="text-primary size-5" />,
    feature: "Blocks Library",
    our: {
      title: "Our product",
      body: "Production‑ready blocks, theming tokens, and accessibility baked in. Easily customize the design and functionality to match your brand and user experience.",
    },
    theirs: {
      title: "Their product",
      body: "Starter examples that need heavy customization before shipping.  Lorem ipsum dolor sit amet, consectetur adipiscing elit interdum hendrerit ex vitae sodales.",
    },
  },
  {
    icon: <Pencil className="text-primary size-5" />,
    feature: "Customization Options",
    our: {
      title: "Our product",
      body: "Complete control over design, branding, and functionality. Tailor every detail to your brand and user experience.",
    },
    theirs: {
      title: "Their product",
      body: "Limited customization options. You may need to customize the design and functionality to match your brand and user experience.",
    },
  },
];

export function ComparisonSection6() {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10 md:gap-14">
        {/* Title block */}
        <div className="section-title-gap-lg flex flex-col md:max-w-xl">
          <Tagline>Comparison Section</Tagline>
          <h2 className="heading-lg text-foreground">
            You vs. your competitor
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            Explain in one or two concise sentences how your solution compares
            to a competitor. Keep it clear and compelling.
          </p>
        </div>
        <ul className="divide-border space-y-8 divide-y md:space-y-12">
          {ITEMS.map((item, idx) => (
            <li
              key={idx}
              className="grid grid-cols-1 items-start gap-6 pb-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:pb-12"
            >
              <div className="col-span-1 flex flex-col gap-3 md:col-span-2 lg:col-span-1 lg:flex-row lg:items-center">
                {item.icon}
                <h3 className="text-foreground text-lg font-semibold lg:text-xl">
                  {item.feature}
                </h3>
              </div>
              <div className="col-span-1 flex flex-col gap-2">
                <h4 className="text-foreground text-base font-semibold lg:text-lg">
                  {item.our.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.our.body}
                </p>
              </div>
              <div className="col-span-1 flex flex-col gap-2">
                <h4 className="text-foreground text-base font-semibold lg:text-lg">
                  {item.theirs.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.theirs.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

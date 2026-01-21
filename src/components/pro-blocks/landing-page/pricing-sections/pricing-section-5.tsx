"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check } from "lucide-react";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

type PricingComparisonPlan = {
  name: string;
  price: number;
  description: string;
};

type PricingComparisonCategory = {
  category: string;
  items: Array<{
    name: string;
    values: Array<string | boolean>;
  }>;
};

const pricingData: {
  plans: PricingComparisonPlan[];
  features: PricingComparisonCategory[];
} = {
  plans: [
    {
      name: "Free",
      price: 0,
      description: "Perfect for testing and personal use.",
    },
    {
      name: "Basic",
      price: 19,
      description: "Great for individuals and small projects.",
    },
    {
      name: "Business",
      price: 29,
      description: "Best for growing startups and teams.",
    },
    {
      name: "Enterprise",
      price: 49,
      description: "Advanced features for large organizations.",
    },
  ],
  features: [
    {
      category: "Core Features",
      items: [
        {
          name: "Team members",
          values: ["1", "5", "25", "Unlimited"],
        },
        { name: "Storage space", values: ["1GB", "10GB", "100GB", "1TB"] },
        { name: "Project management", values: [true, true, true, true] },
        {
          name: "Advanced analytics",
          values: [false, false, true, true],
        },
        {
          name: "API access",
          values: [false, false, false, true],
        },
      ],
    },
    {
      category: "Support & Security",
      items: [
        {
          name: "Email support",
          values: [true, true, true, true],
        },
        { name: "Phone support", values: [false, true, true, true] },
        { name: "Priority support", values: [false, false, true, true] },
        {
          name: "24/7 dedicated support",
          values: [false, false, false, true],
        },
        {
          name: "SSO integration",
          values: [false, false, false, true],
        },
      ],
    },
    {
      category: "Integrations",
      items: [
        {
          name: "Third-party integrations",
          values: ["5", "15", "50", "Unlimited"],
        },
        { name: "Custom integrations", values: [false, false, true, true] },
        { name: "Webhook support", values: [false, true, true, true] },
        {
          name: "White-labeling",
          values: [false, false, false, true],
        },
        {
          name: "Custom branding",
          values: [false, false, false, true],
        },
      ],
    },
  ],
};

export function PricingSection5() {
  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="pricing-section-title-5"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-10 md:gap-12">
          <div className="section-title-gap-xl container-padding-x flex max-w-xl flex-col items-center text-center">
            <Tagline>Pricing section</Tagline>
            <h2
              id="pricing-section-title-5"
              className="heading-xl text-foreground"
            >
              Choose your plan
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Add a concise value statement that addresses price sensitivity and
              showcases plan flexibility while keeping it under two lines.
            </p>
          </div>

          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="border-r" />
                  {pricingData.plans.map((plan) => (
                    <TableHead
                      key={plan.name}
                      className="min-w-3xs border-r px-6 py-6 align-top last:border-r-0"
                    >
                      <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                          <h3 className="text-foreground font-semibold">
                            {plan.name}
                          </h3>
                          <div className="flex flex-row items-end gap-0.5">
                            <span className="text-foreground text-4xl font-semibold">
                              ${plan.price}
                            </span>
                            <span className="text-muted-foreground text-base">
                              /month
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm font-normal text-wrap">
                            {plan.description}
                          </p>
                        </div>
                        <Button className="w-full">Get started</Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingData.features.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    <TableRow className="bg-muted/60">
                      <TableCell
                        colSpan={pricingData.plans.length + 1}
                        className="py-5"
                      >
                        <h3 className="text-foreground font-semibold">
                          {category.category}
                        </h3>
                      </TableCell>
                    </TableRow>
                    {category.items.map((item, itemIndex) => (
                      <TableRow key={itemIndex}>
                        <TableCell className="border-r py-4 pr-6 align-top">
                          <span className="text-foreground text-sm">
                            {item.name}
                          </span>
                        </TableCell>
                        {item.values.map((value, valueIndex) => (
                          <TableCell
                            key={valueIndex}
                            className="min-w-3xs border-r px-6 py-4 text-center last:border-r-0"
                          >
                            {typeof value === "boolean" ? (
                              value ? (
                                <Check
                                  className="text-foreground mx-auto size-4"
                                  aria-label="Included"
                                />
                              ) : (
                                <span
                                  className="text-muted-foreground text-sm"
                                  aria-label="Not included"
                                >
                                  —
                                </span>
                              )
                            ) : (
                              <span className="text-foreground text-sm font-medium">
                                {value}
                              </span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}

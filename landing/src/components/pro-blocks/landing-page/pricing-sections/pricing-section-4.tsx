"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { Badge } from "@/components/ui/badge";

const pricingData = {
  plans: [
    {
      name: "Basic",
      description: "Perfect for individuals and small projects",
      features: [
        {
          name: "Up to 5 team members",
          tooltip:
            "Collaborate with up to 5 team members on unlimited projects",
        },
        {
          name: "10GB storage space",
          tooltip: "Secure cloud storage for all your project files and assets",
        },
        {
          name: "Basic analytics",
          tooltip: "Access to essential metrics and performance tracking",
        },
      ],
      pricing: {
        monthly: 29,
        annually: 290,
      },
      variant: "secondary",
    },
    {
      name: "Standard",
      description: "Ideal for growing teams and businesses",
      badge: "Most popular",
      features: [
        {
          name: "Up to 20 team members",
          tooltip: "Scale your team with expanded collaboration capabilities",
        },
        {
          name: "50GB storage space",
          tooltip: "More storage for larger projects and asset libraries",
        },
        {
          name: "Advanced analytics",
          tooltip: "Detailed insights with custom reporting and dashboards",
        },
        {
          name: "Priority support",
          tooltip: "Get help within 24 hours from our dedicated support team",
        },
      ],
      pricing: {
        monthly: 49,
        annually: 490,
      },
      variant: "default",
    },
    {
      name: "Enterprise",
      description: "For large enterprises and advanced needs",
      features: [
        {
          name: "Unlimited team members",
          tooltip: "No limits on team size or collaboration",
        },
        {
          name: "250GB storage space",
          tooltip: "Enterprise-grade storage with advanced security",
        },
        {
          name: "Custom analytics",
          tooltip: "Tailored analytics solutions with API access",
        },
        {
          name: "24/7 premium support",
          tooltip:
            "Round-the-clock dedicated support with 4-hour response time",
        },
        {
          name: "White-labeling",
          tooltip: "Custom branding and white-label solutions",
        },
      ],
      pricing: {
        monthly: 99,
        annually: 990,
      },
      variant: "secondary",
    },
  ],
};

export function PricingSection4() {
  const [billingPeriod, setBillingPeriod] = React.useState("monthly");

  return (
    <section
      className="bg-background section-padding-y"
      aria-labelledby="pricing-section-title-4"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-8">
          <div className="section-title-gap-xl flex max-w-xl flex-col items-center text-center">
            <Tagline>Pricing section</Tagline>
            <h2
              id="pricing-section-title-4"
              className="heading-xl text-foreground"
            >
              Choose your plan
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Add a concise value statement that addresses price sensitivity and
              showcases plan flexibility while keeping it under two lines.
            </p>
          </div>

          <Tabs
            value={billingPeriod}
            onValueChange={setBillingPeriod}
            className="w-fit"
          >
            <TabsList className="bg-muted h-10 rounded-full">
              <TabsTrigger
                value="monthly"
                className="data-[state=active]:bg-background rounded-full px-3 py-1.5 data-[state=active]:shadow-sm"
              >
                Monthly
              </TabsTrigger>
              <TabsTrigger
                value="annually"
                className="data-[state=active]:bg-background rounded-full px-3 py-1.5 data-[state=active]:shadow-sm"
              >
                Annually <Badge variant="outline">Save 20%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mx-auto flex w-full flex-col gap-4 lg:max-w-5xl lg:flex-row">
            {pricingData.plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`rounded-xl p-6 shadow-none md:p-8 ${
                  index === 2 ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold tracking-tight">
                      {plan.name}
                    </h3>
                    <p
                      className={`text-muted-foreground ${
                        index === 2
                          ? "text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-end gap-0.5">
                    <span className="text-5xl font-medium tracking-tight">
                      $
                      {billingPeriod === "monthly"
                        ? plan.pricing.monthly
                        : plan.pricing.annually}
                    </span>
                    <span
                      className={`text-base leading-6 ${
                        index === 2
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      /{billingPeriod === "monthly" ? "month" : "year"}
                    </span>
                  </div>

                  <Button
                    variant={index === 2 ? "secondary" : "default"}
                    className="w-full"
                    size="lg"
                  >
                    Purchase plan
                  </Button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium">
                    {index === 0
                      ? "What's included:"
                      : `Everything in ${pricingData.plans[index - 1].name}, plus:`}
                  </p>
                  <div className="flex flex-col gap-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check
                          className={`size-5 ${
                            index === 2 ? "" : "text-primary"
                          }`}
                        />
                        <span
                          className={`text-muted-foreground flex-1 text-sm leading-5 font-medium ${
                            index === 2
                              ? "text-primary-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {feature.name}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info
                                className={`size-4 ${
                                  index === 2
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground opacity-70"
                                }`}
                              />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{feature.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

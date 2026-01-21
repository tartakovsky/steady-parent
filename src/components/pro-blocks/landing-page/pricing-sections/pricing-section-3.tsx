"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Check, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import { VariantProps } from "class-variance-authority";

const pricingData = {
  plans: [
    {
      name: "Basic",
      description:
        "A short benefit statement that highlights the ideal user for this.",
      features: [
        {
          name: "Basic project management",
          tooltip: "Create and manage up to 5 projects",
        },
        {
          name: "5GB storage space",
          tooltip: "Secure cloud storage for your files",
        },
        {
          name: "Email support",
          tooltip: "Get help via email within 48 hours",
        },
        {
          name: "Basic reporting",
          tooltip: "Basic reporting and analytics",
        },
      ],
      price: 99,
      variant: "secondary",
    },
    {
      name: "Pro",
      description:
        "A short benefit statement that highlights the ideal user for this.",
      features: [
        {
          name: "Custom workflows",
          tooltip: "Create and automate custom workflows",
        },
        {
          name: "100GB storage space",
          tooltip: "Ample storage for enterprise needs",
        },
        {
          name: "Phone support",
          tooltip: "Priority phone support during business hours",
        },
        {
          name: "Advanced reporting",
          tooltip: "Advanced reporting and analytics",
        },
        {
          name: "Advanced analytics",
          tooltip: "Detailed insights and custom reports",
        },
        {
          name: "API access",
          tooltip: "Full API access for custom integrations",
        },
      ],
      price: 299,
      variant: "default",
      highlighted: true,
    },
  ],
};

export function PricingSection3() {
  return (
    <section
      className="bg-muted/40 section-padding-y"
      aria-labelledby="pricing-section-title-3"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-10 md:gap-12">
          <div className="section-title-gap-xl flex max-w-xl flex-col items-center text-center">
            <Tagline>Pricing section</Tagline>
            <h2
              id="pricing-section-title-3"
              className="heading-xl text-foreground"
            >
              Choose your plan
            </h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              Add a concise value statement that addresses price sensitivity and
              showcases plan flexibility while keeping it under two lines.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-4 md:max-w-3xl md:flex-row md:gap-0">
            {pricingData.plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`p-6 sm:p-8 md:rounded-tl-xl md:rounded-tr-none md:rounded-br-none md:rounded-bl-xl md:border-r-0 ${
                  plan.highlighted
                    ? "md:rounded-xl md:border-r-1 md:shadow-xl"
                    : ""
                }`}
              >
                <CardContent className="flex flex-col gap-8 p-0">
                  <div className="flex flex-col gap-6">
                    <div className="relative flex flex-col gap-3">
                      <h3
                        className={`font-semibold tracking-tight ${
                          plan.highlighted ? "text-primary" : ""
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex items-end gap-0.5">
                      <span className="text-5xl font-medium tracking-tight">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground text-base">
                        /month
                      </span>
                    </div>

                    <Button
                      variant={
                        plan.variant as VariantProps<
                          typeof buttonVariants
                        >["variant"]
                      }
                      className="w-full"
                      size="lg"
                    >
                      Purchase plan
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <p className="text-sm font-medium">
                      {index === 0
                        ? "What's included:"
                        : `Everything in ${pricingData.plans[index - 1]?.name ?? "the previous plan"}, plus:`}
                    </p>
                    <div className="flex flex-col gap-4">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="text-primary size-5" />
                          <span className="text-muted-foreground flex-1 text-sm leading-5 font-medium">
                            {feature.name}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="text-muted-foreground h-4 w-4 cursor-pointer opacity-70 hover:opacity-100" />
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check, X, Box } from "lucide-react";
import type { ReactElement } from "react";

type ProductCard = {
  name: string;
  logo: ReactElement;
  description: string;
  cta: { label: string; href: string };
  features: Array<{ label: string; included: boolean | string }>;
  highlight?: boolean;
};

const YOUR_SOLUTION_CARD: ProductCard = {
  name: "Your Solution",
  logo: <Logo className="size-7" />,
  description: "A short description of the product.",
  cta: { label: "Get started", href: "#" },
  highlight: true,
  features: [
    { label: "Projects", included: "Unlimited" },
    { label: "Custom components", included: true },
    { label: "Design tokens", included: true },
    { label: "Team permissions", included: true },
    { label: "Audit logs", included: true },
  ],
};

const COMPETITOR_CARD: ProductCard = {
  name: "Competitor",
  logo: <Box className="size-7" aria-hidden="true" />,
  description: "A short description of the product.",
  cta: { label: "Learn more", href: "#" },
  features: [
    { label: "Projects", included: "10" },
    { label: "Custom components", included: true },
    { label: "Design tokens", included: true },
    { label: "Team permissions", included: false },
    { label: "Audit logs", included: false },
  ],
};

export function ComparisonSection3() {
  return (
    <section className="bg-muted section-padding-y">
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-8 md:gap-12">
        <div className="section-title-gap-lg mx-auto flex flex-col items-center text-center md:max-w-xl">
          <Tagline>Comparison Section</Tagline>
          <h2 className="heading-lg text-foreground">
            You vs. your competitor
          </h2>
          <p className="text-muted-foreground text-lg/8 text-pretty">
            Explain in one or two concise sentences how your solution compares
            to a competitor. Keep it clear and compelling.
          </p>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
          <ProductCard card={YOUR_SOLUTION_CARD} />
          <ProductCard card={COMPETITOR_CARD} />
        </div>
      </div>
    </section>
  );
}

function ProductCard({ card }: { card: ProductCard }) {
  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-col gap-3">
        <div className="mb-2">{card.logo}</div>
        <CardTitle className="heading-sm">{card.name}</CardTitle>
        <CardDescription>{card.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {card.features.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between py-4 text-sm last:pb-0"
            >
              <span className="text-foreground/90">{f.label}</span>
              <span className="text-foreground">
                {typeof f.included === "boolean" ? (
                  f.included ? (
                    <Check className="size-5" aria-hidden="true" />
                  ) : (
                    <X
                      className="text-muted-foreground size-5"
                      aria-hidden="true"
                    />
                  )
                ) : (
                  f.included
                )}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

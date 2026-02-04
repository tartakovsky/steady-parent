"use client";

import { LucideIcon, RefreshCcw, ShieldCheck, Truck } from "lucide-react";

interface IncentiveItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface IncentiveSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  incentives?: IncentiveItem[];
}

const defaultIncentives: IncentiveItem[] = [
  {
    title: "Free 2-day shipping",
    description:
      "Complimentary express shipping on every order over $75, anywhere in the continental US.",
    icon: Truck,
  },
  {
    title: "30-day free returns",
    description:
      "Changed your mind? Send items back within 30 days for a fast refund with no restocking fees.",
    icon: RefreshCcw,
  },
  {
    title: "Secure checkout",
    description:
      "256-bit SSL encryption plus Buyer Protection on every purchase keeps your payment info safe.",
    icon: ShieldCheck,
  },
];

export default function Incentive1({
  eyebrow = "Why shop with us",
  title = "Incentives that make every purchase better",
  description = "Highlight the benefits your customers care about the most. Reinforce shipping speed, returns, and payment security.",
  incentives = defaultIncentives,
}: IncentiveSectionProps) {
  return (
    <section className="bg-muted/60 section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-10 text-center">
          <div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
            <h2 className="heading-lg">{title}</h2>
            <p className="text-muted-foreground text-lg/8 text-pretty">
              {description}
            </p>
          </div>

          <div className="grid w-full gap-4 md:grid-cols-1 lg:grid-cols-3">
            {incentives.map((incentive) => {
              const Icon = incentive.icon;
              return (
                <div
                  key={incentive.title}
                  className="bg-card border-border flex h-full flex-col gap-4 rounded-xl border p-6 text-left"
                >
                  <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base leading-tight font-medium">
                      {incentive.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-6">
                      {incentive.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

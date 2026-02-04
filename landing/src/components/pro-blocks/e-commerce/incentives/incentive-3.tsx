"use client";

import {
  LucideIcon,
  RefreshCcw,
  ShieldCheck,
  Truck,
  Headset,
} from "lucide-react";

interface IncentiveItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface IncentiveSectionProps {
  incentives?: IncentiveItem[];
}

const defaultIncentives: IncentiveItem[] = [
  {
    title: "Free 2-day shipping",
    description: "Complimentary express shipping on every order over $75.",
    icon: Truck,
  },
  {
    title: "30-day free returns",
    description:
      "Send items back within 30 days for a fast refund with no restocking fees.",
    icon: RefreshCcw,
  },
  {
    title: "Secure checkout",
    description:
      "256-bit SSL encryption on every purchase keeps your payment info safe.",
    icon: ShieldCheck,
  },
  {
    title: "24/7 support",
    description:
      "Our support team is here to help you with any questions or issues you may have.",
    icon: Headset,
  },
];

export default function Incentive3({
  incentives = defaultIncentives,
}: IncentiveSectionProps) {
  return (
    <section className="bg-muted/60 section-padding-y">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-4">
          {incentives.map((incentive) => {
            const Icon = incentive.icon;
            return (
              <div
                key={incentive.title}
                className="flex flex-col gap-6 text-left"
              >
                <div className="bg-card border-border flex size-10 items-center justify-center rounded-md border shadow-xs">
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
    </section>
  );
}

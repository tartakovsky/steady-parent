"use client";

import {
  Headset,
  LucideIcon,
  RefreshCcw,
  ShieldCheck,
  Truck,
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
    description:
      "Complimentary express shipping on every order over $75, anywhere in the continental US.",
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

export default function Incentive5({
  incentives = defaultIncentives,
}: IncentiveSectionProps) {
  return (
    <section className="bg-muted/60 py-12">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex w-full flex-wrap items-center justify-center gap-5 md:gap-x-12 md:gap-y-4">
          {incentives.map((incentive) => {
            const Icon = incentive.icon;
            return (
              <div key={incentive.title} className="flex items-center gap-3">
                <Icon className="text-primary size-6" aria-hidden="true" />
                <h3 className="text-base leading-6 font-medium">
                  {incentive.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

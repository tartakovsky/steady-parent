"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCategoryCard4, {
  ProductCategory,
} from "@/components/pro-blocks/e-commerce/product-category-card-4";

interface SaleSection4Props {
  title?: string;
  countdownDate?: Date;
  categories?: ProductCategory[];
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const defaultCategories: ProductCategory[] = [
  {
    id: 1,
    badge: "33% off",
    tagline: "New Collection",
    headline: "Men's Apparel",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 2,
    badge: "50% off",
    tagline: "Summer Essentials",
    headline: "Women's Fashion",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 3,
    badge: "20% off",
    tagline: "Trending Now",
    headline: "Accessories",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 4,
    badge: "10% off",
    tagline: "Best Sellers",
    headline: "Footwear",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
];

export default function SaleSection4({
  title = "Best deals ending soon",
  countdownDate,
  categories = defaultCategories,
}: SaleSection4Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const defaultDate = useMemo(
    () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    [],
  );
  const targetDate = countdownDate ?? defaultDate;
  const targetTime = useMemo(() => targetDate.getTime(), [targetDate]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-end lg:text-left">
          <h2 className="text-foreground heading-lg">{title}</h2>
          <div className="bg-muted flex items-center gap-2 rounded-full px-3 py-1">
            <span className="text-muted-foreground text-base">Ends in:</span>
            <div className="baseline flex items-center gap-0.5">
              <span className="text-lg font-medium">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground text-sm font-medium">
                D
              </span>
            </div>
            <div className="baseline flex items-center gap-0.5">
              <span className="text-lg font-medium">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground text-sm font-medium">
                H
              </span>
            </div>
            <div className="baseline flex items-center gap-0.5">
              <span className="text-lg font-medium">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground text-sm font-medium">
                M
              </span>
            </div>
            <div className="baseline flex items-center gap-0.5">
              <span className="min-w-[25px] text-right text-lg font-medium">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground text-sm font-medium">
                S
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <div key={category.id} className="aspect-[3/4]">
              <ProductCategoryCard4 category={category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import ProductCategoryCard4, {
  ProductCategory,
} from "@/components/pro-blocks/e-commerce/product-category-card-4";

interface SaleSection3Props {
  title?: string;
  viewAllHref?: string;
  categories?: ProductCategory[];
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

export default function SaleSection3({
  title = "Best deals for you",
  viewAllHref = "#",
  categories = defaultCategories,
}: SaleSection3Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollState();
    api.on("select", updateScrollState);
    api.on("reInit", updateScrollState);

    return () => {
      api.off("select", updateScrollState);
      api.off("reInit", updateScrollState);
    };
  }, [api]);

  const showArrows = canScrollPrev || canScrollNext;

  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-end lg:text-left">
          <h2 className="text-foreground heading-lg">{title}</h2>
          <Button variant="secondary" asChild>
            <Link href={viewAllHref}>View all</Link>
          </Button>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent>
            {categories.map((category) => (
              <CarouselItem
                key={category.id}
                className="sm:basis-1/2 lg:basis-1/3"
              >
                <div className="aspect-[3/4]">
                  <ProductCategoryCard4 category={category} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {showArrows && (
            <>
              <CarouselPrevious
                size="icon-lg"
                className="dark:bg-background -left-5"
              />
              <CarouselNext
                size="icon-lg"
                className="dark:bg-background -right-5"
              />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
}

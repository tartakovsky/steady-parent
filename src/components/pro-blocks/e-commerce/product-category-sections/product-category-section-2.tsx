"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCategoryCard1, {
  ProductCategory,
} from "@/components/pro-blocks/e-commerce/product-category-card-1";

interface ProductCategorySectionProps {
  title?: string;
  viewAllHref?: string;
  categories?: ProductCategory[];
}

const defaultCategories: ProductCategory[] = [
  {
    id: 1,
    tagline: "Featured Collection",
    headline: "Men's Apparel",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 2,
    tagline: "Summer Essentials",
    headline: "Women's Fashion",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 3,
    tagline: "Trending Now",
    headline: "Accessories",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
];

export default function ProductCategorySection2({
  title = "Shop by Category",
  viewAllHref = "#",
  categories = defaultCategories,
}: ProductCategorySectionProps) {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex w-full max-w-7xl flex-col gap-8 md:gap-12">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-end lg:text-left">
          <h2 className="text-foreground heading-lg">{title}</h2>
          <Button variant="secondary" asChild>
            <Link href={viewAllHref}>View all</Link>
          </Button>
        </div>

        <div className="grid min-h-[600px] grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
          {categories[0] && (
            <div className="h-full md:row-span-2">
              <ProductCategoryCard1 category={categories[0]} />
            </div>
          )}
          {categories[1] && (
            <div className="h-full">
              <ProductCategoryCard1 category={categories[1]} />
            </div>
          )}
          {categories[2] && (
            <div className="h-full">
              <ProductCategoryCard1 category={categories[2]} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

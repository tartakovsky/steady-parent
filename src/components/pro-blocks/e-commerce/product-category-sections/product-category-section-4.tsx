import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCategoryCard2, {
  ProductCategory,
} from "@/components/pro-blocks/e-commerce/product-category-card-2";

interface ProductCategorySectionProps {
  title?: string;
  viewAllHref?: string;
  categories?: ProductCategory[];
}

const defaultCategories: ProductCategory[] = [
  {
    id: 1,
    tagline: "New Collection",
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
  {
    id: 4,
    tagline: "Best Sellers",
    headline: "Footwear",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
];

export default function ProductCategorySection4({
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

        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <ProductCategoryCard2 key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

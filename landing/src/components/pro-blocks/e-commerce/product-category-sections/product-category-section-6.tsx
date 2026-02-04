import ProductCategoryCard3, {
  ProductCategory,
} from "@/components/pro-blocks/e-commerce/product-category-card-3";

interface ProductCategorySectionProps {
  title?: string;
  categories?: ProductCategory[];
}

const defaultCategories: ProductCategory[] = [
  {
    id: 1,
    headline: "Men's Apparel",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 2,
    headline: "Women's Fashion",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 3,
    headline: "Accessories",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 4,
    headline: "Footwear",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 5,
    headline: "Jewelry",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 6,
    headline: "Home & Garden",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
];

export default function ProductCategorySection6({
  title = "Shop by Category",
  categories = defaultCategories,
}: ProductCategorySectionProps) {
  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex w-full max-w-7xl flex-col gap-8 md:gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-foreground heading-lg">{title}</h2>
        </div>

        <div className="grid grid-cols-2 items-center justify-center gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <ProductCategoryCard3 key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

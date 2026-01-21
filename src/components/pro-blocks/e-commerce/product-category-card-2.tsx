import Image from "next/image";
import Link from "next/link";

export interface ProductCategory {
  id: number;
  tagline: string;
  headline: string;
  image: string;
  href: string;
}

interface ProductCategoryCardProps {
  category: ProductCategory;
}

export default function ProductCategoryCard2({
  category,
}: ProductCategoryCardProps) {
  return (
    <Link href={category.href} className="group flex flex-col gap-4">
      <div className="relative overflow-hidden">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={category.image}
            alt={category.headline}
            fill
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm font-medium">
          {category.tagline}
        </p>
        <h3 className="text-foreground text-xl font-semibold">
          {category.headline}
        </h3>
      </div>
    </Link>
  );
}

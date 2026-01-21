import Image from "next/image";
import Link from "next/link";

export interface ProductCategory {
  id: number;
  headline: string;
  image: string;
  href: string;
}

interface ProductCategoryCardProps {
  category: ProductCategory;
}

export default function ProductCategoryCard3({
  category,
}: ProductCategoryCardProps) {
  return (
    <Link
      href={category.href}
      className="group flex flex-col items-center gap-3 text-center"
    >
      <div className="relative aspect-square min-h-24 w-full min-w-24 overflow-hidden rounded-full">
        <Image
          src={category.image}
          alt={category.headline}
          fill
          className="object-cover transition-transform duration-200 ease-in-out group-hover:scale-120"
        />
      </div>
      <h3 className="text-foreground text-base font-medium">
        {category.headline}
      </h3>
    </Link>
  );
}

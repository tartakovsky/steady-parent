import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ProductCategory {
  id: number;
  badge: string;
  tagline: string;
  headline: string;
  image: string;
  href: string;
}

interface ProductCategoryCard4Props {
  category: ProductCategory;
}

export default function ProductCategoryCard4({
  category,
}: ProductCategoryCard4Props) {
  return (
    <Link href={category.href} className="group block h-full">
      <div className="relative h-full overflow-hidden">
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={category.image}
            alt={category.headline}
            fill
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <Badge>{category.badge}</Badge>
          <h3 className="text-xl font-semibold text-white md:text-2xl">
            {category.headline}
          </h3>
          <Button variant="outline" size="lg">
            Shop now
          </Button>
        </div>
      </div>
    </Link>
  );
}

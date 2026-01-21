import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface Product {
  id: number;
  category?: string;
  title: string;
  description?: string;
  price: string;
  originalPrice?: string;
  image: string;
  badge?: string;
  href: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard2({ product }: ProductCardProps) {
  return (
    <Link
      href={product.href}
      className="group bg-card border-border flex h-full flex-col overflow-hidden rounded-lg border shadow-2xs"
    >
      <div className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        </div>
        {product.badge && (
          <Badge className="absolute top-4 left-4">{product.badge}</Badge>
        )}
      </div>

      <div className="items-between flex h-full flex-col justify-between gap-2 p-4">
        <div className="flex flex-col gap-1">
          {product.category && (
            <p className="text-muted-foreground text-sm">{product.category}</p>
          )}
          <h3 className="text-foreground text-sm font-medium">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-muted-foreground text-sm leading-5">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-foreground text-base font-medium">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-muted-foreground text-base line-through">
              {product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

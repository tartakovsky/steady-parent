"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import ProductCard2, {
  Product,
} from "@/components/pro-blocks/e-commerce/product-card-2";

interface ProductSectionProps {
  title?: string;
  viewAllHref?: string;
  products?: Product[];
}

const defaultProducts: Product[] = [
  {
    id: 1,
    category: "Running",
    title: "Urban Runner Pro",
    price: "$89.99",
    originalPrice: "$129.99",
    image: "https://ui.shadcn.com/placeholder.svg",
    badge: "Sale",
    href: "#",
  },
  {
    id: 2,
    category: "Travel",
    title: "Travel Explorer Pack",
    price: "$64.99",
    originalPrice: "$89.99",
    image: "https://ui.shadcn.com/placeholder.svg",
    badge: "Sale",
    href: "#",
  },
  {
    id: 3,
    category: "Watches",
    title: "Classic Timepiece",
    price: "$149.99",
    originalPrice: "$249.99",
    image: "https://ui.shadcn.com/placeholder.svg",
    badge: "Sale",
    href: "#",
  },
  {
    id: 4,
    category: "Watches",
    title: "Smart Watch",
    price: "$249.99",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 5,
    category: "Electronics",
    title: "Wireless Headphones",
    price: "$179.99",
    originalPrice: "$229.99",
    image: "https://ui.shadcn.com/placeholder.svg",
    badge: "New",
    href: "#",
  },
  {
    id: 6,
    category: "Electronics",
    title: "Laptop Sleeve",
    price: "$34.99",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
];

export default function ProductListSection4({
  title = "Product list title",
  viewAllHref = "#",
  products = defaultProducts,
}: ProductSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setCurrent(api.selectedScrollSnap());
      setCount(api.scrollSnapList().length);
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

  const scrollPrev = () => api?.scrollPrev();
  const scrollNext = () => api?.scrollNext();

  return (
    <section className="bg-background section-padding-y">
      <div className="container-padding-x mx-auto flex w-full max-w-7xl flex-col gap-8 md:gap-12">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-end lg:text-left">
          <h1 className="text-foreground heading-lg">{title}</h1>
          <Button variant="secondary" asChild>
            <Link href={viewAllHref}>View all</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-8">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="sm:basis-1/2 lg:basis-1/4"
                >
                  <ProductCard2 product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {showArrows && (
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      current === index
                        ? "bg-foreground w-8"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2",
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className="size-10 rounded-full"
                >
                  <ArrowLeft className="size-4" />
                  <span className="sr-only">Previous slide</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="size-10 rounded-full"
                >
                  <ArrowRight className="size-4" />
                  <span className="sr-only">Next slide</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

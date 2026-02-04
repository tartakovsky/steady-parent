"use client";

import type React from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductImageCarousel1 from "@/components/pro-blocks/e-commerce/product-image-carousel-1";
import type { ProductContent } from "@/content/landing/types";

interface ProductRevealProps {
  content: ProductContent;
}

export function ProductReveal({
  content,
}: ProductRevealProps): React.JSX.Element {
  return (
    <section
      id="course"
      className="bg-background scroll-mt-16 pt-8 pb-16"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
          {/* Mobile title (above gallery) */}
          <h2 className="heading-lg w-full text-foreground lg:hidden">
            <span className="highlight-primary-skew">{content.title}</span>
          </h2>

          <ProductImageCarousel1
            images={content.imageUrls}
            productName={content.title}
            className="flex-1"
          />

          <div className="flex flex-1 flex-col gap-6 lg:max-w-lg">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                {/* Desktop title (in right column) */}
                <h2 className="heading-lg text-foreground hidden lg:block">
                  <span className="highlight-primary-skew">{content.title}</span>
                </h2>
                <p className="text-muted-foreground text-base whitespace-pre-line">
                  {content.body}
                </p>
                <div className="flex flex-col gap-4">
                  {content.accordions.map((item) => (
                    <div key={item.title} className="flex flex-col gap-1">
                      <h3 className="text-foreground text-sm font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-1.5 align-baseline">
                  <span className="text-3xl font-semibold tracking-tight">
                    {content.priceCurrent}
                  </span>
                  <span className="text-muted-foreground text-xl font-medium tracking-tight line-through">
                    {content.priceOriginal}
                  </span>
                </div>
                <Badge variant="default" className="rounded-full">
                  {content.discountPercent}
                </Badge>
              </div>

              <Button className="h-14 w-full text-lg" size="lg" asChild>
                <Link href={content.buyCta.href}>{content.buyCta.label}</Link>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

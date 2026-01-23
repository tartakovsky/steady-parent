"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductImageCarousel1 from "@/components/pro-blocks/e-commerce/product-image-carousel-1";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductAccordionItem {
  /** Accordion title, max 6 words. */
  title: string;
  /** Accordion body copy. */
  body: string;
}

interface ProductCta {
  /** Button label, max 4 words. */
  label: string;
  /** Destination URL. */
  href: string;
}

interface ProductContent {
  /** Product title, max 10 words. */
  title: string;
  /** Supporting body copy. */
  body: string;
  /** Price after discount (display). */
  priceCurrent: string;
  /** Price before discount (display). */
  priceOriginal: string;
  /** Discount percentage (display). */
  discountPercent: string;
  /** Buy button label + destination. */
  buyCta: ProductCta;
  /** Exactly six image URLs. */
  imageUrls: [string, string, string, string, string, string];
  /** Exactly three accordion sections. */
  accordions: [ProductAccordionItem, ProductAccordionItem, ProductAccordionItem];
}

const productContent: ProductContent = {
  title: "Premium Cotton T-Shirt",
  body:
    "Experience ultimate comfort with our premium cotton t-shirt. Made from 100% organic cotton, this versatile piece features a classic fit that looks great on everyone.",
  priceCurrent: "$49.99",
  priceOriginal: "$69.00",
  discountPercent: "-20%",
  buyCta: {
    label: "Buy it now",
    href: "#",
  },
  imageUrls: [
    "https://ui.shadcn.com/placeholder.svg",
    "https://ui.shadcn.com/placeholder.svg",
    "https://ui.shadcn.com/placeholder.svg",
    "https://ui.shadcn.com/placeholder.svg",
    "https://ui.shadcn.com/placeholder.svg",
    "https://ui.shadcn.com/placeholder.svg",
  ],
  accordions: [
    {
      title: "Details",
      body:
        "Made from premium 100% organic cotton. Features a classic crew neck design, reinforced shoulder seams, and a comfortable regular fit. Pre-shrunk fabric ensures lasting quality wash after wash.",
    },
    {
      title: "Shipping",
      body:
        "Free standard shipping on orders over $50. Express shipping available at checkout. Orders are typically processed within 1-2 business days and delivered within 5-7 business days.",
    },
    {
      title: "Returns",
      body:
        "We offer free returns within 30 days of purchase. Items must be unworn, unwashed, and in original condition with tags attached. Refunds are processed within 5-10 business days of receiving your return.",
    },
  ],
};

export function ProductReveal() {
  const handleBuyNow = () => {
    console.log("Buy now:", { productName: productContent.title });
  };

  return (
    <section className="bg-background pt-8 pb-16">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <ProductImageCarousel1
            images={productContent.imageUrls}
            productName={productContent.title}
            className="flex-1"
          />

          <div className="flex flex-1 flex-col gap-6 lg:max-w-lg">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <h2 className="text-foreground heading-md">
                  {productContent.title}
                </h2>
                <p className="text-muted-foreground text-base">
                  {productContent.body}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-1.5 align-baseline">
                  <span className="text-3xl font-semibold tracking-tight">
                    {productContent.priceCurrent}
                  </span>
                  <span className="text-muted-foreground text-xl font-medium tracking-tight line-through">
                    {productContent.priceOriginal}
                  </span>
                </div>
                <Badge variant="default" className="rounded-full">
                  {productContent.discountPercent}
                </Badge>
              </div>

              <Button className="w-full" size="lg" onClick={handleBuyNow}>
                {productContent.buyCta.label}
              </Button>
            </div>

            <Accordion type="single" collapsible defaultValue="details">
              {productContent.accordions.map((item, index) => (
                <AccordionItem
                  key={item.title}
                  value={`section-${index + 1}`}
                >
                  <AccordionTrigger>{item.title}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground text-sm">
                      {item.body}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}

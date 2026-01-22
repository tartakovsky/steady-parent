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

const defaultProductData = {
  productName: "Premium Cotton T-Shirt",
  description:
    "Experience ultimate comfort with our premium cotton t-shirt. Made from 100% organic cotton, this versatile piece features a classic fit that looks great on everyone.",
  price: "$49.99",
  originalPrice: "$69.00",
  discount: "-20%",
  mainImage: "https://ui.shadcn.com/placeholder.svg",
  thumbnails: [
    "https://ui.shadcn.com/placeholder.svg",
    "https://ui.shadcn.com/placeholder.svg",
    "https://ui.shadcn.com/placeholder.svg",
    "https://ui.shadcn.com/placeholder.svg",
    "https://ui.shadcn.com/placeholder.svg",
  ],
  details: [
    {
      value: "details",
      title: "Details",
      content:
        "Made from premium 100% organic cotton. Features a classic crew neck design, reinforced shoulder seams, and a comfortable regular fit. Pre-shrunk fabric ensures lasting quality wash after wash.",
    },
    {
      value: "shipping",
      title: "Shipping",
      content:
        "Free standard shipping on orders over $50. Express shipping available at checkout. Orders are typically processed within 1-2 business days and delivered within 5-7 business days.",
    },
    {
      value: "returns",
      title: "Returns",
      content:
        "We offer free returns within 30 days of purchase. Items must be unworn, unwashed, and in original condition with tags attached. Refunds are processed within 5-10 business days of receiving your return.",
    },
  ],
};

interface ProductRevealProps {
  productName?: string;
  price?: string;
  originalPrice?: string;
  discount?: string;
  description?: string;
  mainImage?: string;
  thumbnails?: string[];
}

export function ProductReveal({
  productName = defaultProductData.productName,
  price = defaultProductData.price,
  originalPrice = defaultProductData.originalPrice,
  discount = defaultProductData.discount,
  description = defaultProductData.description,
  mainImage = defaultProductData.mainImage,
  thumbnails = defaultProductData.thumbnails,
}: ProductRevealProps) {
  const handleBuyNow = () => {
    console.log("Buy now:", { productName });
  };

  return (
    <section className="bg-background pt-8 pb-16">
      <div className="container-padding-x mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <ProductImageCarousel1
            images={[mainImage, ...thumbnails]}
            productName={productName}
            className="flex-1"
          />

          <div className="flex flex-1 flex-col gap-6 lg:max-w-lg">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <h2 className="text-foreground heading-md">{productName}</h2>
                <p className="text-muted-foreground text-base">{description}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-1.5 align-baseline">
                  <span className="text-3xl font-semibold tracking-tight">
                    {price}
                  </span>
                  <span className="text-muted-foreground text-xl font-medium tracking-tight line-through">
                    {originalPrice}
                  </span>
                </div>
                <Badge variant="default" className="rounded-full">
                  {discount}
                </Badge>
              </div>

              <Button className="w-full" size="lg" onClick={handleBuyNow}>
                Buy it now
              </Button>
            </div>

            <Accordion type="single" collapsible defaultValue="details">
              {defaultProductData.details.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger>{item.title}</AccordionTrigger>
                  {item.content && (
                    <AccordionContent>
                      <p className="text-muted-foreground text-sm">
                        {item.content}
                      </p>
                    </AccordionContent>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}

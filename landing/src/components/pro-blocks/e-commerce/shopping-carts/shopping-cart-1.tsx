"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const products = [
  {
    id: 1,
    name: "Urban Runner Pro",
    href: "#",
    color: "Navy Blue",
    price: "$89.99",
    quantity: 1,
    imageSrc: "https://ui.shadcn.com/placeholder.svg",
    imageAlt:
      "Lightweight running shoes with premium cushioning and breathable mesh upper.",
  },
  {
    id: 2,
    name: "Travel Explorer Pack",
    href: "#",
    color: "Charcoal Gray",
    price: "$64.99",
    quantity: 1,
    imageSrc: "https://ui.shadcn.com/placeholder.svg",
    imageAlt:
      "Durable waterproof backpack with multiple compartments and ergonomic design.",
  },
  {
    id: 3,
    name: "Classic Timepiece",
    href: "#",
    color: "Silver & Black",
    price: "$149.99",
    quantity: 1,
    imageSrc: "https://ui.shadcn.com/placeholder.svg",
    imageAlt:
      "Elegant minimalist watch with stainless steel case and genuine leather strap.",
  },
];

export default function ShoppingCart1() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="flex min-h-screen items-center justify-center">
          <SheetTrigger asChild>
            <Button variant="secondary">Open cart</Button>
          </SheetTrigger>
        </div>
        <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
          <SheetHeader className="px-4 md:px-6">
            <SheetTitle>Shopping cart</SheetTitle>
            <SheetDescription className="sr-only">
              Review items in your shopping cart
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 md:px-6">
              <div className="divide-y">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0 md:py-6"
                  >
                    <div className="relative size-24 shrink-0 overflow-hidden border">
                      <Image
                        alt={product.imageAlt}
                        src={product.imageSrc}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h3 className="text-base leading-tight font-medium">
                            <Link href={product.href}>{product.name}</Link>
                          </h3>
                          <p className="text-muted-foreground mt-1 text-sm leading-tight">
                            {product.color}
                          </p>
                        </div>
                        <p className="ml-4 text-base font-medium">
                          {product.price}
                        </p>
                      </div>

                      <div className="mt-auto flex items-end justify-between pt-2 text-sm">
                        <p className="text-muted-foreground">
                          Qty {product.quantity}
                        </p>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t px-4 py-6 md:px-6">
              <div className="flex justify-between text-base font-medium">
                <p>Subtotal</p>
                <p>$304.97</p>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Shipping and taxes calculated at checkout.
              </p>

              <div className="mt-6">
                <Button asChild className="w-full" size="lg">
                  <Link href="#">Checkout</Link>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const products = [
  {
    id: 1,
    name: "Classic Timepiece",
    href: "#",
    color: "Silver & Black",
    price: "$149.99",
    imageSrc: "https://ui.shadcn.com/placeholder.svg",
    imageAlt:
      "Elegant minimalist watch with stainless steel case and genuine leather strap.",
  },
  {
    id: 2,
    name: "Urban Runner Pro",
    href: "#",
    color: "Navy Blue",
    price: "$89.99",
    imageSrc: "https://ui.shadcn.com/placeholder.svg",
    imageAlt:
      "Lightweight running shoes with premium cushioning and breathable mesh upper.",
  },
  {
    id: 3,
    name: "Travel Explorer Pack",
    href: "#",
    color: "Charcoal Gray",
    price: "$64.99",
    imageSrc: "https://ui.shadcn.com/placeholder.svg",
    imageAlt:
      "Durable waterproof backpack with multiple compartments and ergonomic design.",
  },
];

export default function ShoppingCart2() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex min-h-screen items-center justify-center">
          <DialogTrigger asChild>
            <Button variant="secondary">Open cart</Button>
          </DialogTrigger>
        </div>
        <DialogContent className="flex max-h-[90vh] flex-col p-0 lg:min-w-4xl">
          <DialogHeader className="px-4 pt-6 md:px-6 lg:px-8">
            <DialogTitle className="text-lg font-medium">
              Shopping Cart
            </DialogTitle>
            <DialogDescription className="sr-only">
              Items in your shopping cart
            </DialogDescription>
          </DialogHeader>

          <form className="flex flex-1 flex-col overflow-hidden pb-8 sm:pb-6 lg:pb-8">
            <section
              aria-labelledby="cart-heading"
              className="flex-1 overflow-y-auto"
            >
              <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
              </h2>

              <ul className="divide-y px-4 md:px-6 lg:px-8">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="flex gap-4 py-4 text-sm first:pt-0 sm:items-center md:gap-6 md:py-6"
                  >
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border sm:size-32">
                      <Image
                        alt={product.imageAlt}
                        src={product.imageSrc}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="grid flex-auto grid-cols-1 grid-rows-1 items-start gap-x-5 gap-y-3 sm:flex sm:items-center sm:gap-0">
                      <div className="row-end-1 flex-auto sm:pr-6">
                        <h3 className="font-medium">
                          <Link href={product.href}>{product.name}</Link>
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {product.color}
                        </p>
                      </div>
                      <p className="row-span-2 row-end-2 font-medium sm:order-1 sm:ml-6 sm:w-1/3 sm:flex-none sm:text-right">
                        {product.price}
                      </p>
                      <div className="flex items-center sm:block sm:flex-none sm:text-center">
                        <Select defaultValue="1">
                          <SelectTrigger
                            className="w-16"
                            aria-label={`Quantity, ${product.name}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="ml-4 h-auto p-0 sm:mt-2 sm:ml-0"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-labelledby="summary-heading"
              className="mt-auto px-4 md:px-6 lg:px-8"
            >
              <div className="bg-muted rounded-lg p-6">
                <h2 id="summary-heading" className="sr-only">
                  Order summary
                </h2>

                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium">$304.97</dd>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="font-medium">$8.00</dd>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Tax</dt>
                    <dd className="font-medium">$25.00</dd>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-base">
                    <dt className="font-medium">Order total</dt>
                    <dd className="font-medium">$337.97</dd>
                  </div>
                </dl>
              </div>
            </section>

            <div className="mt-8 flex justify-end px-4 md:px-6 lg:px-8">
              <Button type="submit" size="lg">
                Continue to Checkout
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

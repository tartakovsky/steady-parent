"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Clock, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const products = [
  {
    id: 1,
    name: "Urban Runner Pro",
    href: "#",
    price: "$89.99",
    color: "Navy Blue",
    inStock: true,
    size: "US 10",
    imageSrc: "https://ui.shadcn.com/placeholder.svg",
    imageAlt:
      "Lightweight running shoes with premium cushioning and breathable mesh upper.",
  },
  {
    id: 2,
    name: "Classic Timepiece",
    href: "#",
    price: "$149.99",
    color: "Silver",
    inStock: false,
    leadTime: "2–3 weeks",
    size: "42mm",
    imageSrc: "https://ui.shadcn.com/placeholder.svg",
    imageAlt:
      "Elegant minimalist watch with stainless steel case and genuine leather strap.",
  },
  {
    id: 3,
    name: "Travel Explorer Pack",
    href: "#",
    price: "$64.99",
    color: "Charcoal Gray",
    inStock: true,
    imageSrc: "https://ui.shadcn.com/placeholder.svg",
    imageAlt:
      "Durable waterproof backpack with multiple compartments and ergonomic design.",
  },
];

export default function ShoppingCart3() {
  return (
    <div className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-2xl max-w-7xl px-4 md:px-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Shopping Cart
        </h1>
        <form className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>

            <ul className="divide-y border-y">
              {products.map((product) => (
                <li key={product.id} className="flex py-6 sm:py-8">
                  <div className="shrink-0">
                    <div className="relative size-24 overflow-hidden rounded-md sm:size-48">
                      <Image
                        alt={product.imageAlt}
                        src={product.imageSrc}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3>
                            <Link
                              href={product.href}
                              className="font-medium hover:underline"
                            >
                              {product.name}
                            </Link>
                          </h3>
                        </div>
                        <div className="mt-1 flex gap-1 text-sm">
                          <p className="text-muted-foreground">
                            {product.color}
                          </p>
                          {product.size ? (
                            <p className="text-muted-foreground">
                              &bull;&nbsp;{product.size}
                            </p>
                          ) : null}
                        </div>
                        <p className="mt-1 font-medium">{product.price}</p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
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

                        <div className="absolute top-0 right-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground -m-2 size-9"
                          >
                            <span className="sr-only">Remove</span>
                            <X />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 flex items-center gap-2 text-sm font-medium">
                      {product.inStock ? (
                        <>
                          <Check
                            aria-hidden="true"
                            className="size-4 shrink-0 text-green-600"
                          />
                          <span>In stock</span>
                        </>
                      ) : (
                        <>
                          <Clock
                            aria-hidden="true"
                            className="text-muted-foreground size-4"
                          />
                          <span className="text-muted-foreground">
                            Ships in {product.leadTime}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Order summary */}
          <section
            aria-labelledby="summary-heading"
            className="bg-muted mt-8 rounded-lg px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
          >
            <h2 id="summary-heading" className="text-lg font-medium">
              Order summary
            </h2>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">$304.97</dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground flex items-center gap-2">
                  <span>Shipping estimate</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <span className="sr-only">
                            Learn more about how shipping is calculated
                          </span>
                          <HelpCircle aria-hidden="true" className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Shipping costs are calculated based on your location
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </dt>
                <dd className="font-medium">$8.00</dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground flex items-center gap-2">
                  <span>Tax estimate</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <span className="sr-only">
                            Learn more about how tax is calculated
                          </span>
                          <HelpCircle aria-hidden="true" className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tax is estimated based on your billing address</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </dt>
                <dd className="font-medium">$25.00</dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-base">
                <dt className="font-medium">Order total</dt>
                <dd className="font-medium">$337.97</dd>
              </div>
            </dl>

            <div className="mt-6">
              <Button type="submit" size="lg" className="w-full">
                Checkout
              </Button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}

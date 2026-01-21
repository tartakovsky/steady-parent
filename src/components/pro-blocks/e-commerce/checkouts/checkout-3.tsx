"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const defaultCartItems = [
  {
    id: 1,
    name: "Organic Cotton T-Shirt",
    category: "Men's Clothing",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 2,
    name: "Running Sneakers",
    category: "Footwear",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
  {
    id: 3,
    name: "Leather Wallet",
    category: "Accessories",
    image: "https://ui.shadcn.com/placeholder.svg",
  },
];

interface Checkout3Props {
  cartItems?: typeof defaultCartItems;
  subtotal?: string;
  shipping?: string;
  discount?: string;
  discountCode?: string;
  taxes?: string;
  total?: string;
}

export default function Checkout3({
  cartItems = defaultCartItems,
  subtotal = "$178.00",
  shipping = "$10.00",
  discount = "-$18.00",
  discountCode = "SPRING10",
  taxes = "$16.02",
  total = "$186.02",
}: Checkout3Props) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container-padding-x mx-auto max-w-lg lg:max-w-5xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
          <div className="order-last flex w-full flex-col gap-6 lg:order-first">
            <div className="flex flex-col gap-3">
              <Button
                variant="default"
                className="w-full bg-black text-white dark:bg-white dark:text-black"
                size="lg"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="currentColor"
                    d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25"
                  />
                </svg>
                Pay
              </Button>
              <Button
                variant="default"
                className="w-full bg-black text-white dark:bg-white dark:text-black"
                size="lg"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_19018_13243)">
                    <path
                      d="M8 6.5459V9.64409H12.3054C12.1164 10.6404 11.549 11.4841 10.6981 12.0514L13.2945 14.0659C14.8072 12.6696 15.68 10.6187 15.68 8.18234C15.68 7.61508 15.6291 7.06957 15.5345 6.54599L8 6.5459Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M3.51771 9.52246L2.93214 9.97071L0.859375 11.5852C2.17574 14.1961 4.87372 15.9998 8.00096 15.9998C10.1609 15.9998 11.9718 15.287 13.2955 14.0653L10.6991 12.0507C9.98638 12.5307 9.07728 12.8216 8.00096 12.8216C5.92098 12.8216 4.15376 11.418 3.52098 9.52708L3.51771 9.52246Z"
                      fill="#34A853"
                    />
                    <path
                      d="M0.858119 4.41406C0.312695 5.49038 0 6.70494 0 7.99947C0 9.29399 0.312695 10.5086 0.858119 11.5849C0.858119 11.5921 3.51998 9.51942 3.51998 9.51942C3.35998 9.03942 3.26541 8.53036 3.26541 7.99939C3.26541 7.46841 3.35998 6.95935 3.51998 6.47935L0.858119 4.41406Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M8.00113 3.18545C9.17933 3.18545 10.2266 3.59271 11.0629 4.37818L13.3538 2.0873C11.9647 0.792777 10.1612 0 8.00113 0C4.87388 0 2.17574 1.79636 0.859375 4.41455L3.52116 6.48001C4.15385 4.58908 5.92114 3.18545 8.00113 3.18545Z"
                      fill="#EA4335"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_19018_13243">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Pay
              </Button>
            </div>

            <div className="relative flex items-center justify-center">
              <Separator />
              <div className="bg-background absolute px-2">
                <span className="text-muted-foreground text-xs">OR</span>
              </div>
            </div>

            <form className="flex flex-col gap-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="johndoe@mail.com"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="cardName">Name on card</FieldLabel>
                  <Input id="cardName" placeholder="John Doe" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="cardNumber">Card number</FieldLabel>
                  <Input id="cardNumber" />
                </Field>

                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-4">
                  <Field>
                    <FieldLabel htmlFor="expiry">
                      Expiration date (MM/YY)
                    </FieldLabel>
                    <Input id="expiry" />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="cvc">CVC</FieldLabel>
                    <Input id="cvc" />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="address">Address</FieldLabel>
                  <Input id="address" />
                </Field>

                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-4">
                  <Field>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input id="city" placeholder="London" />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="country">Country</FieldLabel>
                    <Select defaultValue="uk">
                      <SelectTrigger id="country">
                        <SelectValue placeholder="United Kingdom" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field orientation="horizontal">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) =>
                      setAgreedToTerms(checked === true)
                    }
                  />
                  <FieldLabel
                    htmlFor="terms"
                    className="flex items-center gap-1"
                  >
                    I agree to the
                    <Link
                      href="#"
                      className="text-foreground inline-block underline"
                    >
                      Terms & Conditions
                    </Link>
                  </FieldLabel>
                </Field>

                <Button type="submit" size="lg" className="w-full">
                  Pay {total}
                </Button>
              </FieldGroup>
            </form>
          </div>

          <div className="bg-muted/40 order-first flex w-full flex-col gap-6 rounded-lg p-6 lg:order-last lg:w-96">
            <div className="flex flex-col">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b py-4 first:pt-0 last:border-b-0"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-muted-foreground text-xs">
                        {item.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                      >
                        Edit
                      </Button>
                      <Separator orientation="vertical" className="h-4" />
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <Field className="flex-1">
                <FieldLabel htmlFor="discount">Discount code</FieldLabel>
                <Input
                  id="discount"
                  placeholder="Enter code"
                  className="bg-background"
                />
              </Field>
              <Button variant="outline">Apply</Button>
            </div>

            <div className="flex flex-col gap-4 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{shipping}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Taxes</span>
                <span>{taxes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Discount</span>
                  <Badge variant="outline">{discountCode}</Badge>
                </div>
                <span>{discount}</span>
              </div>
              <div className="flex items-start justify-between border-t pt-4">
                <span className="text-base font-medium">Total</span>
                <span className="text-base font-medium">{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

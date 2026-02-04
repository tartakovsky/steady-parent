import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderSummarySection3Props {
  orderNumber?: string;
  title?: string;
  description?: string;
  trackingNumber?: string;
  productName?: string;
  productDescription?: string;
  productImage?: string;
  quantity?: number;
  price?: string;
  deliveryAddress?: string;
  billingAddress?: string;
  paymentMethod?: {
    type: string;
    last4: string;
    expiry: string;
  };
  shippingMethod?: string;
  shippingDuration?: string;
  subtotal?: string;
  shipping?: string;
  discount?: string;
  discountCode?: string;
  taxes?: string;
  total?: string;
}

export default function OrderSummarySection3({
  title = "Order confirmed!",
  description = "Your order has been confirmed and will be shipped within 2-3 business days.",
  trackingNumber = "UPS-1Z9999999999999999",
  productName = "Wireless Mechanical Keyboard",
  productDescription = "Premium mechanical keyboard with RGB lighting, hot-swappable switches, and aluminum frame. Perfect for work and gaming.",
  productImage = "https://ui.shadcn.com/placeholder.svg",
  quantity = 1,
  price = "$149.00",
  deliveryAddress = "456 Maple Street, Seattle, WA 98101",
  billingAddress = "456 Maple Street, Seattle, WA 98101",
  paymentMethod = {
    type: "Mastercard",
    last4: "8765",
    expiry: "03/28",
  },
  shippingMethod = "Standard Shipping",
  shippingDuration = "3-5 business days",
  subtotal = "$149.00",
  shipping = "$8.00",
  discount = "-$15.00",
  discountCode = "WELCOME15",
  taxes = "$13.41",
  total = "$155.41",
}: OrderSummarySection3Props) {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container-padding-x mx-auto max-w-5xl">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-8 border-b pb-8">
            <div className="flex flex-col gap-4">
              <h1 className="heading-lg text-foreground">{title}</h1>
              <p className="text-muted-foreground text-base">{description}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm">
                Tracking number
              </span>
              <span className="text-base font-medium">{trackingNumber}</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="relative aspect-square w-full shrink-0 overflow-hidden sm:w-[200px]">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-medium">{productName}</h2>
                  <p className="text-muted-foreground text-sm leading-5">
                    {productDescription}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Quantity</span>
                    <span className="text-muted-foreground text-sm">
                      {quantity}
                    </span>
                  </div>
                  <Separator orientation="vertical" className="min-h-5" />
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Price</span>
                    <span className="text-muted-foreground text-sm">
                      {price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-6 md:pl-56">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium">Delivery address</h3>
                  <p className="text-muted-foreground text-sm leading-5">
                    {deliveryAddress}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium">Billing address</h3>
                  <p className="text-muted-foreground text-sm leading-5">
                    {billingAddress}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium">Payment method</h3>
                  <div className="text-muted-foreground flex flex-col gap-1">
                    <p className="text-sm">
                      Card ending with {paymentMethod.last4}
                    </p>
                    <p className="text-sm">Expires {paymentMethod.expiry}</p>
                  </div>
                </div>

                <div className="text-muted-foreground flex flex-col gap-1">
                  <h3 className="text-foreground text-base font-medium">
                    Shipping method
                  </h3>
                  <p className="text-sm leading-5">{shippingMethod}</p>
                  <p className="text-sm leading-5">{shippingDuration}</p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col items-end gap-4 text-sm">
                <div className="flex w-full items-center justify-between gap-2">
                  <span>Subtotal</span>
                  <span>{subtotal}</span>
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                  <span>Shipping</span>
                  <span>{shipping}</span>
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                  <span>Taxes</span>
                  <span>{taxes}</span>
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span>Discount</span>
                    <Badge variant="outline" className="text-xs">
                      {discountCode}
                    </Badge>
                  </div>
                  <span>{discount}</span>
                </div>
                <div className="border-border flex w-full items-center justify-between gap-2 border-t pt-4">
                  <span className="text-lg font-medium">Total</span>
                  <span className="font-medium">{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

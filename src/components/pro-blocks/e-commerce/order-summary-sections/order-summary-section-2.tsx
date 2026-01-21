import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const progressSteps = ["Order placed", "Processing", "Shipped", "Delivered"];

const orderItems = [
  {
    id: 1,
    name: "Premium Leather Crossbody Bag",
    price: "$189.00",
    description:
      "Handcrafted genuine leather bag with adjustable strap, multiple compartments, and premium hardware. Perfect for everyday use.",
    image: "https://ui.shadcn.com/placeholder.svg",
    shippedDate: "March 24, 2025",
    progress: 100,
  },
  {
    id: 2,
    name: "Minimalist Desk Lamp",
    price: "$129.00",
    description:
      "Modern LED desk lamp with adjustable brightness, USB charging port, and touch controls. Energy-efficient and eye-friendly design.",
    image: "https://ui.shadcn.com/placeholder.svg",
    shippedDate: "March 24, 2025",
    progress: 75,
  },
];

interface OrderSummarySection2Props {
  orderNumber?: string;
  orderDate?: string;
  deliveryAddress?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  paymentMethod?: {
    type: string;
    last4: string;
    expiry: string;
  };
  items?: typeof orderItems;
  subtotal?: string;
  shipping?: string;
  taxes?: string;
  total?: string;
}

export default function OrderSummarySection2({
  orderNumber = "#ORD-2024-5623",
  orderDate = "March 22, 2025",
  deliveryAddress = "1842 Oak Avenue, Portland, OR 97201",
  email = "michael.rodriguez@example.com",
  phone = "(503) 555-0198",
  billingAddress = "1842 Oak Avenue, Portland, OR 97201",
  paymentMethod = {
    type: "Visa",
    last4: "4532",
    expiry: "09/26",
  },
  items = orderItems,
  subtotal = "$318.00",
  shipping = "$12.00",
  taxes = "$28.62",
  total = "$358.62",
}: OrderSummarySection2Props) {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container-padding-x mx-auto max-w-5xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-end">
              <h1 className="heading-md text-foreground">
                Order {orderNumber}
              </h1>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Order placed</span>
                <span>{orderDate}</span>
              </div>
            </div>

            <div className="flex flex-col gap-10">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-6 md:flex-row">
                  <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden md:w-[300px]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-6">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-semibold">{item.name}</h2>
                        <p className="text-base font-medium">{item.price}</p>
                        <p className="text-muted-foreground text-sm leading-5">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-6 sm:flex-row">
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <h3 className="text-base font-medium">
                            Delivery address
                          </h3>
                          <p className="text-muted-foreground text-sm leading-5">
                            {deliveryAddress}
                          </p>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <h3 className="text-base font-medium">
                            Shipping updates
                          </h3>
                          <div className="flex flex-col gap-1">
                            <p className="text-muted-foreground text-sm">
                              {email}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                      <Progress value={item.progress} />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {progressSteps.map((step, index) => (
                          <span
                            key={index}
                            className="text-muted-foreground text-xs"
                          >
                            {step}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/40 rounded-lg p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:justify-end lg:gap-6">
              <div className="flex min-w-0 shrink-0 flex-col gap-6 lg:w-48">
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium">Billing address</h3>
                  <p className="text-muted-foreground text-sm leading-5">
                    {billingAddress}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium">Payment information</h3>
                  <div className="flex flex-col">
                    <p className="text-sm">
                      Card ending with {paymentMethod.last4}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Expires {paymentMethod.expiry}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-end gap-4 text-sm">
                <div className="flex w-full max-w-md items-center justify-between gap-2">
                  <span>Subtotal</span>
                  <span>{subtotal}</span>
                </div>
                <div className="flex w-full max-w-md items-center justify-between gap-2">
                  <span>Shipping</span>
                  <span>{shipping}</span>
                </div>
                <div className="flex w-full max-w-md items-center justify-between gap-2">
                  <span>Taxes</span>
                  <span>{taxes}</span>
                </div>
                <div className="border-border flex w-full max-w-md items-center justify-between gap-2 border-t pt-4">
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

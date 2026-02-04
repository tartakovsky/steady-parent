"use client";

import { useState } from "react";
import {
  Mail,
  Truck,
  CreditCard,
  Package,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const deliveryMethods = [
  {
    id: "standard",
    title: "Standard",
    turnaround: "4–10 business days",
    price: "$8.00",
  },
  {
    id: "express",
    title: "Express",
    turnaround: "2–5 business days",
    price: "$24.00",
  },
];

const paymentMethods = [
  { id: "credit-card", title: "Credit card" },
  { id: "paypal", title: "PayPal" },
  { id: "crypto", title: "Cryptocurrency" },
];

const steps = [
  { title: "E-mail", icon: Mail },
  { title: "Address", icon: Truck },
  { title: "Delivery", icon: Package },
  { title: "Payment", icon: CreditCard },
];

export default function Checkout2() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted");
  };

  return (
    <div className="bg-muted/60 relative py-0 md:py-16 md:pt-8">
      <div className="mx-auto max-w-3xl px-0 md:px-6">
        <h1 className="sr-only">Checkout</h1>

        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />

        <form onSubmit={handleSubmit} className="relative">
          <div className="bg-card md:border-border p-4 py-6 md:rounded-lg md:border md:p-6 md:shadow-xs">
            <FieldGroup>
              {currentStep === 1 && (
                <FieldSet>
                  <FieldLegend>Contact information</FieldLegend>
                  <FieldDescription>
                    We'll use this email to send you order confirmations and
                    updates
                  </FieldDescription>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email-address">
                        Email address
                      </FieldLabel>
                      <Input
                        id="email-address"
                        name="email-address"
                        type="email"
                        autoComplete="email"
                        required
                      />
                    </Field>
                  </FieldGroup>
                </FieldSet>
              )}

              {currentStep === 2 && (
                <>
                  <FieldSet>
                    <FieldLegend>Shipping information</FieldLegend>
                    <FieldDescription>
                      Enter the address where you want your order delivered
                    </FieldDescription>
                    <FieldGroup className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                      <Field>
                        <FieldLabel htmlFor="first-name">First name</FieldLabel>
                        <Input
                          id="first-name"
                          name="first-name"
                          type="text"
                          autoComplete="given-name"
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="last-name">Last name</FieldLabel>
                        <Input
                          id="last-name"
                          name="last-name"
                          type="text"
                          autoComplete="family-name"
                          required
                        />
                      </Field>

                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="company">Company</FieldLabel>
                        <Input id="company" name="company" type="text" />
                      </Field>

                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="address">Address</FieldLabel>
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          autoComplete="street-address"
                          required
                        />
                      </Field>

                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="apartment">
                          Apartment, suite, etc.
                        </FieldLabel>
                        <Input id="apartment" name="apartment" type="text" />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="city">City</FieldLabel>
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          autoComplete="address-level2"
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="country">Country</FieldLabel>
                        <Select defaultValue="us" required>
                          <SelectTrigger id="country">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="mx">Mexico</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="region">
                          State / Province
                        </FieldLabel>
                        <Input
                          id="region"
                          name="region"
                          type="text"
                          autoComplete="address-level1"
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="postal-code">
                          Postal code
                        </FieldLabel>
                        <Input
                          id="postal-code"
                          name="postal-code"
                          type="text"
                          autoComplete="postal-code"
                          required
                        />
                      </Field>

                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="phone">Phone</FieldLabel>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          required
                        />
                      </Field>
                    </FieldGroup>
                  </FieldSet>

                  <FieldSeparator className="my-6" />

                  <FieldSet>
                    <FieldLegend>Billing address</FieldLegend>
                    <FieldDescription>
                      The billing address associated with your payment method
                    </FieldDescription>
                    <FieldGroup>
                      <Field orientation="horizontal">
                        <Checkbox
                          id="same-as-shipping"
                          checked={sameAsShipping}
                          onCheckedChange={(checked) =>
                            setSameAsShipping(checked as boolean)
                          }
                        />
                        <FieldLabel
                          htmlFor="same-as-shipping"
                          className="font-normal"
                        >
                          Same as shipping address
                        </FieldLabel>
                      </Field>
                    </FieldGroup>

                    {!sameAsShipping && (
                      <FieldGroup className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                        <Field className="sm:col-span-2">
                          <FieldLabel htmlFor="billing-address">
                            Address
                          </FieldLabel>
                          <Input
                            id="billing-address"
                            name="billing-address"
                            type="text"
                            autoComplete="billing street-address"
                            required={!sameAsShipping}
                          />
                        </Field>

                        <Field className="sm:col-span-2">
                          <FieldLabel htmlFor="billing-apartment">
                            Apartment, suite, etc.
                          </FieldLabel>
                          <Input
                            id="billing-apartment"
                            name="billing-apartment"
                            type="text"
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="billing-city">City</FieldLabel>
                          <Input
                            id="billing-city"
                            name="billing-city"
                            type="text"
                            autoComplete="billing address-level2"
                            required={!sameAsShipping}
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="billing-country">
                            Country
                          </FieldLabel>
                          <Select defaultValue="us" required={!sameAsShipping}>
                            <SelectTrigger id="billing-country">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="ca">Canada</SelectItem>
                              <SelectItem value="mx">Mexico</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="billing-region">
                            State / Province
                          </FieldLabel>
                          <Input
                            id="billing-region"
                            name="billing-region"
                            type="text"
                            autoComplete="billing address-level1"
                            required={!sameAsShipping}
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="billing-postal-code">
                            Postal code
                          </FieldLabel>
                          <Input
                            id="billing-postal-code"
                            name="billing-postal-code"
                            type="text"
                            autoComplete="billing postal-code"
                            required={!sameAsShipping}
                          />
                        </Field>
                      </FieldGroup>
                    )}
                  </FieldSet>
                </>
              )}

              {currentStep === 3 && (
                <FieldSet>
                  <FieldLegend>Delivery method</FieldLegend>
                  <FieldDescription>
                    Choose how you want to receive your order
                  </FieldDescription>
                  <RadioGroup defaultValue={deliveryMethods[0].id}>
                    {deliveryMethods.map((deliveryMethod) => (
                      <FieldLabel
                        key={deliveryMethod.id}
                        htmlFor={deliveryMethod.id}
                      >
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>{deliveryMethod.title}</FieldTitle>
                            <FieldDescription>
                              {deliveryMethod.turnaround} ·{" "}
                              <span className="text-foreground font-medium">
                                {deliveryMethod.price}
                              </span>
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem
                            value={deliveryMethod.id}
                            id={deliveryMethod.id}
                          />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </FieldSet>
              )}

              {currentStep === 4 && (
                <FieldSet>
                  <FieldLegend>Payment</FieldLegend>
                  <FieldDescription>
                    All transactions are secure and encrypted
                  </FieldDescription>
                  <FieldGroup>
                    <FieldLabel className="sr-only">Payment method</FieldLabel>
                    <RadioGroup defaultValue={paymentMethods[0].id}>
                      {paymentMethods.map((paymentMethod) => (
                        <FieldLabel
                          key={paymentMethod.id}
                          htmlFor={paymentMethod.id}
                        >
                          <Field orientation="horizontal">
                            <FieldContent>
                              <FieldTitle>{paymentMethod.title}</FieldTitle>
                            </FieldContent>
                            <RadioGroupItem
                              value={paymentMethod.id}
                              id={paymentMethod.id}
                            />
                          </Field>
                        </FieldLabel>
                      ))}
                    </RadioGroup>
                  </FieldGroup>

                  <FieldGroup className="mt-6 grid grid-cols-4 gap-x-4 gap-y-6">
                    <Field className="col-span-4">
                      <FieldLabel htmlFor="card-number">Card number</FieldLabel>
                      <Input
                        id="card-number"
                        name="card-number"
                        type="text"
                        autoComplete="cc-number"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                      <FieldDescription>
                        Enter your 16-digit card number
                      </FieldDescription>
                    </Field>

                    <Field className="col-span-4">
                      <FieldLabel htmlFor="name-on-card">
                        Name on card
                      </FieldLabel>
                      <Input
                        id="name-on-card"
                        name="name-on-card"
                        type="text"
                        autoComplete="cc-name"
                        required
                      />
                    </Field>

                    <Field className="col-span-3">
                      <FieldLabel htmlFor="expiration-date">
                        Expiration date (MM/YY)
                      </FieldLabel>
                      <Input
                        id="expiration-date"
                        name="expiration-date"
                        type="text"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="cvc">CVC</FieldLabel>
                      <Input
                        id="cvc"
                        name="cvc"
                        type="text"
                        autoComplete="csc"
                        placeholder="123"
                        required
                      />
                    </Field>
                  </FieldGroup>
                </FieldSet>
              )}
            </FieldGroup>

            <div className="mt-8 flex items-center justify-between gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft />
                Previous
              </Button>
              {currentStep < steps.length ? (
                <Button type="button" size="lg" onClick={handleNext}>
                  Next <ArrowRight />
                </Button>
              ) : (
                <Button type="submit" size="lg">
                  Go summary
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

type StepNavigationProps = {
  steps: typeof steps;
  currentStep: number;
  onStepChange: (step: number) => void;
};

function StepNavigation({
  steps,
  currentStep,
  onStepChange,
}: StepNavigationProps) {
  return (
    <>
      <div className="text-muted-foreground relative w-full border-b p-4 text-center text-sm font-medium md:hidden">
        <p>
          Step {currentStep} of {steps.length}
        </p>
      </div>

      <div className="mb-6 hidden gap-3 md:flex">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div key={step.title} className="flex flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => onStepChange(stepNumber)}
                className={`flex w-full flex-col items-center gap-2 rounded-full border border-transparent text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isActive
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="size-4" />
                  ) : (
                    <step.icon className="size-4" />
                  )}
                </span>
                <span>{step.title}</span>
              </button>

              {index < steps.length - 1 && (
                <div className="bg-border h-px flex-1" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

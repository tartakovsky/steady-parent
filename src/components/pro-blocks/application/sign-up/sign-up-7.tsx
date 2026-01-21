"use client";

import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import Link from "next/link";

export function SignUp7() {
  return (
    <div className="bg-background flex min-h-screen justify-center px-6 py-8 md:items-start md:py-16">
      {/* Content wrapper with max width */}
      <div className="w-full max-w-md space-y-8">
        {/* Header section with logo and text */}
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo />
          {/* Title and subtitle */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold md:text-3xl">
              Create an account
            </h2>
            <p className="text-muted-foreground text-sm">
              Let's get started. Fill in the details below to create your
              account.
            </p>
          </div>
        </div>

        {/* Form inputs section */}
        <div className="space-y-4">
          {/* Name input field */}
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <InputGroup>
              <InputGroupInput id="name" placeholder="Name" />
            </InputGroup>
          </Field>

          {/* Email input field */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <InputGroup>
              <InputGroupInput id="email" type="email" placeholder="Email" />
            </InputGroup>
          </Field>

          {/* Password input field with helper text */}
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="password"
                type="password"
                placeholder="Password"
              />
            </InputGroup>
            <p className="text-muted-foreground text-sm">
              Minimum 8 characters.
            </p>
          </Field>

          {/* Terms and conditions checkbox with link */}
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <FieldLabel htmlFor="terms" className="text-sm leading-none">
              <p>
                I agree to the{" "}
                <Link href="#" className="underline">
                  Terms & Conditions
                </Link>
              </p>
            </FieldLabel>
          </div>
        </div>

        {/* Footer section with sign up button and sign in link */}
        <div className="space-y-6">
          <Button className="w-full">Sign up</Button>
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link href="#" className="text-primary underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import Image from "next/image";
import Link from "next/link";

export function SignUp1() {
  return (
    <div className="bg-background gap-x-6 py-6 md:flex md:min-h-screen md:p-6">
      {/* Left side: Sign-up form */}
      <div className="flex items-center justify-center md:w-1/2">
        <div className="w-full max-w-sm px-6 py-16 md:p-0">
          {/* Header section with logo and title */}
          <div className="mb-6 flex flex-col gap-y-6">
            {/* Logo */}
            <Link href="https://www.shadcndesign.com/" target="_blank">
              <Logo />
            </Link>
            {/* Title and description */}
            <div className="flex flex-col gap-y-3">
              <h1 className="text-2xl font-semibold md:text-3xl">
                Create an account
              </h1>
              <p className="text-muted-foreground text-sm">
                Let's get started. Fill in the details below to create your
                account.
              </p>
            </div>
          </div>
          {/* Sign-up form */}
          <div className="mb-6 space-y-4">
            {/* Name input */}
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <InputGroup>
                <InputGroupInput id="name" placeholder="Name" type="text" />
              </InputGroup>
            </Field>
            {/* Email input */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <InputGroup>
                <InputGroupInput id="email" placeholder="Email" type="email" />
              </InputGroup>
            </Field>
            {/* Password input */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  placeholder="Password"
                  type="password"
                />
              </InputGroup>
              <p className="text-muted-foreground text-sm">
                Minimum 8 characters.
              </p>
            </Field>
            {/* Terms and conditions checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <FieldLabel htmlFor="terms" className="text-sm font-normal">
                <p>
                  I agree to the{" "}
                  <Link href="#" className="text-foreground underline">
                    Terms & Conditions
                  </Link>
                </p>
              </FieldLabel>
            </div>
          </div>
          {/* Sign-up button and Sign-in link */}
          <div className="flex flex-col space-y-4">
            <Button className="w-full">Sign up</Button>
            <p className="text-muted-foreground text-center text-sm">
              Already have account?{" "}
              <Link className="text-foreground underline" href="#">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Right side: Image (hidden on mobile) */}
      <Image
        src="https://ui.shadcn.com/placeholder.svg"
        alt="Image"
        width="1800"
        height="1800"
        className="hidden w-1/2 rounded-xl object-cover md:block"
      />
    </div>
  );
}

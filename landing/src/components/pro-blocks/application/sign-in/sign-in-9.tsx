"use client";

import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import Link from "next/link";

export function SignIn9() {
  return (
    <div className="bg-background min-h-screen gap-x-6 md:p-16">
      {/* Content wrapper */}
      <div className="items-top flex w-full justify-center">
        {/* Sign-in form container */}
        <div className="w-full max-w-sm px-6 py-16 md:p-0">
          {/* Logo and header section */}
          <div className="mb-6 flex flex-col items-center space-y-6">
            <Logo className="h-8 w-8" />
            <div className="flex flex-col gap-y-3 text-center">
              <h1 className="text-2xl font-semibold md:text-3xl">Sign in</h1>
              <p className="text-muted-foreground text-sm">
                Log in to unlock tailored content and stay connected with your
                community.
              </p>
            </div>
          </div>
          {/* Input fields section */}
          <div className="mb-6 space-y-4">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="email"
                  placeholder="Email or username"
                  type="email"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  placeholder="Password"
                  type="password"
                />
              </InputGroup>
            </Field>
          </div>
          {/* Sign-in button and sign-up link section */}
          <div className="flex flex-col space-y-6">
            <Button className="w-full">Sign in</Button>
            {/* Forgot password link */}
            <div className="flex justify-center">
              <Link
                className="text-muted-foreground hover:text-foreground text-sm underline"
                href="#"
              >
                Forgot password?
              </Link>
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Don't have an account?{" "}
              <Link className="text-foreground underline" href="#">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

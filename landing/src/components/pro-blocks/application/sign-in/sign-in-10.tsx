"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState } from "react";

export function SignIn10() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Main container
    <div className="items-top bg-muted flex min-h-screen justify-center pt-16">
      {/* Dropdown menu for sign-in form */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        {/* Trigger button for dropdown */}
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Sign in</Button>
        </DropdownMenuTrigger>
        {/* Dropdown content */}
        <DropdownMenuContent className="w-screen rounded-none border-none p-6 md:w-[320px] md:rounded-lg md:border">
          <div className="grid gap-4">
            {/* Sign-in form title */}
            <h2 className="text-lg font-semibold">Sign in</h2>
            {/* Email input field */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <InputGroup>
                <InputGroupInput id="email" placeholder="Email" type="email" />
              </InputGroup>
            </Field>
            {/* Password input field */}
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
            {/* Remember me checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <FieldLabel
                htmlFor="remember"
                className="text-sm leading-none font-medium"
              >
                Remember me
              </FieldLabel>
            </div>
            {/* Sign-in button */}
            <Button>Sign in</Button>
            {/* Forgot password link */}
            <div className="text-center">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground text-sm underline"
              >
                Forgot password?
              </Link>
            </div>
            <Separator />
            {/* Sign-up section */}
            <div>
              <p className="text-muted-foreground text-center text-sm">
                Don't have an account?
              </p>
              {/* Sign-up button */}
              <Button variant="secondary" className="mt-2 w-full">
                Sign up
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

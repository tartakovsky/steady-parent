"use client";

import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

const MAIN_NAV_LINKS = [
  { href: "#", label: "Home" },
  { href: "#", label: "About" },
  { href: "#", label: "Products" },
  { href: "#", label: "Services" },
  { href: "#", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Cookies Settings" },
];

export function Footer2() {
  return (
    <footer
      className="bg-background section-padding-y text-sm"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-12 lg:gap-16">
        <div className="flex flex-col gap-12">
          {/* Top Section */}
          <div className="flex flex-col gap-12 md:items-center md:justify-between lg:flex-row">
            {/* Logo and Navigation */}
            <div className="flex flex-col items-center gap-12 lg:flex-row">
              {/* Logo */}
              <Link href="/" aria-label="Go to homepage">
                <Logo className="size-7" />
              </Link>

              {/* Main Navigation */}
              <nav
                className="flex flex-col items-center gap-4 text-center md:flex-row md:gap-8"
                aria-label="Footer navigation"
              >
                {MAIN_NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Newsletter Form */}
            <form
              className="flex w-full flex-col gap-2 md:w-auto md:flex-row"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter subscription form"
            >
              <Field className="md:w-[242px]">
                <FieldLabel htmlFor="footer2-email" className="sr-only">
                  Email
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="footer2-email"
                    type="email"
                    placeholder="Your email"
                    required
                    aria-required="true"
                    aria-label="Enter your email for newsletter"
                  />
                </InputGroup>
              </Field>
              <Button
                type="submit"
                className="w-full md:w-auto"
                aria-label="Subscribe to our newsletter"
              >
                Subscribe
              </Button>
            </form>
          </div>

          {/* Section Divider */}
          <Separator role="presentation" />

          {/* Bottom Section */}
          <div className="flex flex-col items-center justify-between gap-12 text-center lg:flex-row">
            {/* Copyright Text */}
            <p className="text-muted-foreground order-2 md:order-1">
              <span>Copyright © {new Date().getFullYear()}</span>{" "}
              <Link href="/" className="hover:underline">
                shadcndesign.com
              </Link>
              . All rights reserved.
            </p>

            {/* Legal Navigation */}
            <nav
              className="order-1 flex flex-col items-center gap-4 md:order-2 md:flex-row md:gap-8"
              aria-label="Legal links"
            >
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

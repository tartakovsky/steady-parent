"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

const FOOTER_COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Partners", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Guides", href: "#" },
      { label: "Tutorials", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Downloads", href: "#" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Your Account", href: "#" },
      { label: "Settings", href: "#" },
      { label: "Accessibility", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
  {
    title: "Help & Feedback",
    links: [
      { label: "Contact Support", href: "#" },
      { label: "Get In Touch", href: "#" },
      { label: "Help Articles", href: "#" },
      { label: "Feedback Form", href: "#" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Facebook", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "X", href: "#" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookies Settings", href: "#" },
];

export function Footer5() {
  return (
    <footer
      className="bg-background section-padding-y text-sm"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:gap-16">
        {/* Newsletter Section */}
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="flex flex-col gap-1 text-center lg:text-left">
            <h2 className="text-foreground text-lg font-medium">
              Subscribe to our newsletter
            </h2>
            <p className="text-muted-foreground">
              Get the latest news and updates from our team.
            </p>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-2">
            <div className="flex flex-col gap-2 lg:flex-row">
              <Field className="flex-1">
                <FieldLabel htmlFor="footer5-email" className="sr-only">
                  Email
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="footer5-email"
                    type="email"
                    placeholder="Enter your email"
                  />
                </InputGroup>
              </Field>
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 items-center gap-12 text-center lg:grid-cols-5 lg:items-start lg:gap-6 lg:text-left">
          {/* Navigation Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              {/* Column Title */}
              <h2 className="text-foreground text-base font-medium">
                {column.title}
              </h2>
              {/* Column Navigation */}
              <nav
                className="flex flex-col gap-3"
                aria-label={`${column.title} links`}
              >
                {column.links.map((link) => (
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
          ))}
        </div>

        {/* Section Divider */}
        <Separator role="presentation" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-12 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          {/* Copyright Text */}
          <p className="text-muted-foreground order-2 text-center lg:order-1 lg:text-left">
            <span>Copyright © {new Date().getFullYear()}</span>{" "}
            <Link href="/" className="hover:underline">
              shadcndesign.com
            </Link>
            . All rights reserved.
          </p>

          {/* Legal Navigation */}
          <nav
            className="order-1 flex flex-col items-center gap-4 text-center lg:order-2 lg:flex-row lg:items-start lg:gap-8 lg:text-left"
            aria-label="Legal links"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-center transition-colors md:text-left"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

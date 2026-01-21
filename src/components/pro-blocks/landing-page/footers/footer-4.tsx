"use client";

import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

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
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookies Settings", href: "#" },
];

export function Footer4() {
  return (
    <footer
      className="bg-background section-padding-y text-sm"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:gap-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 items-center gap-12 text-center lg:grid-cols-5 lg:items-start lg:gap-6 lg:text-left">
          {/* Logo Column */}
          <div className="flex flex-col items-center lg:items-start">
            <Link href="/" aria-label="Go to homepage">
              <Logo className="size-7" />
            </Link>
          </div>

          {/* Navigation Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              {/* Column Title */}
              <h2 className="text-foreground text-base font-medium">
                {column.title}
              </h2>
              {/* Column Navigation */}
              <nav
                className="flex flex-col gap-4"
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

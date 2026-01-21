"use client";

import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
  SiWhatsapp,
} from "@icons-pack/react-simple-icons";
import type { ComponentType } from "react";

type FooterLinkItem = {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
};

type FooterColumn = {
  title: string;
  links: FooterLinkItem[];
};

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Company",
    links: [
      { href: "#", label: "About Us" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Careers" },
      { href: "#", label: "Press" },
      { href: "#", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "#", label: "Documentation" },
      { href: "#", label: "Pricing" },
      { href: "#", label: "Changelog" },
      { href: "#", label: "System Status" },
      { href: "#", label: "Support" },
    ],
  },
  {
    title: "Follow us",
    links: [
      { href: "#", label: "Facebook", icon: SiFacebook },
      { href: "#", label: "Instagram", icon: SiInstagram },
      { href: "#", label: "X", icon: SiX },
      { href: "#", label: "Youtube", icon: SiYoutube },
      { href: "#", label: "WhatsApp", icon: SiWhatsapp },
    ],
  },
];

const LEGAL_LINKS = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Cookies Settings" },
];

export function Footer8() {
  return (
    <footer
      className="bg-background section-padding-y border-border border-t"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        {/* Top grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Brand + Newsletter */}
          <div className="flex flex-col items-center justify-center gap-6 text-center lg:col-span-2 lg:items-start lg:justify-start lg:text-left">
            <Link href="/" aria-label="Go to homepage" className="w-fit">
              <Logo className="size-7" />
            </Link>

            <div className="flex flex-col gap-4">
              <h2 className="heading-sm">Join our newsletter</h2>

              <form
                className="md: flex w-full max-w-sm flex-col gap-2 sm:flex-row"
                onSubmit={(e) => e.preventDefault()}
                aria-label="Newsletter subscription form"
              >
                <Field className="sm:flex-1">
                  <FieldLabel htmlFor="footer8-email" className="sr-only">
                    Email
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="footer8-email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      aria-required="true"
                      aria-label="Enter your email for newsletter"
                    />
                  </InputGroup>
                </Field>
                <Button type="submit" className="sm:w-auto">
                  Subscribe
                </Button>
              </form>

              <p className="text-muted-foreground text-sm">
                By subscribing you agree to with our{" "}
                <Link href="#" className="underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => {
            const hasIcons = column.links.some((l) => l.icon);
            return (
              <nav
                key={column.title}
                aria-label={`Footer links ${column.title.toLowerCase()}`}
                className="flex flex-col gap-4 text-center lg:items-start lg:justify-start lg:text-left"
              >
                <h3 className="font-medium">{column.title}</h3>
                <ul
                  className={cn(
                    "text-muted-foreground flex flex-col text-sm",
                    hasIcons
                      ? "items-center gap-4 lg:items-start lg:justify-start lg:text-left"
                      : "gap-3",
                  )}
                >
                  {column.links.map((link) => (
                    <li
                      key={link.label}
                      className={cn(hasIcons && "flex items-center gap-3")}
                    >
                      {link.icon ? (
                        <span aria-hidden="true" className="text-foreground">
                          <link.icon className="size-4" />
                        </span>
                      ) : null}
                      <Link
                        className="hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        href={link.href}
                        aria-label={link.icon ? link.label : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mt-12 lg:mt-16">
          <Separator role="presentation" />
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
          <p className="text-muted-foreground order-2 text-sm md:order-1">
            Copyright © {new Date().getFullYear()} shadcndesign.com. All rights
            reserved.
          </p>

          <nav
            aria-label="Legal links"
            className="order-1 flex flex-col items-center gap-3 md:order-2 lg:flex-row lg:gap-8"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
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

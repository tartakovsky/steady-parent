"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
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
    title: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Roadmap", href: "#" },
      { label: "Get Started", href: "#" },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "Code editor", href: "#" },
      { label: "Component library", href: "#" },
      { label: "Page builder", href: "#" },
      { label: "File manager", href: "#" },
      { label: "Chat", href: "#" },
    ],
  },
  {
    title: "Get help",
    links: [
      { label: "Support", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
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

const LEGAL_LINKS: FooterLinkItem[] = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Cookies Settings" },
];

export function Footer9() {
  return (
    <footer
      className="bg-background section-padding-y border-border border-t"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-padding-x mx-auto max-w-7xl">
        {/* Top grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => {
            const hasIcons = col.links.some((l) => l.icon);
            return (
              <nav
                key={col.title}
                aria-label={`Footer links ${col.title.toLowerCase()}`}
                className="flex flex-col gap-4 text-center lg:items-start lg:justify-start lg:text-left"
              >
                <h3 className="font-medium">{col.title}</h3>
                <ul
                  className={cn(
                    "text-muted-foreground flex flex-col text-sm",
                    hasIcons
                      ? "items-center gap-4 lg:items-start lg:justify-start lg:text-left"
                      : "gap-3",
                  )}
                >
                  {col.links.map((link) => (
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

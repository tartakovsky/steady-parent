"use client";

import { Logo } from "@/components/pro-blocks/e-commerce/examples/shared/logo";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
  SiWhatsapp,
} from "@icons-pack/react-simple-icons";

const MAIN_NAV_LINKS = [
  { href: "#", label: "Home" },
  { href: "#", label: "About Us" },
  { href: "#", label: "Services" },
  { href: "#", label: "Contact Us" },
  { href: "#", label: "FAQ" },
];

const SOCIAL_MEDIA_LINKS = [
  { href: "#", label: "Facebook", icon: SiFacebook },
  { href: "#", label: "Instagram", icon: SiInstagram },
  { href: "#", label: "X", icon: SiX },
  { href: "#", label: "YouTube", icon: SiYoutube },
  { href: "#", label: "WhatsApp", icon: SiWhatsapp },
];

export function Footer3() {
  return (
    <footer
      className="bg-background section-padding-y text-sm"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:gap-16">
        {/* Top Section */}
        <div className="relative flex flex-col items-center gap-10 md:items-center md:justify-between lg:flex-row lg:gap-8">
          {/* Logo */}
          <Link href="/" aria-label="Go to homepage">
            <Logo className="size-7" />
          </Link>

          {/* Main Navigation */}
          <nav
            className="flex flex-col items-center gap-4 md:gap-8 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:flex-row"
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

          {/* Social Media Links */}
          <div
            className="flex justify-center gap-5"
            aria-label="Social media links"
          >
            {SOCIAL_MEDIA_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-all duration-300 hover:scale-110"
                aria-label={`Follow us on ${link.label}`}
              >
                <link.icon className="text-foreground size-5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Section Divider */}
        <Separator role="presentation" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-12 text-center md:gap-6 lg:flex-row lg:text-left">
          {/* Copyright Text */}
          <p className="text-muted-foreground order-2 md:order-1">
            <span>Copyright © {new Date().getFullYear()}</span>{" "}
            <Link href="#" className="hover:underline">
              shadcndesign.com
            </Link>
            . All rights reserved.
          </p>

          {/* Legal Navigation */}
          <nav
            className="order-1 flex flex-col items-center gap-4 text-center md:order-2 md:flex-row md:gap-7"
            aria-label="Legal links"
          >
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies Settings
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

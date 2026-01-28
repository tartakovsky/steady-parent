"use client";

import type React from "react";

import Link from "next/link";

const LEGAL_LINKS = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
] as const;

export function Footer(): React.JSX.Element {
  return (
    <footer
      className="bg-black py-6 text-sm text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p className="text-white/70">
          <span>Copyright © {new Date().getFullYear()}</span>{" "}
          <Link href="/" className="text-white/80 hover:text-white">
            The Steady Parent Method
          </Link>
          .
        </p>

        <nav aria-label="Legal links" className="flex items-center gap-4">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-white/70 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}


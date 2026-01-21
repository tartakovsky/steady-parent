"use client";

import type React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface LandingNavbarProps {
  ctaLabel: string;
  ctaUrl: string;
}

export function LandingNavbar({ ctaLabel, ctaUrl }: LandingNavbarProps): React.JSX.Element {
  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          NMP
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Primary">
          <a href="#what" className="text-muted-foreground hover:text-foreground">
            What you get
          </a>
          <a href="#inside" className="text-muted-foreground hover:text-foreground">
            What is inside
          </a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground">
            FAQ
          </a>
        </nav>
        <Button asChild>
          <Link href={ctaUrl}>{ctaLabel}</Link>
        </Button>
      </div>
    </header>
  );
}


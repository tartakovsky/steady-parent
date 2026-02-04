"use client";

import { Rocket, ChevronsRight } from "lucide-react";
import Link from "next/link";

export function Banner4() {
  return (
    <aside
      role="banner"
      aria-label="Product update announcement"
      className="flex h-screen items-center justify-center" // you can remove classes here - it's just for the wrapper
    >
      <Link
        href="#"
        className="border-border bg-background hover:bg-muted flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 shadow-xs"
        aria-label="Learn more about new Pro Blocks update"
      >
        <Rocket className="size-4 shrink-0" aria-hidden="true" />
        <span className="text-sm" id="update-description">
          <span className="font-semibold">New update </span>
          <span className="text-muted-foreground">
            · 100+ Pro Blocks are now available
          </span>
        </span>
        <ChevronsRight
          className="text-muted-foreground size-4 shrink-0"
          aria-hidden="true"
        />
      </Link>
    </aside>
  );
}

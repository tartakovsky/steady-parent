"use client";

import { Button } from "@/components/ui/button";
import { X, ChevronsRight } from "lucide-react";
import Link from "next/link";

export function Banner6() {
  return (
    <aside
      role="banner"
      aria-label="Product announcement"
      className="fixed top-16 right-0 left-0 mx-auto px-6"
    >
      <div className="relative mx-auto flex max-w-5xl items-center rounded-xl bg-neutral-950 py-3 pr-6 pl-4 shadow-lg md:py-4">
        <Link
          href="#"
          className="flex w-full cursor-pointer items-center justify-start gap-2"
          aria-label="Learn more about shadcn/ui kit Pro blocks"
        >
          <span className="text-sm text-white hover:underline">
            <span className="font-semibold">New update</span> · Pro blocks are
            now available in shadcn/ui kit for Figma!
          </span>
          <ChevronsRight
            className="hidden h-4 w-4 text-white md:block"
            aria-hidden="true"
          />
        </Link>
        <Button
          onClick={() => {
            /* Add close handler */
          }}
          className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/20"
          aria-label="Close announcement"
          variant="ghost"
          size="icon"
        >
          <X className="text-white" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </aside>
  );
}

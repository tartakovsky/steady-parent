"use client";

import { X, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export function Banner2() {
  return (
    <aside
      role="banner"
      aria-label="Promotion announcement"
      className="relative flex items-center bg-neutral-950 py-3 pr-8 pl-6"
    >
      <a
        href="#"
        className="flex w-full cursor-pointer items-center justify-start gap-2"
        aria-label="Learn more about shadcn/ui kit Pro blocks"
      >
        <span className="text-sm text-white hover:underline">
          <span className="font-semibold">New update</span> · Pro blocks are now
          available in shadcn/ui kit for Figma!
        </span>
        <ChevronsRight className="hidden h-4 w-4 text-white md:block" />
      </a>
      <Button
        onClick={() => {
          /* Add close handler */
        }}
        className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/20"
        aria-label="Close announcement"
        variant="ghost"
        size="icon"
      >
        <X className="text-white" />
        <span className="sr-only">Close</span>
      </Button>
    </aside>
  );
}

"use client";

import * as React from "react";

import { X, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Banner1Props {
  href: string;
  labelBold: string;
  label: string;
  dismissible?: boolean;
}

export function Banner1({
  href,
  labelBold,
  label,
  dismissible = false,
}: Banner1Props): React.JSX.Element {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return <></>;

  return (
    <aside
      role="banner"
      aria-label="Promotion announcement"
      className="relative flex items-center bg-neutral-950 py-3 pr-8 pl-6"
    >
      <a
        href={href}
        className="flex w-full cursor-pointer items-start justify-start gap-2 md:items-center md:justify-center"
        aria-label={label}
      >
        <p className="text-left text-sm text-white hover:underline md:text-center">
          <span className="font-semibold">{labelBold}</span> · {label}
        </p>
        <ChevronsRight className="hidden h-4 w-4 text-white md:block" />
      </a>

      {dismissible ? (
        <Button
          type="button"
          onClick={() => {
            setIsVisible(false);
          }}
          className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/20"
          aria-label="Close announcement"
          variant="ghost"
          size="icon"
        >
          <X className="text-white" />
          <span className="sr-only">Close</span>
        </Button>
      ) : null}
    </aside>
  );
}

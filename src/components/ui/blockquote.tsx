"use client";

import type React from "react";

import { cn } from "@/lib/utils";

interface BlockquoteProps {
  children: React.ReactNode;
  className?: string;
}

export function Blockquote({ children, className }: BlockquoteProps): React.JSX.Element {
  return (
    <blockquote
      className={cn(
        "border-l-2 border-primary/40 pl-4 text-muted-foreground text-sm/6 italic",
        className,
      )}
    >
      {children}
    </blockquote>
  );
}

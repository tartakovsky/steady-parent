"use client";

import type React from "react";

interface CalloutProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  title?: string;
}

export function Callout({
  children,
  variant = "primary",
  title,
}: CalloutProps): React.JSX.Element {
  const isPrimary = variant === "primary";

  return (
    <aside
      className={
        isPrimary
          ? "not-prose my-8 rounded-lg bg-primary p-6 md:p-8"
          : "not-prose my-8 rounded-lg border border-border bg-background p-6 md:p-8"
      }
    >
      {title && (
        <p
          className={
            isPrimary
              ? "mb-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground/70"
              : "mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          }
        >
          {title}
        </p>
      )}
      <div
        className={
          isPrimary
            ? "text-primary-foreground text-base/7 [&_strong]:text-primary-foreground [&_a]:underline [&_a]:underline-offset-4"
            : "text-foreground text-base/7 [&_strong]:text-foreground [&_a]:underline [&_a]:underline-offset-4"
        }
      >
        {children}
      </div>
    </aside>
  );
}

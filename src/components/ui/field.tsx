/* eslint-disable react/prop-types */
import type React from "react";

import { cn } from "@/lib/utils";

export type FieldProps = React.HTMLAttributes<HTMLDivElement>;

export function Field({ className, ...props }: FieldProps): React.JSX.Element {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export type FieldLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function FieldLabel({
  className,
  ...props
}: FieldLabelProps): React.JSX.Element {
  return (
    <label
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}


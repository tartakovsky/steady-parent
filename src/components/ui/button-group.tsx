import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ButtonGroup({ className, children, ...props }: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex -space-x-px rounded-md shadow-xs",
        "[&>button]:rounded-none [&>button]:shadow-none",
        "[&>button:first-child]:rounded-l-md",
        "[&>button:last-child]:rounded-r-md",
        "[&>input]:rounded-none [&>input]:shadow-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

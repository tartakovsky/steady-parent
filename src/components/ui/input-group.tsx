import type React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type InputGroupProps = React.HTMLAttributes<HTMLDivElement>;

export function InputGroup({
  className,
  ...props
}: InputGroupProps): React.JSX.Element {
  return (
    <div
      className={cn("relative flex items-center", className)}
      {...props}
    />
  );
}

export type InputGroupInputProps = React.ComponentProps<typeof Input>;

export function InputGroupInput(props: InputGroupInputProps): React.JSX.Element {
  return <Input {...props} />;
}


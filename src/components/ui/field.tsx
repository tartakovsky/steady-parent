import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Field({ className, children, ...props }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}

interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FieldGroup({ className, children, ...props }: FieldGroupProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

interface FieldLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  children: React.ReactNode;
}

export function FieldLabel({ className, children, ...props }: FieldLabelProps) {
  return (
    <Label className={cn("text-sm font-medium", className)} {...props}>
      {children}
    </Label>
  );
}

interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function FieldDescription({ className, children, ...props }: FieldDescriptionProps) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props}>
      {children}
    </p>
  );
}

interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function FieldError({ className, children, ...props }: FieldErrorProps) {
  return (
    <p className={cn("text-destructive text-sm", className)} {...props}>
      {children}
    </p>
  );
}

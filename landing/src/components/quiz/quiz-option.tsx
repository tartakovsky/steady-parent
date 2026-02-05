"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuizOptionProps extends React.HTMLAttributes<HTMLButtonElement> {
  option: { id: string; text: string };
  isSelected: boolean;
  onSelect: () => void;
}

export function QuizOption({
  option,
  isSelected,
  onSelect,
  className,
  ...props
}: QuizOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border-2 p-4 text-left transition-all",
        "min-h-[60px] text-base",
        "hover:border-primary hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-background",
        className
      )}
      {...props}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="flex-1">{option.text}</span>
        {isSelected && <Check className="h-5 w-5 shrink-0 text-primary" />}
      </span>
    </button>
  );
}

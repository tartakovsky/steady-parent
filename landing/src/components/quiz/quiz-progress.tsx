"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface QuizProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  total: number;
}

export function QuizProgress({
  current,
  total,
  className,
  ...props
}: QuizProgressProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Question {current} of {total}
        </span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

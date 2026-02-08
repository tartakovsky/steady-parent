import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "error";
}

const variantStyles = {
  default: "bg-card",
  success: "bg-emerald-50 dark:bg-emerald-950/20",
  warning: "bg-amber-50 dark:bg-amber-950/20",
  error: "bg-red-50 dark:bg-red-950/20",
} as const;

const iconStyles = {
  default: "text-muted-foreground",
  success: "text-emerald-600",
  warning: "text-amber-600",
  error: "text-red-600",
} as const;

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: StatsCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${variantStyles[variant]}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className={`h-4 w-4 ${iconStyles[variant]}`} />
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

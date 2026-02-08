import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ValidationBadgeProps {
  errors: number;
  warnings: number;
}

export function ValidationBadge({ errors, warnings }: ValidationBadgeProps) {
  if (errors > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="h-3 w-3" />
        {errors} error{errors !== 1 ? "s" : ""}
      </span>
    );
  }
  if (warnings > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3" />
        {warnings} warn{warnings !== 1 ? "s" : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <CheckCircle className="h-3 w-3" />
      Pass
    </span>
  );
}

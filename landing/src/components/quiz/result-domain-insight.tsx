"use client";

import {
  Activity,
  Brain,
  Heart,
  Check,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { DomainResult } from "@/lib/quiz/quiz-engine";

const DOMAIN_ICONS: Record<string, LucideIcon> = {
  physical: Activity,
  cognitive: Brain,
  emotional: Heart,
};

function getDomainColor(level: DomainResult["level"]): string {
  switch (level) {
    case "high":
      return "#16a34a";
    case "medium":
      return "#d97706";
    case "low":
      return "#ea580c";
  }
}

function getLevelLabel(level: DomainResult["level"]): string {
  switch (level) {
    case "high":
      return "Strong";
    case "medium":
      return "Developing";
    case "low":
      return "Emerging";
  }
}

interface ResultDomainInsightProps {
  domain: DomainResult;
  shared?: boolean | undefined;
}

export function ResultDomainInsight({
  domain,
  shared,
}: ResultDomainInsightProps) {
  const color = getDomainColor(domain.level);
  const Icon = DOMAIN_ICONS[domain.id] ?? Activity;
  const levelLabel = getLevelLabel(domain.level);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ backgroundColor: `${color}12` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <h3 className="font-bold text-base text-foreground truncate">
            {domain.name}
          </h3>
          <span
            className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
            style={{ backgroundColor: `${color}12`, color }}
          >
            {levelLabel}
          </span>
        </div>
        <span className="text-sm font-bold tabular-nums text-muted-foreground shrink-0">
          {domain.score}
          <span className="font-normal text-muted-foreground/50">
            {" "}
            / {domain.maxScore}
          </span>
        </span>
      </div>

      {/* Mobile level badge */}
      <span
        className="sm:hidden inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4"
        style={{ backgroundColor: `${color}12`, color }}
      >
        {levelLabel}
      </span>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-foreground/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ backgroundColor: color, width: `${domain.percentage}%` }}
        />
      </div>

      {/* Detail content — hidden in shared view */}
      {!shared && (
        <div className="mt-4 space-y-3">
          <p className="font-semibold text-[15px] text-foreground">
            {domain.headline}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {domain.detail}
          </p>

          {domain.strength && (
            <div className="flex items-start gap-2.5 text-sm rounded-xl bg-green-50/70 px-4 py-3">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
              <span className="text-green-900/80 leading-relaxed">
                {domain.strength}
              </span>
            </div>
          )}

          {domain.concern && (
            <div className="flex items-start gap-2.5 text-sm rounded-xl bg-amber-50/70 px-4 py-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              <span className="text-amber-900/80 leading-relaxed">
                {domain.concern}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

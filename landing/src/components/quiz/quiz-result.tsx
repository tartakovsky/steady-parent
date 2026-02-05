"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { savePdf } from "@/lib/save-pdf";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  AlertTriangle,
  RotateCcw,
  Link2,
  ClipboardCheck,
  Info,
  Sparkles,
  ArrowRight,
  Heart,
  Download,
} from "lucide-react";
import type { QuizResult as QuizResultType, DomainResult } from "@/lib/quiz/quiz-engine";

interface QuizResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: QuizResultType;
  quizMeta: { title: string; shortTitle: string };
  onRetake?: () => void;
}

// ── Circular score ring ──────────────────────────────────────────────

function ScoreRing({
  percentage,
  size = 160,
  strokeWidth = 10,
  color,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight">{percentage}%</span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
          readiness
        </span>
      </div>
    </div>
  );
}

// ── Mini bar for domain breakdown ────────────────────────────────────

function DomainBar({ domain, color }: { domain: DomainResult; color: string }) {
  const levelLabel =
    domain.level === "high"
      ? "Strong"
      : domain.level === "medium"
        ? "Developing"
        : "Emerging";

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-semibold text-base">{domain.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{domain.headline}</p>
        </div>
        <div className="text-right shrink-0">
          <span
            className="text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${color}18`,
              color,
            }}
          >
            {levelLabel}
          </span>
        </div>
      </div>
      {/* Custom bar */}
      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${domain.percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {domain.detail}
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function QuizResult({
  result,
  quizMeta,
  onRetake,
  className,
  ...props
}: QuizResultProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePdf = useCallback(async () => {
    if (!resultRef.current || saving) return;
    setSaving(true);
    try {
      const slug = quizMeta.shortTitle.toLowerCase().replace(/\s+/g, "-");
      await savePdf(resultRef.current, `${slug}-results.pdf`);
    } finally {
      setSaving(false);
    }
  }, [saving, quizMeta.shortTitle]);

  // Result-specific theming
  const theme = (() => {
    switch (result.resultId) {
      case "ready":
        return {
          color: "#16a34a",
          bgGradient: "from-green-50 to-emerald-50/50",
          label: "Ready to go",
          icon: <Sparkles className="h-5 w-5" />,
        };
      case "almost":
        return {
          color: "#d97706",
          bgGradient: "from-amber-50 to-yellow-50/50",
          label: "Almost there",
          icon: <Heart className="h-5 w-5" />,
        };
      case "not-yet":
        return {
          color: "#ea580c",
          bgGradient: "from-orange-50 to-amber-50/30",
          label: "Give it time",
          icon: <Heart className="h-5 w-5" />,
        };
      default:
        return {
          color: "var(--primary)",
          bgGradient: "from-primary/5 to-primary/0",
          label: "Your results",
          icon: <Sparkles className="h-5 w-5" />,
        };
    }
  })();

  // Domain colors - distinct but harmonious
  const domainColors = ["#0d9488", "#6366f1", "#e11d48"];

  return (
    <div ref={resultRef} className={cn("space-y-10", className)} {...props}>
      {/* ── Hero: Score + Headline ──────────────────────────────── */}
      <div
        className={cn(
          "rounded-2xl bg-gradient-to-br p-8 sm:p-10",
          theme.bgGradient
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
          <ScoreRing
            percentage={result.percentage}
            color={theme.color}
          />
          <div className="space-y-3 flex-1">
            <div
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${theme.color}15`,
                color: theme.color,
              }}
            >
              {theme.icon}
              {theme.label}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {result.headline}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {result.subheadline}
            </p>
          </div>
        </div>

        <p className="mt-6 text-foreground/80 leading-relaxed max-w-prose">
          {result.explanation}
        </p>

        {/* Quick actions right in the hero */}
        <div className="flex flex-wrap gap-3 mt-6">
          {onRetake && (
            <Button onClick={onRetake} className="gap-2" style={{ backgroundColor: theme.color }}>
              <RotateCcw className="h-4 w-4" />
              Take the quiz yourself
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 bg-background/80">
            {copied ? (
              <>
                <ClipboardCheck className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5" />
                Share results
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSavePdf} disabled={saving} className="gap-1.5 bg-background/80">
            <Download className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save PDF"}
          </Button>
        </div>
      </div>

      {/* ── Domain Breakdown ───────────────────────────────────── */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight">
          Readiness by Area
        </h2>
        <div className="grid gap-6">
          {result.domains.map((domain, i) => (
            <Card key={domain.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <DomainBar
                  domain={domain}
                  color={domainColors[i % domainColors.length]!}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Strengths & Concerns side by side ──────────────────── */}
      {(result.strengths.length > 0 || result.concerns.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-6">
          {result.strengths.length > 0 && (
            <Card className="border-green-100 bg-green-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-700" />
                  </div>
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.concerns.length > 0 && (
            <Card className="border-amber-100 bg-amber-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-700" />
                  </div>
                  Areas to Watch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.concerns.map((concern, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Next Steps ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            What to Do Next
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full text-xs font-bold mt-0.5"
                  style={{
                    backgroundColor: `${theme.color}15`,
                    color: theme.color,
                  }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* ── Good to Know ───────────────────────────────────────── */}
      {result.watchOutFor && (
        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
                <Info className="h-4 w-4 text-blue-700" />
              </div>
              Good to Know
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{result.watchOutFor}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Encouragement ──────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/8 to-primary/3 p-8">
        <p className="text-lg leading-relaxed text-foreground/90">
          {result.encouragement}
        </p>
        {result.retakeAdvice && (
          <p className="mt-3 text-sm text-muted-foreground flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5" />
            {result.retakeAdvice}
          </p>
        )}
      </div>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      {onRetake && (
        <div className="text-center space-y-3 pt-2">
          <Button
            size="lg"
            onClick={onRetake}
            className="gap-2 text-lg px-8 py-6"
            style={{ backgroundColor: theme.color }}
          >
            <RotateCcw className="h-5 w-5" />
            Take the quiz yourself
          </Button>
          <p className="text-sm text-muted-foreground">
            {quizMeta.shortTitle} &middot; {result.domains.length} areas &middot; 2 minutes
          </p>
        </div>
      )}
    </div>
  );
}

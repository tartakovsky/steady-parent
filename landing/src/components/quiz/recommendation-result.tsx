"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { savePdf } from "@/lib/save-pdf";
import { Button } from "@/components/ui/button";
import {
  Link2,
  ClipboardCheck,
  Download,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Users,
  Wrench,
} from "lucide-react";
import type { QuizResult as QuizResultType, DomainResult } from "@/lib/quiz/quiz-engine";

// ── Types ────────────────────────────────────────────────────────────

interface RecommendationResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: QuizResultType;
  quizMeta: {
    title: string;
    shortTitle: string;
    estimatedTime?: string;
    scoreLabel?: string;
    shareCta?: string;
    levelLabels?: { high: string; medium: string; low: string };
    sectionLabels?: { strengths?: string; concerns?: string };
    sources?: string[];
  };
  onRetake?: () => void;
  shared?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, { border: string; badge: string; badgeText: string; label: string }> = {
  high: { border: "border-l-emerald-500", badge: "bg-emerald-50", badgeText: "text-emerald-700", label: "Primary Strategy" },
  medium: { border: "border-l-amber-400", badge: "bg-amber-50", badgeText: "text-amber-700", label: "Supporting Strategy" },
  low: { border: "border-l-gray-300", badge: "bg-gray-50", badgeText: "text-gray-500", label: "Less Needed" },
};

const DEFAULT_LEVEL_LABELS = { high: "Primary Strategy", medium: "Supporting Strategy", low: "Less Needed" };

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

/** Parse markdown-like content with bullet points and bold text into React elements */
function FormattedContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  let currentBullets: React.ReactNode[] = [];

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      elements.push(
        <ul key={`bullets-${elements.length}`} className="space-y-2 mt-3">
          {currentBullets}
        </ul>
      );
      currentBullets = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
      const content = trimmed.replace(/^[•\-]\s*/, "");
      // Parse **bold** — text pattern
      const parts = content.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <span key={j} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </span>
          );
        }
        return <span key={j}>{part}</span>;
      });

      currentBullets.push(
        <li key={`b-${i}`} className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 shrink-0 mt-2" />
          <span className="text-sm text-foreground/80 leading-relaxed">{rendered}</span>
        </li>
      );
    } else if (trimmed.length > 0) {
      flushBullets();
      elements.push(
        <p key={`p-${i}`} className="text-sm text-foreground/80 leading-relaxed">
          {trimmed}
        </p>
      );
    }
  });

  flushBullets();
  return <>{elements}</>;
}

// ── Strategy Card ───────────────────────────────────────────────────

function StrategyCard({
  domain,
  levelLabel,
}: {
  domain: DomainResult;
  levelLabel: string;
}) {
  const styles = (PRIORITY_STYLES[domain.level] ?? PRIORITY_STYLES["medium"])!;
  const hasContent = domain.strength || domain.concern;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl border border-border/50 bg-card overflow-hidden",
        "border-l-4",
        styles.border
      )}
    >
      {/* Header */}
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="font-bold text-base text-foreground">{domain.name}</h3>
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0",
              styles.badge,
              styles.badgeText
            )}
          >
            {levelLabel}
          </span>
        </div>
        <p className="font-semibold text-sm text-foreground/70">{domain.headline}</p>
      </div>

      {/* Description */}
      <div className="px-5 sm:px-6 pb-2">
        <p className="text-sm text-muted-foreground leading-relaxed">{domain.detail}</p>
      </div>

      {/* Strategy recommendations (the main content) */}
      {domain.strength && (
        <div className="mx-4 sm:mx-5 mb-4 rounded-xl bg-emerald-50/60 border border-emerald-100/60 px-4 py-4">
          <FormattedContent text={domain.strength} />
        </div>
      )}

      {/* Concern / alternative note */}
      {domain.concern && (
        <div className="mx-4 sm:mx-5 mb-4 rounded-xl bg-amber-50/60 border border-amber-100/60 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-900/80 leading-relaxed">{domain.concern}</p>
          </div>
        </div>
      )}

      {!hasContent && <div className="pb-2" />}
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function RecommendationResult({
  result,
  quizMeta,
  onRetake,
  shared,
  className,
  ...props
}: RecommendationResultProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("s", "1");
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, []);

  const handleSavePdf = useCallback(async () => {
    if (!resultRef.current || saving) return;
    setSaving(true);
    try {
      const slug = quizMeta.shortTitle.toLowerCase().replace(/\s+/g, "-");
      await savePdf(resultRef.current, `${slug}-toolkit.pdf`);
    } finally {
      setSaving(false);
    }
  }, [saving, quizMeta.shortTitle]);

  const themeColor = result.themeColor;
  const labels = quizMeta.levelLabels ?? DEFAULT_LEVEL_LABELS;

  // Sort domains: high first, then medium, then low
  const sortedDomains = [...result.domains].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.level] ?? 1) - (order[b.level] ?? 1);
  });

  return (
    <div
      ref={resultRef}
      className={cn("space-y-12 sm:space-y-16", className)}
      {...props}
    >
      {/* ── 1. Shared CTA ────────────────────────────────────────── */}
      {shared && (
        <div className="rounded-2xl border-2 border-green-200 bg-green-50/40 p-6 sm:p-8 text-center space-y-4">
          <p className="text-lg sm:text-xl font-bold text-foreground">
            {quizMeta.shareCta || "Build your own personalized toolkit"}
          </p>
          <Button
            size="lg"
            onClick={onRetake}
            className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all bg-green-600 hover:bg-green-700 text-white"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Take the Quiz Yourself
          </Button>
          <p className="text-sm text-muted-foreground">
            {quizMeta.shortTitle} &middot; {quizMeta.estimatedTime ?? "2 minutes"}
          </p>
        </div>
      )}

      {/* ── 2. Hero — Toolkit header ─────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl py-10 sm:py-14 px-6 sm:px-8"
        style={{
          background: `linear-gradient(to bottom right, ${themeColor}0D, ${themeColor}08)`,
        }}
      >
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-[0.07] pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        <div className="relative flex flex-col items-center text-center">
          {shared && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-medium text-muted-foreground mb-6 tracking-wide"
            >
              Someone shared their toolkit with you
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ backgroundColor: `${themeColor}15` }}
          >
            <Wrench className="w-7 h-7" style={{ color: themeColor }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
          >
            {result.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-3 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg"
          >
            {result.subheadline}
          </motion.p>
        </div>
      </motion.section>

      {/* ── 3. Comparative Context ───────────────────────────────── */}
      {result.comparativeContext && (
        <section className="flex items-start gap-3 px-5 py-4 rounded-xl bg-muted/40 max-w-xl mx-auto">
          <Users className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.comparativeContext}
          </p>
        </section>
      )}

      {/* ── 4. Share / Save CTAs ─────────────────────────────────── */}
      {!shared && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={handleShare}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl text-base"
          >
            {copied ? (
              <>
                <ClipboardCheck className="h-4 w-4" />
                Link Copied!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Share Toolkit
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleSavePdf}
            disabled={saving}
            className="gap-2 rounded-xl"
          >
            <Download className="h-4 w-4" />
            {saving ? "Saving..." : "Save PDF"}
          </Button>
          {onRetake && (
            <Button variant="ghost" onClick={onRetake} className="gap-2 rounded-xl">
              <RotateCcw className="h-4 w-4" />
              Retake
            </Button>
          )}
        </div>
      )}

      {/* ── Shared-view second CTA ─────────────────────────────── */}
      {shared && (
        <div className="text-center">
          <Button
            size="lg"
            onClick={onRetake}
            className="text-base sm:text-lg px-10 py-6 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            {quizMeta.shareCta || "Build Your Own Toolkit"}
          </Button>
        </div>
      )}

      {/* ── Owner-only sections ───────────────────────────────────── */}
      {!shared && (
        <>
          {/* ── 5. Strategy Cards ───────────────────────────────────── */}
          <section className="space-y-5">
            <SectionHeading>Your Personalized Strategies</SectionHeading>
            <p className="text-muted-foreground -mt-2">
              {result.explanation}
            </p>
            <div className="grid gap-4">
              {sortedDomains.map(domain => (
                <StrategyCard
                  key={domain.id}
                  domain={domain}
                  levelLabel={labels[domain.level]}
                />
              ))}
            </div>
          </section>

          {/* ── 6. Getting Started ───────────────────────────────────── */}
          {result.nextSteps.length > 0 && (
            <section className="space-y-5">
              <SectionHeading>Getting Started</SectionHeading>
              <div className="space-y-3">
                {result.nextSteps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-border/50 bg-card px-4 sm:px-5 py-4"
                  >
                    <div
                      className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-base text-foreground/80 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              {result.watchOutFor && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-50/70 border border-amber-100/60 px-4 sm:px-5 py-4 mt-4">
                  <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-900/80 leading-relaxed">{result.watchOutFor}</p>
                </div>
              )}
            </section>
          )}

          {/* ── 7. Encouragement ──────────────────────────────────── */}
          <section>
            <div
              className="rounded-2xl px-6 sm:px-8 py-8 sm:py-10 text-center"
              style={{
                background: `linear-gradient(135deg, ${themeColor}08 0%, ${themeColor}04 100%)`,
              }}
            >
              <p className="text-lg sm:text-xl leading-relaxed text-foreground/85 max-w-2xl mx-auto">
                {result.encouragement}
              </p>
            </div>
          </section>

          {/* ── Bottom CTAs ───────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleShare}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl"
            >
              <Link2 className="h-4 w-4" />
              Share Toolkit
            </Button>
            <Button
              variant="outline"
              onClick={handleSavePdf}
              disabled={saving}
              className="gap-2 rounded-xl"
            >
              <Download className="h-4 w-4" />
              Save PDF
            </Button>
            {onRetake && (
              <Button variant="ghost" onClick={onRetake} className="gap-2 rounded-xl">
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
            )}
          </div>
        </>
      )}

      {/* ── Sources ──────────────────────────────────────────────── */}
      {quizMeta.sources && quizMeta.sources.length > 0 && (
        <div className="text-center space-y-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
            Based on research from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {quizMeta.sources.map((source, i) => (
              <span key={i} className="text-xs text-muted-foreground">
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

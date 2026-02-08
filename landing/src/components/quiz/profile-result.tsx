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
  Check,
  Lightbulb,
  Users,
} from "lucide-react";
import type { QuizResult as QuizResultType, DomainResult } from "@/lib/quiz/quiz-engine";

// ── Types ────────────────────────────────────────────────────────────

interface ProfileResultProps extends React.HTMLAttributes<HTMLDivElement> {
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

const LEVEL_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  high: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "#16a34a" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", bar: "#d97706" },
  low: { bg: "bg-rose-50", text: "text-rose-700", bar: "#e11d48" },
};

const DEFAULT_LEVEL_LABELS = { high: "Strong", medium: "Developing", low: "Emerging" };

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

// ── Profile Bar (horizontal bar for the overview) ────────────────────

function ProfileBar({ domain, levelLabel }: { domain: DomainResult; levelLabel: string }) {
  const pct = domain.maxScore > 0 ? (domain.score / domain.maxScore) * 100 : 0;
  const colors = (LEVEL_COLORS[domain.level] ?? LEVEL_COLORS["medium"])!;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-foreground w-36 sm:w-44 truncate">
        {domain.name}
      </span>
      <div className="flex-1 h-3 rounded-full bg-foreground/[0.04] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: colors.bar }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <span
        className={cn(
          "text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
          colors.bg,
          colors.text
        )}
      >
        {levelLabel}
      </span>
    </div>
  );
}

// ── Domain Detail Card ──────────────────────────────────────────────

function DomainCard({ domain, levelLabel }: { domain: DomainResult; levelLabel: string }) {
  const colors = (LEVEL_COLORS[domain.level] ?? LEVEL_COLORS["medium"])!;
  const pct = domain.maxScore > 0 ? (domain.score / domain.maxScore) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: colors.bar }}
          />
          <h3 className="font-bold text-base text-foreground truncate">
            {domain.name}
          </h3>
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0",
              colors.bg,
              colors.text
            )}
          >
            {levelLabel}
          </span>
        </div>
        <span className="text-sm font-bold tabular-nums text-muted-foreground shrink-0">
          {domain.score}
          <span className="font-normal text-muted-foreground/50"> / {domain.maxScore}</span>
        </span>
      </div>

      {/* Score bar */}
      <div className="h-2 w-full rounded-full bg-foreground/[0.04] overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: colors.bar }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </div>

      {/* Content */}
      <p className="font-semibold text-base text-foreground mb-1">{domain.headline}</p>
      <p className="text-base text-muted-foreground leading-relaxed mb-4">{domain.detail}</p>

      {domain.strength && (
        <div className="flex items-start gap-2.5 text-sm rounded-xl bg-green-50/70 px-4 py-3 mb-2">
          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-600" />
          <span className="text-green-900/80 leading-relaxed">{domain.strength}</span>
        </div>
      )}

      {domain.concern && (
        <div className="flex items-start gap-2.5 text-sm rounded-xl bg-indigo-50/70 px-4 py-3">
          <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-600" />
          <span className="text-indigo-900/80 leading-relaxed">{domain.concern}</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function ProfileResult({
  result,
  quizMeta,
  onRetake,
  shared,
  className,
  ...props
}: ProfileResultProps) {
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
      await savePdf(resultRef.current, `${slug}-profile.pdf`);
    } finally {
      setSaving(false);
    }
  }, [saving, quizMeta.shortTitle]);

  const themeColor = result.themeColor;
  const labels = quizMeta.levelLabels ?? DEFAULT_LEVEL_LABELS;

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
            {quizMeta.shareCta || "Curious? Take the quiz yourself"}
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
            {quizMeta.shortTitle} &middot; {quizMeta.estimatedTime ?? "3 minutes"}
          </p>
        </div>
      )}

      {/* ── 2. Hero — Profile Overview ───────────────────────────── */}
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
              Someone shared their results with you
            </motion.p>
          )}

          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {quizMeta.shortTitle}
          </p>

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

          {/* Profile bars in the hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 w-full max-w-md space-y-3"
          >
            {result.domains.map(domain => (
              <ProfileBar
                key={domain.id}
                domain={domain}
                levelLabel={labels[domain.level]}
              />
            ))}
          </motion.div>
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
                Share Results
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
            {quizMeta.shareCta || "Take the Quiz Yourself"}
          </Button>
        </div>
      )}

      {/* ── Owner-only sections ───────────────────────────────────── */}
      {!shared && (
        <>
          {/* ── 5. Domain Detail Cards ─────────────────────────────── */}
          <section className="space-y-5">
            <SectionHeading>A Closer Look</SectionHeading>
            <div className="grid gap-4">
              {result.domains.map(domain => (
                <DomainCard
                  key={domain.id}
                  domain={domain}
                  levelLabel={labels[domain.level]}
                />
              ))}
            </div>
          </section>

          {/* ── 6. Action Plan ────────────────────────────────────── */}
          {result.nextSteps.length > 0 && (
            <section className="space-y-5">
              <SectionHeading>What to Do Next</SectionHeading>
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
              Share Results
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

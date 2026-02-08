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
  TrendingUp,
  Users,
} from "lucide-react";
import type { IdentityQuizResult, IdentityTypeResult } from "@/lib/quiz/quiz-engine";

interface IdentityResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: IdentityQuizResult;
  quizMeta: {
    title: string;
    shortTitle: string;
    estimatedTime?: string;
    shareCta?: string;
    sources?: string[];
  };
  onRetake?: () => void;
  shared?: boolean;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

function BlendBar({ type, maxPercentage }: { type: IdentityTypeResult; maxPercentage: number }) {
  const widthPct = maxPercentage > 0 ? (type.percentage / maxPercentage) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-foreground w-28 sm:w-36 truncate">
        {type.name}
      </span>
      <div className="flex-1 h-3 rounded-full bg-foreground/[0.04] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: type.themeColor }}
          initial={{ width: 0 }}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums text-muted-foreground w-10 text-right">
        {type.percentage}%
      </span>
    </div>
  );
}

function TypeCard({ type, isPrimary }: { type: IdentityTypeResult; isPrimary: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 sm:p-6",
        isPrimary
          ? "border-2"
          : "border-border/50 bg-card"
      )}
      style={isPrimary ? { borderColor: `${type.themeColor}40`, backgroundColor: `${type.themeColor}06` } : undefined}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: type.themeColor }}
        />
        <h3 className="font-bold text-lg text-foreground">{type.name}</h3>
        {isPrimary && (
          <span
            className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${type.themeColor}18`, color: type.themeColor }}
          >
            Primary
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-muted-foreground mb-1">{type.tagline}</p>
      <p className="text-base text-muted-foreground leading-relaxed mb-4">{type.description}</p>

      {/* Strengths */}
      <div className="space-y-2 mb-4">
        {type.strengths.map((s, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm">
            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-600" />
            <span className="text-foreground/80 leading-relaxed">{s}</span>
          </div>
        ))}
      </div>

      {/* Growth edge */}
      <div className="flex items-start gap-2.5 text-sm rounded-xl bg-indigo-50/70 px-4 py-3">
        <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-600" />
        <span className="text-indigo-900/80 leading-relaxed">{type.growthEdge}</span>
      </div>
    </div>
  );
}

export function IdentityResult({
  result,
  quizMeta,
  onRetake,
  shared,
  className,
  ...props
}: IdentityResultProps) {
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
      await savePdf(resultRef.current, `${slug}-results.pdf`);
    } finally {
      setSaving(false);
    }
  }, [saving, quizMeta.shortTitle]);

  const primary = result.primaryType;
  const maxPct = Math.max(...result.allTypes.map(t => t.percentage));

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
            {quizMeta.shortTitle} &middot; {quizMeta.estimatedTime ?? "2 minutes"}
          </p>
        </div>
      )}

      {/* ── 2. Primary Type Hero ─────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl py-12 sm:py-16 px-6 sm:px-8"
        style={{
          background: `linear-gradient(to bottom right, ${primary.themeColor}0D, ${primary.themeColor}08)`,
        }}
      >
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-[0.07] pointer-events-none"
          style={{ backgroundColor: primary.themeColor }}
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
            Your dominant parenting style is...
          </p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground"
          >
            {primary.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-md"
          >
            {primary.tagline}
          </motion.p>
        </div>
      </motion.section>

      {/* ── 3. Comparative Context ───────────────────────────────── */}
      {primary.comparativeContext && (
        <section className="flex items-start gap-3 px-5 py-4 rounded-xl bg-muted/40 max-w-xl mx-auto">
          <Users className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {primary.comparativeContext}
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
            <Button
              variant="ghost"
              onClick={onRetake}
              className="gap-2 rounded-xl"
            >
              <RotateCcw className="h-4 w-4" />
              Retake
            </Button>
          )}
        </div>
      )}

      {/* ── 5. Your Blend ────────────────────────────────────────── */}
      <section className="space-y-5">
        <SectionHeading>Your Match Profile</SectionHeading>
        <div className="space-y-3">
          {result.allTypes.map(type => (
            <BlendBar key={type.id} type={type} maxPercentage={maxPct} />
          ))}
        </div>
      </section>

      {/* ── Shared-view second CTA ───────────────────────────────── */}
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

      {/* ── Owner-only sections ──────────────────────────────────── */}
      {!shared && (
        <>
          {/* ── 6. Type Details ───────────────────────────────────── */}
          <section className="space-y-5">
            <SectionHeading>Your Types</SectionHeading>
            <div className="grid gap-4">
              {result.allTypes.map(type => (
                <TypeCard
                  key={type.id}
                  type={type}
                  isPrimary={type.id === primary.id}
                />
              ))}
            </div>
          </section>

          {/* ── 7. Encouragement ──────────────────────────────────── */}
          <section>
            <div
              className="rounded-2xl px-6 sm:px-8 py-8 sm:py-10 text-center"
              style={{
                background: `linear-gradient(135deg, ${primary.themeColor}08 0%, ${primary.themeColor}04 100%)`,
              }}
            >
              <p className="text-lg sm:text-xl leading-relaxed text-foreground/85 max-w-2xl mx-auto">
                {primary.encouragement}
              </p>
            </div>
          </section>

          {/* ── Bottom CTAs ──────────────────────────────────────── */}
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
              <Button
                variant="ghost"
                onClick={onRetake}
                className="gap-2 rounded-xl"
              >
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

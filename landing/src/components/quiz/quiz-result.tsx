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
  AlertTriangle,
  ArrowRight,
  Users,
  ExternalLink,
} from "lucide-react";
import type { QuizResult as QuizResultType } from "@/lib/quiz/quiz-engine";
import { ResultHero } from "./result-hero";
import { ResultDomainInsight } from "./result-domain-insight";
import { ResultActionPlan } from "./result-action-plan";

// ── Types ────────────────────────────────────────────────────────────

interface QuizResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: QuizResultType;
  quizMeta: {
    title: string;
    shortTitle: string;
    estimatedTime?: string;
    sources?: { name: string; url: string }[];
  };
  onRetake?: () => void;
  shared?: boolean;
}

// ── Theme ────────────────────────────────────────────────────────────

function getTheme(resultId: string) {
  switch (resultId) {
    case "ready":
      return {
        color: "#16a34a",
        bgGradient: "from-green-50/80 to-emerald-50/30",
      };
    case "almost":
      return {
        color: "#d97706",
        bgGradient: "from-amber-50/80 to-yellow-50/30",
      };
    case "not-yet":
      return {
        color: "#ea580c",
        bgGradient: "from-orange-50/80 to-amber-50/20",
      };
    default:
      return {
        color: "#6366f1",
        bgGradient: "from-violet-50/80 to-indigo-50/30",
      };
  }
}

// ── Section heading ──────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="text-2xl font-extrabold tracking-tight text-foreground"
    >
      {children}
    </motion.h2>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function QuizResult({
  result,
  quizMeta,
  onRetake,
  shared,
  className,
  ...props
}: QuizResultProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("s", "1");
    const shareUrl = url.toString();

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `My ${quizMeta.shortTitle} Results`,
          text: result.shareableSummary,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or not available — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [quizMeta.shortTitle, result.shareableSummary]);

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

  const theme = getTheme(result.resultId);

  return (
    <div
      ref={resultRef}
      className={cn("space-y-12 sm:space-y-16", className)}
      {...props}
    >
      {/* ── 1. Shared CTA (visitors see this first) ────────────── */}
      {shared && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border-2 border-green-200 bg-green-50/40 p-6 sm:p-8 text-center space-y-4"
        >
          <p className="text-lg sm:text-xl font-bold text-foreground">
            Curious about your own child&apos;s readiness?
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
            {quizMeta.shortTitle} &middot;{" "}
            {quizMeta.estimatedTime ?? "2 minutes"}
          </p>
        </motion.div>
      )}

      {/* ── 2. Hero ────────────────────────────────────────────── */}
      <ResultHero
        percentage={result.percentage}
        headline={result.headline}
        subheadline={result.subheadline}
        themeColor={theme.color}
        bgGradient={theme.bgGradient}
        shared={shared}
      />

      {/* ── 3. Shareable Summary + Comparative Context ─────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center px-4 py-2"
      >
        <p className="text-xl sm:text-2xl leading-relaxed text-foreground/80 max-w-2xl mx-auto">
          {result.shareableSummary}
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
          <Users className="w-4 h-4 shrink-0" />
          <span>{result.comparativeContext}</span>
        </div>
      </motion.section>

      {/* ── 4. Share / Save CTAs (owner only) ──────────────────── */}
      {!shared && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
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
        </motion.div>
      )}

      {/* ── 5. Domain Insights ─────────────────────────────────── */}
      <section className="space-y-6">
        <SectionHeading>A Closer Look</SectionHeading>
        <div className="grid gap-4">
          {result.domains.map((domain, i) => (
            <ResultDomainInsight
              key={domain.id}
              domain={domain}
              index={i}
              shared={shared}
            />
          ))}
        </div>
      </section>

      {/* ── Shared-view second CTA ─────────────────────────────── */}
      {shared && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={onRetake}
            className="text-base sm:text-lg px-10 py-6 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Find Out Your Child&apos;s Readiness
          </Button>
        </motion.div>
      )}

      {/* ── Owner-only sections ─────────────────────────────────── */}
      {!shared && (
        <>
          {/* ── 6. Strengths ────────────────────────────────────── */}
          {result.strengths.length > 0 && (
            <section className="space-y-5">
              <SectionHeading>Where Your Child Shines</SectionHeading>
              <div className="grid gap-3">
                {result.strengths.map((strength, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-start gap-3 rounded-xl bg-green-50/60 border border-green-100/60 px-4 sm:px-5 py-4"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-green-700" />
                    </div>
                    <p className="text-sm sm:text-[15px] text-green-900/80 leading-relaxed">
                      {strength}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* ── 7. Growth Areas ─────────────────────────────────── */}
          {result.concerns.length > 0 && (
            <section className="space-y-5">
              <SectionHeading>Room to Grow</SectionHeading>
              <div className="grid gap-3">
                {result.concerns.map((concern, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-start gap-3 rounded-xl bg-amber-50/60 border border-amber-100/60 px-4 sm:px-5 py-4"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                    <p className="text-sm sm:text-[15px] text-amber-900/80 leading-relaxed">
                      {concern}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* ── 8. Action Plan ──────────────────────────────────── */}
          <section className="space-y-6">
            <SectionHeading>What to Do Next</SectionHeading>
            <ResultActionPlan
              steps={result.nextSteps}
              watchOutFor={result.watchOutFor}
              themeColor={theme.color}
            />
          </section>

          {/* ── 9. Encouragement ────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="rounded-2xl px-6 sm:px-8 py-8 sm:py-10 text-center"
              style={{
                background: `linear-gradient(135deg, ${theme.color}08 0%, ${theme.color}04 100%)`,
              }}
            >
              <p className="text-lg sm:text-xl leading-relaxed text-foreground/85 max-w-2xl mx-auto">
                {result.encouragement}
              </p>
              {result.retakeAdvice && (
                <p className="mt-4 text-sm text-muted-foreground inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                  {result.retakeAdvice}
                </p>
              )}
            </div>
          </motion.section>

          {/* ── Bottom CTAs ─────────────────────────────────────── */}
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

      {/* ── Sources (always visible) ───────────────────────────── */}
      {quizMeta.sources && quizMeta.sources.length > 0 && (
        <div className="text-center space-y-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
            Based on research from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {quizMeta.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                {source.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

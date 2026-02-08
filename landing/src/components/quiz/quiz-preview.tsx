"use client";

import { useEffect, useRef } from "react";
import { motion, animate } from "framer-motion";
import { RotateCcw, Check, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FreebieCTA } from "@/components/blog/freebie-cta";
import type {
  QuizMeta,
  QuizResult,
  IdentityQuizResult,
  LikertQuizResult,
  DomainResult,
} from "@/lib/quiz/quiz-engine";

type AnyResult = QuizResult | IdentityQuizResult | LikertQuizResult;

function isIdentityResult(r: AnyResult): r is IdentityQuizResult {
  return "primaryType" in r;
}

function isLikertResult(r: AnyResult): r is LikertQuizResult {
  return "primaryDimension" in r;
}

// ── Animated score counter ──────────────────────────────────────────

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      delay: 0.3,
      onUpdate(v) {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value]);
  return <span ref={ref}>0</span>;
}

// ── Score ring ──────────────────────────────────────────────────────

function ScoreRing({
  percentage,
  color,
  label = "Score",
}: {
  percentage: number;
  color: string;
  label?: string | undefined;
}) {
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-foreground/[0.06]"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-foreground">
            <AnimatedCounter value={percentage} />
          </span>
          <span className="text-lg sm:text-xl font-bold text-foreground/30 ml-0.5">%</span>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.16em] mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Horizontal summary bar ──────────────────────────────────────────

function SummaryBar({
  name,
  percentage,
  color,
  label,
  delay,
}: {
  name: string;
  percentage: number;
  color: string;
  label?: string | undefined;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">{name}</span>
        <span className="text-muted-foreground font-medium">{label ?? `${percentage}%`}</span>
      </div>
      <div className="h-3 rounded-full bg-foreground/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(percentage, 4)}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: delay + 0.1 }}
        />
      </div>
    </motion.div>
  );
}

// ── Identity taste card (matches TypeCard from identity-result.tsx) ──

function IdentityTasteCard({
  type,
}: {
  type: { name: string; tagline: string; themeColor: string; description: string; strengths: string[]; growthEdge: string };
}) {
  return (
    <div
      className="rounded-2xl border-2 p-5 sm:p-6"
      style={{ borderColor: `${type.themeColor}40`, backgroundColor: `${type.themeColor}06` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: type.themeColor }}
        />
        <h3 className="font-bold text-lg text-foreground">{type.name}</h3>
        <span
          className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${type.themeColor}18`, color: type.themeColor }}
        >
          Primary
        </span>
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

// ── Domain taste card (for readiness/profile/recommendation) ────────

function DomainTasteCard({ domain, color }: { domain: DomainResult; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <h3 className="font-bold text-lg text-foreground">{domain.name}</h3>
        <span className="text-xs font-medium text-muted-foreground">{domain.percentage}%</span>
      </div>
      <p className="font-semibold text-foreground/90 mb-1">{domain.headline}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{domain.detail}</p>
      {domain.strength && (
        <div className="mt-3 flex items-start gap-2.5 text-sm">
          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-600" />
          <span className="text-foreground/80 leading-relaxed">{domain.strength}</span>
        </div>
      )}
    </div>
  );
}

// ── Extract preview data ────────────────────────────────────────────

interface PreviewData {
  headline: string;
  subheadline: string;
  themeColor: string;
  percentage?: number | undefined;
  scoreLabel?: string | undefined;
  bars: { name: string; percentage: number; color: string; label?: string | undefined }[];
  barsTitle: string;
}

const DOMAIN_COLORS = ["#00b86b", "#e07937", "#9c83f2", "#3b82f6", "#ef4444", "#f59e0b"];

function extractPreviewData(result: AnyResult, meta: QuizMeta): PreviewData {
  if (isIdentityResult(result)) {
    return {
      headline: `You're a ${result.primaryType.name}`,
      subheadline: result.primaryType.tagline,
      themeColor: result.primaryType.themeColor,
      bars: result.allTypes.map((t) => ({
        name: t.name,
        percentage: t.percentage,
        color: t.themeColor,
        label: `${t.percentage}% match`,
      })),
      barsTitle: "Your Match Profile",
    };
  }

  if (isLikertResult(result)) {
    return {
      headline: `Primarily: ${result.primaryDimension.name}`,
      subheadline: result.primaryDimension.tagline,
      themeColor: result.primaryDimension.themeColor,
      bars: result.allDimensions.map((d) => ({
        name: d.name,
        percentage: d.percentage,
        color: d.themeColor,
        label: `${d.meanScore} / ${d.maxScore}`,
      })),
      barsTitle: "Your Dimensions",
    };
  }

  const levelLabel = (level: string) => {
    if (meta.levelLabels) {
      return meta.levelLabels[level as keyof typeof meta.levelLabels] ?? level;
    }
    return level === "high" ? "Strong" : level === "medium" ? "Developing" : "Emerging";
  };

  return {
    headline: result.headline,
    subheadline: result.subheadline,
    themeColor: result.themeColor,
    percentage: result.percentage,
    scoreLabel: meta.scoreLabel,
    bars: result.domains.map((d, i) => ({
      name: d.name,
      percentage: d.percentage,
      color: DOMAIN_COLORS[i % DOMAIN_COLORS.length]!,
      label: `${d.percentage}% — ${levelLabel(d.level)}`,
    })),
    barsTitle:
      meta.resultDisplay === "recommendation"
        ? "Your Strategy Match"
        : meta.resultDisplay === "profile"
          ? "Your Child's Profile"
          : "Domain Scores",
  };
}

// ── Main preview component ──────────────────────────────────────────

interface QuizPreviewProps {
  result: AnyResult;
  quizMeta: QuizMeta;
  onRetake: () => void;
}

export function QuizPreview({ result, quizMeta, onRetake }: QuizPreviewProps) {
  const data = extractPreviewData(result, quizMeta);
  const cta = quizMeta.previewCta;
  const promises = quizMeta.previewPromises;

  return (
    <div className="space-y-8">
      {/* ── Hero ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl py-12 sm:py-16 px-6 sm:px-8"
        style={{
          background: `linear-gradient(to bottom right, ${data.themeColor}0D, ${data.themeColor}08)`,
        }}
      >
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-[0.07] pointer-events-none"
          style={{ backgroundColor: data.themeColor }}
        />
        <div className="relative flex flex-col items-center text-center">
          <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-[0.16em] mb-6">
            {quizMeta.shortTitle}
          </p>
          {data.percentage !== undefined && (
            <div className="mb-6">
              <ScoreRing percentage={data.percentage} color={data.themeColor} label={data.scoreLabel} />
            </div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
          >
            {data.headline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-md"
          >
            {data.subheadline}
          </motion.p>
        </div>
      </motion.section>

      {/* ── Summary bars ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <h2 className="text-lg font-bold text-foreground mb-5">{data.barsTitle}</h2>
        <div className="space-y-4">
          {data.bars.map((bar, i) => (
            <SummaryBar
              key={bar.name}
              name={bar.name}
              percentage={bar.percentage}
              color={bar.color}
              label={bar.label}
              delay={0.6 + i * 0.1}
            />
          ))}
        </div>
      </motion.section>

      {/* ── Taste card: show actual result content, clipped with fade ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative overflow-hidden"
        style={{ maxHeight: 320 }}
      >
        {isIdentityResult(result) ? (
          <IdentityTasteCard type={result.primaryType} />
        ) : isLikertResult(result) ? (
          <IdentityTasteCard type={result.primaryDimension} />
        ) : (
          <div className="space-y-4">
            {result.domains.slice(0, 2).map((domain, i) => (
              <DomainTasteCard
                key={domain.id}
                domain={domain}
                color={DOMAIN_COLORS[i % DOMAIN_COLORS.length]!}
              />
            ))}
          </div>
        )}

        {/* Gradient fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      </motion.div>

      {/* ── Promises list + CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="space-y-6"
      >
        {/* What's included — type specific */}
        {promises && promises.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <p className="font-bold text-foreground mb-4">
              Your full results include:
            </p>
            <ul className="space-y-3">
              {promises.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                  <span className="text-foreground/80 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Email gate CTA */}
        {cta ? (
          <FreebieCTA
            eyebrow={cta.eyebrow}
            title={cta.title}
            body={cta.body}
            buttonText={cta.buttonText}
            variant="secondary"
          />
        ) : (
          <FreebieCTA
            eyebrow="Want the full results?"
            title="Get your complete results delivered to your inbox"
            body="Your personalized breakdown, action steps, and expert-backed recommendations — all in one email."
            buttonText="Send my results"
            variant="secondary"
          />
        )}

        <p className="text-center text-xs text-muted-foreground">
          100% free. No spam. Unsubscribe anytime.
        </p>
      </motion.div>

      {/* ── Retake ── */}
      <div className="flex justify-center pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetake}
          className="text-muted-foreground gap-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retake quiz
        </Button>
      </div>
    </div>
  );
}

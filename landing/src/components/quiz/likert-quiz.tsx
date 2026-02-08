"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, RotateCcw } from "lucide-react";
import { LikertResult } from "./likert-result";
import { QuizPreview } from "./quiz-preview";
import { scoreLikertQuiz } from "@/lib/quiz/quiz-engine";
import {
  readStateFromUrl,
  pushStateToUrl,
  clearStateFromUrl,
} from "@/lib/quiz/quiz-url";
import type { LikertQuizData, LikertQuizResult } from "@/lib/quiz/quiz-engine";

interface LikertQuizProps {
  quiz: LikertQuizData;
  onComplete?: (result: LikertQuizResult) => void;
}

// ── Rating circles with endpoint labels ───────────────────────────────

function RatingRow({
  statementId,
  scale,
  selected,
  onSelect,
}: {
  statementId: string;
  scale: { labels: string[]; points: number[] };
  selected: string | undefined;
  onSelect: (optionId: string) => void;
}) {
  const first = scale.labels[0]!;
  const last = scale.labels[scale.labels.length - 1]!;

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4" role="radiogroup">
      <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 w-20 text-right shrink-0 hidden sm:block">
        {first}
      </span>

      {scale.points.map((_, i) => {
        const optionId = `${statementId}_${i}`;
        const isSelected = selected === optionId;

        return (
          <button
            key={optionId}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${scale.labels[i]}`}
            onClick={() => onSelect(optionId)}
            className={cn(
              "w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected
                ? "bg-primary scale-105 border-2 border-primary shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                : "border-2 border-muted-foreground/25 hover:bg-primary/30"
            )}
          />
        );
      })}

      <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 w-20 shrink-0 hidden sm:block">
        {last}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export function LikertQuiz({ quiz, onComplete }: LikertQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LikertQuizResult | null>(null);
  const [shared, setShared] = useState(false);
  const [preview, setPreview] = useState(false);
  const initialized = useRef(false);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const total = quiz.statements.length;
  const answered = Object.keys(answers).length;
  const allAnswered = answered === total;
  const progressPct = Math.round((answered / total) * 100);

  // ── URL state management ──

  const restoreFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const state = readStateFromUrl(params, quiz.questions);

    if (!state) {
      setAnswers({});
      setResult(null);
      return;
    }

    setAnswers(state.answers);

    if (state.isComplete) {
      setResult(scoreLikertQuiz(quiz, state.answers));
    } else {
      setResult(null);
    }
  }, [quiz]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    restoreFromUrl();
  }, [restoreFromUrl]);

  useEffect(() => {
    const handlePopState = () => restoreFromUrl();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [restoreFromUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShared(params.get("s") === "1");
    setPreview(params.get("p") === "1");
  }, []);

  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0 });
    }
  }, [result]);

  // ── Handlers ──

  const handleRate = useCallback(
    (statementId: string, optionId: string, idx: number) => {
      const newAnswers = { ...answers, [statementId]: optionId };
      setAnswers(newAnswers);

      const answeredCount = Object.keys(newAnswers).length;
      pushStateToUrl(newAnswers, answeredCount - 1, quiz.questions, false);

      // Auto-scroll: align next block's circles to the same screen position
      const currentRow = rowRefs.current[idx];
      const nextRow = rowRefs.current[idx + 1];
      if (currentRow && nextRow) {
        const offset = nextRow.getBoundingClientRect().top - currentRow.getBoundingClientRect().top;
        window.scrollBy({ top: offset, behavior: "smooth" });
      }
    },
    [answers, quiz.questions]
  );

  const handleSubmit = useCallback(() => {
    if (!allAnswered) return;
    const quizResult = scoreLikertQuiz(quiz, answers);
    pushStateToUrl(answers, total - 1, quiz.questions, true, true);
    setResult(quizResult);
    setPreview(true);
    onComplete?.(quizResult);
  }, [allAnswered, answers, quiz, total, onComplete]);

  const handleRetake = useCallback(() => {
    clearStateFromUrl();
    setAnswers({});
    setResult(null);
    setShared(false);
    setPreview(false);
  }, []);

  // ── Result view ──

  if (result) {
    // Preview mode: show teaser + email gate
    if (preview && !shared) {
      return (
        <QuizPreview
          result={result}
          quizMeta={quiz.meta}
          onRetake={handleRetake}
        />
      );
    }

    return (
      <LikertResult
        result={result}
        quizMeta={quiz.meta}
        onRetake={handleRetake}
        shared={shared}
      />
    );
  }

  // ── Quiz form ──

  return (
    <div>
      {/* Header */}
      <div className="space-y-3 mb-8">
        <h1 className="heading-lg">{quiz.meta.title}</h1>
        <p className="text-muted-foreground">{quiz.meta.intro}</p>
      </div>

      {/* Progress — sticky */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-1 -mx-1 px-1">
        <div className="space-y-2 pt-3 pb-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {answered} of {total} rated
            </span>
            <span className="text-muted-foreground">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

      </div>

      {/* Statements */}
      <div className="mt-2">
        {quiz.statements.map((statement, idx) => (
          <div
            key={statement.id}
            ref={(el) => { rowRefs.current[idx] = el; }}
            className={cn(
              "py-8 sm:py-10 px-4 sm:px-6 text-center border-b border-border/30",
              idx % 2 === 1 ? "bg-muted/30" : ""
            )}
          >
            {/* Statement text — large and centered */}
            <p className="text-xl sm:text-2xl font-semibold leading-snug text-foreground max-w-lg mx-auto mb-6">
              {statement.text}
            </p>

            {/* Mobile endpoint labels */}
            <div className="flex items-center justify-center gap-4 mb-3 sm:hidden text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              <span>{quiz.scale.labels[0]}</span>
              <span className="text-muted-foreground/20">&middot;</span>
              <span>{quiz.scale.labels[quiz.scale.labels.length - 1]}</span>
            </div>

            {/* Rating circles */}
            <RatingRow
              statementId={statement.id}
              scale={quiz.scale}
              selected={answers[statement.id]}
              onSelect={(optionId) => handleRate(statement.id, optionId, idx)}
            />
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex flex-col items-center gap-3 pt-10 pb-8">
        <Button
          size="lg"
          disabled={!allAnswered}
          onClick={handleSubmit}
          className={cn(
            "w-full sm:w-auto text-base font-bold px-10 py-6 rounded-xl transition-all",
            allAnswered
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
              : "opacity-50"
          )}
        >
          See My Results
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>

        {!allAnswered && (
          <p className="text-sm text-muted-foreground">
            {total - answered} statement{total - answered !== 1 ? "s" : ""} remaining
          </p>
        )}

        {answered > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetake}
            className="text-muted-foreground gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Start Over
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { QuizProgress } from "./quiz-progress";
import { QuizQuestion } from "./quiz-question";
import { QuizResult } from "./quiz-result";
import { IdentityResult } from "./identity-result";
import { ProfileResult } from "./profile-result";
import { RecommendationResult } from "./recommendation-result";
import { QuizPreview } from "./quiz-preview";
import { QuizEngine, scoreIdentityQuiz } from "@/lib/quiz/quiz-engine";
import {
  readStateFromUrl,
  pushStateToUrl,
  clearStateFromUrl,
} from "@/lib/quiz/quiz-url";
import { LikertQuiz } from "./likert-quiz";
import type {
  IdentityQuizData,
  LikertQuizData,
  QuizResult as QuizResultType,
  IdentityQuizResult,
} from "@/lib/quiz/quiz-engine";
import type { AnyQuizData } from "@/lib/quiz";

type AnyResult = QuizResultType | IdentityQuizResult;

const STORAGE_KEY = "sp_subscriber_email";

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
}

function buildResultUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete("p");
  url.searchParams.delete("s");
  return url.pathname + url.search;
}

function silentQuizSubscribe(email: string, quizSlug: string) {
  fetch("/api/quiz-subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      quizSlug,
      resultUrl: buildResultUrl(),
      fromGate: false,
      timezone: getBrowserTimezone(),
    }),
  }).catch((err) => console.error("Silent quiz subscribe failed:", err));
}

function isIdentity(quiz: AnyQuizData): quiz is IdentityQuizData {
  return quiz.quizType === "identity";
}

function isLikert(quiz: AnyQuizData): quiz is LikertQuizData {
  return quiz.quizType === "likert";
}

function isIdentityResult(result: AnyResult): result is IdentityQuizResult {
  return "primaryType" in result;
}

interface QuizContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  quiz: AnyQuizData;
  onComplete?: (result: AnyResult) => void;
}

export function QuizContainer({
  quiz,
  onComplete,
  className,
  ...props
}: QuizContainerProps) {
  // Likert quizzes have their own container with a completely different interaction model
  if (isLikert(quiz)) {
    return (
      <div className={cn("", className)} {...props}>
        <LikertQuiz quiz={quiz} />
      </div>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<1 | -1>(1);
  const [result, setResult] = useState<AnyResult | null>(null);
  const [shared, setShared] = useState(false);
  const [preview, setPreview] = useState(false);
  const initialized = useRef(false);

  const computeResult = useCallback(
    (ans: Record<string, string>): AnyResult => {
      if (isIdentity(quiz)) {
        return scoreIdentityQuiz(quiz, ans);
      }
      const engine = new QuizEngine(quiz);
      return engine.assembleResult(ans);
    },
    [quiz]
  );

  // Check localStorage on mount — if subscriber email exists, skip preview gate
  useEffect(() => {
    const savedEmail = localStorage.getItem(STORAGE_KEY);
    if (savedEmail) {
      setPreview(false);
    }
  }, []);

  // Gate submission handler — passed to QuizPreview → FreebieCTA
  const subscribeForQuizResults = useCallback(async (email: string) => {
    const res = await fetch("/api/quiz-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        quizSlug: quiz.meta.slug,
        resultUrl: buildResultUrl(),
        fromGate: true,
        timezone: getBrowserTimezone(),
      }),
    });

    if (!res.ok) {
      throw new Error("Subscription failed");
    }

    localStorage.setItem(STORAGE_KEY, email);
    setPreview(false);
  }, [quiz.meta.slug]);

  // When results are shown and gate was skipped (returning user),
  // silently tag the subscriber for this quiz
  const silentSubscribeFired = useRef(false);
  useEffect(() => {
    if (!preview && !shared && result && !silentSubscribeFired.current) {
      const savedEmail = localStorage.getItem(STORAGE_KEY);
      if (savedEmail) {
        silentSubscribeFired.current = true;
        silentQuizSubscribe(savedEmail, quiz.meta.slug);
      }
    }
  }, [preview, shared, result, quiz.meta.slug]);

  // Restore state from URL (on mount + popstate)
  const restoreFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const state = readStateFromUrl(params, quiz.questions);

    setShared(params.get("s") === "1");
    setPreview(params.get("p") === "1");

    if (!state) {
      setAnswers({});
      setCurrentIndex(0);
      setResult(null);
      setDirection(1);
      return;
    }

    setAnswers(state.answers);
    setCurrentIndex(state.currentIndex);

    if (state.isComplete) {
      setResult(computeResult(state.answers));
    } else {
      setResult(null);
    }
  }, [quiz, computeResult]);

  // On mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    restoreFromUrl();
  }, [restoreFromUrl]);

  // Browser back/forward
  useEffect(() => {
    const handlePopState = () => restoreFromUrl();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [restoreFromUrl]);

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex]!;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  if (!currentQuestion && !result) {
    return <div>Invalid quiz state</div>;
  }

  const handleSelect = useCallback(
    (optionId: string) => {
      const newAnswers = { ...answers, [currentQuestion.id]: optionId };
      setAnswers(newAnswers);

      if (isLastQuestion) {
        const quizResult = computeResult(newAnswers);
        pushStateToUrl(newAnswers, currentIndex, quiz.questions, true, true);
        setResult(quizResult);
        setPreview(true);
        onComplete?.(quizResult);
      } else {
        const nextIndex = currentIndex + 1;
        pushStateToUrl(newAnswers, nextIndex, quiz.questions, false);
        setDirection(1);
        setCurrentIndex(nextIndex);
      }
    },
    [currentQuestion, isLastQuestion, currentIndex, answers, quiz, onComplete, computeResult]
  );

  const handleBack = useCallback(() => {
    if (!isFirstQuestion) {
      const prevIndex = currentIndex - 1;
      pushStateToUrl(answers, prevIndex, quiz.questions, false);
      setDirection(-1);
      setCurrentIndex(prevIndex);
    }
  }, [isFirstQuestion, currentIndex, answers, quiz]);

  const handleRetake = useCallback(() => {
    clearStateFromUrl();
    setCurrentIndex(0);
    setAnswers({});
    setDirection(1);
    setResult(null);
    setShared(false);
    setPreview(false);
  }, []);

  // Scroll to top when results appear
  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0 });
    }
  }, [result]);

  // Show results if quiz is complete
  if (result) {
    // Preview mode: show teaser + email gate
    if (preview && !shared) {
      return (
        <div className={cn("", className)} {...props}>
          <QuizPreview
            result={result}
            quizMeta={quiz.meta}
            onRetake={handleRetake}
            onEmailSubmit={subscribeForQuizResults}
          />
        </div>
      );
    }

    if (isIdentityResult(result)) {
      return (
        <div className={cn("", className)} {...props}>
          <IdentityResult
            result={result}
            quizMeta={quiz.meta}
            onRetake={handleRetake}
            shared={shared}
          />
        </div>
      );
    }

    // Branch on resultDisplay for Type A quizzes
    const displayType = quiz.meta.resultDisplay;

    if (displayType === "profile") {
      return (
        <div className={cn("", className)} {...props}>
          <ProfileResult
            result={result}
            quizMeta={quiz.meta}
            onRetake={handleRetake}
            shared={shared}
          />
        </div>
      );
    }

    if (displayType === "recommendation") {
      return (
        <div className={cn("", className)} {...props}>
          <RecommendationResult
            result={result}
            quizMeta={quiz.meta}
            onRetake={handleRetake}
            shared={shared}
          />
        </div>
      );
    }

    // Default: readiness display
    return (
      <div className={cn("", className)} {...props}>
        <QuizResult
          result={result}
          quizMeta={quiz.meta}
          onRetake={handleRetake}
          shared={shared}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)} {...props}>
      {/* Quiz Header */}
      <div className="space-y-4">
        <h1 className="heading-lg">{quiz.meta.title}</h1>
        {currentIndex === 0 && (
          <p className="text-muted-foreground whitespace-pre-line">
            {quiz.meta.intro}
          </p>
        )}
      </div>

      {/* Progress */}
      <QuizProgress current={currentIndex + 1} total={questions.length} />

      {/* Navigation */}
      {!isFirstQuestion && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      {/* Question with Animation */}
      <div className="relative overflow-hidden min-h-[300px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <QuizQuestion
            key={currentQuestion.id}
            question={currentQuestion}
            selectedAnswer={answers[currentQuestion.id]}
            onSelect={handleSelect}
            direction={direction}
          />
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="text-sm text-muted-foreground">
        <p>Estimated time: {quiz.meta.estimatedTime}</p>
      </div>
    </div>
  );
}

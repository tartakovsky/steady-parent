"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { QuizProgress } from "./quiz-progress";
import { QuizQuestion } from "./quiz-question";
import { QuizResult } from "./quiz-result";
import { QuizEngine } from "@/lib/quiz/quiz-engine";
import {
  readStateFromUrl,
  pushStateToUrl,
  clearStateFromUrl,
} from "@/lib/quiz/quiz-url";
import type {
  QuizData,
  QuizResult as QuizResultType,
} from "@/lib/quiz/quiz-engine";

interface QuizContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  quiz: QuizData;
  onComplete?: (result: QuizResultType) => void;
}

export function QuizContainer({
  quiz,
  onComplete,
  className,
  ...props
}: QuizContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<1 | -1>(1);
  const [result, setResult] = useState<QuizResultType | null>(null);
  const [shared, setShared] = useState(false);
  const initialized = useRef(false);

  // Restore state from URL (on mount + popstate)
  const restoreFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const state = readStateFromUrl(params, quiz.questions);

    if (!state) {
      // Clean URL = fresh quiz
      setAnswers({});
      setCurrentIndex(0);
      setResult(null);
      setDirection(1);
      return;
    }

    setAnswers(state.answers);
    setCurrentIndex(state.currentIndex);

    if (state.isComplete) {
      const engine = new QuizEngine(quiz);
      setResult(engine.assembleResult(state.answers));
    } else {
      setResult(null);
    }
  }, [quiz]);

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

  // Safety check - should never happen with proper quiz data
  if (!currentQuestion && !result) {
    return <div>Invalid quiz state</div>;
  }

  const handleSelect = useCallback(
    (optionId: string) => {
      const newAnswers = { ...answers, [currentQuestion.id]: optionId };
      setAnswers(newAnswers);

      if (isLastQuestion) {
        const engine = new QuizEngine(quiz);
        const quizResult = engine.assembleResult(newAnswers);
        pushStateToUrl(newAnswers, currentIndex, quiz.questions, true);
        setResult(quizResult);
        onComplete?.(quizResult);
      } else {
        const nextIndex = currentIndex + 1;
        pushStateToUrl(newAnswers, nextIndex, quiz.questions, false);
        setDirection(1);
        setCurrentIndex(nextIndex);
      }
    },
    [currentQuestion, isLastQuestion, currentIndex, answers, quiz, onComplete]
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
  }, []);

  // Detect shared view from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShared(params.get("s") === "1");
  }, []);

  // Show results if quiz is complete
  if (result) {
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

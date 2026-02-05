"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { QuizOption } from "./quiz-option";
import type { QuizQuestion as QuizQuestionType } from "@/lib/quiz/quiz-engine";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer?: string | undefined;
  onSelect: (optionId: string) => void;
  direction: 1 | -1;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export function QuizQuestion({
  question,
  selectedAnswer,
  onSelect,
  direction,
}: QuizQuestionProps) {
  return (
    <motion.div
      key={question.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.15,
        ease: "easeOut",
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className={cn("heading-md text-foreground")}>{question.text}</h2>
        {question.subtext && (
          <p className="text-muted-foreground">{question.subtext}</p>
        )}
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <QuizOption
            key={option.id}
            option={option}
            isSelected={selectedAnswer === option.id}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}

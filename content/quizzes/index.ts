/**
 * Quiz Registry
 *
 * Central registry for all quizzes. Import quiz JSON files here
 * and export them for use in pages and components.
 */

import pottyTraining from './potty-training-readiness.json';
import type { QuizData } from './quiz-engine';

export const quizzes: Record<string, QuizData> = {
  'is-my-toddler-ready-for-potty-training': pottyTraining as QuizData,
};

export function getQuizBySlug(slug: string): QuizData | undefined {
  return quizzes[slug];
}

export function getAllQuizSlugs(): string[] {
  return Object.keys(quizzes);
}

export function getAllQuizzes(): QuizData[] {
  return Object.values(quizzes);
}

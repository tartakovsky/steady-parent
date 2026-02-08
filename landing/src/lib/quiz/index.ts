/**
 * Quiz Registry
 *
 * Central registry for all quizzes. Import quiz JSON files here
 * and export them for use in pages and components.
 */

import type { QuizData, IdentityQuizData, LikertQuizData } from './quiz-engine';
import { hydrateLikertQuestions } from './quiz-engine';

export type AnyQuizData = QuizData | IdentityQuizData | LikertQuizData;

import parentingStyleData from './parenting-style-likert.json';
import parentingApproachData from './parenting-approach.json';
import emotionalIntelligenceData from './emotional-intelligence.json';
import calmDownToolkitData from './calm-down-toolkit.json';

/** Hydrate a raw Likert JSON into a full LikertQuizData with computed questions array */
function hydrateLikert(raw: Record<string, unknown>): LikertQuizData {
  const data = raw as unknown as Omit<LikertQuizData, 'questions'>;
  return {
    ...data,
    questions: hydrateLikertQuestions(data.statements, data.scale),
  } as LikertQuizData;
}

export const quizzes: Record<string, AnyQuizData> = {
  'parenting-style': hydrateLikert(parentingStyleData as unknown as Record<string, unknown>),
  'parenting-approach': parentingApproachData as unknown as IdentityQuizData,
  'emotional-intelligence': emotionalIntelligenceData as unknown as QuizData,
  'calm-down-toolkit': calmDownToolkitData as unknown as QuizData,
};

export function getQuizBySlug(slug: string): AnyQuizData | undefined {
  return quizzes[slug];
}

export function getAllQuizSlugs(): string[] {
  return Object.keys(quizzes);
}

export function getAllQuizzes(): AnyQuizData[] {
  return Object.values(quizzes);
}

export function isIdentityQuiz(quiz: AnyQuizData): quiz is IdentityQuizData {
  return quiz.quizType === 'identity';
}

export function isLikertQuiz(quiz: AnyQuizData): quiz is LikertQuizData {
  return quiz.quizType === 'likert';
}

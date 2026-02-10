/**
 * Quiz Registry
 *
 * Central registry for all quizzes. Import quiz JSON files here
 * and export them for use in pages and components.
 */

import type { QuizData, IdentityQuizData, LikertQuizData } from './quiz-engine';
import { hydrateLikertQuestions } from './quiz-engine';

export type AnyQuizData = QuizData | IdentityQuizData | LikertQuizData;

// Likert quizzes
import parentingStyleData from './parenting-style.json';

// Identity quizzes
import bedtimeBattleData from './bedtime-battle-style.json';
import parentsPatternsData from './parents-patterns.json';
import worriedParentData from './worried-parent.json';
import parentingLoveLanguageData from './parenting-love-language.json';
import kidDescribeYouData from './kid-describe-you.json';
import parentingSuperpowerData from './parenting-superpower.json';
import parentAt2amData from './parent-at-2am.json';
import parentingEraData from './parenting-era.json';
import coParentTeamData from './co-parent-team.json';

// Readiness quizzes (standard display)
import pottyTrainingData from './potty-training-readiness.json';
import kindergartenReadinessData from './kindergarten-readiness.json';
import solidFoodsData from './solid-foods-readiness.json';
import dropTheNapData from './drop-the-nap.json';
import sleepoverReadinessData from './sleepover-readiness.json';
import secondChildData from './second-child-readiness.json';

// Readiness quizzes (profile display)
import parentingBatteryData from './parenting-battery.json';
import screenDependenceData from './screen-dependence.json';
import emotionalIntelligenceData from './emotional-intelligence.json';
import socialConfidenceData from './social-confidence.json';
import communicationSafetyData from './communication-safety.json';

// Readiness quizzes (recommendation display)
import calmDownToolkitData from './calm-down-toolkit.json';
import bedtimeRoutineData from './bedtime-routine.json';
import ageAppropriateChoresData from './age-appropriate-chores.json';

/** Hydrate a raw Likert JSON into a full LikertQuizData with computed questions array */
function hydrateLikert(raw: Record<string, unknown>): LikertQuizData {
  const data = raw as unknown as Omit<LikertQuizData, 'questions'>;
  return {
    ...data,
    questions: hydrateLikertQuestions(data.statements, data.scale),
  } as LikertQuizData;
}

export const quizzes: Record<string, AnyQuizData> = {
  // Likert
  'parenting-style': hydrateLikert(parentingStyleData as unknown as Record<string, unknown>),

  // Identity
  'bedtime-battle-style': bedtimeBattleData as unknown as IdentityQuizData,
  'parents-patterns': parentsPatternsData as unknown as IdentityQuizData,
  'worried-parent': worriedParentData as unknown as IdentityQuizData,
  'parenting-love-language': parentingLoveLanguageData as unknown as IdentityQuizData,
  'kid-describe-you': kidDescribeYouData as unknown as IdentityQuizData,
  'parenting-superpower': parentingSuperpowerData as unknown as IdentityQuizData,
  'parent-at-2am': parentAt2amData as unknown as IdentityQuizData,
  'parenting-era': parentingEraData as unknown as IdentityQuizData,
  'co-parent-team': coParentTeamData as unknown as IdentityQuizData,

  // Readiness (standard)
  'potty-training-readiness': pottyTrainingData as unknown as QuizData,
  'kindergarten-readiness': kindergartenReadinessData as unknown as QuizData,
  'solid-foods-readiness': solidFoodsData as unknown as QuizData,
  'drop-the-nap': dropTheNapData as unknown as QuizData,
  'sleepover-readiness': sleepoverReadinessData as unknown as QuizData,
  'second-child-readiness': secondChildData as unknown as QuizData,

  // Readiness (profile display)
  'parenting-battery': parentingBatteryData as unknown as QuizData,
  'screen-dependence': screenDependenceData as unknown as QuizData,
  'emotional-intelligence': emotionalIntelligenceData as unknown as QuizData,
  'social-confidence': socialConfidenceData as unknown as QuizData,
  'communication-safety': communicationSafetyData as unknown as QuizData,

  // Readiness (recommendation display)
  'calm-down-toolkit': calmDownToolkitData as unknown as QuizData,
  'bedtime-routine': bedtimeRoutineData as unknown as QuizData,
  'age-appropriate-chores': ageAppropriateChoresData as unknown as QuizData,
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

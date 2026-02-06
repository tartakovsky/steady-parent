/**
 * Quiz Registry
 *
 * Central registry for all quizzes. Import quiz JSON files here
 * and export them for use in pages and components.
 */

import pottyTraining from './potty-training-readiness.json';
import kindergartenReadiness from './kindergarten-readiness.json';
import solidFoods from './solid-foods-readiness.json';
import dropTheNap from './drop-the-nap.json';
import sleepover from './sleepover-readiness.json';
import secondChild from './second-child-readiness.json';
import parentingBattery from './parenting-battery.json';
import screenDependence from './screen-dependence.json';
import emotionalIntelligence from './emotional-intelligence.json';
import socialConfidence from './social-confidence.json';
import communicationSafety from './communication-safety.json';
import bedtimeRoutine from './bedtime-routine.json';
import ageAppropriateChores from './age-appropriate-chores.json';
import calmDownToolkit from './calm-down-toolkit.json';
import type { QuizData } from './quiz-engine';

export const quizzes: Record<string, QuizData> = {
  'potty-training-readiness': pottyTraining as QuizData,
  'kindergarten-readiness': kindergartenReadiness as QuizData,
  'solid-foods-readiness': solidFoods as QuizData,
  'drop-the-nap': dropTheNap as QuizData,
  'sleepover-readiness': sleepover as QuizData,
  'second-child-readiness': secondChild as QuizData,
  'parenting-battery': parentingBattery as QuizData,
  'screen-dependence': screenDependence as QuizData,
  'emotional-intelligence': emotionalIntelligence as QuizData,
  'social-confidence': socialConfidence as QuizData,
  'communication-safety': communicationSafety as QuizData,
  'bedtime-routine': bedtimeRoutine as QuizData,
  'age-appropriate-chores': ageAppropriateChores as QuizData,
  'calm-down-toolkit': calmDownToolkit as QuizData,
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

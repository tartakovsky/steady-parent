/**
 * Strict Zod schema for quiz data.
 *
 * Used for:
 * 1. Validating quiz JSON at build time
 * 2. Structured output when generating quizzes with an LLM
 * 3. Single source of truth for the QuizData type
 */

import { z } from "zod";

// ── Primitives ───────────────────────────────────────────────────────

export const QuizOptionSchema = z.object({
  id: z.string().min(1).max(20).describe("Unique option ID, e.g. 'q1a'"),
  text: z.string().min(1).max(200).describe("Option text shown to the user"),
  points: z.int().min(0).max(10).describe("Points awarded for this option"),
});

export const QuizQuestionSchema = z.object({
  id: z.string().min(1).max(20).describe("Unique question ID, e.g. 'q1'"),
  domain: z.string().min(1).max(40).describe("Domain ID this question belongs to"),
  text: z.string().min(10).max(300).describe("Question text"),
  subtext: z.string().max(300).optional().describe("Clarifying hint shown below the question"),
  options: z.array(QuizOptionSchema).min(2).max(5).describe("Answer options, first should be strongest"),
  source: z.string().max(200).optional().describe("Research source citation"),
});

export const DomainConfigSchema = z.object({
  id: z.string().min(1).max(40).describe("Domain ID, must match the key in the domains record"),
  name: z.string().min(1).max(60).describe("Human-readable domain name"),
  maxPoints: z.int().min(1).max(100).describe("Maximum achievable points in this domain"),
  thresholds: z.object({
    high: z.int().min(1).describe("Minimum score for 'high' level"),
    medium: z.int().min(0).describe("Minimum score for 'medium' level"),
  }),
});

export const DomainLevelContentSchema = z.object({
  level: z.enum(["high", "medium", "low"]),
  headline: z.string().min(1).max(80).describe("Short headline, e.g. 'Body is ready'"),
  detail: z.string().min(10).max(500).describe("Detailed explanation paragraph"),
  strength: z.string().max(300).optional().describe("Strength statement for high-level domains"),
  concern: z.string().max(300).optional().describe("Concern statement for medium/low-level domains"),
});

export const ResultTemplateSchema = z.object({
  id: z.string().min(1).max(40).describe("Result ID, e.g. 'ready', 'almost', 'not-yet'"),
  scoreRange: z.object({
    min: z.int().min(0).describe("Minimum total score (inclusive)"),
    max: z.int().min(0).describe("Maximum total score (inclusive)"),
  }),
  headline: z.string().min(1).max(80).describe("Bold result headline, e.g. 'Green Light!'"),
  subheadline: z.string().min(1).max(200).describe("Softer follow-up line"),
  explanation: z.string().min(20).max(600).describe("Detailed explanation of what the score means"),
  nextSteps: z.array(z.string().min(10).max(300)).min(2).max(6).describe("Actionable next steps"),
  watchOutFor: z.string().min(10).max(500).describe("Important nuance for the parent"),
  encouragement: z.string().min(10).max(400).describe("Warm, supportive closing message"),
  comparativeContext: z.string().min(10).max(300).describe("Social proof context, e.g. 'Most parents who score in this range successfully potty train within 1-2 weeks.'"),
  retakeAdvice: z.string().max(200).optional().describe("When to retake, e.g. 'Retake in 2-4 weeks'"),
});

export const QuizMetaSchema = z.object({
  id: z.string().min(1).max(60).describe("Quiz ID, e.g. 'potty-training-readiness'"),
  slug: z.string().min(1).max(80).describe("URL slug, e.g. 'is-my-toddler-ready-for-potty-training'"),
  title: z.string().min(10).max(120).describe("Full quiz title in question form"),
  shortTitle: z.string().min(5).max(60).describe("Short title for sharing, e.g. 'Potty Training Readiness Quiz'"),
  description: z.string().min(20).max(300).describe("SEO description"),
  intro: z.string().min(20).max(600).describe("Intro paragraph shown before question 1"),
  estimatedTime: z.string().min(1).max(20).describe("e.g. '2 minutes'"),
  questionCount: z.int().min(3).max(30).describe("Number of questions (must match questions array length)"),
  ageRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    unit: z.string().min(1).max(20),
  }).optional().describe("Target age range if applicable"),
  sources: z.array(z.object({
    name: z.string().min(1).max(100),
    url: z.string().url(),
  })).min(1).max(10).describe("Research sources backing the quiz"),
});

// ── Main schema ──────────────────────────────────────────────────────

export const QuizDataSchema = z.object({
  meta: QuizMetaSchema,
  domains: z.record(z.string(), DomainConfigSchema)
    .describe("Domain definitions keyed by domain ID"),
  questions: z.array(QuizQuestionSchema).min(3).max(30)
    .describe("Quiz questions in display order"),
  domainContent: z.record(z.string(), z.object({
    high: DomainLevelContentSchema,
    medium: DomainLevelContentSchema,
    low: DomainLevelContentSchema,
  })).describe("Content blocks for each domain at each level"),
  results: z.record(z.string(), ResultTemplateSchema)
    .describe("Result templates keyed by result ID"),
}).refine(
  (data) => data.meta.questionCount === data.questions.length,
  { message: "meta.questionCount must match questions array length" }
).refine(
  (data) => {
    // Every question must reference a valid domain
    const domainIds = new Set(Object.keys(data.domains));
    return data.questions.every((q) => domainIds.has(q.domain));
  },
  { message: "All questions must reference a domain that exists in the domains record" }
).refine(
  (data) => {
    // domainContent must have an entry for every domain
    const domainIds = Object.keys(data.domains);
    return domainIds.every((id) => id in data.domainContent);
  },
  { message: "domainContent must have entries for every domain" }
).refine(
  (data) => {
    // Score ranges must cover 0 → totalMax without gaps or overlaps
    const totalMax = Object.values(data.domains)
      .reduce((sum, d) => sum + d.maxPoints, 0);
    const ranges = Object.values(data.results)
      .map((r) => r.scoreRange)
      .sort((a, b) => a.min - b.min);

    if (ranges.length === 0) return false;
    if (ranges[0]!.min !== 0) return false;
    if (ranges[ranges.length - 1]!.max !== totalMax) return false;

    for (let i = 1; i < ranges.length; i++) {
      if (ranges[i]!.min !== ranges[i - 1]!.max + 1) return false;
    }
    return true;
  },
  { message: "Result score ranges must cover 0 to totalMax (sum of domain maxPoints) with no gaps or overlaps" }
).refine(
  (data) => {
    // Each question must have at least one 0-point option
    return data.questions.every((q) =>
      q.options.some((o) => o.points === 0)
    );
  },
  { message: "Every question must have at least one 0-point option" }
);

// ── Inferred type ────────────────────────────────────────────────────

export type QuizDataFromSchema = z.infer<typeof QuizDataSchema>;

// ── Validation helper ────────────────────────────────────────────────

export function validateQuizData(data: unknown): QuizDataFromSchema {
  return QuizDataSchema.parse(data);
}

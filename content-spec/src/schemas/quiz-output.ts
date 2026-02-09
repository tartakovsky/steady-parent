/**
 * Zod schemas for validating deployed quiz JSON files.
 *
 * Three quiz types: likert, identity, assessment (standard).
 * Each has distinct structure but shares a common QuizMeta schema.
 */

import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Shared: Quiz meta (common to all quiz types)
// ---------------------------------------------------------------------------

const PreviewCtaSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  buttonText: z.string().min(1),
});

const CommunityCtaSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  buttonText: z.string().min(1),
});

export const QuizMetaSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  description: z.string().min(1),
  intro: z.string().min(1),
  estimatedTime: z.string().min(1),
  questionCount: z.number().int().positive(),
  scoreLabel: z.string().optional(),
  subject: z.string().optional(),
  shareCta: z.string().optional(),
  levelLabels: z
    .object({
      high: z.string().min(1),
      medium: z.string().min(1),
      low: z.string().min(1),
    })
    .optional(),
  sectionLabels: z
    .object({
      strengths: z.string().optional(),
      concerns: z.string().optional(),
    })
    .optional(),
  ageRange: z
    .object({
      min: z.number().int().nonnegative(),
      max: z.number().int().positive(),
      unit: z.string().min(1),
    })
    .optional(),
  resultDisplay: z
    .enum(["readiness", "profile", "recommendation", "classification"])
    .optional(),
  previewCta: PreviewCtaSchema.optional(),
  previewPromises: z.array(z.string()).optional(),
  communityCta: CommunityCtaSchema.optional(),
  sources: z.array(z.string()).min(1),
});

// ---------------------------------------------------------------------------
// Likert quiz output
// ---------------------------------------------------------------------------

const LikertScaleSchema = z.object({
  labels: z.array(z.string().min(1)).min(2),
  points: z.array(z.number().int()).min(2),
});

const LikertDimensionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  themeColor: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1),
  growthEdge: z.string().min(1),
  encouragement: z.string().min(1),
  comparativeContext: z.string().min(1),
});

const LikertStatementSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  dimension: z.string().min(1),
  reversed: z.boolean().optional(),
});

export const LikertQuizOutputSchema = z.object({
  quizType: z.literal("likert"),
  meta: QuizMetaSchema,
  scale: LikertScaleSchema,
  dimensions: z.record(z.string(), LikertDimensionSchema),
  statements: z.array(LikertStatementSchema).min(1),
});

// ---------------------------------------------------------------------------
// Identity quiz output
// ---------------------------------------------------------------------------

const IdentityTypeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  themeColor: z.string().min(1),
  description: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1),
  growthEdge: z.string().min(1),
  encouragement: z.string().min(1),
  comparativeContext: z.string().min(1),
});

const IdentityOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  points: z.record(z.string(), z.number()),
});

const IdentityQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  subtext: z.string().optional(),
  options: z.array(IdentityOptionSchema).min(2),
});

export const IdentityQuizOutputSchema = z.object({
  quizType: z.literal("identity"),
  meta: QuizMetaSchema,
  types: z.record(z.string(), IdentityTypeSchema),
  questions: z.array(IdentityQuestionSchema).min(1),
});

// ---------------------------------------------------------------------------
// Assessment (standard) quiz output
// ---------------------------------------------------------------------------

const DomainConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  maxPoints: z.number().int().positive(),
  thresholds: z.object({
    high: z.number().int(),
    medium: z.number().int(),
  }),
});

const QuizOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  points: z.number().int(),
});

const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  domain: z.string().min(1),
  text: z.string().min(1),
  subtext: z.string().optional(),
  options: z.array(QuizOptionSchema).min(2),
  source: z.string().optional(),
});

const DomainLevelContentSchema = z.object({
  level: z.enum(["high", "medium", "low"]),
  headline: z.string().min(1),
  detail: z.string().min(1),
  strength: z.string().optional(),
  concern: z.string().optional(),
});

const ResultTemplateSchema = z.object({
  id: z.string().min(1),
  themeColor: z.string().min(1),
  scoreRange: z.object({
    min: z.number().int(),
    max: z.number().int(),
  }),
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  explanation: z.string().min(1),
  nextSteps: z.array(z.string().min(1)).min(1),
  watchOutFor: z.string().min(1),
  encouragement: z.string().min(1),
  comparativeContext: z.string().min(1),
  retakeAdvice: z.string().optional(),
});

export const AssessmentQuizOutputSchema = z.object({
  quizType: z.string().optional(), // "readiness" or absent
  meta: QuizMetaSchema,
  domains: z.record(z.string(), DomainConfigSchema),
  questions: z.array(QuizQuestionSchema).min(1),
  domainContent: z.record(
    z.string(),
    z.object({
      high: DomainLevelContentSchema,
      medium: DomainLevelContentSchema,
      low: DomainLevelContentSchema,
    }),
  ),
  results: z.record(z.string(), ResultTemplateSchema),
});

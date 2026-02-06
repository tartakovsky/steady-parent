/**
 * Strict Zod schemas for quiz data.
 *
 * Two quiz types:
 *   - Readiness (Type A): domain-based scoring, result tiers by total score
 *   - Identity (Type B): multi-type scoring, result = primary type + blend %
 *
 * Used for:
 * 1. Validating quiz JSON at build time
 * 2. Structured output when generating quizzes with an LLM
 * 3. Single source of truth for quiz TypeScript types
 */

import { z } from "zod";

// ═════════════════════════════════════════════════════════════════════
// SHARED
// ═════════════════════════════════════════════════════════════════════

export const QuizMetaSchema = z.object({
  id: z.string().min(1).max(60)
    .describe("Quiz ID, e.g. 'potty-training-readiness'"),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .describe("URL slug, lowercase with hyphens, e.g. 'potty-training-readiness'"),
  title: z.string().min(10).max(120)
    .describe("Full quiz title in question form, e.g. 'Is My Toddler Ready for Potty Training?'"),
  shortTitle: z.string().min(5).max(60)
    .describe("Short title for sharing, e.g. 'Potty Training Readiness Quiz'"),
  description: z.string().min(20).max(300)
    .describe("SEO meta description"),
  intro: z.string().min(20).max(600)
    .describe("Intro paragraph shown before question 1. Set expectations and reduce anxiety."),
  estimatedTime: z.string().min(1).max(20)
    .describe("e.g. '2 minutes'"),
  questionCount: z.int().min(3).max(30)
    .describe("Number of questions — MUST match questions array length"),
  ageRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    unit: z.string().min(1).max(20),
  }).optional()
    .describe("Target child age range if applicable"),
  sources: z.array(z.object({
    name: z.string().min(1).max(100),
    url: z.string().url(),
  })).min(1).max(10)
    .describe("Research sources backing the quiz — must be real, verifiable URLs"),
});

// ═════════════════════════════════════════════════════════════════════
// TYPE A: READINESS / ASSESSMENT
// ═════════════════════════════════════════════════════════════════════
//
// Each question scores into ONE domain. Options have a single point value.
// Result = tier based on total score (e.g., "Green Light" / "Yellow Light" / "Not Yet").
// Domain-level content at high/medium/low composes into a personalized result.

export const ReadinessOptionSchema = z.object({
  id: z.string().min(1).max(20)
    .describe("Unique option ID within the quiz, e.g. 'q1a'"),
  text: z.string().min(1).max(200)
    .describe("Option text shown to the user"),
  points: z.int().min(0).max(10)
    .describe("Points awarded. Highest = strongest readiness signal. Must include at least one 0-point option per question."),
});

export const ReadinessQuestionSchema = z.object({
  id: z.string().min(1).max(20)
    .describe("Unique question ID, e.g. 'q1'"),
  domain: z.string().min(1).max(40)
    .describe("Domain ID this question belongs to — must exist in the domains record"),
  text: z.string().min(10).max(300)
    .describe("Question text — should describe an observable behavior, not an opinion"),
  subtext: z.string().max(300).optional()
    .describe("Clarifying hint shown below the question, e.g. what to look for"),
  options: z.array(ReadinessOptionSchema).min(2).max(5)
    .describe("Answer options (2-5)"),
  source: z.string().max(200).optional()
    .describe("Research source citation for this question"),
});

export const DomainConfigSchema = z.object({
  id: z.string().min(1).max(40)
    .describe("Domain ID — must match the key in the domains record"),
  name: z.string().min(1).max(60)
    .describe("Human-readable domain name, e.g. 'Physical Readiness'"),
  maxPoints: z.int().min(1).max(100)
    .describe("Maximum achievable points — MUST equal sum of max option points for this domain's questions"),
  thresholds: z.object({
    high: z.int().min(1)
      .describe("Minimum score for 'high' level — must be greater than medium"),
    medium: z.int().min(0)
      .describe("Minimum score for 'medium' level"),
  }),
});

// Domain content is split by level for maximum rigidity:
// - High level MUST have a strength statement
// - Medium/Low levels MUST have a concern statement

export const DomainHighContentSchema = z.object({
  level: z.literal("high"),
  headline: z.string().min(1).max(80)
    .describe("Short positive headline, e.g. 'Body is ready'"),
  detail: z.string().min(10).max(500)
    .describe("Detailed explanation paragraph — warm, supportive tone"),
  strength: z.string().min(10).max(300)
    .describe("Strength statement shown in the 'Where Your Child Shines' section"),
});

export const DomainMediumContentSchema = z.object({
  level: z.literal("medium"),
  headline: z.string().min(1).max(80)
    .describe("Short encouraging headline, e.g. 'Physical skills emerging'"),
  detail: z.string().min(10).max(500)
    .describe("Detailed explanation — acknowledge progress, normalize the gap"),
  concern: z.string().min(10).max(300)
    .describe("Concern statement shown in the 'Room to Grow' section — frame as opportunity, not deficit"),
});

export const DomainLowContentSchema = z.object({
  level: z.literal("low"),
  headline: z.string().min(1).max(80)
    .describe("Short gentle headline, e.g. 'Physical maturation in progress'"),
  detail: z.string().min(10).max(500)
    .describe("Detailed explanation — normalize, reassure, explain the developmental timeline"),
  concern: z.string().min(10).max(300)
    .describe("Concern statement for 'Room to Grow' — developmental framing, never blame"),
});

export const ResultTemplateSchema = z.object({
  id: z.string().min(1).max(40)
    .describe("Result ID, e.g. 'ready', 'almost', 'not-yet'"),
  scoreRange: z.object({
    min: z.int().min(0).describe("Minimum total score (inclusive)"),
    max: z.int().min(0).describe("Maximum total score (inclusive)"),
  }),
  headline: z.string().min(1).max(80)
    .describe("Bold result headline, e.g. 'Green Light!'"),
  subheadline: z.string().min(1).max(200)
    .describe("Softer follow-up line under the headline"),
  explanation: z.string().min(20).max(600)
    .describe("What this score means — warm, specific, actionable"),
  nextSteps: z.array(z.string().min(10).max(300)).min(2).max(6)
    .describe("Actionable next steps — specific and practical, not generic"),
  watchOutFor: z.string().min(10).max(500)
    .describe("Important nuance — a thoughtful caveat, not a warning"),
  encouragement: z.string().min(10).max(400)
    .describe("Warm, supportive closing message — should feel like a hug"),
  comparativeContext: z.string().min(10).max(300)
    .describe("Social proof context, e.g. 'Most parents who score in this range successfully potty train within 1-2 weeks.'"),
  retakeAdvice: z.string().max(200).optional()
    .describe("When to retake, e.g. 'Retake in 2-4 weeks'"),
});

// ── Readiness quiz main schema ──────────────────────────────────────

export const ReadinessQuizDataSchema = z.object({
  quizType: z.literal("readiness")
    .describe("Quiz type discriminator — always 'readiness' for assessment quizzes"),
  meta: QuizMetaSchema,
  domains: z.record(z.string(), DomainConfigSchema)
    .describe("Domain definitions keyed by domain ID"),
  questions: z.array(ReadinessQuestionSchema).min(3).max(30)
    .describe("Quiz questions in display order"),
  domainContent: z.record(z.string(), z.object({
    high: DomainHighContentSchema,
    medium: DomainMediumContentSchema,
    low: DomainLowContentSchema,
  })).describe("Content blocks for each domain at each level"),
  results: z.record(z.string(), ResultTemplateSchema)
    .describe("Result templates keyed by result ID — score ranges must cover 0 to totalMax"),
})

// Refinement 1: questionCount matches questions array length
.refine(
  (data) => data.meta.questionCount === data.questions.length,
  { message: "meta.questionCount must match questions array length" },
)

// Refinement 2: all questions reference valid domains
.refine(
  (data) => {
    const domainIds = new Set(Object.keys(data.domains));
    return data.questions.every((q) => domainIds.has(q.domain));
  },
  { message: "All questions must reference a domain that exists in the domains record" },
)

// Refinement 3: domainContent covers every domain
.refine(
  (data) => {
    const domainIds = Object.keys(data.domains);
    return domainIds.every((id) => id in data.domainContent);
  },
  { message: "domainContent must have entries for every domain" },
)

// Refinement 4: score ranges cover 0 → totalMax with no gaps or overlaps
.refine(
  (data) => {
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
  { message: "Result score ranges must cover 0 to totalMax (sum of domain maxPoints) with no gaps or overlaps" },
)

// Refinement 5: every question has at least one 0-point option
.refine(
  (data) => {
    return data.questions.every((q) =>
      q.options.some((o) => o.points === 0),
    );
  },
  { message: "Every question must have at least one 0-point option" },
)

// Refinement 6: maxPoints matches the actual sum of max option points per domain
.refine(
  (data) => {
    const calculated: Record<string, number> = {};
    for (const q of data.questions) {
      const maxPts = Math.max(...q.options.map((o) => o.points));
      calculated[q.domain] = (calculated[q.domain] || 0) + maxPts;
    }
    return Object.entries(data.domains).every(
      ([id, config]) => calculated[id] === config.maxPoints,
    );
  },
  { message: "Domain maxPoints must equal the sum of max option points for its questions" },
)

// Refinement 7: high threshold must be greater than medium threshold
.refine(
  (data) => {
    return Object.values(data.domains).every(
      (d) => d.thresholds.high > d.thresholds.medium,
    );
  },
  { message: "Domain threshold 'high' must be greater than 'medium'" },
)

// Refinement 8: each domain must have at least 2 questions
.refine(
  (data) => {
    const counts: Record<string, number> = {};
    for (const q of data.questions) {
      counts[q.domain] = (counts[q.domain] || 0) + 1;
    }
    return Object.keys(data.domains).every((id) => (counts[id] || 0) >= 2);
  },
  { message: "Each domain must have at least 2 questions" },
)

// Refinement 9: question IDs must be unique
.refine(
  (data) => {
    const ids = data.questions.map((q) => q.id);
    return new Set(ids).size === ids.length;
  },
  { message: "All question IDs must be unique" },
)

// Refinement 10: option IDs must be unique within each question
.refine(
  (data) => {
    return data.questions.every((q) => {
      const ids = q.options.map((o) => o.id);
      return new Set(ids).size === ids.length;
    });
  },
  { message: "Option IDs must be unique within each question" },
)

// Refinement 11: domain record keys must match the id field inside each domain config
.refine(
  (data) => {
    return Object.entries(data.domains).every(([key, config]) => key === config.id);
  },
  { message: "Domain record key must match the domain's id field" },
)

// Refinement 12: result record keys must match the id field inside each result template
.refine(
  (data) => {
    return Object.entries(data.results).every(([key, tmpl]) => key === tmpl.id);
  },
  { message: "Result record key must match the result's id field" },
);


// ═════════════════════════════════════════════════════════════════════
// TYPE B: IDENTITY / CLASSIFICATION
// ═════════════════════════════════════════════════════════════════════
//
// Each option distributes points across MULTIPLE personality types.
// Result = primary type (highest total score) + blend percentages.
// Every type is framed positively. Nobody gets a "bad" result.

export const IdentityTypeSchema = z.object({
  id: z.string().min(1).max(40)
    .describe("Type ID, e.g. 'lighthouse'. Must match the key in the types record."),
  name: z.string().min(2).max(60)
    .describe("Display name, e.g. 'Lighthouse Parent'"),
  tagline: z.string().min(10).max(200)
    .describe("One-line identity statement, e.g. 'You guide without hovering.' — this is what gets shared"),
  description: z.string().min(50).max(800)
    .describe("Full paragraph explaining this type — warm, validating, specific. Should make the user think 'wow, this is so me.'"),
  strengths: z.array(z.string().min(10).max(200)).min(2).max(5)
    .describe("Specific strengths of this type — concrete behaviors, not vague praise"),
  growthEdge: z.string().min(10).max(300)
    .describe("One growth area framed positively — 'You might sometimes...' not 'Your weakness is...'"),
  encouragement: z.string().min(10).max(400)
    .describe("Warm closing message specific to this type"),
  comparativeContext: z.string().min(10).max(300)
    .describe("Social proof or normalizing context, e.g. 'This is the most common style among parents who...'"),
});

export const IdentityOptionSchema = z.object({
  id: z.string().min(1).max(20)
    .describe("Unique option ID within the quiz, e.g. 'q1a'"),
  text: z.string().min(1).max(200)
    .describe("Option text — a concrete action or reaction, not a self-assessment"),
  points: z.record(z.string(), z.int().min(0).max(5))
    .describe("Points awarded to each type. MUST have an entry for EVERY type ID. High points (3-5) for types this answer represents, low/zero for others."),
});

export const IdentityQuestionSchema = z.object({
  id: z.string().min(1).max(20)
    .describe("Unique question ID, e.g. 'q1'"),
  text: z.string().min(10).max(300)
    .describe("Question text — present a scenario or situation, not 'which do you prefer'"),
  subtext: z.string().max(300).optional()
    .describe("Optional clarifying context for the scenario"),
  options: z.array(IdentityOptionSchema).min(3).max(6)
    .describe("Answer options (3-6). Each option should feel like a valid, relatable choice — no obvious 'wrong' answers."),
});

// ── Identity quiz main schema ───────────────────────────────────────

export const IdentityQuizDataSchema = z.object({
  quizType: z.literal("identity")
    .describe("Quiz type discriminator — always 'identity' for personality/classification quizzes"),
  meta: QuizMetaSchema,
  types: z.record(z.string(), IdentityTypeSchema)
    .describe("Personality types keyed by type ID. All types must be framed positively."),
  questions: z.array(IdentityQuestionSchema).min(5).max(15)
    .describe("Quiz questions in display order — scenario-based, not self-assessment"),
})

// Refinement 1: questionCount matches questions array length
.refine(
  (data) => data.meta.questionCount === data.questions.length,
  { message: "meta.questionCount must match questions array length" },
)

// Refinement 2: must have at least 3 types
.refine(
  (data) => Object.keys(data.types).length >= 3,
  { message: "Identity quizzes must have at least 3 types" },
)

// Refinement 3: every option must have points for EVERY type (including 0)
.refine(
  (data) => {
    const typeIds = Object.keys(data.types);
    return data.questions.every((q) =>
      q.options.every((o) => {
        const optionKeys = Object.keys(o.points);
        if (optionKeys.length !== typeIds.length) return false;
        return typeIds.every((id) => id in o.points);
      }),
    );
  },
  { message: "Every option must have a points entry for every type ID (including 0)" },
)

// Refinement 4: every option must award at least 1 total point
.refine(
  (data) => {
    return data.questions.every((q) =>
      q.options.every((o) => {
        const total = Object.values(o.points).reduce((sum, p) => sum + p, 0);
        return total > 0;
      }),
    );
  },
  { message: "Every option must award at least 1 total point across all types" },
)

// Refinement 5: every type must be reachable (at least one option gives it > 0)
.refine(
  (data) => {
    const typeIds = Object.keys(data.types);
    return typeIds.every((typeId) =>
      data.questions.some((q) =>
        q.options.some((o) => (o.points[typeId] || 0) > 0),
      ),
    );
  },
  { message: "Every type must be reachable — at least one option across all questions must award it points" },
)

// Refinement 6: no two options in the same question may have identical point distributions
.refine(
  (data) => {
    return data.questions.every((q) => {
      const signatures = q.options.map((o) =>
        Object.keys(o.points).sort().map((k) => `${k}:${o.points[k]}`).join(","),
      );
      return new Set(signatures).size === signatures.length;
    });
  },
  { message: "No two options in the same question may have identical point distributions" },
)

// Refinement 7: each question must have options that favor at least 2 different types
.refine(
  (data) => {
    return data.questions.every((q) => {
      const favoredTypes = q.options.map((o) => {
        let maxPts = -1;
        let maxType = "";
        for (const [typeId, pts] of Object.entries(o.points)) {
          if (pts > maxPts) { maxPts = pts; maxType = typeId; }
        }
        return maxType;
      });
      return new Set(favoredTypes).size >= 2;
    });
  },
  { message: "Each question must have options that favor at least 2 different types" },
)

// Refinement 8: question IDs must be unique
.refine(
  (data) => {
    const ids = data.questions.map((q) => q.id);
    return new Set(ids).size === ids.length;
  },
  { message: "All question IDs must be unique" },
)

// Refinement 9: option IDs must be unique within each question
.refine(
  (data) => {
    return data.questions.every((q) => {
      const ids = q.options.map((o) => o.id);
      return new Set(ids).size === ids.length;
    });
  },
  { message: "Option IDs must be unique within each question" },
)

// Refinement 10: type record keys must match the id field inside each type
.refine(
  (data) => {
    return Object.entries(data.types).every(([key, t]) => key === t.id);
  },
  { message: "Type record key must match the type's id field" },
)

// Refinement 11: every type must be favored by at least one option somewhere
// (stronger than "reachable" — means it's the TOP scorer for at least one answer)
.refine(
  (data) => {
    const typeIds = Object.keys(data.types);
    const favored = new Set<string>();
    for (const q of data.questions) {
      for (const o of q.options) {
        let maxPts = -1;
        let maxType = "";
        for (const [typeId, pts] of Object.entries(o.points)) {
          if (pts > maxPts) { maxPts = pts; maxType = typeId; }
        }
        favored.add(maxType);
      }
    }
    return typeIds.every((id) => favored.has(id));
  },
  { message: "Every type must be the top-scoring type for at least one option across all questions" },
);


// ═════════════════════════════════════════════════════════════════════
// INFERRED TYPES
// ═════════════════════════════════════════════════════════════════════

export type ReadinessQuizData = z.infer<typeof ReadinessQuizDataSchema>;
export type IdentityQuizData = z.infer<typeof IdentityQuizDataSchema>;

// ═════════════════════════════════════════════════════════════════════
// BACKWARD COMPAT — existing code imports these names
// ═════════════════════════════════════════════════════════════════════

/** @deprecated Use ReadinessQuizDataSchema */
export const QuizDataSchema = ReadinessQuizDataSchema;
/** @deprecated Use ReadinessQuizData */
export type QuizDataFromSchema = ReadinessQuizData;

// Re-export old sub-schema names for any imports
export const QuizOptionSchema = ReadinessOptionSchema;
export const QuizQuestionSchema = ReadinessQuestionSchema;
export const DomainLevelContentSchema = DomainHighContentSchema;

// ═════════════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═════════════════════════════════════════════════════════════════════

export function validateReadinessQuiz(data: unknown): ReadinessQuizData {
  return ReadinessQuizDataSchema.parse(data);
}

export function validateIdentityQuiz(data: unknown): IdentityQuizData {
  return IdentityQuizDataSchema.parse(data);
}

export function validateQuizData(data: unknown): ReadinessQuizData | IdentityQuizData {
  if (typeof data === "object" && data !== null && "quizType" in data) {
    const { quizType } = data as { quizType: unknown };
    if (quizType === "identity") {
      return IdentityQuizDataSchema.parse(data);
    }
  }
  return ReadinessQuizDataSchema.parse(data);
}

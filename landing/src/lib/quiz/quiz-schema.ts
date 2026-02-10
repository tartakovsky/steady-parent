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
  intro: z.string().min(20).max(250)
    .describe("2 sentences. What this quiz measures and why it matters. Not a blog post."),
  estimatedTime: z.string().min(1).max(20)
    .describe("e.g. '2 minutes'"),
  questionCount: z.int().min(3).max(30)
    .describe("Number of questions — MUST match questions array length"),
  scoreLabel: z.string().min(1).max(30).optional()
    .describe("Label shown under the percentage in the score ring, e.g. 'Readiness', 'Battery', 'Score'. Defaults to 'Score' if omitted."),
  subject: z.string().min(1).max(60).optional()
    .describe("Who the quiz is about, used in shareable summary, e.g. 'your child', 'you', 'your family'. Defaults to 'your child' if omitted."),
  shareCta: z.string().min(1).max(120).optional()
    .describe("CTA text shown to visitors who receive shared results, e.g. 'Curious about your own parenting battery?'. Defaults to 'Curious? Take the quiz yourself' if omitted."),
  levelLabels: z.object({
    high: z.string().min(1).max(20)
      .describe("Badge for BEST outcome (high score), e.g. 'Strong', 'Ready', 'Charged', 'Solid'"),
    medium: z.string().min(1).max(20)
      .describe("Badge for MIDDLE outcome (medium score), e.g. 'Developing', 'Getting There', 'Moderate'. NEVER use 'Emerging' here — that implies low."),
    low: z.string().min(1).max(20)
      .describe("Badge for WORST/LOWEST outcome (low score), e.g. 'Emerging', 'Not Yet', 'Depleted', 'Low'"),
  }).optional()
    .describe("Badge labels for domain score levels. Ordering: high=best > medium=middle > low=worst. Must make semantic sense with every domain name in this quiz. Defaults to Strong/Developing/Emerging."),
  sectionLabels: z.object({
    strengths: z.string().max(60).optional()
      .describe("Heading for the strengths section, e.g. 'Where Your Child Shines' or 'Where You're Doing Well'. Defaults to 'What's Going Well'."),
    concerns: z.string().max(60).optional()
      .describe("Heading for the growth areas section, e.g. 'Room to Grow'. Defaults to 'Room to Grow'."),
  }).optional()
    .describe("Optional section heading overrides. Use when the default headings don't fit the quiz subject."),
  ageRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    unit: z.string().min(1).max(20),
  }).optional()
    .describe("Target child age range if applicable"),
  sources: z.array(z.string().min(1).max(100)).min(1).max(5)
    .describe("Plain-text research basis, e.g. 'AAP toilet training guidelines', 'CDC developmental milestones'. Organization name + topic only. NO URLs, NO article titles, NO author names."),
  previewCta: z.object({
    eyebrow: z.string().min(1).max(60)
      .describe("Small label above the title, e.g. 'Want the full breakdown?'"),
    title: z.string().min(1).max(120)
      .describe("Main CTA headline, e.g. 'Get your child's complete readiness profile'"),
    body: z.string().min(1).max(300)
      .describe("1-2 sentences describing what the full results contain — must match what this quiz type actually renders"),
    buttonText: z.literal("Send my results")
      .describe("Always 'Send my results'"),
  }).describe("Email gate CTA shown on the preview page before full results are unlocked"),
  previewPromises: z.array(z.string().min(1).max(120)).min(3).max(5)
    .describe("Bullet points listing what full results include — must accurately reflect what the result display renders"),
  communityCta: z.object({
    eyebrow: z.string().min(1).max(50)
      .describe("Short hook, 3-6 words, e.g. 'Want help with this?'"),
    title: z.string().min(1).max(80)
      .describe("One line: why THIS parent should join the community for THIS topic"),
    body: z.string().min(1).max(160)
      .describe("One sentence. What they'll get in the community. Must end with '. We are there with you daily too.'"),
    buttonText: z.literal("Join the community")
      .describe("Always 'Join the community'"),
  }).refine(
    (cta) => cta.body.includes("We are there with you daily too"),
    { message: "communityCta.body must contain 'We are there with you daily too'" },
  ).describe("Community upsell shown on full results page — sells the community, not the quiz"),
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
  detail: z.string().min(10).max(300)
    .describe("2-3 sentences. What this level means practically."),
  strength: z.string().min(10).max(250)
    .describe("1-2 sentences for the strengths section."),
});

export const DomainMediumContentSchema = z.object({
  level: z.literal("medium"),
  headline: z.string().min(1).max(80)
    .describe("Short honest headline"),
  detail: z.string().min(10).max(300)
    .describe("2-3 sentences. Honest about where they are."),
  concern: z.string().min(10).max(250)
    .describe("1-2 sentences for the growth areas section."),
});

export const DomainLowContentSchema = z.object({
  level: z.literal("low"),
  headline: z.string().min(1).max(80)
    .describe("Short direct headline"),
  detail: z.string().min(10).max(300)
    .describe("2-3 sentences. What's happening developmentally."),
  concern: z.string().min(10).max(250)
    .describe("1-2 sentences for the growth areas section."),
});

export const ResultTemplateSchema = z.object({
  id: z.string().min(1).max(40)
    .describe("Result ID, e.g. 'ready', 'almost', 'not-yet'"),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/)
    .describe("Hex color for this result tier's UI theme, e.g. '#16a34a' for green. Used for score ring, action plan, encouragement section."),
  scoreRange: z.object({
    min: z.int().min(0).describe("Minimum total score (inclusive)"),
    max: z.int().min(0).describe("Maximum total score (inclusive)"),
  }),
  headline: z.string().min(1).max(80)
    .describe("Short, evocative result title (2-5 words). Must NOT restate the score or range — the ring already shows the percentage. Examples: 'Green Light!', 'Fully Charged', 'Almost There'. Think bumper sticker, not data label."),
  subheadline: z.string().min(1).max(180)
    .describe("One sentence with a concrete insight the reader didn't already know from the headline. Not a dry domain summary."),
  explanation: z.string().min(20).max(600)
    .describe("3-4 sentences. What this pattern looks like in daily life and what to do about it."),
  nextSteps: z.array(z.string().min(10).max(200)).min(2).max(5)
    .describe("Actionable next steps — specific and practical"),
  watchOutFor: z.string().min(10).max(300)
    .describe("One counterintuitive insight or nuance"),
  encouragement: z.string().min(10).max(350)
    .describe("2-3 sentences. Direct closing — what the score means and what to do. No platitudes."),
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
  tagline: z.string().min(10).max(120)
    .describe("One shareable sentence — the identity badge. Direct and specific."),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/)
    .describe("Hex color for this type's UI. Each type gets a distinct color."),
  description: z.string().min(50).max(400)
    .describe("2-3 sentences. Specific, recognizable description — make the reader think 'that's me.' No generic praise."),
  strengths: z.array(z.string().min(10).max(150)).min(2).max(4)
    .describe("Specific strengths — concrete behaviors, not vague praise"),
  growthEdge: z.string().min(10).max(200)
    .describe("1-2 sentences. One honest growth area — direct, not hedging."),
  encouragement: z.string().min(10).max(350)
    .describe("2-3 sentences. Direct closing — what this type means and what to lean into. No platitudes."),
  comparativeContext: z.string().min(10).max(200)
    .describe("1 sentence. Plain statistic or normalizing context."),
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
// TYPE C: LIKERT / RATING SCALE
// ═════════════════════════════════════════════════════════════════════
//
// Each statement rated on a scale (e.g. 1-5 Never→Always).
// Statements map to dimensions. Score = mean rating per dimension.
// Result = primary dimension (highest mean) + profile.
// Modeled after PSDQ / PAQ parenting style assessments.

export const LikertScaleSchema = z.object({
  labels: z.array(z.string().min(1).max(30)).min(3).max(7)
    .describe("Scale point labels from low to high, e.g. ['Never','Rarely','Sometimes','Often','Always']"),
  points: z.array(z.int().min(0).max(10)).min(3).max(7)
    .describe("Numeric values for each scale point, e.g. [1,2,3,4,5]"),
});

export const LikertDimensionSchema = z.object({
  id: z.string().min(1).max(40)
    .describe("Dimension ID — must match the key in the dimensions record"),
  name: z.string().min(2).max(60)
    .describe("Friendly display name, e.g. 'Steady Guide' (NOT academic jargon like 'Authoritative')"),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/)
    .describe("Hex color for this dimension's UI. Each dimension gets a distinct color."),
  tagline: z.string().min(10).max(120)
    .describe("One shareable sentence — the identity badge for this dimension."),
  description: z.string().min(50).max(400)
    .describe("2-3 sentences. Recognizable description — make the reader think 'that's me.'"),
  strengths: z.array(z.string().min(10).max(150)).min(2).max(4)
    .describe("Specific strengths — concrete behaviors, not vague praise"),
  growthEdge: z.string().min(10).max(200)
    .describe("1-2 sentences. One honest growth area — direct, not hedging."),
  encouragement: z.string().min(10).max(350)
    .describe("2-3 sentences. Direct closing — what scoring high here means. No platitudes."),
  comparativeContext: z.string().min(10).max(200)
    .describe("1 sentence. Plain statistic or normalizing context."),
  populationNorm: z.object({
    mean: z.number().min(0).max(10)
      .describe("Expected population mean on the scale (e.g. 3.9 on a 1-5 scale)"),
    sd: z.number().min(0.01).max(5)
      .describe("Expected population standard deviation (e.g. 0.55)"),
  }).optional()
    .describe("Population norm for percentile-based scoring. Source: validated instrument research (e.g. PSDQ). When provided for ALL dimensions, the quiz uses z-score→percentile blend instead of raw-mean blend."),
});

export const LikertStatementSchema = z.object({
  id: z.string().min(1).max(20)
    .describe("Unique statement ID, e.g. 's1'"),
  text: z.string().min(10).max(200)
    .describe("Statement text — a concrete parenting behavior, not a belief or opinion"),
  dimension: z.string().min(1).max(40)
    .describe("Dimension ID this statement measures — must exist in the dimensions record"),
  reversed: z.boolean().optional()
    .describe("If true, rating is reverse-scored (5→1, 4→2, etc.) before computing mean"),
});

// ── Likert quiz main schema ──────────────────────────────────────────

export const LikertQuizDataSchema = z.object({
  quizType: z.literal("likert")
    .describe("Quiz type discriminator — always 'likert' for rating-scale quizzes"),
  meta: QuizMetaSchema,
  scale: LikertScaleSchema
    .describe("Rating scale configuration"),
  dimensions: z.record(z.string(), LikertDimensionSchema)
    .describe("Parenting dimensions keyed by dimension ID"),
  statements: z.array(LikertStatementSchema).min(6).max(30)
    .describe("Statements in display order — will be rated on the scale"),
})

// Refinement 1: questionCount matches statements array length
.refine(
  (data) => data.meta.questionCount === data.statements.length,
  { message: "meta.questionCount must match statements array length" },
)

// Refinement 2: all statements reference valid dimensions
.refine(
  (data) => {
    const dimIds = new Set(Object.keys(data.dimensions));
    return data.statements.every((s) => dimIds.has(s.dimension));
  },
  { message: "All statements must reference a dimension that exists in the dimensions record" },
)

// Refinement 3: each dimension has at least 3 statements
.refine(
  (data) => {
    const counts: Record<string, number> = {};
    for (const s of data.statements) {
      counts[s.dimension] = (counts[s.dimension] || 0) + 1;
    }
    return Object.keys(data.dimensions).every((id) => (counts[id] || 0) >= 3);
  },
  { message: "Each dimension must have at least 3 statements" },
)

// Refinement 4: statement IDs must be unique
.refine(
  (data) => {
    const ids = data.statements.map((s) => s.id);
    return new Set(ids).size === ids.length;
  },
  { message: "All statement IDs must be unique" },
)

// Refinement 5: dimension record keys must match the id field
.refine(
  (data) => {
    return Object.entries(data.dimensions).every(([key, dim]) => key === dim.id);
  },
  { message: "Dimension record key must match the dimension's id field" },
)

// Refinement 6: scale labels and points arrays must be same length
.refine(
  (data) => data.scale.labels.length === data.scale.points.length,
  { message: "scale.labels and scale.points must have the same length" },
)

// Refinement 7: must have at least 2 dimensions
.refine(
  (data) => Object.keys(data.dimensions).length >= 2,
  { message: "Likert quizzes must have at least 2 dimensions" },
);


// ═════════════════════════════════════════════════════════════════════
// INFERRED TYPES
// ═════════════════════════════════════════════════════════════════════

export type ReadinessQuizData = z.infer<typeof ReadinessQuizDataSchema>;
export type IdentityQuizData = z.infer<typeof IdentityQuizDataSchema>;
export type LikertQuizData = z.infer<typeof LikertQuizDataSchema>;

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

export function validateLikertQuiz(data: unknown): LikertQuizData {
  return LikertQuizDataSchema.parse(data);
}

export function validateQuizData(data: unknown): ReadinessQuizData | IdentityQuizData | LikertQuizData {
  if (typeof data === "object" && data !== null && "quizType" in data) {
    const { quizType } = data as { quizType: unknown };
    if (quizType === "identity") {
      return IdentityQuizDataSchema.parse(data);
    }
    if (quizType === "likert") {
      return LikertQuizDataSchema.parse(data);
    }
  }
  return ReadinessQuizDataSchema.parse(data);
}

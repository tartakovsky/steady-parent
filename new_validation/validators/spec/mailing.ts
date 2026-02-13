/**
 * Mailing form spec validator — Zod schemas + cross-reference checks for spec/mailing.json.
 *
 * Two layers:
 * 1. Zod schemas validate each entry's fields (word counts, forbidden terms,
 *    literal button text/endpoints, params structure). No external data needed.
 * 2. Cross-reference function checks spec keys against taxonomy and vice versa.
 *
 * The Zod schemas are the SINGLE SOURCE OF TRUTH for all mailing form validation rules.
 * Admin UI reads error messages directly — zero hardcoded rule strings in the frontend.
 * Generator agents receive these schemas so they know exact constraints.
 */

import { z } from "zod/v4";
import {
  FORBIDDEN_TERMS,
  checkWordCount,
  checkCleanText,
  type CrossRefIssue,
  type TaxonomyForCrossRef,
} from "./shared";

// ---------------------------------------------------------------------------
// Constants — these ARE the rules, referenced by schemas below
// ---------------------------------------------------------------------------

export const FREEBIE_ENDPOINT = "/api/freebie-subscribe";
export const WAITLIST_ENDPOINT = "/api/waitlist-subscribe";
export const QUIZ_GATE_ENDPOINT = "/api/quiz-subscribe";

export const WAITLIST_BUTTON_TEXT = "Reserve your spot";
export const WAITLIST_JOINED_TAG = "waitlist-joined";
export const QUIZ_GATE_BUTTON_TEXT = "Send my results";
export const QUIZ_COMPLETED_TAG = "quiz-completed";
export const INPUT_PLACEHOLDER = "Email address";

// ---------------------------------------------------------------------------
// Freebie form schema (blog article pages)
// ---------------------------------------------------------------------------

const FreebieFieldsSchema = z.object({
  eyebrow: z.string().min(1).meta({ description: "2-7 words" }),
  title: z.string().min(1).meta({ description: "3-10 words" }),
  body: z.string().min(1).meta({ description: "8-36 words" }),
  inputPlaceholder: z
    .literal(INPUT_PLACEHOLDER)
    .meta({ description: `must be "${INPUT_PLACEHOLDER}"` }),
  buttonText: z.string().min(1).meta({ description: "non-empty, varies per freebie" }),
  endpoint: z
    .literal(FREEBIE_ENDPOINT)
    .meta({ description: `must be "${FREEBIE_ENDPOINT}"` }),
  tags: z.array(z.string()).min(1).meta({ description: 'must include "lead"' }),
  params: z
    .object({ category: z.string().min(1) })
    .meta({ description: "category slug" }),
});

export const FreebieFormSchema = FreebieFieldsSchema.superRefine((val, ctx) => {
  checkWordCount(val.eyebrow, "eyebrow", 2, 7, ctx);
  checkWordCount(val.title, "title", 3, 10, ctx);
  checkWordCount(val.body, "body", 8, 36, ctx);

  // Tag count: exactly 2
  if (val.tags.length !== 2) {
    ctx.addIssue({
      code: "custom",
      path: ["tags"],
      message: `must have exactly 2 tags, got ${val.tags.length}`,
    });
  }

  if (!val.tags.includes("lead")) {
    ctx.addIssue({
      code: "custom",
      path: ["tags"],
      message: 'must include "lead"',
    });
  }

  // Tag format: second tag must be "freebie-{category}"
  const expectedFreebieTag = `freebie-${val.params.category}`;
  if (!val.tags.includes(expectedFreebieTag)) {
    ctx.addIssue({
      code: "custom",
      path: ["tags"],
      message: `must include "${expectedFreebieTag}"`,
    });
  }

  checkCleanText(
    {
      eyebrow: val.eyebrow,
      title: val.title,
      body: val.body,
      buttonText: val.buttonText,
    },
    ctx,
  );
}).meta({
  id: "freebie-form",
  title: "Freebie Form",
  description:
    "Email capture form on blog article pages. Delivers a category-specific freebie.",
});

// ---------------------------------------------------------------------------
// Waitlist form schema (course pages)
// ---------------------------------------------------------------------------

const WaitlistFieldsSchema = z.object({
  eyebrow: z.string().min(1).meta({ description: "2-7 words" }),
  title: z.string().min(1).meta({ description: "5-12 words" }),
  body: z.string().min(1).meta({ description: "20-30 words" }),
  inputPlaceholder: z
    .literal(INPUT_PLACEHOLDER)
    .meta({ description: `must be "${INPUT_PLACEHOLDER}"` }),
  buttonText: z
    .literal(WAITLIST_BUTTON_TEXT)
    .meta({ description: `must be "${WAITLIST_BUTTON_TEXT}"` }),
  endpoint: z
    .literal(WAITLIST_ENDPOINT)
    .meta({ description: `must be "${WAITLIST_ENDPOINT}"` }),
  tags: z.array(z.string()).min(1).meta({ description: 'must include "lead" and "waitlist-joined"' }),
  params: z
    .object({ category: z.string().min(1) })
    .meta({ description: "category slug" }),
});

export const WaitlistFormSchema = WaitlistFieldsSchema.superRefine(
  (val, ctx) => {
    checkWordCount(val.eyebrow, "eyebrow", 2, 7, ctx);
    checkWordCount(val.title, "title", 5, 12, ctx);
    checkWordCount(val.body, "body", 20, 30, ctx);

    // Tag count: exactly 3
    if (val.tags.length !== 3) {
      ctx.addIssue({
        code: "custom",
        path: ["tags"],
        message: `must have exactly 3 tags, got ${val.tags.length}`,
      });
    }

    if (!val.tags.includes("lead")) {
      ctx.addIssue({
        code: "custom",
        path: ["tags"],
        message: 'must include "lead"',
      });
    }

    if (!val.tags.includes(WAITLIST_JOINED_TAG)) {
      ctx.addIssue({
        code: "custom",
        path: ["tags"],
        message: `must include "${WAITLIST_JOINED_TAG}"`,
      });
    }

    // Tag format: third tag must be "waitlist-{category}"
    const expectedWaitlistTag = `waitlist-${val.params.category}`;
    if (!val.tags.includes(expectedWaitlistTag)) {
      ctx.addIssue({
        code: "custom",
        path: ["tags"],
        message: `must include "${expectedWaitlistTag}"`,
      });
    }

    checkCleanText(
      {
        eyebrow: val.eyebrow,
        title: val.title,
        body: val.body,
        buttonText: val.buttonText,
      },
      ctx,
    );
  },
).meta({
  id: "waitlist-form",
  title: "Waitlist Form",
  description:
    "Email capture form on course landing pages. Adds subscriber to course waitlist.",
});

// ---------------------------------------------------------------------------
// Quiz gate form schema (quiz pages)
// ---------------------------------------------------------------------------

const QuizGateFieldsSchema = z.object({
  eyebrow: z.string().min(1).meta({ description: "2-7 words" }),
  title: z.string().min(1).meta({ description: "3-10 words" }),
  body: z.string().min(1).meta({ description: "8-36 words" }),
  inputPlaceholder: z
    .literal(INPUT_PLACEHOLDER)
    .meta({ description: `must be "${INPUT_PLACEHOLDER}"` }),
  buttonText: z
    .literal(QUIZ_GATE_BUTTON_TEXT)
    .meta({ description: `must be "${QUIZ_GATE_BUTTON_TEXT}"` }),
  endpoint: z
    .literal(QUIZ_GATE_ENDPOINT)
    .meta({ description: `must be "${QUIZ_GATE_ENDPOINT}"` }),
  tags: z.array(z.string()).min(1).meta({ description: 'must include "lead", "quiz-{slug}", and "quiz-completed"' }),
  params: z
    .object({
      quizSlug: z.string().min(1),
      resultUrl: z.string(),
      fromGate: z.literal(true),
    })
    .meta({ description: "quizSlug + resultUrl (dynamic) + fromGate: true" }),
});

export const QuizGateFormSchema = QuizGateFieldsSchema.superRefine(
  (val, ctx) => {
    checkWordCount(val.eyebrow, "eyebrow", 2, 7, ctx);
    checkWordCount(val.title, "title", 3, 10, ctx);
    checkWordCount(val.body, "body", 8, 36, ctx);

    // Tag count: exactly 3
    if (val.tags.length !== 3) {
      ctx.addIssue({
        code: "custom",
        path: ["tags"],
        message: `must have exactly 3 tags, got ${val.tags.length}`,
      });
    }

    if (!val.tags.includes("lead")) {
      ctx.addIssue({
        code: "custom",
        path: ["tags"],
        message: 'must include "lead"',
      });
    }

    // Tag format: must include "quiz-{quizSlug}"
    const expectedQuizTag = `quiz-${val.params.quizSlug}`;
    if (!val.tags.includes(expectedQuizTag)) {
      ctx.addIssue({
        code: "custom",
        path: ["tags"],
        message: `must include "${expectedQuizTag}"`,
      });
    }

    // Must include quiz-completed (automation trigger)
    if (!val.tags.includes(QUIZ_COMPLETED_TAG)) {
      ctx.addIssue({
        code: "custom",
        path: ["tags"],
        message: `must include "${QUIZ_COMPLETED_TAG}"`,
      });
    }

    checkCleanText(
      {
        eyebrow: val.eyebrow,
        title: val.title,
        body: val.body,
        buttonText: val.buttonText,
      },
      ctx,
    );
  },
).meta({
  id: "quiz-gate-form",
  title: "Quiz Gate Form",
  description:
    "Email capture form on quiz pages. Gates full results behind email signup.",
});

// ---------------------------------------------------------------------------
// Top-level spec file schema
// ---------------------------------------------------------------------------

export const MailingSpecSchema = z
  .object({
    blog: z.record(z.string(), z.record(z.string(), FreebieFormSchema)),
    course: z.record(z.string(), WaitlistFormSchema),
    quiz: z.record(z.string(), QuizGateFormSchema),
  })
  .meta({
    id: "mailing-spec",
    title: "Mailing Spec",
    description: "Complete mailing form specification keyed by URL path.",
  });

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type FreebieForm = z.infer<typeof FreebieFormSchema>;
export type WaitlistForm = z.infer<typeof WaitlistFormSchema>;
export type QuizGateForm = z.infer<typeof QuizGateFormSchema>;
export type MailingSpec = z.infer<typeof MailingSpecSchema>;

// ---------------------------------------------------------------------------
// Cross-reference checks (needs taxonomy)
// ---------------------------------------------------------------------------

/**
 * Validate mailing spec keys against taxonomy — bidirectional.
 *
 * Spec → Taxonomy (no orphans):
 * - Every blog/{category} key exists as a category in taxonomy
 * - Every blog/{category}/{article} key exists as an article in that category
 * - Every course/{slug} maps to a real course in taxonomy
 * - Every quiz/{slug} maps to a real quiz in taxonomy
 * - Every freebie params.category matches its parent category key
 * - Every waitlist params.category matches a valid category slug
 *
 * Taxonomy → Spec (completeness):
 * - Every article in taxonomy has an entry in blog/{category}/{article}
 * - Every course in taxonomy has an entry in course/{slug}
 * - Every quiz in taxonomy has an entry in quiz/{slug}
 */
export function validateMailingCrossRefs(
  spec: MailingSpec,
  taxonomy: TaxonomyForCrossRef,
): CrossRefIssue[] {
  const issues: CrossRefIssue[] = [];

  // Build taxonomy lookups
  const catSlugs = new Set(taxonomy.categories.map((c) => c.slug));
  const articlesByCat = new Map<string, Set<string>>();
  for (const a of taxonomy.entries) {
    let set = articlesByCat.get(a.categorySlug);
    if (!set) {
      set = new Set();
      articlesByCat.set(a.categorySlug, set);
    }
    set.add(a.slug);
  }
  const quizSlugs = new Set(taxonomy.quizzes.map((q) => q.slug));

  // Course slugs from taxonomy — extract from courses map or category slugs
  const courseSlugs = new Set<string>();
  if (taxonomy.courses) {
    for (const [, c] of taxonomy.courses) {
      // Extract slug from URL: "/course/{slug}/" → "{slug}"
      const match = c.url.match(/^\/course\/([^/]+)/);
      if (match) courseSlugs.add(match[1]);
    }
  }

  // --- Spec → Taxonomy (no orphans) ---

  // Blog entries
  for (const catSlug of Object.keys(spec.blog)) {
    if (!catSlugs.has(catSlug)) {
      issues.push({
        path: `blog/${catSlug}`,
        message: `category "${catSlug}" not in taxonomy`,
        severity: "error",
      });
      continue;
    }

    const catArticles = articlesByCat.get(catSlug) ?? new Set();
    const catEntries = spec.blog[catSlug];
    if (!catEntries) continue;

    for (const articleSlug of Object.keys(catEntries)) {
      if (!catArticles.has(articleSlug)) {
        issues.push({
          path: `blog/${catSlug}/${articleSlug}`,
          message: `article "${articleSlug}" not in taxonomy under category "${catSlug}"`,
          severity: "error",
        });
      }

      // Verify params.category matches the parent key
      const entry = catEntries[articleSlug];
      if (entry && entry.params.category !== catSlug) {
        issues.push({
          path: `blog/${catSlug}/${articleSlug}/params/category`,
          message: `params.category "${entry.params.category}" does not match parent key "${catSlug}"`,
          severity: "error",
        });
      }
    }
  }

  // Course entries
  for (const courseSlug of Object.keys(spec.course)) {
    if (courseSlugs.size > 0 && !courseSlugs.has(courseSlug)) {
      issues.push({
        path: `course/${courseSlug}`,
        message: `course "${courseSlug}" not in taxonomy`,
        severity: "error",
      });
    }

    // Verify params.category is a valid category slug
    const entry = spec.course[courseSlug];
    if (entry && !catSlugs.has(entry.params.category)) {
      issues.push({
        path: `course/${courseSlug}/params/category`,
        message: `params.category "${entry.params.category}" not a valid category`,
        severity: "error",
      });
    }
  }

  // Quiz entries
  for (const quizSlug of Object.keys(spec.quiz)) {
    if (!quizSlugs.has(quizSlug)) {
      issues.push({
        path: `quiz/${quizSlug}`,
        message: `quiz "${quizSlug}" not in taxonomy`,
        severity: "error",
      });
    }

    // Verify params.quizSlug matches the key
    const entry = spec.quiz[quizSlug];
    if (entry && entry.params.quizSlug !== quizSlug) {
      issues.push({
        path: `quiz/${quizSlug}/params/quizSlug`,
        message: `params.quizSlug "${entry.params.quizSlug}" does not match key "${quizSlug}"`,
        severity: "error",
      });
    }
  }

  // --- Taxonomy → Spec (completeness) ---

  for (const article of taxonomy.entries) {
    const catEntries = spec.blog[article.categorySlug];
    if (!catEntries || !(article.slug in catEntries)) {
      issues.push({
        path: `blog/${article.categorySlug}/${article.slug}`,
        message: `missing mailing form entry for article "${article.title}"`,
        severity: "error",
      });
    }
  }

  if (courseSlugs.size > 0) {
    for (const [, c] of taxonomy.courses!) {
      const match = c.url.match(/^\/course\/([^/]+)/);
      if (match && !(match[1] in spec.course)) {
        issues.push({
          path: `course/${match[1]}`,
          message: `missing mailing form entry for course "${c.name}"`,
          severity: "error",
        });
      }
    }
  }

  for (const quiz of taxonomy.quizzes) {
    if (!(quiz.slug in spec.quiz)) {
      issues.push({
        path: `quiz/${quiz.slug}`,
        message: `missing mailing form entry for quiz "${quiz.title}"`,
        severity: "error",
      });
    }
  }

  return issues;
}

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
import { SlugSchema, checkWordCount, checkCleanText } from "./shared";

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
    .object({ category: SlugSchema })
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
    .object({ category: SlugSchema })
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
      quizSlug: SlugSchema,
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
    blog: z.record(SlugSchema, z.record(SlugSchema, FreebieFormSchema)),
    course: z.record(SlugSchema, WaitlistFormSchema),
    quiz: z.record(SlugSchema, QuizGateFormSchema),
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


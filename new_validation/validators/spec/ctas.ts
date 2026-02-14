/**
 * CTA spec validator — Zod schemas + cross-reference checks for spec/ctas.json.
 *
 * Two layers:
 * 1. Zod schemas validate each entry's fields (word counts, forbidden terms,
 *    required phrases, URL formats). No external data needed.
 * 2. Cross-reference function checks spec keys against taxonomy and vice versa.
 *
 * The Zod schemas are the SINGLE SOURCE OF TRUTH for all CTA validation rules.
 * Admin UI reads error messages directly — zero hardcoded rule strings in the frontend.
 * Generator agents receive these schemas so they know exact constraints.
 */

import { z } from "zod/v4";
import { SlugSchema, checkWordCount, checkCleanText } from "./shared";
import type { TaxonomySpec, ValidationIssue } from "./taxonomy";

// ---------------------------------------------------------------------------
// Constants — these ARE the rules, referenced by schemas below
// ---------------------------------------------------------------------------

export const COMMUNITY_BUTTON_TEXT = "Join the community";
export const COMMUNITY_FOUNDER_LINE = "We are there with you daily too";
export const COMMUNITY_URL = "https://www.skool.com/steady-parent-1727";

// ---------------------------------------------------------------------------
// Community CTA schema
// ---------------------------------------------------------------------------

const CommunityFieldsSchema = z.object({
  eyebrow: z.string().min(1).meta({ description: "2-5 words" }),
  title: z.string().min(1).meta({ description: "3-8 words" }),
  body: z
    .string()
    .min(1)
    .meta({ description: `8-24 words, must contain "${COMMUNITY_FOUNDER_LINE}"` }),
  buttonText: z
    .literal(COMMUNITY_BUTTON_TEXT)
    .meta({ description: `must be "${COMMUNITY_BUTTON_TEXT}"` }),
  buttonUrl: z
    .literal(COMMUNITY_URL)
    .meta({ description: `must be "${COMMUNITY_URL}"` }),
});

export const CommunityCopySchema = CommunityFieldsSchema.superRefine(
  (val, ctx) => {
    checkWordCount(val.eyebrow, "eyebrow", 2, 5, ctx);
    checkWordCount(val.title, "title", 3, 8, ctx);
    checkWordCount(val.body, "body", 8, 24, ctx);

    if (!val.body.includes(COMMUNITY_FOUNDER_LINE)) {
      ctx.addIssue({
        code: "custom",
        path: ["body"],
        message: `must contain "${COMMUNITY_FOUNDER_LINE}"`,
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
  id: "community-cta",
  title: "Community CTA",
  description:
    "Community CTA copy shown on article and quiz pages. Links to the Skool community.",
});

// ---------------------------------------------------------------------------
// Course CTA schema
// ---------------------------------------------------------------------------

const CourseFieldsSchema = z.object({
  eyebrow: z.string().min(1).meta({ description: "2-5 words" }),
  title: z.string().min(1).meta({ description: "5-12 words" }),
  body: z.string().min(1).meta({ description: "8-24 words" }),
  buttonText: z
    .string()
    .min(1)
    .meta({ description: "non-empty button label" }),
  buttonUrl: z
    .string()
    .regex(
      /^\/course\/[a-z0-9]+(-[a-z0-9]+)*\/$/,
      'must match /course/{slug}/',
    )
    .meta({ description: "must match /course/{slug}/" }),
});

export const CourseCopySchema = CourseFieldsSchema.superRefine((val, ctx) => {
  checkWordCount(val.eyebrow, "eyebrow", 2, 5, ctx);
  checkWordCount(val.title, "title", 5, 12, ctx);
  checkWordCount(val.body, "body", 8, 24, ctx);

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
  id: "course-cta",
  title: "Course CTA",
  description:
    "Course CTA copy shown on article pages. Links to a course landing page.",
});

// ---------------------------------------------------------------------------
// Blog article entry (community + course)
// ---------------------------------------------------------------------------

export const BlogArticleCtaSchema = z
  .object({
    community: CommunityCopySchema,
    course: CourseCopySchema,
  })
  .meta({
    id: "blog-article-cta",
    title: "Blog Article CTAs",
    description: "Each article must have both a community CTA and a course CTA.",
  });

// ---------------------------------------------------------------------------
// Quiz entry (community only)
// ---------------------------------------------------------------------------

export const QuizCtaSchema = z
  .object({
    community: CommunityCopySchema,
  })
  .meta({
    id: "quiz-cta",
    title: "Quiz CTA",
    description: "Each quiz must have a community CTA on its results page.",
  });

// ---------------------------------------------------------------------------
// Top-level spec file schema
// ---------------------------------------------------------------------------

export const CtaSpecSchema = z
  .object({
    blog: z.record(SlugSchema, z.record(SlugSchema, BlogArticleCtaSchema)),
    quiz: z.record(SlugSchema, QuizCtaSchema),
  })
  .meta({
    id: "cta-spec",
    title: "CTA Spec",
    description: "Complete CTA specification keyed by URL path.",
  });

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type CommunityCopy = z.infer<typeof CommunityCopySchema>;
export type CourseCopy = z.infer<typeof CourseCopySchema>;
export type BlogArticleCta = z.infer<typeof BlogArticleCtaSchema>;
export type QuizCta = z.infer<typeof QuizCtaSchema>;
export type CtaSpec = z.infer<typeof CtaSpecSchema>;

// ---------------------------------------------------------------------------
// Cross-reference checks (needs taxonomy)
// ---------------------------------------------------------------------------

export function validateCtaCrossRefs(
  spec: CtaSpec,
  taxonomy: TaxonomySpec,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const catSlugs = new Set(Object.keys(taxonomy.categories));
  const courseUrls = new Set(
    Object.values(taxonomy.course).map((c) => c.url),
  );

  // --- Spec → Taxonomy (no orphans) ---

  for (const catSlug of Object.keys(spec.blog)) {
    if (!catSlugs.has(catSlug)) {
      issues.push({
        path: `blog/${catSlug}`,
        message: `category "${catSlug}" not in taxonomy`,
      });
      continue;
    }

    const taxArticles = taxonomy.blog[catSlug] ?? {};
    const catEntries = spec.blog[catSlug];
    if (!catEntries) continue;

    for (const articleSlug of Object.keys(catEntries)) {
      if (!(articleSlug in taxArticles)) {
        issues.push({
          path: `blog/${catSlug}/${articleSlug}`,
          message: `article "${articleSlug}" not in taxonomy under "${catSlug}"`,
        });
      }

      // Check course buttonUrl resolves to a real course
      const entry = catEntries[articleSlug];
      if (entry && !courseUrls.has(entry.course.buttonUrl)) {
        issues.push({
          path: `blog/${catSlug}/${articleSlug}/course/buttonUrl`,
          message: `course URL "${entry.course.buttonUrl}" does not match any course in taxonomy`,
        });
      }
    }
  }

  for (const quizSlug of Object.keys(spec.quiz)) {
    if (!(quizSlug in taxonomy.quiz)) {
      issues.push({
        path: `quiz/${quizSlug}`,
        message: `quiz "${quizSlug}" not in taxonomy`,
      });
    }
  }

  // --- Taxonomy → Spec (completeness) ---
  // Catalog pages (key "") don't need CTAs — only pillar + series do

  for (const [catSlug, articles] of Object.entries(taxonomy.blog)) {
    for (const [articleKey, article] of Object.entries(articles)) {
      if (article.pageType === "catalog") continue;

      const catEntries = spec.blog[catSlug];
      if (!catEntries || !(articleKey in catEntries)) {
        issues.push({
          path: `blog/${catSlug}/${articleKey}`,
          message: `missing CTA entry for article "${article.title}"`,
        });
      }
    }
  }

  for (const [quizSlug, quiz] of Object.entries(taxonomy.quiz)) {
    if (!(quizSlug in spec.quiz)) {
      issues.push({
        path: `quiz/${quizSlug}`,
        message: `missing CTA entry for quiz "${quiz.title}"`,
      });
    }
  }

  return issues;
}

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
import {
  checkWordCount,
  checkCleanText,
  type CrossRefIssue,
  type TaxonomyForCrossRef,
} from "./shared";

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
    .min(1)
    .meta({ description: 'must start with "/course/"' }),
});

export const CourseCopySchema = CourseFieldsSchema.superRefine((val, ctx) => {
  checkWordCount(val.eyebrow, "eyebrow", 2, 5, ctx);
  checkWordCount(val.title, "title", 5, 12, ctx);
  checkWordCount(val.body, "body", 8, 24, ctx);

  if (!val.buttonUrl.startsWith("/course/")) {
    ctx.addIssue({
      code: "custom",
      path: ["buttonUrl"],
      message: `must start with "/course/", got "${val.buttonUrl}"`,
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
    blog: z.record(z.string(), z.record(z.string(), BlogArticleCtaSchema)),
    quiz: z.record(z.string(), QuizCtaSchema),
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
  const courseUrls = new Set<string>();
  if (taxonomy.courses) {
    for (const [, c] of taxonomy.courses) {
      courseUrls.add(c.url);
    }
  }

  // --- Spec → Taxonomy (no orphans) ---

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

      // Check course buttonUrl resolves to a real course
      const entry = catEntries[articleSlug];
      if (entry && courseUrls.size > 0 && !courseUrls.has(entry.course.buttonUrl)) {
        issues.push({
          path: `blog/${catSlug}/${articleSlug}/course/buttonUrl`,
          message: `course URL "${entry.course.buttonUrl}" does not match any course in taxonomy`,
          severity: "warning",
        });
      }
    }
  }

  for (const quizSlug of Object.keys(spec.quiz)) {
    if (!quizSlugs.has(quizSlug)) {
      issues.push({
        path: `quiz/${quizSlug}`,
        message: `quiz "${quizSlug}" not in taxonomy`,
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
        message: `missing CTA entry for article "${article.title}"`,
        severity: "error",
      });
    }
  }

  for (const quiz of taxonomy.quizzes) {
    if (!(quiz.slug in spec.quiz)) {
      issues.push({
        path: `quiz/${quiz.slug}`,
        message: `missing CTA entry for quiz "${quiz.title}"`,
        severity: "error",
      });
    }
  }

  return issues;
}

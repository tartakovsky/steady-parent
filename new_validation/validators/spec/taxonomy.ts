/**
 * Taxonomy spec validator — Zod schemas + structural checks for spec/taxonomy.json.
 *
 * Two layers:
 * 1. Zod schemas validate each entry's shape (field types, discriminated unions,
 *    URL slugs, page type constraints). No external data needed.
 * 2. validateTaxonomy() checks structural invariants that span multiple entries
 *    (pillar counts, URL consistency, slug uniqueness, category coverage).
 *
 * The Zod schemas are the SINGLE SOURCE OF TRUTH for all taxonomy validation rules.
 * Admin UI reads error messages directly — zero hardcoded rule strings in the frontend.
 */

import { z } from "zod/v4";
import { SlugSchema } from "./shared";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

const RangeSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().positive(),
  })
  .refine((data) => data.min <= data.max, {
    message: "min must be <= max",
  });

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

const CategorySchema = z.object({
  name: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Article — discriminated union on pageType
// ---------------------------------------------------------------------------

const CatalogArticleSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  pageType: z.literal("catalog"),
});

const PillarArticleSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  pageType: z.literal("pillar"),
});

const SeriesArticleSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  pageType: z.literal("series"),
  seriesPosition: z.number().int().positive(),
});

const ArticleSchema = z.discriminatedUnion("pageType", [
  CatalogArticleSchema,
  PillarArticleSchema,
  SeriesArticleSchema,
]);

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

const QuizTypeEnum = z.enum(["likert", "identity", "assessment"]);

const QuizSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  quizType: QuizTypeEnum,
  connectsTo: z.array(SlugSchema).min(1),
});

// ---------------------------------------------------------------------------
// Course
// ---------------------------------------------------------------------------

const CourseSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  categorySlug: SlugSchema,
});

// ---------------------------------------------------------------------------
// Page type constraints — articles
// ---------------------------------------------------------------------------

const CatalogPageTypeSchema = z.object({
  requiresDescription: z.boolean(),
});

const ArticlePageTypeSchema = z.object({
  wordCount: RangeSchema,
  h2Count: RangeSchema,
  ctaCount: RangeSchema,
  imageCount: RangeSchema,
  faqQuestionCount: RangeSchema,
  requiresTldr: z.boolean(),
  requiresFaq: z.boolean(),
  minInternalLinks: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Page type constraints — quizzes (three separate schemas per layout)
// ---------------------------------------------------------------------------

const QuizLikertPageTypeSchema = z.object({
  statementCount: RangeSchema,
  dimensionCount: RangeSchema,
  scalePoints: z.number().int().positive(),
  optionsPerQuestion: RangeSchema,
  requiresSources: z.boolean(),
  requiresIntro: z.boolean(),
});

const QuizIdentityPageTypeSchema = z.object({
  questionCount: RangeSchema,
  typeCount: RangeSchema,
  optionsPerQuestion: RangeSchema,
  requiresSources: z.boolean(),
  requiresIntro: z.boolean(),
});

const QuizAssessmentPageTypeSchema = z.object({
  questionCount: RangeSchema,
  domainCount: RangeSchema,
  optionsPerQuestion: RangeSchema,
  requiresSources: z.boolean(),
  requiresIntro: z.boolean(),
});

// ---------------------------------------------------------------------------
// Top-level spec schema
// ---------------------------------------------------------------------------

export const TaxonomySpecSchema = z
  .object({
    categories: z.record(SlugSchema, CategorySchema),
    blog: z.record(SlugSchema, z.record(z.union([SlugSchema, z.literal("")]), ArticleSchema)),
    quiz: z.record(SlugSchema, QuizSchema),
    course: z.record(SlugSchema, CourseSchema),
    pageTypes: z.object({
      article: z.object({
        catalog: CatalogPageTypeSchema,
        pillar: ArticlePageTypeSchema,
        series: ArticlePageTypeSchema,
      }),
      quiz: z.object({
        likert: QuizLikertPageTypeSchema,
        identity: QuizIdentityPageTypeSchema,
        assessment: QuizAssessmentPageTypeSchema,
      }),
    }),
  })
  .meta({
    id: "taxonomy-spec",
    title: "Taxonomy Spec",
    description:
      "Master registry: categories, articles, quizzes, courses, and page type constraints.",
  });

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type TaxonomySpec = z.infer<typeof TaxonomySpecSchema>;

export interface ValidationIssue {
  path: string;
  message: string;
}

// Re-export leaf schemas for admin UI introspection
export {
  CategorySchema,
  CatalogArticleSchema,
  PillarArticleSchema,
  SeriesArticleSchema,
  ArticleSchema,
  QuizTypeEnum,
  QuizSchema,
  CourseSchema,
  RangeSchema,
  CatalogPageTypeSchema,
  ArticlePageTypeSchema,
  QuizLikertPageTypeSchema,
  QuizIdentityPageTypeSchema,
  QuizAssessmentPageTypeSchema,
};

// ---------------------------------------------------------------------------
// Structural validation
// ---------------------------------------------------------------------------

export function validateTaxonomy(spec: TaxonomySpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const catSlugs = new Set(Object.keys(spec.categories));

  // 1. Every blog category key exists in categories
  for (const catSlug of Object.keys(spec.blog)) {
    if (!catSlugs.has(catSlug)) {
      issues.push({
        path: `blog/${catSlug}`,
        message: `category "${catSlug}" not in categories`,
      });
    }
  }

  // 2. Every category has ≥1 article
  for (const catSlug of catSlugs) {
    const articles = spec.blog[catSlug];
    if (!articles || Object.keys(articles).length === 0) {
      issues.push({
        path: `categories/${catSlug}`,
        message: `category has no articles`,
      });
    }
  }

  // 3. Exactly 1 catalog per category, catalog key must be ""
  for (const [catSlug, articles] of Object.entries(spec.blog)) {
    const catalogs = Object.entries(articles).filter(
      ([, a]) => a.pageType === "catalog",
    );
    if (catalogs.length === 0) {
      issues.push({
        path: `blog/${catSlug}`,
        message: `no catalog page`,
      });
    } else if (catalogs.length > 1) {
      issues.push({
        path: `blog/${catSlug}`,
        message: `${catalogs.length} catalog pages (expected 1)`,
      });
    } else {
      const [catalogKey] = catalogs[0];
      if (catalogKey !== "") {
        issues.push({
          path: `blog/${catSlug}/${catalogKey}`,
          message: `catalog key must be "", got "${catalogKey}"`,
        });
      }
    }
  }

  // 4. Exactly 1 pillar per category, pillar slug == "guide"
  for (const [catSlug, articles] of Object.entries(spec.blog)) {
    const pillars = Object.entries(articles).filter(
      ([, a]) => a.pageType === "pillar",
    );
    if (pillars.length === 0) {
      issues.push({
        path: `blog/${catSlug}`,
        message: `no pillar article`,
      });
    } else if (pillars.length > 1) {
      issues.push({
        path: `blog/${catSlug}`,
        message: `${pillars.length} pillar articles (expected 1)`,
      });
    } else {
      const [pillarSlug] = pillars[0];
      if (pillarSlug !== "guide") {
        issues.push({
          path: `blog/${catSlug}/${pillarSlug}`,
          message: `pillar slug must be "guide", got "${pillarSlug}"`,
        });
      }
    }
  }

  // 5. URL format: key "" → /blog/{cat}/, key "guide" → /blog/{cat}/guide/, others → /blog/{cat}/{slug}/
  for (const [catSlug, articles] of Object.entries(spec.blog)) {
    for (const [articleKey, article] of Object.entries(articles)) {
      const expected =
        articleKey === ""
          ? `/blog/${catSlug}/`
          : `/blog/${catSlug}/${articleKey}/`;
      if (article.url !== expected) {
        issues.push({
          path: `blog/${catSlug}/${articleKey}/url`,
          message: `expected "${expected}", got "${article.url}"`,
        });
      }
    }
  }

  // 6. seriesPosition sequential 1..N per category (no gaps, no duplicates)
  for (const [catSlug, articles] of Object.entries(spec.blog)) {
    const positions: number[] = [];
    for (const [, article] of Object.entries(articles)) {
      if (article.pageType === "series") {
        positions.push(article.seriesPosition);
      }
    }
    if (positions.length > 0) {
      const sorted = [...positions].sort((a, b) => a - b);
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] !== i + 1) {
          issues.push({
            path: `blog/${catSlug}`,
            message: `seriesPosition not sequential: expected 1..${positions.length}, got [${sorted.join(", ")}]`,
          });
          break;
        }
      }
    }
  }

  // 7. Quiz URL: /quiz/{slug}/
  for (const [slug, quiz] of Object.entries(spec.quiz)) {
    const expected = `/quiz/${slug}/`;
    if (quiz.url !== expected) {
      issues.push({
        path: `quiz/${slug}/url`,
        message: `expected "${expected}", got "${quiz.url}"`,
      });
    }
  }

  // 8. Quiz connectsTo → valid categories
  for (const [slug, quiz] of Object.entries(spec.quiz)) {
    for (const cat of quiz.connectsTo) {
      if (!catSlugs.has(cat)) {
        issues.push({
          path: `quiz/${slug}/connectsTo`,
          message: `"${cat}" is not a valid category`,
        });
      }
    }
  }

  // 9. Quiz connectsTo no duplicates
  for (const [slug, quiz] of Object.entries(spec.quiz)) {
    const seen = new Set<string>();
    for (const cat of quiz.connectsTo) {
      if (seen.has(cat)) {
        issues.push({
          path: `quiz/${slug}/connectsTo`,
          message: `duplicate category "${cat}"`,
        });
      }
      seen.add(cat);
    }
  }

  // 10. Quiz quizType → valid pageTypes.quiz key
  const quizPageTypeKeys = new Set(Object.keys(spec.pageTypes.quiz));
  for (const [slug, quiz] of Object.entries(spec.quiz)) {
    if (!quizPageTypeKeys.has(quiz.quizType)) {
      issues.push({
        path: `quiz/${slug}/quizType`,
        message: `"${quiz.quizType}" is not a valid quiz page type (expected: ${[...quizPageTypeKeys].join(", ")})`,
      });
    }
  }

  // 11. Course categorySlug → valid category
  for (const [slug, course] of Object.entries(spec.course)) {
    if (!catSlugs.has(course.categorySlug)) {
      issues.push({
        path: `course/${slug}/categorySlug`,
        message: `"${course.categorySlug}" is not a valid category`,
      });
    }
  }

  // 12. Every category has exactly 1 course
  const categoriesWithCourse = new Map<string, string[]>();
  for (const [slug, course] of Object.entries(spec.course)) {
    const list = categoriesWithCourse.get(course.categorySlug) ?? [];
    list.push(slug);
    categoriesWithCourse.set(course.categorySlug, list);
  }
  for (const catSlug of catSlugs) {
    const courses = categoriesWithCourse.get(catSlug);
    if (!courses || courses.length === 0) {
      issues.push({
        path: `categories/${catSlug}`,
        message: `no course for category`,
      });
    } else if (courses.length > 1) {
      issues.push({
        path: `categories/${catSlug}`,
        message: `${courses.length} courses (expected 1): ${courses.join(", ")}`,
      });
    }
  }

  // 13. Course URL: /course/{slug}/
  for (const [slug, course] of Object.entries(spec.course)) {
    const expected = `/course/${slug}/`;
    if (course.url !== expected) {
      issues.push({
        path: `course/${slug}/url`,
        message: `expected "${expected}", got "${course.url}"`,
      });
    }
  }

  // 14. Article slugs unique within each category
  for (const [catSlug, articles] of Object.entries(spec.blog)) {
    const seen = new Set<string>();
    for (const articleSlug of Object.keys(articles)) {
      if (seen.has(articleSlug)) {
        issues.push({
          path: `blog/${catSlug}/${articleSlug}`,
          message: `duplicate slug within category`,
        });
      }
      seen.add(articleSlug);
    }
  }

  return issues;
}

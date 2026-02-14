/**
 * CTA spec cross-reference validator — checks ctas.json against taxonomy.json.
 *
 * Validates:
 * - No orphans: every key in CTA spec exists in taxonomy
 * - Course URL resolution: every course buttonUrl points to a real taxonomy course
 * - Completeness: every non-catalog taxonomy entry has a CTA entry
 */

import type { TaxonomySpec, ValidationIssue } from "./taxonomy";
import type { CtaSpec } from "./ctas";

export function validateCtaCrossRefs(
  spec: CtaSpec,
  taxonomy: TaxonomySpec,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const catSlugs = new Set(Object.keys(taxonomy.categories));
  const courseUrls = new Set(
    Object.values(taxonomy.course)
      .filter((c) => !("pageType" in c))
      .map((c) => c.url),
  );

  // =========================================================================
  // Spec → Taxonomy (no orphans)
  // =========================================================================

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

  // =========================================================================
  // Completeness (taxonomy → spec)
  // =========================================================================

  // Blog: every non-catalog article needs a CTA entry
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

  // Quiz: every non-catalog quiz needs a CTA entry
  for (const [quizSlug, quiz] of Object.entries(taxonomy.quiz)) {
    if ("pageType" in quiz && quiz.pageType === "catalog") continue;
    if (!(quizSlug in spec.quiz)) {
      issues.push({
        path: `quiz/${quizSlug}`,
        message: `missing CTA entry for quiz "${quiz.title}"`,
      });
    }
  }

  return issues;
}

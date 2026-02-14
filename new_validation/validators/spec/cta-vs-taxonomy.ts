/**
 * CTA vs taxonomy validator — checks ctas.json against taxonomy.json.
 *
 * Validates bidirectionally:
 *
 * Spec → Taxonomy (no orphans):
 * - Every blog category key exists in taxonomy.categories
 * - Every blog article key exists in taxonomy.blog[cat]
 * - Every quiz key exists in taxonomy.quiz
 * - Every course buttonUrl resolves to a real course in taxonomy
 * - Every course buttonUrl matches the specific course for its category
 *
 * Taxonomy → Spec (completeness):
 * - Every non-catalog blog article has a CTA entry
 * - Every non-catalog quiz has a CTA entry
 */

import type { TaxonomySpec, ValidationIssue } from "./taxonomy";
import type { CtaSpec } from "./ctas";

/** Map category slug → course URL from taxonomy. */
function courseByCat(taxonomy: TaxonomySpec): Map<string, string> {
  const map = new Map<string, string>();
  for (const [, course] of Object.entries(taxonomy.course)) {
    if ("pageType" in course) continue; // catalog
    map.set(course.categorySlug, course.url);
  }
  return map;
}

export function validateCtaVsTaxonomy(
  spec: CtaSpec,
  taxonomy: TaxonomySpec,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const catSlugs = new Set(Object.keys(taxonomy.categories));
  const courseUrlByCat = courseByCat(taxonomy);

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

    const expectedCourseUrl = courseUrlByCat.get(catSlug);

    for (const articleSlug of Object.keys(catEntries)) {
      if (!(articleSlug in taxArticles)) {
        issues.push({
          path: `blog/${catSlug}/${articleSlug}`,
          message: `article "${articleSlug}" not in taxonomy under "${catSlug}"`,
        });
      }

      const entry = catEntries[articleSlug];
      if (!entry) continue;

      const buttonUrl = entry.course.buttonUrl;

      // Course buttonUrl must match the category's course in taxonomy
      if (expectedCourseUrl) {
        if (buttonUrl !== expectedCourseUrl) {
          issues.push({
            path: `blog/${catSlug}/${articleSlug}/course/buttonUrl`,
            message: `course URL "${buttonUrl}" does not match category course "${expectedCourseUrl}"`,
          });
        }
      } else {
        issues.push({
          path: `blog/${catSlug}/${articleSlug}/course/buttonUrl`,
          message: `no course found in taxonomy for category "${catSlug}"`,
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

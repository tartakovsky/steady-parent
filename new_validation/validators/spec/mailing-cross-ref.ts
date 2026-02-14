/**
 * Mailing spec cross-reference validator — checks mailing.json against taxonomy.json.
 *
 * Validates:
 * - No orphans: every key in mailing spec exists in taxonomy
 * - Params consistency: params.category / params.quizSlug match parent keys and taxonomy
 * - Waitlist category matches taxonomy course's categorySlug
 * - Completeness: every non-catalog taxonomy entry has a mailing entry
 */

import type { TaxonomySpec, ValidationIssue } from "./taxonomy";
import type { MailingSpec } from "./mailing";

export function validateMailingCrossRefs(
  spec: MailingSpec,
  taxonomy: TaxonomySpec,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const catSlugs = new Set(Object.keys(taxonomy.categories));

  // =========================================================================
  // Spec → Taxonomy (no orphans)
  // =========================================================================

  // Blog entries
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

      // Verify params.category matches the parent key
      const entry = catEntries[articleSlug];
      if (entry && entry.params.category !== catSlug) {
        issues.push({
          path: `blog/${catSlug}/${articleSlug}/params/category`,
          message: `params.category "${entry.params.category}" does not match parent key "${catSlug}"`,
        });
      }
    }
  }

  // Course entries
  for (const courseSlug of Object.keys(spec.course)) {
    if (!(courseSlug in taxonomy.course)) {
      issues.push({
        path: `course/${courseSlug}`,
        message: `course "${courseSlug}" not in taxonomy`,
      });
      continue;
    }

    const entry = spec.course[courseSlug];
    if (!entry) continue;

    // Verify params.category is a valid category slug
    if (!catSlugs.has(entry.params.category)) {
      issues.push({
        path: `course/${courseSlug}/params/category`,
        message: `params.category "${entry.params.category}" not a valid category`,
      });
    }

    // Verify params.category matches the course's categorySlug in taxonomy
    const course = taxonomy.course[courseSlug];
    if (course && !("pageType" in course)) {
      if (entry.params.category !== course.categorySlug) {
        issues.push({
          path: `course/${courseSlug}/params/category`,
          message: `params.category "${entry.params.category}" does not match taxonomy course categorySlug "${course.categorySlug}"`,
        });
      }
    }
  }

  // Quiz entries
  for (const quizSlug of Object.keys(spec.quiz)) {
    if (!(quizSlug in taxonomy.quiz)) {
      issues.push({
        path: `quiz/${quizSlug}`,
        message: `quiz "${quizSlug}" not in taxonomy`,
      });
    }

    // Verify params.quizSlug matches the key
    const entry = spec.quiz[quizSlug];
    if (entry && entry.params.quizSlug !== quizSlug) {
      issues.push({
        path: `quiz/${quizSlug}/params/quizSlug`,
        message: `params.quizSlug "${entry.params.quizSlug}" does not match key "${quizSlug}"`,
      });
    }
  }

  // =========================================================================
  // Completeness (taxonomy → spec)
  // =========================================================================

  // Blog: every non-catalog article needs a mailing entry
  for (const [catSlug, articles] of Object.entries(taxonomy.blog)) {
    for (const [articleKey, article] of Object.entries(articles)) {
      if (article.pageType === "catalog") continue;

      const catEntries = spec.blog[catSlug];
      if (!catEntries || !(articleKey in catEntries)) {
        issues.push({
          path: `blog/${catSlug}/${articleKey}`,
          message: `missing mailing form entry for article "${article.title}"`,
        });
      }
    }
  }

  // Course: every non-catalog course needs a mailing entry
  for (const [courseSlug, course] of Object.entries(taxonomy.course)) {
    if ("pageType" in course) continue; // catalog
    if (!(courseSlug in spec.course)) {
      issues.push({
        path: `course/${courseSlug}`,
        message: `missing mailing form entry for course "${course.name}"`,
      });
    }
  }

  // Quiz: every non-catalog quiz needs a mailing entry
  for (const [quizSlug, quiz] of Object.entries(taxonomy.quiz)) {
    if ("pageType" in quiz && quiz.pageType === "catalog") continue;
    if (!(quizSlug in spec.quiz)) {
      issues.push({
        path: `quiz/${quizSlug}`,
        message: `missing mailing form entry for quiz "${quiz.title}"`,
      });
    }
  }

  return issues;
}

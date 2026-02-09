/**
 * Cross-link validation: checks referential integrity between
 * article taxonomy, quiz taxonomy, and article link plan.
 */

import type {
  ArticleTaxonomy,
  QuizTaxonomy,
  LinkPlan,
  ValidationResult,
} from "../types";

export interface CrossLinkStats {
  articleCount: number;
  totalLinks: number;
  linksByType: Record<string, number>;
  totalCtas: number;
  ctasByType: Record<string, number>;
  quizConnections: { slug: string; title: string; url: string; categories: string[] }[];
}

/**
 * Compute aggregate cross-linking stats from the link plan + quiz taxonomy.
 */
export function computeCrossLinkStats(
  linkPlan: LinkPlan,
  quizTaxonomy: QuizTaxonomy,
): CrossLinkStats {
  const linksByType: Record<string, number> = {};
  const ctasByType: Record<string, number> = {};
  let totalLinks = 0;
  let totalCtas = 0;

  for (const entry of linkPlan) {
    for (const link of entry.links) {
      linksByType[link.type] = (linksByType[link.type] ?? 0) + 1;
      totalLinks++;
    }
    for (const cta of entry.ctas) {
      ctasByType[cta.type] = (ctasByType[cta.type] ?? 0) + 1;
      totalCtas++;
    }
  }

  const quizConnections = quizTaxonomy.entries.map((q) => ({
    slug: q.slug,
    title: q.title,
    url: q.url,
    categories: q.connectsTo,
  }));

  return {
    articleCount: linkPlan.length,
    totalLinks,
    linksByType,
    totalCtas,
    ctasByType,
    quizConnections,
  };
}

/** Strip trailing slash for URL comparison (keeps root "/" as-is). */
function norm(url: string): string {
  return url.length > 1 && url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Validate referential integrity across link plan, article taxonomy,
 * and quiz taxonomy. URLs are compared with trailing slashes stripped.
 */
export function validateCrossLinks(
  linkPlan: LinkPlan,
  articleTaxonomy: ArticleTaxonomy,
  quizTaxonomy: QuizTaxonomy,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const categorySlugs = new Set(articleTaxonomy.categories.map((c) => c.slug));
  const articleUrls = new Set(articleTaxonomy.entries.map((a) => norm(a.url)));
  const quizUrls = new Set(quizTaxonomy.entries.map((q) => norm(q.url)));
  const allKnownUrls = new Set([...articleUrls, ...quizUrls]);

  // 1. Quiz connectsTo must reference valid category slugs
  for (const quiz of quizTaxonomy.entries) {
    for (const slug of quiz.connectsTo) {
      if (!categorySlugs.has(slug)) {
        errors.push(
          `Quiz "${quiz.title}" connectsTo unknown category: "${slug}"`,
        );
      }
    }
  }

  // 2. Every article in taxonomy should have a link plan entry
  const linkPlanUrls = new Set(linkPlan.map((e) => norm(e.url)));
  for (const article of articleTaxonomy.entries) {
    if (!linkPlanUrls.has(norm(article.url))) {
      warnings.push(
        `Article "${article.title}" has no link plan entry`,
      );
    }
  }

  // 3. Every link plan entry should reference a known article URL
  for (const entry of linkPlan) {
    if (!articleUrls.has(norm(entry.url))) {
      errors.push(
        `Link plan entry "${entry.article}" has unknown URL: ${entry.url}`,
      );
    }
  }

  // 4. All link targets must reference known article or quiz URLs
  for (const entry of linkPlan) {
    for (const link of entry.links) {
      if (!allKnownUrls.has(norm(link.url))) {
        errors.push(
          `"${entry.article}" links to unknown URL: ${link.url} (type: ${link.type})`,
        );
      }
    }
  }

  return { errors, warnings };
}

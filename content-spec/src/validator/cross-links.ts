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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CrossLinkStats {
  articleCount: number;
  totalLinks: number;
  linksByType: Record<string, number>;
  totalCtas: number;
  ctasByType: Record<string, number>;
}

export interface ResolvedLink {
  url: string;
  type: string;
  intent: string;
  targetTitle: string | null;
  valid: boolean;
}

export interface CrossLinkArticle {
  title: string;
  url: string;
  links: ResolvedLink[];
}

export interface CrossLinkCategory {
  slug: string;
  name: string;
  articles: CrossLinkArticle[];
}

export interface CrossLinkQuiz {
  slug: string;
  title: string;
  url: string;
  categories: string[];
}

export interface CrossLinkDetail {
  stats: CrossLinkStats;
  categories: CrossLinkCategory[];
  orphanedArticles: string[]; // taxonomy articles with no link plan entry
  quizConnections: CrossLinkQuiz[];
  validation: ValidationResult;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip trailing slash for URL comparison (keeps root "/" as-is). */
function norm(url: string): string {
  return url.length > 1 && url.endsWith("/") ? url.slice(0, -1) : url;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export function computeCrossLinkStats(linkPlan: LinkPlan): CrossLinkStats {
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

  return { articleCount: linkPlan.length, totalLinks, linksByType, totalCtas, ctasByType };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Full detail builder (for admin UI)
// ---------------------------------------------------------------------------

/**
 * Build the full cross-link detail: per-category articles with resolved
 * link targets, quiz connections, validation, and orphan detection.
 */
export function buildCrossLinkDetail(
  linkPlan: LinkPlan,
  articleTaxonomy: ArticleTaxonomy,
  quizTaxonomy: QuizTaxonomy,
): CrossLinkDetail {
  // URL → title lookup (normalized URLs)
  const urlToTitle = new Map<string, string>();
  for (const a of articleTaxonomy.entries) {
    urlToTitle.set(norm(a.url), a.title);
  }
  for (const q of quizTaxonomy.entries) {
    urlToTitle.set(norm(q.url), q.title);
  }
  const allKnownUrls = new Set(urlToTitle.keys());

  // Article URL → categorySlug lookup
  const articleCatMap = new Map<string, string>();
  for (const a of articleTaxonomy.entries) {
    if (a.categorySlug) {
      articleCatMap.set(norm(a.url), a.categorySlug);
    }
  }

  // Group link plan entries by category
  const catArticlesMap = new Map<string, CrossLinkArticle[]>();
  for (const entry of linkPlan) {
    const catSlug = articleCatMap.get(norm(entry.url)) ?? "uncategorized";
    const links: ResolvedLink[] = entry.links.map((l) => ({
      url: l.url,
      type: l.type,
      intent: l.intent,
      targetTitle: urlToTitle.get(norm(l.url)) ?? null,
      valid: allKnownUrls.has(norm(l.url)),
    }));
    const article: CrossLinkArticle = {
      title: entry.article,
      url: entry.url,
      links,
    };
    const list = catArticlesMap.get(catSlug) ?? [];
    list.push(article);
    catArticlesMap.set(catSlug, list);
  }

  // Build ordered categories
  const categories: CrossLinkCategory[] = articleTaxonomy.categories
    .filter((c) => catArticlesMap.has(c.slug))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      articles: catArticlesMap.get(c.slug) ?? [],
    }));

  // Orphaned articles (in taxonomy but not in link plan)
  const linkPlanUrls = new Set(linkPlan.map((e) => norm(e.url)));
  const orphanedArticles = articleTaxonomy.entries
    .filter((a) => !linkPlanUrls.has(norm(a.url)))
    .map((a) => a.title);

  // Quiz connections
  const quizConnections: CrossLinkQuiz[] = quizTaxonomy.entries.map((q) => ({
    slug: q.slug,
    title: q.title,
    url: q.url,
    categories: q.connectsTo,
  }));

  return {
    stats: computeCrossLinkStats(linkPlan),
    categories,
    orphanedArticles,
    quizConnections,
    validation: validateCrossLinks(linkPlan, articleTaxonomy, quizTaxonomy),
  };
}

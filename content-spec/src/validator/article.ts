/**
 * Article validator — checks a parsed article against its plan and page type.
 *
 * Refactored from landing/src/lib/admin/article-validator.ts:
 * - Uses PageType config instead of hardcoded ranges
 * - Takes CtaCatalog instead of old categoryCtas record
 */

import type {
  ParsedArticle,
  LinkPlanEntry,
  PageType,
  CtaDefinition,
  ValidationResult,
} from "../types";

// ---------------------------------------------------------------------------
// URL registry builder
// ---------------------------------------------------------------------------

export function buildUrlRegistry(linkPlan: LinkPlanEntry[]): Set<string> {
  const urls = new Set<string>();
  for (const entry of linkPlan) {
    urls.add(entry.url);
    for (const link of entry.links) {
      if (link.url) urls.add(link.url);
    }
    for (const cta of entry.ctas) {
      if (cta.url) urls.add(cta.url);
    }
  }
  return urls;
}

// ---------------------------------------------------------------------------
// Plan matching
// ---------------------------------------------------------------------------

export function findPlanEntry(
  linkPlan: LinkPlanEntry[],
  article: ParsedArticle,
): LinkPlanEntry | null {
  // Match by slug against URL
  for (const entry of linkPlan) {
    const urlSlug = entry.url.replace(/\/$/, "").split("/").pop();
    if (urlSlug === article.slug) return entry;
  }
  // Match by title
  const titleLower = article.metadata.title.toLowerCase().trim();
  for (const entry of linkPlan) {
    if (entry.article.toLowerCase().trim() === titleLower) return entry;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Range check helper
// ---------------------------------------------------------------------------

function checkRange(
  value: number,
  range: { min: number; max: number },
  label: string,
  errors: string[],
  warnings: string[],
): void {
  if (range.max === 0 && range.min === 0) return; // not applicable
  if (value < range.min) {
    errors.push(`${label}: ${value} (min ${range.min})`);
  } else if (value > range.max) {
    warnings.push(`${label}: ${value} (max ${range.max})`);
  }
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

export function validateArticle(
  article: ParsedArticle,
  plan: LinkPlanEntry | null,
  urlRegistry: Set<string>,
  pageType: PageType,
  ctaCatalog?: CtaDefinition[],
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const c = pageType.constraints;

  // ----- Structural checks using PageType config -----
  checkRange(article.wordCount, c.wordCount, "Word count", errors, warnings);
  checkRange(article.h2Count, c.h2Count, "H2 count", errors, warnings);
  checkRange(article.ctaCount, c.ctaCount, "CTA count", errors, warnings);
  checkRange(article.imageCount, c.imageCount, "Image count", errors, warnings);
  checkRange(
    article.faqQuestionCount,
    c.faqQuestionCount,
    "FAQ questions",
    errors,
    warnings,
  );

  if (c.requiresTldr && !article.hasTldr) {
    errors.push("No TLDR section found (expected ## TLDR)");
  }

  if (c.requiresFaq && !article.hasFaq) {
    errors.push("No FAQ section found (expected ## FAQ heading)");
  }

  if (article.internalLinkCount < c.minInternalLinks) {
    errors.push(
      `Too few internal links: ${article.internalLinkCount} (min ${c.minInternalLinks})`,
    );
  }

  // ----- Plan-based checks -----
  if (!plan) {
    errors.push("Could not match article to any link plan entry");
    return { errors, warnings };
  }

  // Required links
  const allFoundUrls = new Set([
    ...article.links.map((l) => l.url),
    ...article.ctaComponents.filter((c) => c.href).map((c) => c.href!),
  ]);

  const missingLinks = plan.links.filter((l) => !allFoundUrls.has(l.url));
  if (missingLinks.length > 0) {
    errors.push(`Missing ${missingLinks.length} required links`);
    for (const ml of missingLinks) {
      errors.push(`  - ${ml.url} (type=${ml.type})`);
    }
  }

  // Required CTAs
  const missingCtas = plan.ctas.filter(
    (ct) => ct.url !== null && !allFoundUrls.has(ct.url!),
  );
  if (missingCtas.length > 0) {
    errors.push(`Missing ${missingCtas.length} required CTAs`);
    for (const mc of missingCtas) {
      errors.push(`  - ${mc.url} (type=${mc.type})`);
    }
  }

  // Unauthorized URLs
  for (const url of allFoundUrls) {
    if (url.startsWith("/")) {
      if (!urlRegistry.has(url)) errors.push(`Hallucinated internal URL: ${url}`);
    } else if (url.startsWith("http")) {
      if (!urlRegistry.has(url)) errors.push(`Unauthorized external URL: ${url}`);
    }
  }

  // ----- CTA title consistency against catalog -----
  if (ctaCatalog && ctaCatalog.length > 0) {
    for (const comp of article.ctaComponents) {
      if (!comp.title) continue;
      const compTitleLower = comp.title.toLowerCase();

      // Find matching catalog entry by type
      if (comp.type === "CourseCTA") {
        const courses = ctaCatalog.filter((d) => d.type === "course");
        const matched = courses.some((d) =>
          compTitleLower.includes(d.name.toLowerCase()),
        );
        if (!matched && courses.length > 0) {
          errors.push(
            `CourseCTA title "${comp.title}" doesn't match any catalog course`,
          );
        }
      }
      if (comp.type === "FreebieCTA") {
        const freebies = ctaCatalog.filter((d) => d.type === "freebie");
        const matched = freebies.some((d) =>
          compTitleLower.includes(d.name.toLowerCase()),
        );
        if (!matched && freebies.length > 0) {
          errors.push(
            `FreebieCTA title "${comp.title}" doesn't match any catalog freebie`,
          );
        }
      }
    }
  }

  // ----- Video promise check -----
  for (const comp of article.ctaComponents) {
    if (comp.body && comp.body.toLowerCase().includes("video")) {
      errors.push(
        "CTA body promises video (courses are text + audio + illustrations only)",
      );
    }
  }

  return { errors, warnings };
}

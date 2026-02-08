/**
 * Article validator — checks a parsed MDX article against its link plan.
 *
 * TypeScript port of validation checks from research/validate_article.py.
 * Returns { errors, warnings } arrays.
 */

import type {
  LinkPlanEntry,
  ParsedArticle,
  ValidationResult,
} from "./types";

// ---------------------------------------------------------------------------
// URL registry builder
// ---------------------------------------------------------------------------

export function buildUrlRegistry(linkPlan: LinkPlanEntry[]): Set<string> {
  const urls = new Set<string>();
  for (const entry of linkPlan) {
    urls.add(entry.url);
    for (const link of entry.links ?? []) {
      if (link.url) urls.add(link.url);
    }
    for (const cta of entry.ctas ?? []) {
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
// Validator
// ---------------------------------------------------------------------------

export function validateArticle(
  article: ParsedArticle,
  plan: LinkPlanEntry | null,
  urlRegistry: Set<string>,
  categoryCtas?: Record<
    string,
    { course_name: string; freebie_name: string }
  >,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const isPillar =
    plan?.links?.some((l) => l.type === "series_preview") ?? false;

  // ----- Word count -----
  if (isPillar) {
    if (article.wordCount < 2500)
      errors.push(
        `Pillar article too short: ${article.wordCount} words (min 2,500)`,
      );
    else if (article.wordCount > 4000)
      warnings.push(
        `Pillar article long: ${article.wordCount} words (target max 3,500)`,
      );
  } else {
    if (article.wordCount < 1600)
      errors.push(
        `Article too short: ${article.wordCount} words (min 1,800)`,
      );
    else if (article.wordCount < 1800)
      warnings.push(
        `Article slightly short: ${article.wordCount} words (target 1,800-2,200)`,
      );
    else if (article.wordCount > 2400)
      warnings.push(
        `Article long: ${article.wordCount} words (target 1,800-2,200)`,
      );
  }

  // ----- Heading count -----
  if (article.h2Count < 3)
    warnings.push(`Only ${article.h2Count} H2 sections (target 5-8)`);

  // ----- TLDR -----
  if (!article.hasTldr) errors.push("No TLDR section found (expected ## TLDR)");

  // ----- FAQ -----
  if (!article.hasFaq) {
    errors.push("No FAQ section found (expected ## FAQ heading)");
  } else {
    if (article.faqQuestionCount < 3)
      errors.push(
        `Too few FAQ questions: ${article.faqQuestionCount} (min 3)`,
      );
    else if (article.faqQuestionCount > 7)
      warnings.push(
        `Many FAQ questions: ${article.faqQuestionCount} (target 3-5)`,
      );
  }

  // ----- CTA components -----
  if (article.ctaCount < 3)
    errors.push(
      `Too few CTA components: ${article.ctaCount} (need exactly 3)`,
    );
  else if (article.ctaCount > 3)
    warnings.push(
      `Too many CTA components: ${article.ctaCount} (target exactly 3)`,
    );

  // ----- Image placeholders -----
  if (article.imageCount < 3)
    errors.push(
      `Too few image placeholders: ${article.imageCount} (need exactly 3)`,
    );
  else if (article.imageCount > 3)
    warnings.push(
      `Too many image placeholders: ${article.imageCount} (target exactly 3)`,
    );

  // ----- Internal links -----
  if (!isPillar) {
    if (article.internalLinkCount < 5)
      errors.push(
        `Too few internal links: ${article.internalLinkCount} (min 5)`,
      );
    else if (article.internalLinkCount > 15)
      warnings.push(
        `Many internal links: ${article.internalLinkCount} (target 5-10)`,
      );
  }

  if (!plan) {
    errors.push("Could not match article to any link plan entry");
    return { errors, warnings };
  }

  // ----- Required links from plan -----
  const allFoundUrls = new Set([
    ...article.links.map((l) => l.url),
    ...article.ctaComponents.filter((c) => c.href).map((c) => c.href!),
  ]);

  const missingLinks = (plan.links ?? []).filter(
    (l) => !allFoundUrls.has(l.url),
  );
  if (missingLinks.length > 0) {
    errors.push(`Missing ${missingLinks.length} required links`);
    for (const ml of missingLinks) {
      errors.push(`  - ${ml.url} (type=${ml.type})`);
    }
  }

  // ----- Required CTAs from plan -----
  const missingCtas = (plan.ctas ?? []).filter(
    (c) => c.url !== null && !allFoundUrls.has(c.url!),
  );
  if (missingCtas.length > 0) {
    errors.push(`Missing ${missingCtas.length} required CTAs`);
    for (const mc of missingCtas) {
      errors.push(`  - ${mc.url} (type=${mc.type})`);
    }
  }

  // ----- Unauthorized URLs -----
  for (const url of allFoundUrls) {
    if (url.startsWith("/")) {
      if (!urlRegistry.has(url))
        errors.push(`Hallucinated internal URL: ${url}`);
    } else if (url.startsWith("http")) {
      if (!urlRegistry.has(url))
        errors.push(`Unauthorized external URL: ${url}`);
    }
  }

  // ----- CTA title consistency -----
  if (categoryCtas) {
    const catSlug = article.metadata.category?.toLowerCase().replace(/ /g, "-") ?? "";
    // Also try deriving from plan URL
    const planParts = plan.url.replace(/^\/|\/$/g, "").split("/");
    const planCatSlug =
      planParts[0] === "blog" && planParts.length > 1
        ? (planParts[1] ?? "")
        : (planParts[0] ?? "");
    const catCta = categoryCtas[catSlug] ?? categoryCtas[planCatSlug];

    if (catCta) {
      for (const comp of article.ctaComponents) {
        if (comp.type === "CourseCTA" && comp.title) {
          if (
            !comp.title.toLowerCase().includes(catCta.course_name.toLowerCase())
          ) {
            errors.push(
              `CourseCTA title "${comp.title}" doesn't match canonical "${catCta.course_name}"`,
            );
          }
        }
        if (comp.type === "FreebieCTA" && comp.title) {
          if (
            !comp.title
              .toLowerCase()
              .includes(catCta.freebie_name.toLowerCase())
          ) {
            errors.push(
              `FreebieCTA title "${comp.title}" doesn't match canonical "${catCta.freebie_name}"`,
            );
          }
        }
      }
    }
  }

  // ----- Video promise check -----
  for (const comp of article.ctaComponents) {
    if (comp.body && comp.body.toLowerCase().includes("video")) {
      errors.push(
        `CTA body promises video (courses are text + audio + illustrations only)`,
      );
    }
  }

  return { errors, warnings };
}

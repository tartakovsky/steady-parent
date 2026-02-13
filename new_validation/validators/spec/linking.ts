/**
 * Linking spec validator — Zod schemas + structural checks for spec/linking.json.
 *
 * Two layers:
 * 1. Zod schemas validate each entry's shape (link/CTA fields, type enums,
 *    URL formats). No external data needed.
 * 2. validateLinking() checks structural invariants within the linking spec
 *    (duplicate URLs, CTA coverage, URL formats).
 * 3. validateLinkingCrossRefs() checks against taxonomy (URL resolution,
 *    completeness, type consistency).
 *
 * The Zod schemas are the SINGLE SOURCE OF TRUTH for all linking validation rules.
 */

import { z } from "zod/v4";
import { SlugSchema } from "./shared";
import type { TaxonomySpec, ValidationIssue } from "./taxonomy";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const COMMUNITY_URL = "https://www.skool.com/steady-parent-1727";

// ---------------------------------------------------------------------------
// Link type enums
// ---------------------------------------------------------------------------

const LinkTypeEnum = z.enum([
  "series_preview",
  "pillar",
  "next",
  "prev",
  "cross",
  "sibling",
  "quiz",
]);

const CtaTypeEnum = z.enum(["course", "community", "freebie"]);

// ---------------------------------------------------------------------------
// Link schema
// ---------------------------------------------------------------------------

const LinkSchema = z.object({
  url: z.string().min(1),
  type: LinkTypeEnum,
  intent: z.string().min(1),
});

// ---------------------------------------------------------------------------
// CTA placement schema (url is nullable for freebies)
// ---------------------------------------------------------------------------

const CtaPlacementSchema = z.object({
  url: z.string().nullable(),
  type: CtaTypeEnum,
  intent: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Article link plan
// ---------------------------------------------------------------------------

const ArticleLinkPlanSchema = z.object({
  links: z.array(LinkSchema).min(1),
  ctas: z.array(CtaPlacementSchema),
});

// ---------------------------------------------------------------------------
// Top-level spec schema
// ---------------------------------------------------------------------------

export const LinkingSpecSchema = z
  .record(
    SlugSchema,
    z.record(
      z.union([SlugSchema, z.literal("")]),
      ArticleLinkPlanSchema,
    ),
  )
  .meta({
    id: "linking-spec",
    title: "Linking Spec",
    description:
      "Per-article link plans: internal links and CTA placements for every article.",
  });

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type LinkingSpec = z.infer<typeof LinkingSpecSchema>;

// Re-export leaf schemas for admin UI introspection
export {
  LinkTypeEnum,
  CtaTypeEnum,
  LinkSchema,
  CtaPlacementSchema,
  ArticleLinkPlanSchema,
};

// ---------------------------------------------------------------------------
// Structural validation (no taxonomy needed)
// ---------------------------------------------------------------------------

export function validateLinking(spec: LinkingSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [catSlug, articles] of Object.entries(spec)) {
    for (const [articleKey, plan] of Object.entries(articles)) {
      const path = articleKey === "" ? `${catSlug}/` : `${catSlug}/${articleKey}`;

      // 1. All link URLs must start with /blog/ or /quiz/ and have trailing slash
      for (let i = 0; i < plan.links.length; i++) {
        const url = plan.links[i].url;
        if (!url.startsWith("/blog/") && !url.startsWith("/quiz/")) {
          issues.push({
            path: `${path}/links[${i}]`,
            message: `URL must start with /blog/ or /quiz/, got "${url}"`,
          });
        }
        if (!url.endsWith("/")) {
          issues.push({
            path: `${path}/links[${i}]`,
            message: `URL must have trailing slash, got "${url}"`,
          });
        }
      }

      // 2. No duplicate link URLs per article
      const seenUrls = new Set<string>();
      for (let i = 0; i < plan.links.length; i++) {
        const url = plan.links[i].url;
        if (seenUrls.has(url)) {
          issues.push({
            path: `${path}/links[${i}]`,
            message: `duplicate link URL "${url}"`,
          });
        }
        seenUrls.add(url);
      }

      // 3. Exactly 3 CTAs: one each of course, community, freebie
      const ctaTypes = plan.ctas.map((c) => c.type);
      for (const required of ["course", "community", "freebie"] as const) {
        const count = ctaTypes.filter((t) => t === required).length;
        if (count === 0) {
          issues.push({
            path: `${path}/ctas`,
            message: `missing "${required}" CTA`,
          });
        } else if (count > 1) {
          issues.push({
            path: `${path}/ctas`,
            message: `${count} "${required}" CTAs (expected 1)`,
          });
        }
      }
      if (plan.ctas.length !== 3) {
        issues.push({
          path: `${path}/ctas`,
          message: `expected 3 CTAs, got ${plan.ctas.length}`,
        });
      }

      // 4. Community CTA URL must be the Skool constant
      for (let i = 0; i < plan.ctas.length; i++) {
        const cta = plan.ctas[i];
        if (cta.type === "community" && cta.url !== COMMUNITY_URL) {
          issues.push({
            path: `${path}/ctas[${i}]`,
            message: `community URL must be "${COMMUNITY_URL}", got "${cta.url}"`,
          });
        }
      }

      // 5. Freebie CTA URL must be null
      for (let i = 0; i < plan.ctas.length; i++) {
        const cta = plan.ctas[i];
        if (cta.type === "freebie" && cta.url !== null) {
          issues.push({
            path: `${path}/ctas[${i}]`,
            message: `freebie URL must be null, got "${cta.url}"`,
          });
        }
      }

      // 6. Course CTA URL must match /course/{slug}/ pattern
      for (let i = 0; i < plan.ctas.length; i++) {
        const cta = plan.ctas[i];
        if (
          cta.type === "course" &&
          (cta.url === null ||
            !/^\/course\/[a-z0-9]+(-[a-z0-9]+)*\/$/.test(cta.url))
        ) {
          issues.push({
            path: `${path}/ctas[${i}]`,
            message: `course URL must match /course/{slug}/, got "${cta.url}"`,
          });
        }
      }
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Cross-reference validation (needs taxonomy)
// ---------------------------------------------------------------------------

export function validateLinkingCrossRefs(
  spec: LinkingSpec,
  taxonomy: TaxonomySpec,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const catSlugs = new Set(Object.keys(taxonomy.categories));

  // Build URL → entry lookup from taxonomy
  const validArticleUrls = new Set<string>();
  const validQuizUrls = new Set<string>();
  const articlePageTypes = new Map<string, string>(); // url → pageType

  for (const [catSlug, articles] of Object.entries(taxonomy.blog)) {
    for (const [articleKey, article] of Object.entries(articles)) {
      validArticleUrls.add(article.url);
      articlePageTypes.set(article.url, article.pageType);
    }
  }
  for (const [, quiz] of Object.entries(taxonomy.quiz)) {
    validQuizUrls.add(quiz.url);
  }

  // Course URL per category
  const courseByCat = new Map<string, string>();
  for (const [, course] of Object.entries(taxonomy.course)) {
    courseByCat.set(course.categorySlug, course.url);
  }

  // --- Spec → Taxonomy (no orphans) ---

  for (const [catSlug, articles] of Object.entries(spec)) {
    if (!catSlugs.has(catSlug)) {
      issues.push({
        path: catSlug,
        message: `category "${catSlug}" not in taxonomy`,
      });
      continue;
    }

    const taxArticles = taxonomy.blog[catSlug];
    if (!taxArticles) continue;

    for (const [articleKey, plan] of Object.entries(articles)) {
      const path =
        articleKey === "" ? `${catSlug}/` : `${catSlug}/${articleKey}`;

      // Article must exist in taxonomy
      if (!(articleKey in taxArticles)) {
        issues.push({
          path,
          message: `article key "${articleKey}" not in taxonomy under "${catSlug}"`,
        });
        continue;
      }

      // Every link URL must resolve to a valid article or quiz
      for (let i = 0; i < plan.links.length; i++) {
        const url = plan.links[i].url;
        if (!validArticleUrls.has(url) && !validQuizUrls.has(url)) {
          issues.push({
            path: `${path}/links[${i}]`,
            message: `URL "${url}" does not resolve to any article or quiz in taxonomy`,
          });
        }
      }

      // Course CTA URL must match the category's course
      const expectedCourseUrl = courseByCat.get(catSlug);
      for (let i = 0; i < plan.ctas.length; i++) {
        const cta = plan.ctas[i];
        if (cta.type === "course" && expectedCourseUrl && cta.url !== expectedCourseUrl) {
          issues.push({
            path: `${path}/ctas[${i}]`,
            message: `course CTA URL "${cta.url}" does not match category course "${expectedCourseUrl}"`,
          });
        }
      }

      // Link type consistency checks
      const thisArticleUrl =
        articleKey === ""
          ? `/blog/${catSlug}/`
          : `/blog/${catSlug}/${articleKey}/`;
      const thisPageType = articlePageTypes.get(thisArticleUrl);

      for (let i = 0; i < plan.links.length; i++) {
        const link = plan.links[i];
        const targetPageType = articlePageTypes.get(link.url);

        // "pillar" links must point to a pillar article
        if (link.type === "pillar" && targetPageType && targetPageType !== "pillar") {
          issues.push({
            path: `${path}/links[${i}]`,
            message: `"pillar" link points to ${targetPageType} page, expected pillar`,
          });
        }

        // "series_preview" links should come from pillar/catalog pages and point to series articles
        if (link.type === "series_preview") {
          if (thisPageType && thisPageType !== "pillar" && thisPageType !== "catalog") {
            issues.push({
              path: `${path}/links[${i}]`,
              message: `"series_preview" link on ${thisPageType} page (expected pillar or catalog)`,
            });
          }
          if (targetPageType && targetPageType !== "series") {
            issues.push({
              path: `${path}/links[${i}]`,
              message: `"series_preview" link points to ${targetPageType} page, expected series`,
            });
          }
        }

        // "prev"/"next" links must point to series articles in the same category
        if (link.type === "prev" || link.type === "next") {
          if (link.url.startsWith("/blog/")) {
            const targetParts = link.url.replace(/^\/|\/$/g, "").split("/");
            if (targetParts.length >= 2 && targetParts[1] !== catSlug) {
              issues.push({
                path: `${path}/links[${i}]`,
                message: `"${link.type}" link crosses category boundary (${catSlug} → ${targetParts[1]})`,
              });
            }
          }
        }
      }
    }
  }

  // --- Taxonomy → Spec (completeness) ---

  for (const [catSlug, articles] of Object.entries(taxonomy.blog)) {
    const specCat = spec[catSlug];
    for (const articleKey of Object.keys(articles)) {
      if (!specCat || !(articleKey in specCat)) {
        const path =
          articleKey === "" ? `${catSlug}/` : `${catSlug}/${articleKey}`;
        issues.push({
          path,
          message: `missing link plan entry (exists in taxonomy but not in linking spec)`,
        });
      }
    }
  }

  return issues;
}

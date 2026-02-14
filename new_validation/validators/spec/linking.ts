/**
 * Linking spec validator — Zod schemas + structural checks for spec/linking.json.
 *
 * Two layers:
 * 1. Zod schemas validate each entry's shape (link/CTA/mailing fields).
 *    No external data needed.
 * 2. validateLinking() checks structural invariants within the linking spec
 *    (per-page-type CTA/mailing rules, URL formats, duplicate links).
 *
 * Cross-reference validation lives in linking-cross-ref.ts (separate file).
 *
 * Links have NO type field — navigation structure is inferred from URLs
 * during cross-ref validation against taxonomy.
 */

import { z } from "zod/v4";
import { SlugSchema, wc } from "./shared";
import type { ValidationIssue } from "./taxonomy";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const COMMUNITY_URL = "https://www.skool.com/steady-parent-1727";

// ---------------------------------------------------------------------------
// Link schema (url + intent only, no type)
// ---------------------------------------------------------------------------

const LinkSchema = z.object({
  url: z.string().min(1),
  intent: z.string().min(1),
});

// ---------------------------------------------------------------------------
// CTA placement schema
// ---------------------------------------------------------------------------

const CtaTypeEnum = z.enum(["course", "community"]);

const CtaPlacementSchema = z.object({
  url: z.string().min(1),
  type: CtaTypeEnum,
  intent: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Mailing reference schema (nullable)
// ---------------------------------------------------------------------------

const MailingTypeEnum = z.enum(["freebie", "quiz-gate", "waitlist"]);

const MailingRefSchema = z.object({
  type: MailingTypeEnum,
  intent: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Page link plan — every entry has links, ctas, mailing
// ---------------------------------------------------------------------------

const PageLinkPlanSchema = z.object({
  links: z.array(LinkSchema),
  ctas: z.array(CtaPlacementSchema),
  mailing: MailingRefSchema.nullable(),
});

// ---------------------------------------------------------------------------
// Top-level spec schema — three sections
// ---------------------------------------------------------------------------

const KeySchema = z.union([SlugSchema, z.literal("")]);

export const LinkingSpecSchema = z
  .object({
    blog: z.record(SlugSchema, z.record(KeySchema, PageLinkPlanSchema)),
    quiz: z.record(KeySchema, PageLinkPlanSchema),
    course: z.record(KeySchema, PageLinkPlanSchema),
  })
  .meta({
    id: "linking-spec",
    title: "Linking Spec",
    description:
      "Per-page link plans, CTA placements, and mailing references for every page on the site.",
  });

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type LinkingSpec = z.infer<typeof LinkingSpecSchema>;

// Re-export leaf schemas for admin UI introspection
export {
  LinkSchema,
  CtaTypeEnum,
  CtaPlacementSchema,
  MailingTypeEnum,
  MailingRefSchema,
  PageLinkPlanSchema,
};

// ---------------------------------------------------------------------------
// Structural validation (no taxonomy needed)
// ---------------------------------------------------------------------------

/**
 * Infer page type from section + key.
 *
 * Blog: "" = catalog, "guide" = pillar, other = series
 * Quiz/Course: "" = catalog, other = page
 */
type BlogPageType = "catalog" | "pillar" | "series";
type SectionPageType = "catalog" | "page";

function blogPageType(key: string): BlogPageType {
  if (key === "") return "catalog";
  if (key === "guide") return "pillar";
  return "series";
}

function sectionPageType(key: string): SectionPageType {
  return key === "" ? "catalog" : "page";
}

/** Derive the canonical URL for a page from its keys. */
function blogUrl(cat: string, key: string): string {
  return key === "" ? `/blog/${cat}/` : `/blog/${cat}/${key}/`;
}

function quizUrl(key: string): string {
  return key === "" ? "/quiz/" : `/quiz/${key}/`;
}

function courseUrl(key: string): string {
  return key === "" ? "/course/" : `/course/${key}/`;
}

export function validateLinking(spec: LinkingSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // =========================================================================
  // Blog section
  // =========================================================================

  for (const [cat, articles] of Object.entries(spec.blog)) {
    for (const [key, plan] of Object.entries(articles)) {
      const path = key === "" ? `blog/${cat}/` : `blog/${cat}/${key}`;
      const pt = blogPageType(key);
      const selfUrl = blogUrl(cat, key);

      // --- URL checks ---
      validateLinkUrls(plan, path, selfUrl, issues);

      // --- CTA rules ---
      const ctaTypes = plan.ctas.map((c) => c.type);

      if (pt === "catalog") {
        // 1 CTA: community
        expectCtaSet(ctaTypes, ["community"], path, issues);
      } else {
        // pillar + series: 2 CTAs: course + community
        expectCtaSet(ctaTypes, ["community", "course"], path, issues);
      }

      validateCtaUrls(plan, path, issues);

      // --- Mailing rules ---
      if (pt === "catalog") {
        if (plan.mailing !== null) {
          issues.push({
            path: `${path}/mailing`,
            message: "catalog page must have mailing: null",
          });
        }
      } else {
        if (!plan.mailing || plan.mailing.type !== "freebie") {
          issues.push({
            path: `${path}/mailing`,
            message: 'must have mailing type "freebie"',
          });
        }
      }

      // --- Intent quality ---
      validateIntents(plan, path, issues);

      // --- Cross-category diversity (pillar + series only) ---
      if (pt !== "catalog") {
        const hasCrossCat = plan.links.some((link) => {
          const parts = link.url.replace(/^\/|\/$/g, "").split("/");
          // Link to /blog/{other-cat}/... counts as cross-category
          if (parts[0] === "blog" && parts.length >= 2 && parts[1] !== cat)
            return true;
          // Link to /quiz/ or /course/ is always cross-section
          if (parts[0] === "quiz" || parts[0] === "course") return true;
          return false;
        });
        if (!hasCrossCat) {
          issues.push({
            path: `${path}/links`,
            message:
              "must include at least 1 cross-category or cross-section link",
          });
        }
      }
    }

    // --- Course CTA consistency within category ---
    const courseCtaUrls = new Set<string>();
    for (const [key, plan] of Object.entries(articles)) {
      for (const cta of plan.ctas) {
        if (cta.type === "course") courseCtaUrls.add(cta.url);
      }
    }
    if (courseCtaUrls.size > 1) {
      issues.push({
        path: `blog/${cat}/ctas`,
        message: `inconsistent course CTA URLs within category: ${[...courseCtaUrls].join(", ")}`,
      });
    }
  }

  // =========================================================================
  // Quiz section
  // =========================================================================

  for (const [key, plan] of Object.entries(spec.quiz)) {
    const path = key === "" ? "quiz/" : `quiz/${key}`;
    const pt = sectionPageType(key);
    const selfUrl = quizUrl(key);

    validateLinkUrls(plan, path, selfUrl, issues);

    validateIntents(plan, path, issues);

    if (pt === "catalog") {
      expectCtaSet(plan.ctas.map((c) => c.type), [], path, issues);
      if (plan.mailing !== null) {
        issues.push({
          path: `${path}/mailing`,
          message: "catalog page must have mailing: null",
        });
      }
    } else {
      expectCtaSet(plan.ctas.map((c) => c.type), ["community"], path, issues);
      validateCtaUrls(plan, path, issues);
      if (!plan.mailing || plan.mailing.type !== "quiz-gate") {
        issues.push({
          path: `${path}/mailing`,
          message: 'must have mailing type "quiz-gate"',
        });
      }
      if (plan.links.length < 1) {
        issues.push({
          path: `${path}/links`,
          message: "quiz page must have at least 1 link",
        });
      }
    }
  }

  // =========================================================================
  // Course section
  // =========================================================================

  for (const [key, plan] of Object.entries(spec.course)) {
    const path = key === "" ? "course/" : `course/${key}`;
    const pt = sectionPageType(key);
    const selfUrl = courseUrl(key);

    validateLinkUrls(plan, path, selfUrl, issues);
    validateIntents(plan, path, issues);

    if (pt === "catalog") {
      expectCtaSet(plan.ctas.map((c) => c.type), [], path, issues);
      if (plan.mailing !== null) {
        issues.push({
          path: `${path}/mailing`,
          message: "catalog page must have mailing: null",
        });
      }
    } else {
      expectCtaSet(plan.ctas.map((c) => c.type), [], path, issues);
      if (!plan.mailing || plan.mailing.type !== "waitlist") {
        issues.push({
          path: `${path}/mailing`,
          message: 'must have mailing type "waitlist"',
        });
      }
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateLinkUrls(
  plan: z.infer<typeof PageLinkPlanSchema>,
  path: string,
  selfUrl: string,
  issues: ValidationIssue[],
) {
  const seen = new Set<string>();

  for (let i = 0; i < plan.links.length; i++) {
    const url = plan.links[i].url;

    // Trailing slash
    if (!url.endsWith("/")) {
      issues.push({
        path: `${path}/links[${i}]`,
        message: `URL must have trailing slash, got "${url}"`,
      });
    }

    // Duplicate
    if (seen.has(url)) {
      issues.push({
        path: `${path}/links[${i}]`,
        message: `duplicate link URL "${url}"`,
      });
    }
    seen.add(url);

    // Self-link
    if (url === selfUrl) {
      issues.push({
        path: `${path}/links[${i}]`,
        message: `self-link to "${url}"`,
      });
    }
  }
}

function expectCtaSet(
  actual: string[],
  expected: string[],
  path: string,
  issues: ValidationIssue[],
) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();

  if (sortedActual.length !== sortedExpected.length) {
    issues.push({
      path: `${path}/ctas`,
      message: `expected ${sortedExpected.length} CTAs [${sortedExpected.join(", ")}], got ${sortedActual.length} [${sortedActual.join(", ")}]`,
    });
    return;
  }

  for (let i = 0; i < sortedActual.length; i++) {
    if (sortedActual[i] !== sortedExpected[i]) {
      issues.push({
        path: `${path}/ctas`,
        message: `expected CTAs [${sortedExpected.join(", ")}], got [${sortedActual.join(", ")}]`,
      });
      return;
    }
  }

  // Check for duplicates within actual
  const ctaCounts = new Map<string, number>();
  for (const t of actual) {
    ctaCounts.set(t, (ctaCounts.get(t) ?? 0) + 1);
  }
  for (const [t, count] of ctaCounts) {
    if (count > 1) {
      issues.push({
        path: `${path}/ctas`,
        message: `duplicate "${t}" CTA (${count} found)`,
      });
    }
  }
}

const MIN_INTENT_WORDS = 5;

function validateIntents(
  plan: z.infer<typeof PageLinkPlanSchema>,
  path: string,
  issues: ValidationIssue[],
) {
  // Min word count
  for (let i = 0; i < plan.links.length; i++) {
    const words = wc(plan.links[i].intent);
    if (words < MIN_INTENT_WORDS) {
      issues.push({
        path: `${path}/links[${i}]`,
        message: `intent must be at least ${MIN_INTENT_WORDS} words, got ${words}: "${plan.links[i].intent}"`,
      });
    }
  }

  // No duplicate intents within a page
  const seenIntents = new Set<string>();
  for (let i = 0; i < plan.links.length; i++) {
    const intent = plan.links[i].intent;
    if (seenIntents.has(intent)) {
      issues.push({
        path: `${path}/links[${i}]`,
        message: `duplicate intent: "${intent}"`,
      });
    }
    seenIntents.add(intent);
  }
}

function validateCtaUrls(
  plan: z.infer<typeof PageLinkPlanSchema>,
  path: string,
  issues: ValidationIssue[],
) {
  for (let i = 0; i < plan.ctas.length; i++) {
    const cta = plan.ctas[i];

    if (cta.type === "community" && cta.url !== COMMUNITY_URL) {
      issues.push({
        path: `${path}/ctas[${i}]`,
        message: `community URL must be "${COMMUNITY_URL}", got "${cta.url}"`,
      });
    }

    if (
      cta.type === "course" &&
      !/^\/course\/[a-z0-9]+(-[a-z0-9]+)*\/$/.test(cta.url)
    ) {
      issues.push({
        path: `${path}/ctas[${i}]`,
        message: `course URL must match /course/{slug}/, got "${cta.url}"`,
      });
    }
  }
}

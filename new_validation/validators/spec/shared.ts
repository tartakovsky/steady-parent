/**
 * Shared constants, types, and helpers used by all spec validators.
 */

import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Shared schemas
// ---------------------------------------------------------------------------

/** Valid URL path segment: lowercase alphanumeric + hyphens, no leading/trailing hyphens */
export const SlugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "must be a valid URL slug (lowercase alphanumeric + hyphens)",
  );

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FORBIDDEN_TERMS = [
  "weekly expert q&as",
  "live coaching calls",
  "video content",
  "1-on-1 access",
  "guaranteed response times",
] as const;

// ---------------------------------------------------------------------------
// Cross-reference types
// ---------------------------------------------------------------------------

export interface CrossRefIssue {
  path: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * Taxonomy shape — minimal interface for what cross-ref validators need.
 * Will be replaced by the real taxonomy schema once spec/taxonomy.json is built.
 */
export interface TaxonomyForCrossRef {
  categories: { slug: string; name: string }[];
  entries: { slug: string; categorySlug: string; title: string }[];
  /** Course name per category slug */
  courses?: Map<string, { name: string; url: string }>;
  quizzes: { slug: string; title: string }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function wc(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

export function checkWordCount(
  val: string,
  field: string,
  min: number,
  max: number,
  ctx: z.RefinementCtx,
) {
  const count = wc(val);
  if (count < min || count > max) {
    ctx.addIssue({
      code: "custom",
      path: [field],
      message: `must be ${min}-${max} words, got ${count}`,
    });
  }
}

export function checkCleanText(
  fields: Record<string, string>,
  ctx: z.RefinementCtx,
) {
  const allText = Object.values(fields).join(" ");

  if (allText.includes("!")) {
    ctx.addIssue({
      code: "custom",
      message: "contains exclamation mark",
    });
  }

  const lower = allText.toLowerCase();
  for (const term of FORBIDDEN_TERMS) {
    if (lower.includes(term)) {
      ctx.addIssue({
        code: "custom",
        message: `contains forbidden term "${term}"`,
      });
    }
  }
}

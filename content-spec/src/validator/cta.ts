/**
 * CTA catalog validator — checks business rules beyond what the Zod schema catches.
 *
 * Validates:
 * - Per-category community entries have cta_copy with correct field lengths
 * - cta_copy.body mentions founder presence
 * - No exclamation marks or forbidden terms
 * - Category coverage (every taxonomy category has community + course + freebie)
 *
 * Returns { errors, warnings } — same pattern as quiz and article validators.
 */

import type { CtaCatalog } from "../types";

const FORBIDDEN_TERMS = [
  "weekly expert q&as",
  "live coaching calls",
  "video content",
  "1-on-1 access",
  "guaranteed response times",
];

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

interface CtaValidationResult {
  errors: string[];
  warnings: string[];
}

/**
 * Validate the full CTA catalog.
 * @param catalog  Parsed CTA catalog (already Zod-valid)
 * @param categorySlugs  Optional list of category slugs for coverage checks
 */
export function validateCtaCatalog(
  catalog: CtaCatalog,
  categorySlugs?: string[],
): CtaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const globalCommunity = catalog.find(
    (c) => c.type === "community" && c.id === "community",
  );
  const perCatCommunities = catalog.filter(
    (c) => c.type === "community" && c.id !== "community",
  );
  const courses = catalog.filter((c) => c.type === "course");
  const freebies = catalog.filter((c) => c.type === "freebie");

  // --- Global community checks ---
  if (!globalCommunity) {
    errors.push("Missing global community entry (id: \"community\")");
  } else {
    if (!globalCommunity.founder_presence) {
      warnings.push("Global community entry missing founder_presence");
    }
    if (globalCommunity.cant_promise.length === 0) {
      warnings.push("Global community entry has empty cant_promise list");
    }
  }

  // --- Per-category community entry checks ---
  for (const entry of perCatCommunities) {
    const slug = entry.id.replace(/^community-/, "");
    const prefix = `community-${slug}`;

    // Must have cta_copy
    if (!entry.cta_copy) {
      errors.push(`${prefix}: missing cta_copy (eyebrow, title, body, buttonText required)`);
      continue;
    }

    const { eyebrow, title, body, buttonText } = entry.cta_copy;

    // Word count checks
    const eyebrowWc = wordCount(eyebrow);
    if (eyebrowWc < 2 || eyebrowWc > 5) {
      errors.push(`${prefix}: eyebrow "${eyebrow}" is ${eyebrowWc} words (must be 2-5)`);
    }

    const titleWc = wordCount(title);
    if (titleWc < 5 || titleWc > 12) {
      errors.push(`${prefix}: title is ${titleWc} words (must be 5-12)`);
    }

    const bodyWc = wordCount(body);
    if (bodyWc < 15 || bodyWc > 30) {
      errors.push(`${prefix}: body is ${bodyWc} words (must be 15-30)`);
    }

    const btnWc = wordCount(buttonText);
    if (btnWc < 2 || btnWc > 5) {
      errors.push(`${prefix}: buttonText "${buttonText}" is ${btnWc} words (must be 2-5)`);
    }

    // what_it_is word count
    const witWc = wordCount(entry.what_it_is);
    if (witWc < 15 || witWc > 30) {
      errors.push(`${prefix}: what_it_is is ${witWc} words (must be 15-30)`);
    }

    // Founder mention in body
    if (!/founder/i.test(body)) {
      errors.push(`${prefix}: cta_copy.body must mention founders`);
    }

    // No exclamation marks
    const allText = [entry.what_it_is, eyebrow, title, body, buttonText].join(" ");
    if (allText.includes("!")) {
      errors.push(`${prefix}: contains exclamation mark`);
    }

    // No forbidden terms
    const lowerText = allText.toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
      if (lowerText.includes(term)) {
        errors.push(`${prefix}: contains forbidden term "${term}"`);
      }
    }

    // can_promise and cant_promise should be empty
    if (entry.can_promise.length > 0) {
      warnings.push(`${prefix}: can_promise should be empty for per-category entries`);
    }
    if (entry.cant_promise.length > 0) {
      warnings.push(`${prefix}: cant_promise should be empty for per-category entries`);
    }
  }

  // --- Coverage checks (if category slugs provided) ---
  if (categorySlugs) {
    const communitySlugSet = new Set(
      perCatCommunities.map((c) => c.id.replace(/^community-/, "")),
    );
    const courseSlugSet = new Set(
      courses.map((c) => c.id.replace(/^course-/, "")),
    );
    const freebieSlugSet = new Set(
      freebies.map((c) => c.id.replace(/^freebie-/, "")),
    );

    for (const slug of categorySlugs) {
      if (!communitySlugSet.has(slug)) {
        errors.push(`Missing per-category community entry for "${slug}"`);
      }
      if (!courseSlugSet.has(slug)) {
        errors.push(`Missing course entry for "${slug}"`);
      }
      if (!freebieSlugSet.has(slug)) {
        errors.push(`Missing freebie entry for "${slug}"`);
      }
    }

    // Check for orphan entries (slugs not in taxonomy)
    const slugSet = new Set(categorySlugs);
    for (const slug of communitySlugSet) {
      if (!slugSet.has(slug)) {
        warnings.push(`Community entry "community-${slug}" doesn't match any taxonomy category`);
      }
    }
    for (const slug of courseSlugSet) {
      if (!slugSet.has(slug)) {
        warnings.push(`Course entry "course-${slug}" doesn't match any taxonomy category`);
      }
    }
  }

  return { errors, warnings };
}

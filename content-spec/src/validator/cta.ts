/**
 * CTA catalog validator — checks business rules beyond what the Zod schema catches.
 *
 * Validates:
 * - All per-category entries (community, course, freebie) have cta_copy
 * - Community: buttonText = "Join the community", body includes founder line
 * - Course/freebie: title contains the product name
 * - Word count constraints on eyebrow, title, body
 * - No exclamation marks or forbidden terms
 * - Category coverage (every taxonomy category has community + course + freebie)
 *
 * Returns { errors, warnings } — same pattern as quiz and article validators.
 */

import type { CtaCatalog } from "../types";

export const FORBIDDEN_TERMS = [
  "weekly expert q&as",
  "live coaching calls",
  "video content",
  "1-on-1 access",
  "guaranteed response times",
];

export const COMMUNITY_BUTTON_TEXT = "Join the community";
export const COMMUNITY_FOUNDER_LINE = "We are there with you daily too";
export const PREVIEW_BUTTON_TEXT = "Send my results";
export const WAITLIST_BUTTON_TEXT = "Reserve your spot";

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

interface CtaValidationResult {
  errors: string[];
  warnings: string[];
}

/**
 * Validate cta_copy fields shared by all entry types.
 * Returns errors for the given prefix.
 */
function validateCtaCopy(
  prefix: string,
  eyebrow: string,
  title: string,
  body: string,
  _buttonText: string,
): string[] {
  const errs: string[] = [];

  // Eyebrow: 2-5 words
  const eyebrowWc = wordCount(eyebrow);
  if (eyebrowWc < 2 || eyebrowWc > 5) {
    errs.push(`${prefix}: eyebrow "${eyebrow}" is ${eyebrowWc} words (must be 2-5)`);
  }

  // Title: 3-12 words
  const titleWc = wordCount(title);
  if (titleWc < 3 || titleWc > 12) {
    errs.push(`${prefix}: title is ${titleWc} words (must be 3-12)`);
  }

  // Body: 8-35 words
  const bodyWc = wordCount(body);
  if (bodyWc < 8 || bodyWc > 35) {
    errs.push(`${prefix}: body is ${bodyWc} words (must be 8-35)`);
  }

  // No exclamation marks
  const allText = [eyebrow, title, body, _buttonText].join(" ");
  if (allText.includes("!")) {
    errs.push(`${prefix}: contains exclamation mark`);
  }

  // No forbidden terms
  const lowerText = allText.toLowerCase();
  for (const term of FORBIDDEN_TERMS) {
    if (lowerText.includes(term)) {
      errs.push(`${prefix}: contains forbidden term "${term}"`);
    }
  }

  return errs;
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

    if (!entry.cta_copy) {
      errors.push(`${prefix}: missing cta_copy`);
      continue;
    }

    const { eyebrow, title, body, buttonText } = entry.cta_copy;

    // Community-specific: fixed buttonText
    if (buttonText !== COMMUNITY_BUTTON_TEXT) {
      errors.push(`${prefix}: buttonText must be "${COMMUNITY_BUTTON_TEXT}", got "${buttonText}"`);
    }

    // Community-specific: founder line in body
    if (!body.includes(COMMUNITY_FOUNDER_LINE)) {
      errors.push(`${prefix}: body must contain "${COMMUNITY_FOUNDER_LINE}"`);
    }

    errors.push(...validateCtaCopy(prefix, eyebrow, title, body, buttonText));

    // can_promise and cant_promise should be empty
    if (entry.can_promise.length > 0) {
      warnings.push(`${prefix}: can_promise should be empty for per-category entries`);
    }
    if (entry.cant_promise.length > 0) {
      warnings.push(`${prefix}: cant_promise should be empty for per-category entries`);
    }
  }

  // --- Course and freebie checks ---
  for (const entry of [...courses, ...freebies]) {
    const prefix = entry.id;

    if (!entry.what_it_is) {
      errors.push(`${prefix}: missing what_it_is`);
    }

    if (!entry.cta_copy) {
      errors.push(`${prefix}: missing cta_copy`);
      continue;
    }

    const { eyebrow, title, body, buttonText } = entry.cta_copy;
    errors.push(...validateCtaCopy(prefix, eyebrow, title, body, buttonText));

    // Title should reference the product name
    if (!title.toLowerCase().includes(entry.name.toLowerCase())) {
      warnings.push(`${prefix}: title "${title}" does not contain product name "${entry.name}"`);
    }
  }

  // --- Waitlist entry checks ---
  const waitlists = catalog.filter((c) => c.type === "waitlist");
  for (const entry of waitlists) {
    const prefix = entry.id;

    if (!entry.what_it_is) {
      errors.push(`${prefix}: missing what_it_is`);
    }

    if (!entry.url) {
      errors.push(`${prefix}: missing url`);
    } else if (!entry.url.startsWith("/course/")) {
      errors.push(`${prefix}: url must start with "/course/", got "${entry.url}"`);
    }

    if (!entry.cta_copy) {
      errors.push(`${prefix}: missing cta_copy`);
      continue;
    }

    const { eyebrow, title, body, buttonText } = entry.cta_copy;

    if (buttonText !== WAITLIST_BUTTON_TEXT) {
      errors.push(`${prefix}: buttonText must be "${WAITLIST_BUTTON_TEXT}", got "${buttonText}"`);
    }

    errors.push(...validateCtaCopy(prefix, eyebrow, title, body, buttonText));
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
    const waitlistSlugSet = new Set(
      waitlists.map((c) => c.id.replace(/^waitlist-/, "")),
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
      if (!waitlistSlugSet.has(slug)) {
        warnings.push(`Missing waitlist entry for "${slug}"`);
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
    for (const slug of waitlistSlugSet) {
      if (!slugSet.has(slug)) {
        warnings.push(`Waitlist entry "waitlist-${slug}" doesn't match any taxonomy category`);
      }
    }
  }

  return { errors, warnings };
}

/**
 * CTA catalog validator — checks business rules for link-out CTAs.
 *
 * Returns { errors, warnings, groups, byEntry }:
 * - errors/warnings: flat lists for CLI / backward compat
 * - groups: structured per-section summaries
 * - byEntry: per entry-ID errors/warnings so the UI can render them inline
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

export interface CheckGroup {
  name: string;
  description: string;
  itemCount: number;
  errors: string[];
  warnings: string[];
}

export interface EntryCheck {
  ok: boolean;
  detail?: string | undefined;  // e.g. "3w", or error reason when !ok
}

export interface EntryValidation {
  errors: string[];
  warnings: string[];
  checks: Record<string, EntryCheck>;
}

interface CtaValidationResult {
  errors: string[];
  warnings: string[];
  groups: CheckGroup[];
  byEntry: Record<string, EntryValidation>;
}

/**
 * Validate cta_copy fields shared by all entry types.
 * Returns { errors, checks } — errors for flat lists, checks for per-column UI.
 * Exported for reuse by mailing form validator.
 */
export function validateCtaCopy(
  prefix: string,
  eyebrow: string,
  title: string,
  body: string,
  _buttonText: string,
  options?: { eyebrowMin?: number; eyebrowMax?: number; titleMin?: number; titleMax?: number; bodyMin?: number; bodyMax?: number },
): { errors: string[]; checks: Record<string, EntryCheck> } {
  const errs: string[] = [];
  const checks: Record<string, EntryCheck> = {};
  const eyebrowMin = options?.eyebrowMin ?? 2;
  const eyebrowMax = options?.eyebrowMax ?? 5;
  const titleMin = options?.titleMin ?? 3;
  const titleMax = options?.titleMax ?? 8;
  const bodyMin = options?.bodyMin ?? 8;
  const bodyMax = options?.bodyMax ?? 24;

  const eyebrowWc = wordCount(eyebrow);
  const eyebrowOk = eyebrowWc >= eyebrowMin && eyebrowWc <= eyebrowMax;
  checks["eyebrow"] = { ok: eyebrowOk, detail: `${eyebrowWc}w` + (eyebrowOk ? "" : ` (${eyebrowMin}-${eyebrowMax})`) };
  if (!eyebrowOk) {
    errs.push(`${prefix}: eyebrow "${eyebrow}" is ${eyebrowWc} words (must be ${eyebrowMin}-${eyebrowMax})`);
  }

  const titleWc = wordCount(title);
  const titleOk = titleWc >= titleMin && titleWc <= titleMax;
  checks["title"] = { ok: titleOk, detail: `${titleWc}w` + (titleOk ? "" : ` (${titleMin}-${titleMax})`) };
  if (!titleOk) {
    errs.push(`${prefix}: title is ${titleWc} words (must be ${titleMin}-${titleMax})`);
  }

  const bodyWc = wordCount(body);
  const bodyOk = bodyWc >= bodyMin && bodyWc <= bodyMax;
  checks["body"] = { ok: bodyOk, detail: `${bodyWc}w` + (bodyOk ? "" : ` (${bodyMin}-${bodyMax})`) };
  if (!bodyOk) {
    errs.push(`${prefix}: body is ${bodyWc} words (must be ${bodyMin}-${bodyMax})`);
  }

  const allText = [eyebrow, title, body, _buttonText].join(" ");
  const hasExcl = allText.includes("!");
  const lowerText = allText.toLowerCase();
  const foundForbidden = FORBIDDEN_TERMS.filter((t) => lowerText.includes(t));
  const cleanOk = !hasExcl && foundForbidden.length === 0;
  checks["clean"] = {
    ok: cleanOk,
    detail: !cleanOk
      ? [hasExcl ? "has !" : "", ...foundForbidden.map((t) => `"${t}"`)].filter(Boolean).join(", ")
      : undefined,
  };
  if (hasExcl) {
    errs.push(`${prefix}: contains exclamation mark`);
  }
  for (const term of foundForbidden) {
    errs.push(`${prefix}: contains forbidden term "${term}"`);
  }

  return { errors: errs, checks };
}

// Helper: get or create an entry in the byEntry map
function getEntry(
  byEntry: Record<string, EntryValidation>,
  id: string,
): EntryValidation {
  let e = byEntry[id];
  if (!e) {
    e = { errors: [], warnings: [], checks: {} };
    byEntry[id] = e;
  }
  return e;
}

export function validateCtaCatalog(
  catalog: CtaCatalog,
  categorySlugs?: string[],
  quizSlugs?: string[],
  coursePageUrls?: Set<string>,
): CtaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const groups: CheckGroup[] = [];
  const byEntry: Record<string, EntryValidation> = {};

  const globalCommunity = catalog.find(
    (c) => c.type === "community" && c.id === "community",
  );
  const perCatCommunities = catalog.filter(
    (c) => c.type === "community" && c.id !== "community" && !c.id.startsWith("community-quiz-"),
  );
  const quizCommunities = catalog.filter(
    (c) => c.type === "community" && c.id.startsWith("community-quiz-"),
  );
  const courses = catalog.filter((c) => c.type === "course");

  // --- Group 1: Global community ---
  {
    const g: CheckGroup = {
      name: "Global Community",
      description: "Entry exists, founder_presence, cant_promise list",
      itemCount: 1,
      errors: [],
      warnings: [],
    };
    const e = getEntry(byEntry, "community");

    if (!globalCommunity) {
      const msg = "Missing global community entry (id: \"community\")";
      g.errors.push(msg);
      e.errors.push(msg);
      e.checks["exists"] = { ok: false };
    } else {
      e.checks["exists"] = { ok: true };
      const hasFP = !!globalCommunity.founder_presence;
      e.checks["founder_presence"] = { ok: hasFP, detail: hasFP ? undefined : "missing" };
      if (!hasFP) {
        const msg = "Missing founder_presence";
        g.warnings.push(msg);
        e.warnings.push(msg);
      }
      const cpLen = globalCommunity.cant_promise.length;
      e.checks["cant_promise"] = { ok: cpLen > 0, detail: `${cpLen} items` };
      if (cpLen === 0) {
        const msg = "Empty cant_promise list";
        g.warnings.push(msg);
        e.warnings.push(msg);
      }
    }

    errors.push(...g.errors);
    warnings.push(...g.warnings);
    groups.push(g);
  }

  const globalCommunityUrl = globalCommunity?.url;
  const categorySlugSet = new Set(categorySlugs ?? []);

  // Helper: validate a community entry (per-category or quiz)
  function validateCommunityEntry(
    entry: CtaCatalog[number],
    e: EntryValidation,
    g: CheckGroup,
    checkPromises: boolean,
  ) {
    // pageUrl check — derive from slug
    const isQuiz = entry.id.startsWith("community-quiz-");
    const slug = isQuiz
      ? entry.id.replace(/^community-quiz-/, "")
      : entry.id.replace(/^community-/, "");
    const pagePattern = isQuiz ? `/quiz/${slug}` : `/blog/${slug}/*`;
    const pageOk = isQuiz ? true : categorySlugSet.has(slug);
    e.checks["pageUrl"] = { ok: pageOk, detail: pagePattern + (pageOk ? "" : " (no category)") };
    if (!pageOk) {
      const msg = `Page ${pagePattern} — category "${slug}" not in taxonomy`;
      g.errors.push(`${entry.id}: ${msg}`);
      e.errors.push(msg);
    }

    // url check — CTA destination
    const hasUrl = !!entry.url;
    const urlMatchesGlobal = hasUrl && entry.url === globalCommunityUrl;
    const urlOk = hasUrl && urlMatchesGlobal;
    e.checks["url"] = { ok: urlOk, detail: hasUrl ? entry.url : "missing" };
    if (!hasUrl) {
      const msg = "Missing url";
      g.errors.push(`${entry.id}: ${msg}`);
      e.errors.push(msg);
    } else if (!urlMatchesGlobal) {
      const msg = `url "${entry.url}" does not match global community url`;
      g.warnings.push(`${entry.id}: ${msg}`);
      e.warnings.push(msg);
    }

    const hasCopy = !!entry.cta_copy;
    e.checks["cta_copy"] = { ok: hasCopy, detail: hasCopy ? undefined : "missing" };
    if (!hasCopy) {
      const msg = "Missing cta_copy";
      g.errors.push(`${entry.id}: ${msg}`);
      e.errors.push(msg);
      return;
    }

    const { eyebrow, title, body, buttonText } = entry.cta_copy!;

    const btnOk = buttonText === COMMUNITY_BUTTON_TEXT;
    e.checks["buttonText"] = { ok: btnOk, detail: btnOk ? undefined : `"${buttonText}"` };
    if (!btnOk) {
      const msg = `buttonText must be "${COMMUNITY_BUTTON_TEXT}", got "${buttonText}"`;
      g.errors.push(`${entry.id}: ${msg}`);
      e.errors.push(msg);
    }

    const founderOk = body.includes(COMMUNITY_FOUNDER_LINE);
    e.checks["founderLine"] = { ok: founderOk, detail: founderOk ? undefined : "missing" };
    if (!founderOk) {
      const msg = `Body must contain "${COMMUNITY_FOUNDER_LINE}"`;
      g.errors.push(`${entry.id}: ${msg}`);
      e.errors.push(msg);
    }

    const copyResult = validateCtaCopy(entry.id, eyebrow, title, body, buttonText);
    Object.assign(e.checks, copyResult.checks);
    for (const copyErr of copyResult.errors) {
      const msg = copyErr.replace(`${entry.id}: `, "");
      g.errors.push(copyErr);
      e.errors.push(msg);
    }

    if (checkPromises) {
      if (entry.can_promise.length > 0) {
        const msg = "can_promise should be empty for per-category entries";
        g.warnings.push(`${entry.id}: ${msg}`);
        e.warnings.push(msg);
      }
      if (entry.cant_promise.length > 0) {
        const msg = "cant_promise should be empty for per-category entries";
        g.warnings.push(`${entry.id}: ${msg}`);
        e.warnings.push(msg);
      }
    }
  }

  // --- Group 2: Per-category community ---
  {
    const g: CheckGroup = {
      name: "Per-Category Community CTAs",
      description: "cta_copy, buttonText, founder line, word counts, forbidden terms",
      itemCount: perCatCommunities.length,
      errors: [],
      warnings: [],
    };

    for (const entry of perCatCommunities) {
      const e = getEntry(byEntry, entry.id);
      validateCommunityEntry(entry, e, g, true);
    }

    errors.push(...g.errors);
    warnings.push(...g.warnings);
    groups.push(g);
  }

  // --- Group 3: Quiz community ---
  {
    const g: CheckGroup = {
      name: "Quiz Community CTAs",
      description: "cta_copy, buttonText, founder line, word counts, forbidden terms",
      itemCount: quizCommunities.length,
      errors: [],
      warnings: [],
    };

    for (const entry of quizCommunities) {
      const e = getEntry(byEntry, entry.id);
      validateCommunityEntry(entry, e, g, false);
    }

    errors.push(...g.errors);
    warnings.push(...g.warnings);
    groups.push(g);
  }

  // --- Group 4: Course ---
  {
    const g: CheckGroup = {
      name: "Course CTAs",
      description: "what_it_is, cta_copy, word counts, title references product name",
      itemCount: courses.length,
      errors: [],
      warnings: [],
    };

    for (const entry of courses) {
      const e = getEntry(byEntry, entry.id);
      const slug = entry.id.replace(/^course-/, "");

      // pageUrl check — where article CTAs reference this course
      const pagePattern = `/blog/${slug}/*`;
      const pageOk = categorySlugSet.has(slug);
      e.checks["pageUrl"] = { ok: pageOk, detail: pagePattern + (pageOk ? "" : " (no category)") };
      if (!pageOk) {
        const msg = `Page ${pagePattern} — category "${slug}" not in taxonomy`;
        g.errors.push(`${entry.id}: ${msg}`);
        e.errors.push(msg);
      }

      // url check — CTA destination (course landing page)
      const hasUrl = !!entry.url;
      const urlStartsOk = hasUrl && entry.url!.startsWith("/course/");
      const urlHasWaitlist = hasUrl && coursePageUrls ? coursePageUrls.has(entry.url!) : true;
      const urlOk = hasUrl && urlStartsOk && urlHasWaitlist;
      e.checks["url"] = {
        ok: urlOk,
        detail: hasUrl
          ? entry.url + (!urlStartsOk ? " (need /course/)" : !urlHasWaitlist ? " (no waitlist)" : "")
          : "missing",
      };
      if (!hasUrl) {
        const msg = "Missing url";
        g.errors.push(`${entry.id}: ${msg}`);
        e.errors.push(msg);
      } else if (!urlStartsOk) {
        const msg = `url "${entry.url}" must start with "/course/"`;
        g.errors.push(`${entry.id}: ${msg}`);
        e.errors.push(msg);
      } else if (!urlHasWaitlist) {
        const msg = `url "${entry.url}" has no matching waitlist entry`;
        g.warnings.push(`${entry.id}: ${msg}`);
        e.warnings.push(msg);
      }

      const hasWii = !!entry.what_it_is;
      e.checks["what_it_is"] = { ok: hasWii, detail: hasWii ? undefined : "missing" };
      if (!hasWii) {
        const msg = "Missing what_it_is";
        g.errors.push(`${entry.id}: ${msg}`);
        e.errors.push(msg);
      }

      const hasCopy = !!entry.cta_copy;
      e.checks["cta_copy"] = { ok: hasCopy, detail: hasCopy ? undefined : "missing" };
      if (!hasCopy) {
        const msg = "Missing cta_copy";
        g.errors.push(`${entry.id}: ${msg}`);
        e.errors.push(msg);
        continue;
      }

      const { eyebrow, title, body, buttonText } = entry.cta_copy!;
      const copyResult = validateCtaCopy(entry.id, eyebrow, title, body, buttonText, { titleMin: 5, titleMax: 12 });
      Object.assign(e.checks, copyResult.checks);
      for (const copyErr of copyResult.errors) {
        const msg = copyErr.replace(`${entry.id}: `, "");
        g.errors.push(copyErr);
        e.errors.push(msg);
      }

      const nameInTitle = title.toLowerCase().includes(entry.name.toLowerCase());
      e.checks["nameInTitle"] = { ok: nameInTitle, detail: nameInTitle ? undefined : `"${entry.name}" not in title` };
      if (!nameInTitle) {
        const msg = `Title "${title}" does not contain product name "${entry.name}"`;
        g.warnings.push(`${entry.id}: ${msg}`);
        e.warnings.push(msg);
      }
    }

    errors.push(...g.errors);
    warnings.push(...g.warnings);
    groups.push(g);
  }

  // --- Group 5: Category coverage ---
  if (categorySlugs) {
    const g: CheckGroup = {
      name: "Category Coverage",
      description: "community + course entry per category, orphan detection",
      itemCount: categorySlugs.length,
      errors: [],
      warnings: [],
    };

    const communitySlugSet = new Set(
      perCatCommunities.map((c) => c.id.replace(/^community-/, "")),
    );
    const courseSlugSet = new Set(
      courses.map((c) => c.id.replace(/^course-/, "")),
    );

    for (const slug of categorySlugs) {
      if (!communitySlugSet.has(slug)) {
        const id = `community-${slug}`;
        const msg = "Missing entry";
        g.errors.push(`Missing per-category community entry for "${slug}"`);
        getEntry(byEntry, id).errors.push(msg);
      }
      if (!courseSlugSet.has(slug)) {
        const id = `course-${slug}`;
        const msg = "Missing entry";
        g.errors.push(`Missing course entry for "${slug}"`);
        getEntry(byEntry, id).errors.push(msg);
      }
    }

    const slugSet = new Set(categorySlugs);
    for (const slug of communitySlugSet) {
      if (!slugSet.has(slug)) {
        const id = `community-${slug}`;
        const msg = "Doesn't match any taxonomy category";
        g.warnings.push(`Community entry "${id}" doesn't match any taxonomy category`);
        getEntry(byEntry, id).warnings.push(msg);
      }
    }
    for (const slug of courseSlugSet) {
      if (!slugSet.has(slug)) {
        const id = `course-${slug}`;
        const msg = "Doesn't match any taxonomy category";
        g.warnings.push(`Course entry "${id}" doesn't match any taxonomy category`);
        getEntry(byEntry, id).warnings.push(msg);
      }
    }

    errors.push(...g.errors);
    warnings.push(...g.warnings);
    groups.push(g);
  }

  // --- Group 6: Quiz community coverage ---
  if (quizSlugs) {
    const g: CheckGroup = {
      name: "Quiz Community Coverage",
      description: "community-quiz-{slug} entry per quiz",
      itemCount: quizSlugs.length,
      errors: [],
      warnings: [],
    };

    const quizCommunitySlugSet = new Set(
      quizCommunities.map((c) => c.id.replace(/^community-quiz-/, "")),
    );

    for (const slug of quizSlugs) {
      if (!quizCommunitySlugSet.has(slug)) {
        const id = `community-quiz-${slug}`;
        const msg = "Missing entry";
        g.errors.push(`Missing quiz community entry for "${slug}" (expected "${id}")`);
        getEntry(byEntry, id).errors.push(msg);
      }
    }

    errors.push(...g.errors);
    warnings.push(...g.warnings);
    groups.push(g);
  }

  return { errors, warnings, groups, byEntry };
}

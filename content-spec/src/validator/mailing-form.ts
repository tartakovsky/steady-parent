/**
 * Mailing form catalog validator — checks business rules for email capture forms.
 *
 * Returns { errors, warnings, byEntry }:
 * - errors/warnings: flat lists for CLI / backward compat
 * - byEntry: per entry-ID errors/warnings + structured checks for per-column UI
 */

import type { MailingFormCatalog } from "../types";
import type { EntryValidation, EntryCheck } from "./cta";
import { validateCtaCopy, WAITLIST_BUTTON_TEXT, PREVIEW_BUTTON_TEXT } from "./cta";

interface MailingFormValidationResult {
  errors: string[];
  warnings: string[];
  byEntry: Record<string, EntryValidation>;
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

function setCheck(ev: EntryValidation, name: string, check: EntryCheck) {
  ev.checks[name] = check;
}

export function validateMailingFormCatalog(
  catalog: MailingFormCatalog,
  categorySlugs?: string[],
  quizSlugs?: string[],
): MailingFormValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const byEntry: Record<string, EntryValidation> = {};

  const freebies = catalog.filter((c) => c.type === "freebie");
  const waitlists = catalog.filter((c) => c.type === "waitlist");
  const quizGates = catalog.filter((c) => c.type === "quiz-gate");

  // --- Freebie checks ---
  for (const entry of freebies) {
    const prefix = entry.id;
    const ev = getEntry(byEntry, entry.id);

    const hasWii = !!entry.what_it_is;
    setCheck(ev, "what_it_is", { ok: hasWii, detail: hasWii ? undefined : "missing" });
    if (!hasWii) {
      errors.push(`${prefix}: missing what_it_is`);
      ev.errors.push("missing what_it_is");
    }

    const urlOk = entry.pageUrlPattern.startsWith("/blog/");
    setCheck(ev, "urlPattern", { ok: urlOk, detail: urlOk ? entry.pageUrlPattern : `"${entry.pageUrlPattern}" (need /blog/)` });
    if (!urlOk) {
      errors.push(`${prefix}: pageUrlPattern must start with "/blog/", got "${entry.pageUrlPattern}"`);
      ev.errors.push(`pageUrlPattern must start with "/blog/"`);
    }

    const hasLead = entry.tags.includes("lead");
    setCheck(ev, "tags", { ok: hasLead, detail: hasLead ? entry.tags.join(", ") : `missing "lead"` });
    if (!hasLead) {
      warnings.push(`${prefix}: tags should include "lead"`);
      ev.warnings.push(`tags should include "lead"`);
    }

    const hasCopy = !!entry.cta_copy;
    setCheck(ev, "cta_copy", { ok: hasCopy, detail: hasCopy ? undefined : "missing" });
    if (!hasCopy) {
      errors.push(`${prefix}: missing cta_copy`);
      ev.errors.push("missing cta_copy");
      continue;
    }

    const { eyebrow, title, body, buttonText } = entry.cta_copy!;
    const copyResult = validateCtaCopy(prefix, eyebrow, title, body, buttonText);
    Object.assign(ev.checks, copyResult.checks);
    for (const copyErr of copyResult.errors) {
      const msg = copyErr.replace(`${prefix}: `, "");
      errors.push(copyErr);
      ev.errors.push(msg);
    }

    const nameInTitle = title.toLowerCase().includes(entry.name.toLowerCase());
    setCheck(ev, "nameInTitle", { ok: nameInTitle, detail: nameInTitle ? undefined : `"${entry.name}" not in title` });
    if (!nameInTitle) {
      warnings.push(`${prefix}: title "${title}" does not contain product name "${entry.name}"`);
      ev.warnings.push(`title does not contain product name "${entry.name}"`);
    }
  }

  // --- Waitlist checks ---
  for (const entry of waitlists) {
    const prefix = entry.id;
    const ev = getEntry(byEntry, entry.id);

    const hasWii = !!entry.what_it_is;
    setCheck(ev, "what_it_is", { ok: hasWii, detail: hasWii ? undefined : "missing" });
    if (!hasWii) {
      errors.push(`${prefix}: missing what_it_is`);
      ev.errors.push("missing what_it_is");
    }

    const urlOk = entry.pageUrlPattern.startsWith("/course/");
    setCheck(ev, "urlPattern", { ok: urlOk, detail: urlOk ? entry.pageUrlPattern : `"${entry.pageUrlPattern}" (need /course/)` });
    if (!urlOk) {
      errors.push(`${prefix}: pageUrlPattern must start with "/course/", got "${entry.pageUrlPattern}"`);
      ev.errors.push(`pageUrlPattern must start with "/course/"`);
    }

    const hasLead = entry.tags.includes("lead");
    setCheck(ev, "tags", { ok: hasLead, detail: hasLead ? entry.tags.join(", ") : `missing "lead"` });
    if (!hasLead) {
      warnings.push(`${prefix}: tags should include "lead"`);
      ev.warnings.push(`tags should include "lead"`);
    }

    const hasCopy = !!entry.cta_copy;
    setCheck(ev, "cta_copy", { ok: hasCopy, detail: hasCopy ? undefined : "missing" });
    if (!hasCopy) {
      errors.push(`${prefix}: missing cta_copy`);
      ev.errors.push("missing cta_copy");
      continue;
    }

    const { eyebrow, title, body, buttonText } = entry.cta_copy!;

    const btnOk = buttonText === WAITLIST_BUTTON_TEXT;
    setCheck(ev, "buttonText", { ok: btnOk, detail: btnOk ? undefined : `"${buttonText}"` });
    if (!btnOk) {
      errors.push(`${prefix}: buttonText must be "${WAITLIST_BUTTON_TEXT}", got "${buttonText}"`);
      ev.errors.push(`buttonText must be "${WAITLIST_BUTTON_TEXT}"`);
    }

    const copyResult = validateCtaCopy(prefix, eyebrow, title, body, buttonText);
    Object.assign(ev.checks, copyResult.checks);
    for (const copyErr of copyResult.errors) {
      const msg = copyErr.replace(`${prefix}: `, "");
      errors.push(copyErr);
      ev.errors.push(msg);
    }
  }

  // --- Quiz-gate checks ---
  for (const entry of quizGates) {
    const prefix = entry.id;
    const ev = getEntry(byEntry, entry.id);

    const urlOk = entry.pageUrlPattern.startsWith("/quiz/");
    setCheck(ev, "urlPattern", { ok: urlOk, detail: urlOk ? entry.pageUrlPattern : `"${entry.pageUrlPattern}" (need /quiz/)` });
    if (!urlOk) {
      errors.push(`${prefix}: pageUrlPattern must start with "/quiz/", got "${entry.pageUrlPattern}"`);
      ev.errors.push(`pageUrlPattern must start with "/quiz/"`);
    }

    const hasLead = entry.tags.includes("lead");
    setCheck(ev, "tags", { ok: hasLead, detail: hasLead ? entry.tags.join(", ") : `missing "lead"` });
    if (!hasLead) {
      errors.push(`${prefix}: tags must include "lead"`);
      ev.errors.push(`tags must include "lead"`);
    }

    if (entry.cta_copy) {
      setCheck(ev, "cta_copy", { ok: true });
      const { eyebrow, title, body, buttonText } = entry.cta_copy;

      const btnOk = buttonText === PREVIEW_BUTTON_TEXT;
      setCheck(ev, "buttonText", { ok: btnOk, detail: btnOk ? undefined : `"${buttonText}"` });
      if (!btnOk) {
        errors.push(`${prefix}: buttonText must be "${PREVIEW_BUTTON_TEXT}", got "${buttonText}"`);
        ev.errors.push(`buttonText must be "${PREVIEW_BUTTON_TEXT}"`);
      }

      const copyResult = validateCtaCopy(prefix, eyebrow, title, body, buttonText);
      Object.assign(ev.checks, copyResult.checks);
      for (const copyErr of copyResult.errors) {
        const msg = copyErr.replace(`${prefix}: `, "");
        errors.push(copyErr);
        ev.errors.push(msg);
      }
    } else {
      setCheck(ev, "cta_copy", { ok: false, detail: "missing" });
      errors.push(`${prefix}: missing cta_copy`);
      ev.errors.push("missing cta_copy");
      // Downstream fields can't be checked without copy
      setCheck(ev, "buttonText", { ok: false, detail: "N/A" });
      setCheck(ev, "eyebrow", { ok: false, detail: "N/A" });
      setCheck(ev, "title", { ok: false, detail: "N/A" });
      setCheck(ev, "body", { ok: false, detail: "N/A" });
      setCheck(ev, "clean", { ok: false, detail: "N/A" });
    }
  }

  // --- Coverage checks ---
  if (categorySlugs) {
    const freebieSlugSet = new Set(
      freebies.map((c) => c.id.replace(/^freebie-/, "")),
    );
    const waitlistSlugSet = new Set(
      waitlists.map((c) => c.id.replace(/^waitlist-/, "")),
    );

    for (const slug of categorySlugs) {
      if (!freebieSlugSet.has(slug)) {
        const id = `freebie-${slug}`;
        errors.push(`Missing freebie mailing form for "${slug}"`);
        const ev = getEntry(byEntry, id);
        ev.errors.push("Missing entry");
        setCheck(ev, "exists", { ok: false, detail: "no entry in catalog" });
      }
      if (!waitlistSlugSet.has(slug)) {
        const id = `waitlist-${slug}`;
        warnings.push(`Missing waitlist mailing form for "${slug}"`);
        const ev = getEntry(byEntry, id);
        ev.warnings.push("Missing entry");
        setCheck(ev, "exists", { ok: false, detail: "no entry in catalog" });
      }
    }
  }

  if (quizSlugs) {
    const quizGateSlugSet = new Set(
      quizGates.map((c) => c.id.replace(/^quiz-gate-/, "")),
    );

    for (const slug of quizSlugs) {
      if (!quizGateSlugSet.has(slug)) {
        const id = `quiz-gate-${slug}`;
        errors.push(`Missing quiz-gate mailing form for "${slug}"`);
        const ev = getEntry(byEntry, id);
        ev.errors.push("Missing entry");
        setCheck(ev, "exists", { ok: false, detail: "no entry in catalog" });
      }
    }
  }

  return { errors, warnings, byEntry };
}

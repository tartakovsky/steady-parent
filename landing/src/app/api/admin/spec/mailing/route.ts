import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import {
  MailingFormCatalogSchema,
  MailingTagTaxonomySchema,
  FormTagMappingsSchema,
  QuizTaxonomySchema,
  ArticleTaxonomySchema,
  validateMailingFormCatalog,
  validateCtaCopy,
  PREVIEW_BUTTON_TEXT,
} from "@steady-parent/content-spec";
import type { EntryValidation } from "@steady-parent/content-spec";
import { quizzes } from "@/lib/quiz";

// ---------------------------------------------------------------------------
// Path helper
// ---------------------------------------------------------------------------

function getContentPlanPath(filename: string): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", filename);
  }
  return path.join(process.cwd(), "..", "content-plan", filename);
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

interface CtaCopy {
  eyebrow: string;
  title: string;
  body: string;
  buttonText: string;
}

interface FreebieArticle {
  slug: string;
  title: string;
  entryId: string;
  copy: CtaCopy | null;
  validation: EntryValidation;
  tagMapOk: boolean;
  tagRefsWarning: string | null;
}

interface FreebieCategory {
  categorySlug: string;
  categoryName: string;
  articles: FreebieArticle[];
}

interface WaitlistEntry {
  categorySlug: string;
  categoryName: string;
  courseName: string | null;
  whatItIs: string | null;
  pageUrlPattern: string | null;
  endpoint: string | null;
  tags: string[];
  copy: CtaCopy | null;
  validation: EntryValidation;
  tagMapOk: boolean;
  tagRefsWarning: string | null;
}

interface QuizGateEntry {
  quizSlug: string;
  quizTitle: string;
  pageUrlPattern: string | null;
  endpoint: string | null;
  tags: string[];
  copy: CtaCopy | null;
  copySource: "catalog" | "quiz-json" | null;
  validation: EntryValidation;
  tagMapOk: boolean;
  tagRefsWarning: string | null;
}

// ---------------------------------------------------------------------------
// SPEC-ONLY mailing validation route.
//
// Validates that per-article freebie entries, per-category waitlist entries,
// and per-quiz quiz-gate entries exist in mailing_form_catalog.json with
// correct copy, tags, URLs, etc.
//
// Does NOT: call Kit API, query DB, check file existence on disk
// ---------------------------------------------------------------------------

const MISSING_ENTRY: EntryValidation = {
  errors: ["Missing entry in mailing_form_catalog.json"],
  warnings: [],
  checks: {},
};

export async function GET() {
  try {
    const [tagsRaw, mappingsRaw, quizRaw, taxRaw, mfRaw] = await Promise.all([
      fs.readFile(getContentPlanPath("mailing_tags.json"), "utf-8"),
      fs.readFile(getContentPlanPath("form_tag_mappings.json"), "utf-8"),
      fs.readFile(getContentPlanPath("quiz_taxonomy.json"), "utf-8"),
      fs.readFile(getContentPlanPath("article_taxonomy.json"), "utf-8"),
      fs.readFile(getContentPlanPath("mailing_form_catalog.json"), "utf-8"),
    ]);

    const mailingTags = MailingTagTaxonomySchema.parse(JSON.parse(tagsRaw));
    const formMappings = FormTagMappingsSchema.parse(JSON.parse(mappingsRaw));
    const quizTaxonomy = QuizTaxonomySchema.parse(JSON.parse(quizRaw));
    const taxonomy = ArticleTaxonomySchema.parse(JSON.parse(taxRaw));
    const mailingFormCatalog = MailingFormCatalogSchema.parse(JSON.parse(mfRaw));
    const categorySlugs = taxonomy.categories.map((c) => c.slug);
    const categoryNames = new Map(
      taxonomy.categories.map((c) => [c.slug, c.name]),
    );
    const quizSlugs = quizTaxonomy.entries.map(
      (q: { slug: string }) => q.slug,
    );
    const quizTitles = new Map(
      quizTaxonomy.entries.map((q: { slug: string; title: string }) => [
        q.slug,
        q.title,
      ]),
    );

    // Build a fast lookup by catalog entry id
    const catalogById = new Map(mailingFormCatalog.map((e) => [e.id, e]));

    // -----------------------------------------------------------------------
    // 1. Run the existing catalog-level validator (for waitlists + quiz gates)
    // -----------------------------------------------------------------------
    const mfValidation = validateMailingFormCatalog(
      mailingFormCatalog,
      categorySlugs,
      quizSlugs,
    );
    const byEntry = mfValidation.byEntry;

    // -----------------------------------------------------------------------
    // 2. Quiz-gate previewCta patching (same as before)
    // -----------------------------------------------------------------------
    for (const slug of quizSlugs) {
      const quiz = quizzes[slug];
      const previewCta = quiz?.meta?.previewCta;
      if (!previewCta) continue;

      const entryId = `quiz-gate-${slug}`;
      const ev = byEntry[entryId];
      if (!ev) continue;

      const { eyebrow, title, body, buttonText } = previewCta;
      ev.errors = ev.errors.filter((e) => e !== "missing cta_copy");
      ev.checks["cta_copy"] = { ok: true, detail: "from quiz JSON" };

      const btnOk = buttonText === PREVIEW_BUTTON_TEXT;
      ev.checks["buttonText"] = {
        ok: btnOk,
        detail: btnOk ? undefined : `"${buttonText}"`,
      };
      if (!btnOk) ev.errors.push(`buttonText must be "${PREVIEW_BUTTON_TEXT}"`);

      const copyResult = validateCtaCopy(
        entryId,
        eyebrow,
        title,
        body,
        buttonText,
        { eyebrowMax: 7, titleMax: 10, bodyMax: 36 },
      );
      Object.assign(ev.checks, copyResult.checks);
      for (const copyErr of copyResult.errors) {
        const msg = copyErr.replace(`${entryId}: `, "");
        ev.errors.push(msg);
      }
    }

    // -----------------------------------------------------------------------
    // 3. Tag mapping + cross-reference checks
    // -----------------------------------------------------------------------
    const blogMappings = new Map<string, string[]>();
    const waitlistMappings = new Set<string>();
    const quizMappings = new Set<string>();
    for (const m of formMappings) {
      if (m.formId.startsWith("blog/")) {
        blogMappings.set(m.formId.replace(/^blog\//, ""), m.tagIds);
      } else if (m.formId.startsWith("waitlist/")) {
        waitlistMappings.add(m.formId.replace(/^waitlist\//, ""));
      } else if (m.formId.startsWith("quiz/")) {
        quizMappings.add(m.formId.replace(/^quiz\//, ""));
      }
    }

    const tagIdSet = new Set(mailingTags.map((t) => t.id));
    const tagRefWarnings = new Map<string, string>();
    for (const m of formMappings) {
      const unresolvedTags = m.tagIds.filter((t) => !tagIdSet.has(t));
      if (unresolvedTags.length === 0) continue;

      let entryId: string | null = null;
      if (m.formId.startsWith("blog/"))
        entryId = `freebie-${m.formId.replace(/^blog\//, "")}`;
      else if (m.formId.startsWith("waitlist/"))
        entryId = `waitlist-${m.formId.replace(/^waitlist\//, "")}`;
      else if (m.formId.startsWith("quiz/"))
        entryId = `quiz-gate-${m.formId.replace(/^quiz\//, "")}`;

      if (entryId) {
        const detail = unresolvedTags.join(", ");
        tagRefWarnings.set(entryId, detail);
        const ev = byEntry[entryId];
        if (ev) {
          ev.warnings.push(`Unresolved tags in mailing_tags.json: ${detail}`);
        }
      }
    }

    // -----------------------------------------------------------------------
    // 4. Build per-article freebie entries
    //
    // Each article should have its OWN entry in the catalog with id
    // "freebie-{category}-{articleSlug}". If it doesn't exist, that article
    // is missing its freebie form spec → error.
    // -----------------------------------------------------------------------
    const freebieCategories: FreebieCategory[] = categorySlugs.map(
      (catSlug) => {
        const articles = taxonomy.entries
          .filter((a) => a.categorySlug === catSlug)
          .map((a): FreebieArticle => {
            const entryId = `freebie-${catSlug}-${a.slug}`;
            const catalogEntry = catalogById.get(entryId);

            if (!catalogEntry) {
              return {
                slug: a.slug,
                title: a.title,
                entryId,
                copy: null,
                validation: MISSING_ENTRY,
                tagMapOk: false,
                tagRefsWarning: null,
              };
            }

            // Entry exists — use its validation from the catalog validator
            const validation = byEntry[entryId] ?? {
              errors: [],
              warnings: [],
              checks: {},
            };

            const copy: CtaCopy | null = catalogEntry.cta_copy
              ? {
                  eyebrow: catalogEntry.cta_copy.eyebrow,
                  title: catalogEntry.cta_copy.title,
                  body: catalogEntry.cta_copy.body,
                  buttonText: catalogEntry.cta_copy.buttonText,
                }
              : null;

            // Per-article tag map check: look for blog/{category}/{article}
            const articleFormId = `${catSlug}/${a.slug}`;
            const tagMapOk = blogMappings.has(articleFormId);
            const tagRefsWarning =
              tagRefWarnings.get(entryId) ?? null;

            return {
              slug: a.slug,
              title: a.title,
              entryId,
              copy,
              validation,
              tagMapOk,
              tagRefsWarning,
            };
          });

        return {
          categorySlug: catSlug,
          categoryName: categoryNames.get(catSlug) ?? catSlug,
          articles,
        };
      },
    );

    // -----------------------------------------------------------------------
    // 5. Build waitlist + quiz gate entries (same as before — per page)
    // -----------------------------------------------------------------------

    const waitlistEntries: WaitlistEntry[] = categorySlugs.map((catSlug) => {
      const catalogEntry = mailingFormCatalog.find(
        (e) => e.type === "waitlist" && e.id === `waitlist-${catSlug}`,
      );
      const entryId = `waitlist-${catSlug}`;
      return {
        categorySlug: catSlug,
        categoryName: categoryNames.get(catSlug) ?? catSlug,
        courseName: catalogEntry?.name ?? null,
        whatItIs: catalogEntry?.what_it_is ?? null,
        pageUrlPattern: catalogEntry?.pageUrlPattern ?? null,
        endpoint: catalogEntry?.endpoint ?? null,
        tags: catalogEntry?.tags ?? [],
        copy: catalogEntry?.cta_copy
          ? {
              eyebrow: catalogEntry.cta_copy.eyebrow,
              title: catalogEntry.cta_copy.title,
              body: catalogEntry.cta_copy.body,
              buttonText: catalogEntry.cta_copy.buttonText,
            }
          : null,
        validation: byEntry[entryId] ?? {
          errors: ["Missing entry"],
          warnings: [],
          checks: {},
        },
        tagMapOk: waitlistMappings.has(catSlug),
        tagRefsWarning: tagRefWarnings.get(entryId) ?? null,
      };
    });

    const quizGateEntries: QuizGateEntry[] = quizSlugs.map(
      (slug: string) => {
        const catalogEntry = mailingFormCatalog.find(
          (e) => e.type === "quiz-gate" && e.id === `quiz-gate-${slug}`,
        );
        const quiz = quizzes[slug];
        const previewCta = quiz?.meta?.previewCta;
        const entryId = `quiz-gate-${slug}`;

        let copy: CtaCopy | null = null;
        let copySource: "catalog" | "quiz-json" | null = null;
        if (previewCta) {
          copy = previewCta;
          copySource = "quiz-json";
        } else if (catalogEntry?.cta_copy) {
          copy = {
            eyebrow: catalogEntry.cta_copy.eyebrow,
            title: catalogEntry.cta_copy.title,
            body: catalogEntry.cta_copy.body,
            buttonText: catalogEntry.cta_copy.buttonText,
          };
          copySource = "catalog";
        }

        return {
          quizSlug: slug,
          quizTitle: quizTitles.get(slug) ?? slug,
          pageUrlPattern: catalogEntry?.pageUrlPattern ?? null,
          endpoint: catalogEntry?.endpoint ?? null,
          tags: catalogEntry?.tags ?? [],
          copy,
          copySource,
          validation: byEntry[entryId] ?? {
            errors: ["Missing entry"],
            warnings: [],
            checks: {},
          },
          tagMapOk: quizMappings.has(slug),
          tagRefsWarning: tagRefWarnings.get(entryId) ?? null,
        };
      },
    );

    // -----------------------------------------------------------------------
    // 6. Aggregate counts
    // -----------------------------------------------------------------------
    let totalErrors = 0;
    let totalWarnings = 0;

    // Freebie errors are per-article now
    for (const cat of freebieCategories) {
      for (const art of cat.articles) {
        totalErrors += art.validation.errors.length;
        totalWarnings += art.validation.warnings.length;
      }
    }
    for (const w of waitlistEntries) {
      totalErrors += w.validation.errors.length;
      totalWarnings += w.validation.warnings.length;
    }
    for (const q of quizGateEntries) {
      totalErrors += q.validation.errors.length;
      totalWarnings += q.validation.warnings.length;
    }

    return NextResponse.json({
      freebies: freebieCategories,
      waitlists: waitlistEntries,
      quizGates: quizGateEntries,
      totalErrors,
      totalWarnings,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load spec files", detail: String(err) },
      { status: 500 },
    );
  }
}

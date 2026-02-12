import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import {
  KitIntegrationSpecSchema,
  MailingTagTaxonomySchema,
  FormTagMappingsSchema,
  QuizTaxonomySchema,
  ArticleTaxonomySchema,
  MailingFormCatalogSchema,
  validateKitIntegration,
  validateMailingFormCatalog,
  validateCtaCopy,
  PREVIEW_BUTTON_TEXT,
} from "@steady-parent/content-spec";
import type { IntegrationValidationResult, EntryValidation } from "@steady-parent/content-spec";
import { quizzes } from "@/lib/quiz";
import { blogPosts } from "@/content/blog/posts";

import { db } from "@/lib/db";
import { kitTags as kitTagsTable } from "@/lib/db/schema";
import { kitTags as kitTagConfig } from "@/lib/kit-config";

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

function getContentPlanPath(filename: string): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", filename);
  }
  return path.join(process.cwd(), "..", "content-plan", filename);
}

function getSrcPath(relativePath: string): string {
  return path.join(process.cwd(), "src", relativePath);
}

// ---------------------------------------------------------------------------
// Kit API: fetch custom fields
// ---------------------------------------------------------------------------

async function fetchKitCustomFields(): Promise<string[]> {
  const apiKey = process.env["KIT_API_KEY"];
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.kit.com/v4/custom_fields", {
      headers: {
        "X-Kit-Api-Key": apiKey,
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      custom_fields: { id: number; key: string; name: string }[];
    };
    return data.custom_fields.map((f) => f.key);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Code checks: file exists + pattern search
// ---------------------------------------------------------------------------

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fileContainsPatterns(
  filePath: string,
  patterns: string[],
): Promise<{ exists: boolean; hasPatterns: boolean; missingPatterns: string[] }> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const missing = patterns.filter((p) => !content.includes(p));
    return { exists: true, hasPatterns: missing.length === 0, missingPatterns: missing };
  } catch {
    return { exists: false, hasPatterns: false, missingPatterns: patterns };
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

interface KitTagRow {
  id: number;
  kitId: number;
  name: string;
  subscriberCount: number;
  configName: string | null;
}

export async function GET() {
  // Always return tag rows
  const rows: KitTagRow[] = await db.select().from(kitTagsTable);

  // Run integration validation + build coverage data
  let integration: IntegrationValidationResult | null = null;
  let mailingByEntry: Record<string, EntryValidation> | null = null;
  let articlesByCategory: Record<
    string,
    Array<{
      slug: string;
      title: string;
      published: boolean;
      checks: Record<string, { ok: boolean; detail?: string | undefined }>;
    }>
  > | null = null;
  let coverage: {
    categorySlugs: string[];
    quizSlugs: string[];
    freebySlugs: Set<string>;
    waitlistSlugs: Set<string>;
    blogMappings: Set<string>;
    waitlistMappings: Set<string>;
    quizMappings: Set<string>;
  } | null = null;

  try {
    const [intRaw, tagsRaw, mappingsRaw, quizRaw, taxRaw, mfRaw] = await Promise.all([
      fs.readFile(getContentPlanPath("kit_integration.json"), "utf-8"),
      fs.readFile(getContentPlanPath("mailing_tags.json"), "utf-8"),
      fs.readFile(getContentPlanPath("form_tag_mappings.json"), "utf-8"),
      fs.readFile(getContentPlanPath("quiz_taxonomy.json"), "utf-8"),
      fs.readFile(getContentPlanPath("article_taxonomy.json"), "utf-8"),
      fs.readFile(getContentPlanPath("mailing_form_catalog.json"), "utf-8"),
    ]);

    const intSpec = KitIntegrationSpecSchema.parse(JSON.parse(intRaw));
    const mailingTags = MailingTagTaxonomySchema.parse(JSON.parse(tagsRaw));
    const formMappings = FormTagMappingsSchema.parse(JSON.parse(mappingsRaw));
    const quizTaxonomy = QuizTaxonomySchema.parse(JSON.parse(quizRaw));
    const taxonomy = ArticleTaxonomySchema.parse(JSON.parse(taxRaw));
    const mailingFormCatalog = MailingFormCatalogSchema.parse(JSON.parse(mfRaw));
    const categorySlugs = taxonomy.categories.map((c) => c.slug);
    const quizSlugs = quizTaxonomy.entries.map((q: { slug: string }) => q.slug);

    // Build coverage sets from mailing form catalog
    const freebySlugs = new Set<string>();
    const waitlistSlugs = new Set<string>();
    for (const entry of mailingFormCatalog) {
      if (entry.type === "freebie") {
        freebySlugs.add(entry.id.replace(/^freebie-/, ""));
      } else if (entry.type === "waitlist") {
        waitlistSlugs.add(entry.id.replace(/^waitlist-/, ""));
      }
    }

    const blogMappings = new Set<string>();
    const waitlistMappings = new Set<string>();
    const quizMappings = new Set<string>();
    for (const m of formMappings) {
      if (m.formId.startsWith("blog/")) blogMappings.add(m.formId.replace(/^blog\//, ""));
      else if (m.formId.startsWith("waitlist/")) waitlistMappings.add(m.formId.replace(/^waitlist\//, ""));
      else if (m.formId.startsWith("quiz/")) quizMappings.add(m.formId.replace(/^quiz\//, ""));
    }

    coverage = { categorySlugs, quizSlugs, freebySlugs, waitlistSlugs, blogMappings, waitlistMappings, quizMappings };

    // Build article deployment counts per category (for freebie drill-down)
    const taxonomyCategorySet = new Set(categorySlugs);
    const publishedSet = new Set(
      blogPosts
        .filter((p) => taxonomyCategorySet.has(p.meta.categorySlug))
        .map((p) => p.meta.slug),
    );
    articlesByCategory = {};
    for (const catSlug of categorySlugs) {
      const catArticles = taxonomy.entries.filter(
        (e) => e.categorySlug === catSlug,
      );

      // Freebie checks: compute actual rendered values and run validateCtaCopy
      const freebieEntry = mailingFormCatalog.find(
        (e) => e.type === "freebie" && e.id === `freebie-${catSlug}`,
      );
      const hasKitForm = blogMappings.has(catSlug);

      // Compute the values that FreebieCTA actually renders on the page
      // Page passes: title = "Get [the] {name}", body = what_it_is
      // Defaults: eyebrow = "Not ready for a course yet?", buttonText = "Send me the sheet"
      let freebieChecks: Record<string, { ok: boolean; detail?: string | undefined }> = {};
      if (freebieEntry?.name && freebieEntry?.what_it_is) {
        const freebieEyebrow = "Not ready for a course yet?";
        const freeName = freebieEntry.name;
        const freebieTitle = `Get ${freeName.startsWith("The ") ? "" : "the "}${freeName}`;
        const freebieBody = freebieEntry.what_it_is;
        const freebieButton = "Send me the sheet";

        const copyResult = validateCtaCopy(
          `freebie-${catSlug}`, freebieEyebrow, freebieTitle, freebieBody, freebieButton,
        );
        freebieChecks = copyResult.checks;
      } else {
        const reason = !freebieEntry ? "no entry" : !freebieEntry.name ? "no name" : "no desc";
        freebieChecks = {
          eyebrow: { ok: false, detail: reason },
          title: { ok: false, detail: reason },
          body: { ok: false, detail: reason },
          clean: { ok: false, detail: reason },
        };
      }
      freebieChecks["kit_form"] = hasKitForm ? { ok: true } : { ok: false, detail: "missing" };

      articlesByCategory[catSlug] = catArticles.map((a) => {
        const published = publishedSet.has(a.slug);
        return {
          slug: a.slug,
          title: a.title,
          published,
          checks: published ? { ...freebieChecks } : {},
        };
      });
    }

    // Run mailing form validation for per-entry inline results
    const mfValidation = validateMailingFormCatalog(mailingFormCatalog, categorySlugs, quizSlugs);
    mailingByEntry = mfValidation.byEntry;

    // Patch quiz-gate entries with previewCta from quiz JSON files
    for (const slug of quizSlugs) {
      const quiz = quizzes[slug];
      const previewCta = quiz?.meta?.previewCta;
      if (!previewCta) continue;

      const entryId = `quiz-gate-${slug}`;
      const ev = mailingByEntry[entryId];
      if (!ev) continue;

      const { eyebrow, title, body, buttonText } = previewCta;

      // Replace "missing cta_copy" error with actual validation
      ev.errors = ev.errors.filter((e) => e !== "missing cta_copy");
      ev.checks["cta_copy"] = { ok: true, detail: "from quiz JSON" };

      // Validate buttonText
      const btnOk = buttonText === PREVIEW_BUTTON_TEXT;
      ev.checks["buttonText"] = { ok: btnOk, detail: btnOk ? undefined : `"${buttonText}"` };
      if (!btnOk) {
        ev.errors.push(`buttonText must be "${PREVIEW_BUTTON_TEXT}"`);
      }

      // Run standard copy validation (word counts, forbidden terms)
      const copyResult = validateCtaCopy(entryId, eyebrow, title, body, buttonText);
      Object.assign(ev.checks, copyResult.checks);
      for (const copyErr of copyResult.errors) {
        const msg = copyErr.replace(`${entryId}: `, "");
        ev.errors.push(msg);
      }
    }

    // Live Kit state
    const customFields = await fetchKitCustomFields();
    const liveKitState = {
      customFields,
      forms: [] as { id: number; name: string }[],
      tags: rows.map((r) => ({
        id: r.kitId,
        name: r.name,
        subscriberCount: r.subscriberCount,
      })),
    };

    // Code checks: API routes
    const apiRouteResults: Record<string, boolean> = {};
    for (const [routeName, routePath] of Object.entries(intSpec.subscriberApiRoutes)) {
      const routeFilePath = path.join(
        process.cwd(), "src", "app", ...routePath.split("/").filter(Boolean), "route.ts",
      );
      apiRouteResults[routeName] = await fileExists(routeFilePath);
    }

    // Code checks: frontend patterns
    const frontendResults: Record<
      string,
      { exists: boolean; hasPatterns: boolean; missingPatterns: string[] }
    > = {};
    for (const [key, check] of Object.entries(intSpec.frontendChecks)) {
      const allPatterns = [
        ...(check.requiredProps ?? []),
        ...(check.requiredPatterns ?? []),
      ];
      frontendResults[key] = await fileContainsPatterns(
        getSrcPath(check.file.replace(/^src\//, "")),
        allPatterns,
      );
    }

    integration = validateKitIntegration(
      intSpec,
      mailingTags,
      formMappings,
      quizTaxonomy,
      kitTagConfig,
      rows.length > 0 ? liveKitState : null,
      { apiRouteResults, frontendResults },
      categorySlugs,
    );
  } catch {
    // Integration validation is best-effort
  }

  return NextResponse.json({
    tags: rows,
    integration,
    mailingByEntry,
    articlesByCategory,
    coverage: coverage ? {
      categorySlugs: coverage.categorySlugs,
      quizSlugs: coverage.quizSlugs,
      freebySlugs: [...coverage.freebySlugs],
      waitlistSlugs: [...coverage.waitlistSlugs],
      blogMappings: [...coverage.blogMappings],
      waitlistMappings: [...coverage.waitlistMappings],
      quizMappings: [...coverage.quizMappings],
    } : null,
  });
}

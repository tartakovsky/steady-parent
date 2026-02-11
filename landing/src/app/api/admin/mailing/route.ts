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
} from "@steady-parent/content-spec";
import type { IntegrationValidationResult, EntryValidation } from "@steady-parent/content-spec";

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

    // Run mailing form validation for per-entry inline results
    const mfValidation = validateMailingFormCatalog(mailingFormCatalog, categorySlugs, quizSlugs);
    mailingByEntry = mfValidation.byEntry;

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

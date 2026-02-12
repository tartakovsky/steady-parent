/**
 * Validation script — runs all content-spec schemas against real data files.
 *
 * Usage:
 *   npx tsx content-spec/src/validate-plans.ts
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import {
  ArticleTaxonomySchema,
  QuizTaxonomySchema,
  CtaCatalogSchema,
  MailingFormCatalogSchema,
  LinkPlanSchema,
  PageTypesSchema,
  QuizPageTypesSchema,
  MailingTagTaxonomySchema,
  FormTagMappingsSchema,
  KitIntegrationSpecSchema,
} from "./schemas/index";
import { validateFormTagRefs } from "./schemas/mailing";
import { validateCtaCatalog } from "./validator/cta";
import { validateMailingFormCatalog } from "./validator/mailing-form";
import { validateCrossLinks } from "./validator/cross-links";
import { validateKitIntegrationOffline } from "./validator/kit-integration";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentPlanDir = path.join(__dirname, "..", "..", "content-plan");

interface FileResult {
  file: string;
  schema: string;
  ok: boolean;
  entryCount?: number | undefined;
  errors?: string[] | undefined;
}

async function validateFile(
  filename: string,
  schemaName: string,
  schema: { parse: (data: unknown) => unknown },
): Promise<FileResult> {
  const filePath = path.join(contentPlanDir, filename);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as unknown;
    const parsed = schema.parse(data);

    const count = Array.isArray(parsed)
      ? parsed.length
      : typeof parsed === "object" && parsed !== null && "entries" in parsed
        ? (parsed as { entries: unknown[] }).entries.length
        : undefined;

    return { file: filename, schema: schemaName, ok: true, entryCount: count };
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : String(error);
    // Extract Zod issues if available
    const issues: string[] = [];
    if (
      typeof error === "object" &&
      error !== null &&
      "issues" in error &&
      Array.isArray((error as { issues: unknown[] }).issues)
    ) {
      for (const issue of (error as { issues: { message: string; path: (string | number)[] }[] }).issues) {
        issues.push(`  ${issue.path.join(".")}: ${issue.message}`);
      }
    }
    return {
      file: filename,
      schema: schemaName,
      ok: false,
      errors: issues.length > 0 ? issues : [msg],
    };
  }
}

async function main() {
  console.log("=== content-spec: Plan Data Validation ===\n");

  const results: FileResult[] = [];

  // Validate each data file against its schema
  results.push(
    await validateFile("article_taxonomy.json", "ArticleTaxonomySchema", ArticleTaxonomySchema),
  );
  results.push(
    await validateFile("quiz_taxonomy.json", "QuizTaxonomySchema", QuizTaxonomySchema),
  );
  results.push(
    await validateFile("cta_catalog.json", "CtaCatalogSchema", CtaCatalogSchema),
  );
  results.push(
    await validateFile("article_link_plan.json", "LinkPlanSchema", LinkPlanSchema),
  );
  results.push(
    await validateFile("page_types.json", "PageTypesSchema", PageTypesSchema),
  );
  results.push(
    await validateFile("mailing_tags.json", "MailingTagTaxonomySchema", MailingTagTaxonomySchema),
  );
  results.push(
    await validateFile("quiz_page_types.json", "QuizPageTypesSchema", QuizPageTypesSchema),
  );
  results.push(
    await validateFile("form_tag_mappings.json", "FormTagMappingsSchema", FormTagMappingsSchema),
  );
  results.push(
    await validateFile("kit_integration.json", "KitIntegrationSpecSchema", KitIntegrationSpecSchema),
  );
  results.push(
    await validateFile("mailing_form_catalog.json", "MailingFormCatalogSchema", MailingFormCatalogSchema),
  );

  // Cross-file validation: form tag refs
  let crossFileErrors: string[] = [];
  try {
    const tagsRaw = await fs.readFile(
      path.join(contentPlanDir, "mailing_tags.json"),
      "utf-8",
    );
    const mappingsRaw = await fs.readFile(
      path.join(contentPlanDir, "form_tag_mappings.json"),
      "utf-8",
    );
    const tags = MailingTagTaxonomySchema.parse(JSON.parse(tagsRaw));
    const mappings = FormTagMappingsSchema.parse(JSON.parse(mappingsRaw));
    crossFileErrors = validateFormTagRefs(tags, mappings);
  } catch {
    crossFileErrors = ["Could not run cross-file validation (parse errors above)"];
  }

  // Cross-file validation: CTA catalog business rules
  let ctaErrors: string[] = [];
  let ctaWarnings: string[] = [];
  try {
    const ctaRaw = await fs.readFile(
      path.join(contentPlanDir, "cta_catalog.json"),
      "utf-8",
    );
    const taxRaw = await fs.readFile(
      path.join(contentPlanDir, "article_taxonomy.json"),
      "utf-8",
    );
    const quizRawCta = await fs.readFile(
      path.join(contentPlanDir, "quiz_taxonomy.json"),
      "utf-8",
    );
    const mfRawCta = await fs.readFile(
      path.join(contentPlanDir, "mailing_form_catalog.json"),
      "utf-8",
    );
    const catalog = CtaCatalogSchema.parse(JSON.parse(ctaRaw));
    const taxonomy = ArticleTaxonomySchema.parse(JSON.parse(taxRaw));
    const quizTaxCta = QuizTaxonomySchema.parse(JSON.parse(quizRawCta));
    const mfCatalog = MailingFormCatalogSchema.parse(JSON.parse(mfRawCta));
    const categorySlugs = taxonomy.categories.map((c) => c.slug);
    const quizSlugs = quizTaxCta.entries.map((q: { slug: string }) => q.slug);
    const coursePageUrls = new Set(
      mfCatalog.filter((e) => e.type === "waitlist").map((e) => e.pageUrlPattern),
    );
    const result = validateCtaCatalog(catalog, categorySlugs, quizSlugs, coursePageUrls);
    ctaErrors = result.errors;
    ctaWarnings = result.warnings;
  } catch {
    ctaErrors = ["Could not run CTA validation (parse errors above)"];
  }

  // Cross-file validation: mailing form catalog business rules
  let mailingFormErrors: string[] = [];
  let mailingFormWarnings: string[] = [];
  try {
    const mfRaw = await fs.readFile(
      path.join(contentPlanDir, "mailing_form_catalog.json"),
      "utf-8",
    );
    const taxRawMf = await fs.readFile(
      path.join(contentPlanDir, "article_taxonomy.json"),
      "utf-8",
    );
    const quizRawMf = await fs.readFile(
      path.join(contentPlanDir, "quiz_taxonomy.json"),
      "utf-8",
    );
    const mfCatalog = MailingFormCatalogSchema.parse(JSON.parse(mfRaw));
    const taxonomyMf = ArticleTaxonomySchema.parse(JSON.parse(taxRawMf));
    const quizTaxMf = QuizTaxonomySchema.parse(JSON.parse(quizRawMf));
    const categorySlugs = taxonomyMf.categories.map((c) => c.slug);
    const quizSlugs = quizTaxMf.entries.map((q: { slug: string }) => q.slug);
    const mfResult = validateMailingFormCatalog(mfCatalog, categorySlugs, quizSlugs);
    mailingFormErrors = mfResult.errors;
    mailingFormWarnings = mfResult.warnings;
  } catch {
    mailingFormErrors = ["Could not run mailing form validation (parse errors above)"];
  }

  // Cross-file validation: cross-links (quiz connectsTo, link plan URLs)
  let crossLinkErrors: string[] = [];
  let crossLinkWarnings: string[] = [];
  try {
    const taxRaw2 = await fs.readFile(
      path.join(contentPlanDir, "article_taxonomy.json"),
      "utf-8",
    );
    const quizRaw = await fs.readFile(
      path.join(contentPlanDir, "quiz_taxonomy.json"),
      "utf-8",
    );
    const lpRaw = await fs.readFile(
      path.join(contentPlanDir, "article_link_plan.json"),
      "utf-8",
    );
    const taxonomy2 = ArticleTaxonomySchema.parse(JSON.parse(taxRaw2));
    const quizTax = QuizTaxonomySchema.parse(JSON.parse(quizRaw));
    const lp = LinkPlanSchema.parse(JSON.parse(lpRaw));
    const clResult = validateCrossLinks(lp, taxonomy2, quizTax);
    crossLinkErrors = clResult.errors;
    crossLinkWarnings = clResult.warnings;
  } catch {
    crossLinkErrors = ["Could not run cross-link validation (parse errors above)"];
  }

  // Cross-file validation: Kit integration (offline checks only)
  let kitIntErrors: string[] = [];
  let kitIntWarnings: string[] = [];
  try {
    const intRaw = await fs.readFile(
      path.join(contentPlanDir, "kit_integration.json"),
      "utf-8",
    );
    const tagsRaw3 = await fs.readFile(
      path.join(contentPlanDir, "mailing_tags.json"),
      "utf-8",
    );
    const mappingsRaw2 = await fs.readFile(
      path.join(contentPlanDir, "form_tag_mappings.json"),
      "utf-8",
    );
    const quizRaw2 = await fs.readFile(
      path.join(contentPlanDir, "quiz_taxonomy.json"),
      "utf-8",
    );
    const taxRaw3 = await fs.readFile(
      path.join(contentPlanDir, "article_taxonomy.json"),
      "utf-8",
    );
    const intSpec = KitIntegrationSpecSchema.parse(JSON.parse(intRaw));
    const tags3 = MailingTagTaxonomySchema.parse(JSON.parse(tagsRaw3));
    const mappings2 = FormTagMappingsSchema.parse(JSON.parse(mappingsRaw2));
    const quizTax2 = QuizTaxonomySchema.parse(JSON.parse(quizRaw2));
    const taxonomy3 = ArticleTaxonomySchema.parse(JSON.parse(taxRaw3));

    // Build kitTagConfig from mailing_tags (CLI has no access to kit-config.ts)
    const kitTagConfig: Record<string, number> = {};
    for (const tag of tags3) {
      if (tag.kitTagId != null) {
        kitTagConfig[tag.id] = tag.kitTagId;
      }
    }

    const categorySlugs = taxonomy3.categories.map((c) => c.slug);
    const kitResult = validateKitIntegrationOffline(
      intSpec, tags3, mappings2, quizTax2, kitTagConfig, categorySlugs,
    );
    kitIntErrors = kitResult.errors;
    kitIntWarnings = kitResult.warnings;
  } catch {
    kitIntErrors = ["Could not run Kit integration validation (parse errors above)"];
  }

  // Print results
  let allPassed = true;
  for (const r of results) {
    const status = r.ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
    const count = r.entryCount != null ? ` (${r.entryCount} entries)` : "";
    console.log(`${status}  ${r.file} → ${r.schema}${count}`);
    if (!r.ok && r.errors) {
      for (const e of r.errors.slice(0, 10)) {
        console.log(`       ${e}`);
      }
      if (r.errors.length > 10) {
        console.log(`       ... and ${r.errors.length - 10} more`);
      }
      allPassed = false;
    }
  }

  // Cross-file results
  if (crossFileErrors.length > 0) {
    console.log(
      `\n\x1b[31mFAIL\x1b[0m  Cross-file: form_tag_mappings → mailing_tags`,
    );
    for (const e of crossFileErrors) {
      console.log(`       ${e}`);
    }
    allPassed = false;
  } else {
    console.log(
      `\n\x1b[32mPASS\x1b[0m  Cross-file: form_tag_mappings → mailing_tags`,
    );
  }

  // CTA catalog validation results
  if (ctaErrors.length > 0) {
    console.log(`\n\x1b[31mFAIL\x1b[0m  Cross-file: cta_catalog business rules`);
    for (const e of ctaErrors.slice(0, 20)) {
      console.log(`       ${e}`);
    }
    if (ctaErrors.length > 20) {
      console.log(`       ... and ${ctaErrors.length - 20} more`);
    }
    allPassed = false;
  } else {
    console.log(`\n\x1b[32mPASS\x1b[0m  Cross-file: cta_catalog business rules`);
  }
  if (ctaWarnings.length > 0) {
    for (const w of ctaWarnings) {
      console.log(`       \x1b[33mWARN\x1b[0m ${w}`);
    }
  }

  // Mailing form catalog validation results
  if (mailingFormErrors.length > 0) {
    console.log(`\n\x1b[31mFAIL\x1b[0m  Cross-file: mailing_form_catalog business rules`);
    for (const e of mailingFormErrors.slice(0, 20)) {
      console.log(`       ${e}`);
    }
    if (mailingFormErrors.length > 20) {
      console.log(`       ... and ${mailingFormErrors.length - 20} more`);
    }
    allPassed = false;
  } else {
    console.log(`\n\x1b[32mPASS\x1b[0m  Cross-file: mailing_form_catalog business rules`);
  }
  if (mailingFormWarnings.length > 0) {
    for (const w of mailingFormWarnings) {
      console.log(`       \x1b[33mWARN\x1b[0m ${w}`);
    }
  }

  // Cross-link validation results
  if (crossLinkErrors.length > 0) {
    console.log(`\n\x1b[31mFAIL\x1b[0m  Cross-file: cross-links (quiz→categories, link plan→taxonomy)`);
    for (const e of crossLinkErrors.slice(0, 20)) {
      console.log(`       ${e}`);
    }
    if (crossLinkErrors.length > 20) {
      console.log(`       ... and ${crossLinkErrors.length - 20} more`);
    }
    allPassed = false;
  } else {
    console.log(`\n\x1b[32mPASS\x1b[0m  Cross-file: cross-links (quiz→categories, link plan→taxonomy)`);
  }
  if (crossLinkWarnings.length > 0) {
    for (const w of crossLinkWarnings) {
      console.log(`       \x1b[33mWARN\x1b[0m ${w}`);
    }
  }

  // Kit integration validation results
  if (kitIntErrors.length > 0) {
    console.log(`\n\x1b[31mFAIL\x1b[0m  Cross-file: Kit integration (offline)`);
    for (const e of kitIntErrors.slice(0, 20)) {
      console.log(`       ${e}`);
    }
    if (kitIntErrors.length > 20) {
      console.log(`       ... and ${kitIntErrors.length - 20} more`);
    }
    allPassed = false;
  } else {
    console.log(`\n\x1b[32mPASS\x1b[0m  Cross-file: Kit integration (offline)`);
  }
  if (kitIntWarnings.length > 0) {
    for (const w of kitIntWarnings) {
      console.log(`       \x1b[33mWARN\x1b[0m ${w}`);
    }
  }

  console.log(
    `\n${allPassed ? "\x1b[32mAll validations passed!\x1b[0m" : "\x1b[31mSome validations failed.\x1b[0m"}`,
  );

  process.exit(allPassed ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

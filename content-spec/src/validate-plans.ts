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
  LinkPlanSchema,
  PageTypesSchema,
  QuizPageTypesSchema,
  MailingTagTaxonomySchema,
  FormTagMappingsSchema,
} from "./schemas/index";
import { validateFormTagRefs } from "./schemas/mailing";
import { validateCtaCatalog } from "./validator/cta";
import { validateCrossLinks } from "./validator/cross-links";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "..", "data");

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
  const filePath = path.join(dataDir, filename);
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

  // Cross-file validation: form tag refs
  let crossFileErrors: string[] = [];
  try {
    const tagsRaw = await fs.readFile(
      path.join(dataDir, "mailing_tags.json"),
      "utf-8",
    );
    const mappingsRaw = await fs.readFile(
      path.join(dataDir, "form_tag_mappings.json"),
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
      path.join(dataDir, "cta_catalog.json"),
      "utf-8",
    );
    const taxRaw = await fs.readFile(
      path.join(dataDir, "article_taxonomy.json"),
      "utf-8",
    );
    const catalog = CtaCatalogSchema.parse(JSON.parse(ctaRaw));
    const taxonomy = ArticleTaxonomySchema.parse(JSON.parse(taxRaw));
    const categorySlugs = taxonomy.categories.map((c) => c.slug);
    const result = validateCtaCatalog(catalog, categorySlugs);
    ctaErrors = result.errors;
    ctaWarnings = result.warnings;
  } catch {
    ctaErrors = ["Could not run CTA validation (parse errors above)"];
  }

  // Cross-file validation: cross-links (quiz connectsTo, link plan URLs)
  let crossLinkErrors: string[] = [];
  let crossLinkWarnings: string[] = [];
  try {
    const taxRaw2 = await fs.readFile(
      path.join(dataDir, "article_taxonomy.json"),
      "utf-8",
    );
    const quizRaw = await fs.readFile(
      path.join(dataDir, "quiz_taxonomy.json"),
      "utf-8",
    );
    const lpRaw = await fs.readFile(
      path.join(dataDir, "article_link_plan.json"),
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

  console.log(
    `\n${allPassed ? "\x1b[32mAll validations passed!\x1b[0m" : "\x1b[31mSome validations failed.\x1b[0m"}`,
  );

  process.exit(allPassed ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

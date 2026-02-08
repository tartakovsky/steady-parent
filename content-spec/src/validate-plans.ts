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
  MailingTagTaxonomySchema,
  FormTagMappingsSchema,
} from "./schemas/index";
import { validateFormTagRefs } from "./schemas/mailing";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const researchDir = path.join(__dirname, "..", "..", "research");

interface FileResult {
  file: string;
  schema: string;
  ok: boolean;
  entryCount?: number;
  errors?: string[];
}

async function validateFile(
  filename: string,
  schemaName: string,
  schema: { parse: (data: unknown) => unknown },
): Promise<FileResult> {
  const filePath = path.join(researchDir, filename);
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
    await validateFile("form_tag_mappings.json", "FormTagMappingsSchema", FormTagMappingsSchema),
  );

  // Cross-file validation: form tag refs
  let crossFileErrors: string[] = [];
  try {
    const tagsRaw = await fs.readFile(
      path.join(researchDir, "mailing_tags.json"),
      "utf-8",
    );
    const mappingsRaw = await fs.readFile(
      path.join(researchDir, "form_tag_mappings.json"),
      "utf-8",
    );
    const tags = MailingTagTaxonomySchema.parse(JSON.parse(tagsRaw));
    const mappings = FormTagMappingsSchema.parse(JSON.parse(mappingsRaw));
    crossFileErrors = validateFormTagRefs(tags, mappings);
  } catch {
    crossFileErrors = ["Could not run cross-file validation (parse errors above)"];
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

  console.log(
    `\n${allPassed ? "\x1b[32mAll validations passed!\x1b[0m" : "\x1b[31mSome validations failed.\x1b[0m"}`,
  );

  process.exit(allPassed ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

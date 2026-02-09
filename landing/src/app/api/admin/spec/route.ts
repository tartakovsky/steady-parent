import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import {
  ArticleTaxonomySchema,
  CtaCatalogSchema,
  MailingTagTaxonomySchema,
  PageTypesSchema,
} from "@steady-parent/content-spec";

function getResearchPath(filename: string): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", filename);
  }
  return path.join(process.cwd(), "..", "research", filename);
}

async function loadAndValidate<T>(
  filename: string,
  schema: { parse: (data: unknown) => T },
): Promise<T | null> {
  try {
    const raw = await fs.readFile(getResearchPath(filename), "utf-8");
    return schema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function GET() {
  const [taxonomy, pageTypes, ctaCatalog, mailingTags] = await Promise.all([
    loadAndValidate("article_taxonomy.json", ArticleTaxonomySchema),
    loadAndValidate("page_types.json", PageTypesSchema),
    loadAndValidate("cta_catalog.json", CtaCatalogSchema),
    loadAndValidate("mailing_tags.json", MailingTagTaxonomySchema),
  ]);

  return NextResponse.json({ taxonomy, pageTypes, ctaCatalog, mailingTags });
}

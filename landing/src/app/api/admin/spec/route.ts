import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import {
  ArticleTaxonomySchema,
  CtaCatalogSchema,
  MailingTagTaxonomySchema,
  PageTypesSchema,
  QuizTaxonomySchema,
  QuizPageTypesSchema,
  LinkPlanSchema,
  validateCtaCatalog,
  buildCrossLinkDetail,
} from "@steady-parent/content-spec";

function getDataPath(filename: string): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", filename);
  }
  return path.join(process.cwd(), "..", "data", filename);
}

async function loadAndValidate<T>(
  filename: string,
  schema: { parse: (data: unknown) => T },
): Promise<T | null> {
  try {
    const raw = await fs.readFile(getDataPath(filename), "utf-8");
    return schema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function GET() {
  const [taxonomy, quizTaxonomy, pageTypes, quizPageTypes, ctaCatalog, mailingTags, linkPlan] = await Promise.all([
    loadAndValidate("article_taxonomy.json", ArticleTaxonomySchema),
    loadAndValidate("quiz_taxonomy.json", QuizTaxonomySchema),
    loadAndValidate("page_types.json", PageTypesSchema),
    loadAndValidate("quiz_page_types.json", QuizPageTypesSchema),
    loadAndValidate("cta_catalog.json", CtaCatalogSchema),
    loadAndValidate("mailing_tags.json", MailingTagTaxonomySchema),
    loadAndValidate("article_link_plan.json", LinkPlanSchema),
  ]);

  // Run CTA business-rule validation
  let ctaValidation: { errors: string[]; warnings: string[] } | null = null;
  if (ctaCatalog && taxonomy) {
    const categorySlugs = taxonomy.categories.map((c) => c.slug);
    ctaValidation = validateCtaCatalog(ctaCatalog, categorySlugs);
  }

  // Build cross-link detail (stats + per-article links + validation)
  let crossLinkDetail = null;
  if (linkPlan && taxonomy && quizTaxonomy) {
    crossLinkDetail = buildCrossLinkDetail(linkPlan, taxonomy, quizTaxonomy);
  }

  return NextResponse.json({
    taxonomy,
    quizTaxonomy,
    pageTypes,
    quizPageTypes,
    ctaCatalog,
    mailingTags,
    ctaValidation,
    crossLinkDetail,
  });
}

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import {
  ArticleTaxonomySchema,
  CtaCatalogSchema,
  MailingFormCatalogSchema,
  MailingTagTaxonomySchema,
  FormTagMappingsSchema,
  KitIntegrationSpecSchema,
  PageTypesSchema,
  QuizTaxonomySchema,
  QuizPageTypesSchema,
  LinkPlanSchema,
  buildCrossLinkDetail,
} from "@steady-parent/content-spec";

function getContentPlanPath(filename: string): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", filename);
  }
  return path.join(process.cwd(), "..", "content-plan", filename);
}

async function loadAndValidate<T>(
  filename: string,
  schema: { parse: (data: unknown) => T },
): Promise<T | null> {
  try {
    const raw = await fs.readFile(getContentPlanPath(filename), "utf-8");
    return schema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function GET() {
  const [taxonomy, quizTaxonomy, pageTypes, quizPageTypes, ctaCatalog, mailingFormCatalog, mailingTags, linkPlan, formTagMappings, integrationSpec] = await Promise.all([
    loadAndValidate("article_taxonomy.json", ArticleTaxonomySchema),
    loadAndValidate("quiz_taxonomy.json", QuizTaxonomySchema),
    loadAndValidate("page_types.json", PageTypesSchema),
    loadAndValidate("quiz_page_types.json", QuizPageTypesSchema),
    loadAndValidate("cta_catalog.json", CtaCatalogSchema),
    loadAndValidate("mailing_form_catalog.json", MailingFormCatalogSchema),
    loadAndValidate("mailing_tags.json", MailingTagTaxonomySchema),
    loadAndValidate("article_link_plan.json", LinkPlanSchema),
    loadAndValidate("form_tag_mappings.json", FormTagMappingsSchema),
    loadAndValidate("kit_integration.json", KitIntegrationSpecSchema),
  ]);

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
    mailingFormCatalog,
    mailingTags,
    crossLinkDetail,
    formTagMappings,
    integrationSpec,
  });
}

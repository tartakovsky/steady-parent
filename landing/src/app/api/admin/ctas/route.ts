import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import {
  ArticleTaxonomySchema,
  CtaCatalogSchema,
  QuizTaxonomySchema,
  validateCtaCatalog,
} from "@steady-parent/content-spec";

function getContentPlanPath(filename: string): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", filename);
  }
  return path.join(process.cwd(), "..", "content-plan", filename);
}

export async function GET() {
  try {
    const [ctaRaw, taxRaw, quizRaw] = await Promise.all([
      fs.readFile(getContentPlanPath("cta_catalog.json"), "utf-8"),
      fs.readFile(getContentPlanPath("article_taxonomy.json"), "utf-8"),
      fs.readFile(getContentPlanPath("quiz_taxonomy.json"), "utf-8"),
    ]);

    const catalog = CtaCatalogSchema.parse(JSON.parse(ctaRaw));
    const taxonomy = ArticleTaxonomySchema.parse(JSON.parse(taxRaw));
    const quizTaxonomy = QuizTaxonomySchema.parse(JSON.parse(quizRaw));
    const categorySlugs = taxonomy.categories.map((c) => c.slug);
    const quizSlugs = quizTaxonomy.entries.map((q: { slug: string }) => q.slug);
    const validation = validateCtaCatalog(catalog, categorySlugs, quizSlugs);

    return NextResponse.json({ catalog, categorySlugs, validation });
  } catch {
    return NextResponse.json(
      { catalog: null, categorySlugs: [], validation: null },
    );
  }
}

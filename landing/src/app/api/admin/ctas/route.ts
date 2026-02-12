import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import {
  ArticleTaxonomySchema,
  CtaCatalogSchema,
  MailingFormCatalogSchema,
  QuizTaxonomySchema,
  validateCtaCatalog,
  extractCTAsFromMdx,
} from "@steady-parent/content-spec";
import type { ExtractedCTA, EntryCheck } from "@steady-parent/content-spec";
import { blogPosts } from "@/content/blog/posts";

function getContentPlanPath(filename: string): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", filename);
  }
  return path.join(process.cwd(), "..", "content-plan", filename);
}

function getMdxPath(slug: string): string {
  return path.join(process.cwd(), "src", "content", "blog", "posts", `${slug}.mdx`);
}

// ---------------------------------------------------------------------------
// Per-article CTA check builder
// ---------------------------------------------------------------------------

function buildArticleCTAChecks(
  ctas: ExtractedCTA[],
  component: "CourseCTA" | "CommunityCTA",
  catalogEntry:
    | {
        url?: string | undefined;
        cta_copy?: {
          eyebrow: string;
          title: string;
          body: string;
          buttonText: string;
        } | undefined;
      }
    | undefined,
): Record<string, EntryCheck> {
  const checks: Record<string, EntryCheck> = {};
  const matching = ctas.filter((c) => c.component === component);
  const present = matching.length > 0;
  checks["cta"] = {
    ok: present,
    detail: present ? String(matching.length) : "missing",
  };
  if (!present) return checks;

  const cta = matching[0]!;
  if (!catalogEntry) {
    checks["href"] = { ok: false, detail: "no catalog entry" };
    return checks;
  }

  // Href check
  const expectedHref = catalogEntry.url;
  const actualHref = cta.props["href"];
  const hrefOk = !!actualHref && actualHref === expectedHref;
  checks["href"] = {
    ok: hrefOk,
    detail: !actualHref
      ? "missing"
      : hrefOk
        ? undefined
        : `got ${actualHref}`,
  };

  // Copy checks
  if (catalogEntry.cta_copy) {
    const { eyebrow, title, body, buttonText } = catalogEntry.cta_copy;
    checks["eyebrow"] = {
      ok: cta.props["eyebrow"] === eyebrow,
      detail: cta.props["eyebrow"] !== eyebrow ? "mismatch" : undefined,
    };
    checks["title"] = {
      ok: cta.props["title"] === title,
      detail: cta.props["title"] !== title ? "mismatch" : undefined,
    };
    checks["body"] = {
      ok: cta.props["body"] === body,
      detail: cta.props["body"] !== body ? "mismatch" : undefined,
    };
    checks["buttonText"] = {
      ok: cta.props["buttonText"] === buttonText,
      detail: cta.props["buttonText"] !== buttonText ? "mismatch" : undefined,
    };
  }

  return checks;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const [ctaRaw, taxRaw, quizRaw, mfRaw] = await Promise.all([
      fs.readFile(getContentPlanPath("cta_catalog.json"), "utf-8"),
      fs.readFile(getContentPlanPath("article_taxonomy.json"), "utf-8"),
      fs.readFile(getContentPlanPath("quiz_taxonomy.json"), "utf-8"),
      fs.readFile(getContentPlanPath("mailing_form_catalog.json"), "utf-8"),
    ]);

    const catalog = CtaCatalogSchema.parse(JSON.parse(ctaRaw));
    const taxonomy = ArticleTaxonomySchema.parse(JSON.parse(taxRaw));
    const quizTaxonomy = QuizTaxonomySchema.parse(JSON.parse(quizRaw));
    const mailingForms = MailingFormCatalogSchema.parse(JSON.parse(mfRaw));
    const categorySlugs = taxonomy.categories.map((c) => c.slug);
    const quizSlugs = quizTaxonomy.entries.map((q: { slug: string }) => q.slug);
    const coursePageUrls = new Set(
      mailingForms.filter((e) => e.type === "waitlist").map((e) => e.pageUrlPattern),
    );
    const validation = validateCtaCatalog(catalog, categorySlugs, quizSlugs, coursePageUrls);

    // --- Deployment analysis: read published MDX, extract CTA props ---
    const taxonomyCategorySet = new Set(categorySlugs);
    const publishedMap = new Map<
      string,
      { categorySlug: string; ctas: ExtractedCTA[] }
    >();

    for (const post of blogPosts) {
      if (!taxonomyCategorySet.has(post.meta.categorySlug)) continue;
      try {
        const mdx = await fs.readFile(getMdxPath(post.meta.slug), "utf-8");
        publishedMap.set(post.meta.slug, {
          categorySlug: post.meta.categorySlug,
          ctas: extractCTAsFromMdx(mdx),
        });
      } catch {
        // MDX not readable — skip
      }
    }

    const deployment: Record<
      string,
      {
        articles: Array<{
          slug: string;
          title: string;
          published: boolean;
          community: Record<string, EntryCheck>;
          course: Record<string, EntryCheck>;
        }>;
        publishedCount: number;
        totalCount: number;
        communityIssues: number;
        courseIssues: number;
      }
    > = {};

    for (const catSlug of categorySlugs) {
      const catArticles = taxonomy.entries.filter(
        (e) => e.categorySlug === catSlug,
      );
      const communityEntry = catalog.find(
        (c) => c.id === `community-${catSlug}`,
      );
      const courseEntry = catalog.find((c) => c.id === `course-${catSlug}`);
      let publishedCount = 0;
      let communityIssues = 0;
      let courseIssues = 0;

      const articles = catArticles.map((article) => {
        const pub = publishedMap.get(article.slug);
        if (!pub) {
          return {
            slug: article.slug,
            title: article.title,
            published: false,
            community: {} as Record<string, EntryCheck>,
            course: {} as Record<string, EntryCheck>,
          };
        }
        publishedCount++;
        const community = buildArticleCTAChecks(
          pub.ctas,
          "CommunityCTA",
          communityEntry,
        );
        const course = buildArticleCTAChecks(
          pub.ctas,
          "CourseCTA",
          courseEntry,
        );

        if (Object.values(community).some((c) => !c.ok)) communityIssues++;
        if (Object.values(course).some((c) => !c.ok)) courseIssues++;

        return {
          slug: article.slug,
          title: article.title,
          published: true,
          community,
          course,
        };
      });

      deployment[catSlug] = {
        articles,
        publishedCount,
        totalCount: catArticles.length,
        communityIssues,
        courseIssues,
      };
    }

    return NextResponse.json({ catalog, categorySlugs, validation, deployment });
  } catch {
    return NextResponse.json(
      { catalog: null, categorySlugs: [], validation: null, deployment: null },
    );
  }
}

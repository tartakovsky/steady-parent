import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import {
  ArticleTaxonomySchema,
  CtaCatalogSchema,
  MailingFormCatalogSchema,
  QuizTaxonomySchema,
  validateCtaCatalog,
  validateCtaCopy,
  extractCTAsFromMdx,
  COMMUNITY_BUTTON_TEXT,
  COMMUNITY_FOUNDER_LINE,
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

  // Href check — compare against catalog URL
  const expectedHref = catalogEntry?.url;
  const actualHref = cta.props["href"];
  const hrefOk = !!actualHref && !!expectedHref && actualHref === expectedHref;
  checks["href"] = {
    ok: hrefOk,
    detail: !actualHref
      ? "missing"
      : !expectedHref
        ? "no catalog url"
        : hrefOk
          ? undefined
          : `got ${actualHref}`,
  };

  // Full copy validation on deployed props — word counts, forbidden terms, etc.
  const eyebrow = cta.props["eyebrow"] ?? "";
  const title = cta.props["title"] ?? "";
  const body = cta.props["body"] ?? "";
  const buttonText = cta.props["buttonText"] ?? "";

  if (eyebrow && title && body) {
    const copyResult = validateCtaCopy("_", eyebrow, title, body, buttonText);
    Object.assign(checks, copyResult.checks);
  }

  // Community-specific: founder line + button text
  if (component === "CommunityCTA") {
    const founderOk = body.includes(COMMUNITY_FOUNDER_LINE);
    checks["founder"] = { ok: founderOk, detail: founderOk ? undefined : "missing" };

    const btnOk = buttonText === COMMUNITY_BUTTON_TEXT;
    checks["buttonText"] = { ok: btnOk, detail: btnOk ? buttonText : `"${buttonText}"` };
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

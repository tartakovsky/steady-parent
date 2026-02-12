/**
 * Reality-check validator — verifies deployed pages match catalog specs.
 *
 * Parses raw MDX to extract CTA component usage, then checks that
 * hrefs and component presence align with the CTA and mailing form catalogs.
 */

import type { EntryCheck } from "./cta";
import type { CtaCatalog, MailingFormCatalog } from "../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExtractedCTA {
  component: "CourseCTA" | "CommunityCTA" | "FreebieCTA";
  props: Record<string, string>;
}

export interface ArticleReality {
  slug: string;
  title: string;
  published: boolean;
  checks: Record<string, EntryCheck>;
}

export interface CategoryReality {
  slug: string;
  name: string;
  publishedCount: number;
  totalCount: number;
  status: "pass" | "fail" | "empty";
  articles: ArticleReality[];
}

export interface CoursePageReality {
  categorySlug: string;
  waitlistExists: boolean;
  hasCopy: boolean;
  pageUrl: string;
}

export interface QuizPageReality {
  slug: string;
  inRegistry: boolean;
  gateFormExists: boolean;
}

export interface RealityReport {
  categories: CategoryReality[];
  coursePages: CoursePageReality[];
  quizPages: QuizPageReality[];
  summary: {
    published: number;
    total: number;
    issues: number;
    coursePages: number;
    quizPages: number;
  };
}

// ---------------------------------------------------------------------------
// MDX CTA extraction
// ---------------------------------------------------------------------------

const CTA_COMPONENT_RE =
  /<(CourseCTA|CommunityCTA|FreebieCTA)\s+([\s\S]*?)\/?\s*>/g;
const PROP_RE = /(\w+)="([^"]*)"/g;

export function extractCTAsFromMdx(mdxContent: string): ExtractedCTA[] {
  const results: ExtractedCTA[] = [];
  let match: RegExpExecArray | null;

  // Reset lastIndex for safety
  CTA_COMPONENT_RE.lastIndex = 0;
  while ((match = CTA_COMPONENT_RE.exec(mdxContent)) !== null) {
    const component = match[1] as ExtractedCTA["component"];
    const attrString = match[2] ?? "";
    const props: Record<string, string> = {};

    PROP_RE.lastIndex = 0;
    let propMatch: RegExpExecArray | null;
    while ((propMatch = PROP_RE.exec(attrString)) !== null) {
      const key = propMatch[1];
      const val = propMatch[2];
      if (key && val !== undefined) props[key] = val;
    }

    results.push({ component, props });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Per-article validation
// ---------------------------------------------------------------------------

function validatePublishedArticle(
  categorySlug: string,
  extractedCTAs: ExtractedCTA[],
  ctaCatalog: CtaCatalog,
  mailingFormCatalog: MailingFormCatalog,
): Record<string, EntryCheck> {
  const checks: Record<string, EntryCheck> = {};

  // Find catalog entries for this category
  const courseEntry = ctaCatalog.find((c) => c.id === `course-${categorySlug}`);
  const communityEntry = ctaCatalog.find(
    (c) => c.id === `community-${categorySlug}`,
  );
  const freebieEntry = mailingFormCatalog.find(
    (c) => c.type === "freebie" && c.id === `freebie-${categorySlug}`,
  );

  // CourseCTA presence
  const courseCTAs = extractedCTAs.filter(
    (c) => c.component === "CourseCTA",
  );
  const hasCourseCTA = courseCTAs.length > 0;
  checks["courseCta"] = {
    ok: hasCourseCTA,
    detail: hasCourseCTA ? `${courseCTAs.length} found` : "missing",
  };

  // CourseCTA href
  if (hasCourseCTA && courseEntry?.url) {
    const href = courseCTAs[0]?.props["href"];
    const hrefOk = href === courseEntry.url;
    checks["courseHref"] = {
      ok: hrefOk,
      detail: href
        ? hrefOk
          ? href
          : `${href} (expected ${courseEntry.url})`
        : "no href",
    };
  } else if (hasCourseCTA) {
    checks["courseHref"] = {
      ok: false,
      detail: courseEntry ? "no href on component" : "no catalog entry",
    };
  } else {
    checks["courseHref"] = { ok: false, detail: "no CourseCTA" };
  }

  // CommunityCTA presence
  const communityCTAs = extractedCTAs.filter(
    (c) => c.component === "CommunityCTA",
  );
  const hasCommunityCTA = communityCTAs.length > 0;
  checks["communityCta"] = {
    ok: hasCommunityCTA,
    detail: hasCommunityCTA ? `${communityCTAs.length} found` : "missing",
  };

  // CommunityCTA href
  if (hasCommunityCTA && communityEntry?.url) {
    const href = communityCTAs[0]?.props["href"];
    const hrefOk = href === communityEntry.url;
    checks["communityHref"] = {
      ok: hrefOk,
      detail: href
        ? hrefOk
          ? href
          : `${href} (expected ${communityEntry.url})`
        : "no href",
    };
  } else if (hasCommunityCTA) {
    checks["communityHref"] = {
      ok: false,
      detail: communityEntry ? "no href on component" : "no catalog entry",
    };
  } else {
    checks["communityHref"] = { ok: false, detail: "no CommunityCTA" };
  }

  // Freebie (auto-injected by page component — we just check the entry exists)
  checks["freebie"] = {
    ok: !!freebieEntry,
    detail: freebieEntry ? "entry exists" : "no freebie entry",
  };

  return checks;
}

// ---------------------------------------------------------------------------
// Full report builder
// ---------------------------------------------------------------------------

interface TaxonomyArticle {
  slug: string;
  title: string;
  categorySlug: string;
}

interface TaxonomyCategory {
  slug: string;
  name: string;
}

interface PublishedArticle {
  categorySlug: string;
  extractedCTAs: ExtractedCTA[];
}

export function buildRealityReport(input: {
  taxonomyCategories: TaxonomyCategory[];
  taxonomyArticles: TaxonomyArticle[];
  publishedArticles: Map<string, PublishedArticle>;
  ctaCatalog: CtaCatalog;
  mailingFormCatalog: MailingFormCatalog;
  deployedQuizSlugs: string[];
  quizTaxonomySlugs: string[];
}): RealityReport {
  const {
    taxonomyCategories,
    taxonomyArticles,
    publishedArticles,
    ctaCatalog,
    mailingFormCatalog,
    deployedQuizSlugs,
    quizTaxonomySlugs,
  } = input;

  let totalIssues = 0;

  // --- Blog articles by category ---
  const categories: CategoryReality[] = [];

  for (const cat of taxonomyCategories) {
    const catArticles = taxonomyArticles.filter(
      (a) => a.categorySlug === cat.slug,
    );
    const articles: ArticleReality[] = [];
    let catHasIssues = false;
    let publishedCount = 0;

    for (const article of catArticles) {
      const pub = publishedArticles.get(article.slug);
      if (pub) {
        publishedCount++;
        const checks = validatePublishedArticle(
          article.categorySlug,
          pub.extractedCTAs,
          ctaCatalog,
          mailingFormCatalog,
        );
        const hasIssue = Object.values(checks).some((c) => !c.ok);
        if (hasIssue) {
          catHasIssues = true;
          totalIssues++;
        }
        articles.push({
          slug: article.slug,
          title: article.title,
          published: true,
          checks,
        });
      } else {
        articles.push({
          slug: article.slug,
          title: article.title,
          published: false,
          checks: {},
        });
      }
    }

    categories.push({
      slug: cat.slug,
      name: cat.name,
      publishedCount,
      totalCount: catArticles.length,
      status:
        publishedCount === 0
          ? "empty"
          : catHasIssues
            ? "fail"
            : "pass",
      articles,
    });
  }

  // --- Course pages ---
  const coursePages: CoursePageReality[] = [];
  for (const cat of taxonomyCategories) {
    const waitlist = mailingFormCatalog.find(
      (e) => e.type === "waitlist" && e.id === `waitlist-${cat.slug}`,
    );
    coursePages.push({
      categorySlug: cat.slug,
      waitlistExists: !!waitlist,
      hasCopy: !!waitlist?.cta_copy,
      pageUrl: waitlist?.pageUrlPattern ?? `(no waitlist for ${cat.slug})`,
    });
  }

  // --- Quiz pages ---
  const deployedSet = new Set(deployedQuizSlugs);
  const quizGateSet = new Set(
    mailingFormCatalog
      .filter((e) => e.type === "quiz-gate")
      .map((e) => e.id.replace(/^quiz-gate-/, "")),
  );

  const quizPages: QuizPageReality[] = [];
  for (const slug of quizTaxonomySlugs) {
    quizPages.push({
      slug,
      inRegistry: deployedSet.has(slug),
      gateFormExists: quizGateSet.has(slug),
    });
  }

  return {
    categories,
    coursePages,
    quizPages,
    summary: {
      published: publishedArticles.size,
      total: taxonomyArticles.length,
      issues: totalIssues,
      coursePages: coursePages.filter((c) => c.waitlistExists).length,
      quizPages: quizPages.filter((q) => q.inRegistry).length,
    },
  };
}

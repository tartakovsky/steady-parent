/**
 * Linking vs taxonomy validator — checks linking.json against taxonomy.json.
 *
 * Validates bidirectionally:
 *
 * Spec → Taxonomy (no orphans):
 * - Every blog category/article key exists in taxonomy
 * - Every quiz/course key exists in taxonomy
 * - Every link URL resolves to a real taxonomy entry
 * - Every course CTA URL matches the category's course in taxonomy
 *
 * Taxonomy → Spec (completeness):
 * - Every taxonomy entry has a linking entry
 * - Blog catalog/pillar links to all series articles in order
 * - Series articles have correct guide backlink + prev/next chain
 * - Quiz/course catalogs link to all pages
 */

import type { TaxonomySpec, ValidationIssue } from "./taxonomy";
import type { LinkingSpec } from "./linking";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build set of all valid URLs from taxonomy (blog + quiz + course). */
function buildValidUrls(taxonomy: TaxonomySpec) {
  const urls = new Set<string>();

  for (const [cat, articles] of Object.entries(taxonomy.blog)) {
    for (const [key, article] of Object.entries(articles)) {
      urls.add(article.url);
    }
  }
  for (const [, entry] of Object.entries(taxonomy.quiz)) {
    urls.add(entry.url);
  }
  for (const [, entry] of Object.entries(taxonomy.course)) {
    urls.add(entry.url);
  }

  return urls;
}

/** Get the course URL for a blog category from taxonomy. */
function courseByCat(taxonomy: TaxonomySpec): Map<string, string> {
  const map = new Map<string, string>();
  for (const [, course] of Object.entries(taxonomy.course)) {
    if ("pageType" in course) continue; // catalog
    map.set(course.categorySlug, course.url);
  }
  return map;
}

/** Get series articles for a category, sorted by seriesPosition. */
function seriesForCategory(
  taxonomy: TaxonomySpec,
  cat: string,
): { key: string; url: string; position: number }[] {
  const articles = taxonomy.blog[cat];
  if (!articles) return [];

  const series: { key: string; url: string; position: number }[] = [];
  for (const [key, article] of Object.entries(articles)) {
    if (article.pageType === "series") {
      series.push({ key, url: article.url, position: article.seriesPosition });
    }
  }
  return series.sort((a, b) => a.position - b.position);
}

// ---------------------------------------------------------------------------
// Cross-reference validation
// ---------------------------------------------------------------------------

export function validateLinkingVsTaxonomy(
  spec: LinkingSpec,
  taxonomy: TaxonomySpec,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const validUrls = buildValidUrls(taxonomy);
  const catSlugs = new Set(Object.keys(taxonomy.categories));
  const courseUrlByCat = courseByCat(taxonomy);

  // =========================================================================
  // Spec → Taxonomy (no orphans)
  // =========================================================================

  // Blog: every category key and article key must exist
  for (const [cat, articles] of Object.entries(spec.blog)) {
    if (!catSlugs.has(cat)) {
      issues.push({
        path: `blog/${cat}`,
        message: `category "${cat}" not in taxonomy`,
      });
      continue;
    }

    const taxArticles = taxonomy.blog[cat];
    if (!taxArticles) continue;

    for (const articleKey of Object.keys(articles)) {
      if (!(articleKey in taxArticles)) {
        const path =
          articleKey === "" ? `blog/${cat}/` : `blog/${cat}/${articleKey}`;
        issues.push({
          path,
          message: `article key "${articleKey}" not in taxonomy under "${cat}"`,
        });
      }
    }
  }

  // Quiz: every key must exist
  for (const quizKey of Object.keys(spec.quiz)) {
    if (!(quizKey in taxonomy.quiz)) {
      issues.push({
        path: quizKey === "" ? "quiz/" : `quiz/${quizKey}`,
        message: `quiz "${quizKey}" not in taxonomy`,
      });
    }
  }

  // Course: every key must exist
  for (const courseKey of Object.keys(spec.course)) {
    if (!(courseKey in taxonomy.course)) {
      issues.push({
        path: courseKey === "" ? "course/" : `course/${courseKey}`,
        message: `course "${courseKey}" not in taxonomy`,
      });
    }
  }

  // =========================================================================
  // URL resolution: every link URL must resolve to a taxonomy entry
  // =========================================================================

  function checkLinkResolution(
    links: { url: string }[],
    path: string,
  ) {
    for (let i = 0; i < links.length; i++) {
      const url = links[i].url;
      if (!validUrls.has(url)) {
        issues.push({
          path: `${path}/links[${i}]`,
          message: `URL "${url}" not found in taxonomy`,
        });
      }
    }
  }

  for (const [cat, articles] of Object.entries(spec.blog)) {
    for (const [key, plan] of Object.entries(articles)) {
      const path = key === "" ? `blog/${cat}/` : `blog/${cat}/${key}`;
      checkLinkResolution(plan.links, path);
    }
  }
  for (const [key, plan] of Object.entries(spec.quiz)) {
    checkLinkResolution(plan.links, key === "" ? "quiz/" : `quiz/${key}`);
  }
  for (const [key, plan] of Object.entries(spec.course)) {
    checkLinkResolution(plan.links, key === "" ? "course/" : `course/${key}`);
  }

  // =========================================================================
  // CTA resolution: course CTA URLs
  // =========================================================================

  for (const [cat, articles] of Object.entries(spec.blog)) {
    const expectedCourseUrl = courseUrlByCat.get(cat);

    for (const [key, plan] of Object.entries(articles)) {
      const path = key === "" ? `blog/${cat}/` : `blog/${cat}/${key}`;

      for (let i = 0; i < plan.ctas.length; i++) {
        const cta = plan.ctas[i];
        if (cta.type !== "course") continue;

        // Must match taxonomy course for this category
        if (expectedCourseUrl && cta.url !== expectedCourseUrl) {
          issues.push({
            path: `${path}/ctas[${i}]`,
            message: `course CTA "${cta.url}" does not match category course "${expectedCourseUrl}"`,
          });
        }

        // Must resolve to a real course
        if (!validUrls.has(cta.url)) {
          issues.push({
            path: `${path}/ctas[${i}]`,
            message: `course CTA URL "${cta.url}" not found in taxonomy`,
          });
        }
      }
    }
  }

  // =========================================================================
  // Completeness (taxonomy → spec)
  // =========================================================================

  for (const [cat, articles] of Object.entries(taxonomy.blog)) {
    const specCat = spec.blog[cat];
    for (const articleKey of Object.keys(articles)) {
      if (!specCat || !(articleKey in specCat)) {
        const path =
          articleKey === "" ? `blog/${cat}/` : `blog/${cat}/${articleKey}`;
        issues.push({
          path,
          message: "missing linking entry (exists in taxonomy but not in linking spec)",
        });
      }
    }
  }

  for (const quizKey of Object.keys(taxonomy.quiz)) {
    if (!(quizKey in spec.quiz)) {
      issues.push({
        path: quizKey === "" ? "quiz/" : `quiz/${quizKey}`,
        message: "missing linking entry (exists in taxonomy but not in linking spec)",
      });
    }
  }

  for (const courseKey of Object.keys(taxonomy.course)) {
    if (!(courseKey in spec.course)) {
      issues.push({
        path: courseKey === "" ? "course/" : `course/${courseKey}`,
        message: "missing linking entry (exists in taxonomy but not in linking spec)",
      });
    }
  }

  // =========================================================================
  // Blog catalog completeness
  // =========================================================================

  for (const [cat, articles] of Object.entries(spec.blog)) {
    const catalogPlan = articles[""];
    if (!catalogPlan) continue;

    const guideUrl = `/blog/${cat}/guide/`;
    const series = seriesForCategory(taxonomy, cat);
    const linkUrls = catalogPlan.links.map((l) => l.url);

    // Must link to guide
    if (!linkUrls.includes(guideUrl)) {
      issues.push({
        path: `blog/${cat}//links`,
        message: `catalog must link to guide article "${guideUrl}"`,
      });
    }

    // Must link to ALL series articles
    for (const s of series) {
      if (!linkUrls.includes(s.url)) {
        issues.push({
          path: `blog/${cat}//links`,
          message: `catalog missing link to series article "${s.url}" (position ${s.position})`,
        });
      }
    }

    // Series links must appear in seriesPosition order
    checkSeriesOrder(catalogPlan.links, series, `blog/${cat}/`, issues);
  }

  // =========================================================================
  // Blog pillar completeness
  // =========================================================================

  for (const [cat, articles] of Object.entries(spec.blog)) {
    const pillarPlan = articles["guide"];
    if (!pillarPlan) continue;

    const series = seriesForCategory(taxonomy, cat);
    const linkUrls = pillarPlan.links.map((l) => l.url);

    // Must link to ALL series articles
    for (const s of series) {
      if (!linkUrls.includes(s.url)) {
        issues.push({
          path: `blog/${cat}/guide/links`,
          message: `pillar missing link to series article "${s.url}" (position ${s.position})`,
        });
      }
    }

    // Series links must appear in seriesPosition order
    checkSeriesOrder(pillarPlan.links, series, `blog/${cat}/guide`, issues);
  }

  // =========================================================================
  // Series navigation (prev/next chain inferred from URLs)
  // =========================================================================

  for (const [cat, articles] of Object.entries(spec.blog)) {
    const series = seriesForCategory(taxonomy, cat);
    if (series.length === 0) continue;

    const guideUrl = `/blog/${cat}/guide/`;

    for (let idx = 0; idx < series.length; idx++) {
      const s = series[idx];
      const plan = articles[s.key];
      if (!plan) continue;

      const path = `blog/${cat}/${s.key}`;
      const linkUrls = new Set(plan.links.map((l) => l.url));

      // Must link to guide (pillar backlink)
      if (!linkUrls.has(guideUrl)) {
        issues.push({
          path: `${path}/links`,
          message: `series article (position ${s.position}) must link to guide "${guideUrl}"`,
        });
      }

      // Prev link
      if (idx > 0) {
        const prevUrl = series[idx - 1].url;
        if (!linkUrls.has(prevUrl)) {
          issues.push({
            path: `${path}/links`,
            message: `series article (position ${s.position}) must link to previous article "${prevUrl}"`,
          });
        }
      }

      // Next link
      if (idx < series.length - 1) {
        const nextUrl = series[idx + 1].url;
        if (!linkUrls.has(nextUrl)) {
          issues.push({
            path: `${path}/links`,
            message: `series article (position ${s.position}) must link to next article "${nextUrl}"`,
          });
        }
      }
    }
  }

  // =========================================================================
  // Quiz catalog completeness
  // =========================================================================

  {
    const rootPlan = spec.quiz[""];
    if (rootPlan) {
      const linkUrls = rootPlan.links.map((l) => l.url);
      for (const [slug, quiz] of Object.entries(taxonomy.quiz)) {
        if (slug === "") continue; // catalog itself
        if (!linkUrls.includes(quiz.url)) {
          issues.push({
            path: "quiz//links",
            message: `quiz catalog missing link to "${quiz.url}"`,
          });
        }
      }
    }
  }

  // =========================================================================
  // Course catalog completeness
  // =========================================================================

  {
    const rootPlan = spec.course[""];
    if (rootPlan) {
      const linkUrls = rootPlan.links.map((l) => l.url);
      for (const [slug, course] of Object.entries(taxonomy.course)) {
        if (slug === "") continue; // catalog itself
        if (!linkUrls.includes(course.url)) {
          issues.push({
            path: "course//links",
            message: `course catalog missing link to "${course.url}"`,
          });
        }
      }
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check that series article links appear in seriesPosition order among the
 * page's links. Non-series links can appear anywhere (before, between, after).
 */
function checkSeriesOrder(
  links: { url: string }[],
  series: { url: string; position: number }[],
  path: string,
  issues: ValidationIssue[],
) {
  if (series.length === 0) return;

  const seriesUrlSet = new Set(series.map((s) => s.url));
  const seriesUrlOrder = series.map((s) => s.url);

  // Extract only the series URLs from links, in the order they appear
  const actualOrder = links
    .map((l) => l.url)
    .filter((url) => seriesUrlSet.has(url));

  // Compare against expected order
  for (let i = 0; i < actualOrder.length; i++) {
    if (i < seriesUrlOrder.length && actualOrder[i] !== seriesUrlOrder[i]) {
      issues.push({
        path: `${path}/links`,
        message: `series links out of order: expected "${seriesUrlOrder[i]}" at position ${i + 1}, got "${actualOrder[i]}"`,
      });
      break; // one error is enough to signal misordering
    }
  }
}

# Deployed Reality Check — verify actual pages match catalog specs

**Date:** 2026-02-12 14:38
**Scope:** content-spec/src/validator/reality-check.ts, content-spec/src/index.ts, landing/src/app/api/admin/reality-check/route.ts, landing/src/app/admin/deployed/page.tsx, landing/src/components/admin/admin-sidebar.tsx

## Summary
Added a new "Deployed" admin page that reads actual MDX files, extracts CTA component usage via regex, and compares against the CTA and mailing form catalogs. Shows per-category expandable accordion with per-article drill-down for blog CTAs, plus tables for course pages and quiz pages.

## Context & Problem
The CTA and mailing form admin pages validated catalog data quality (word counts, forbidden terms, coverage) but never checked what's actually deployed on the site. The user wanted to see at a glance: "for each published page, are the right CTAs there with correct hrefs?" With only 5/245 articles published, finding issues early before mass generation is critical.

The previous attempt (cross-referencing JSON catalogs for URL columns) was rejected because it validated catalog-vs-catalog, not catalog-vs-deployed-reality.

## Decisions Made

### Regex-based MDX CTA extraction
- **Chose:** Regex `/<(CourseCTA|CommunityCTA|FreebieCTA)\s+(...)\/?>/g` + prop extraction via `(\w+)="([^"]*)"`
- **Why:** MDX components have a consistent JSX format with string props in double quotes. AST parsing would require MDX compiler dependency and be slower. Regex handles the actual patterns used in these files perfectly.

### blogPosts registry as source of truth for "published"
- **Chose:** Import `blogPosts` from `@/content/blog/posts` rather than scanning filesystem for MDX files
- **Why:** The registry is what determines which pages are actually generated (via `generateStaticParams`). An MDX file on disk that's not in the registry won't become a page. This matches what "deployed" means.

### Separate page (/admin/deployed) rather than modifying existing CTA page
- **Chose:** New dedicated page under Validation group
- **Why:** The CTA page validates catalog data quality. The deployed page validates deployment reality. Different concerns, different data sources (MDX files vs JSON), different UI (per-article accordion vs per-category flat table).

### Five checks per published article
- **Chose:** courseCta (present?), courseHref (matches catalog?), communityCta (present?), communityHref (matches catalog?), freebie (entry exists for category?)
- **Why:** These are the three CTA types on blog articles. CourseCTA and CommunityCTA are inline in MDX. FreebieCTA is auto-injected by the page component from mailing_form_catalog, so we just check the catalog entry exists.

## Architectural Notes
- The reality-check validator lives in content-spec (pure logic, no Next.js dependency) so it could be used by CLI tools too
- The API route handles the I/O: reading MDX files, loading catalogs, importing quiz registry
- Category `"tools"` (used by `welcome.mdx`) is not in the article taxonomy, so those articles are correctly filtered out
- The page already detected a real issue: MDX articles use `steady-parent-1727` Skool URL but catalog has `steady-parent` — this is a genuine href mismatch

## Key Files for Context
- `content-spec/src/validator/reality-check.ts` — extractCTAsFromMdx + buildRealityReport
- `landing/src/app/api/admin/reality-check/route.ts` — API route (reads MDX, loads catalogs)
- `landing/src/app/admin/deployed/page.tsx` — accordion UI with per-category/article drill-down
- `landing/src/content/blog/posts.ts` — blogPosts registry (source of truth for published articles)
- `.worklogs/2026-02-12-141137-cta-url-columns.md` — prior worklog for the URL columns approach (now superseded)

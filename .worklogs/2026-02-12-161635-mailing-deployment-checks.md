# Add freebie deployment checks to mailing page, fix status icon

**Date:** 2026-02-12 16:16
**Scope:** landing/src/app/api/admin/mailing/route.ts, landing/src/app/admin/mailing/page.tsx, landing/src/app/admin/ctas/page.tsx

## Summary
Added per-article freebie deployment validation to the mailing forms page, matching the pattern from the CTA page. Fixed FreebieRow status icon bug that showed green even when articles were missing. Collapsed accordions by default. Added visual separation (left border indent) to sub-tables on both pages.

## Context & Problem
The mailing forms freebie table had expandable rows but the sub-table only showed article slug + "Live" status — no actual freebie validation columns. The category status icon was also incorrect: `FreebieRow` recomputed `hasErrors` internally using only `ev.errors.length`, ignoring deployment issues (missing articles, check failures). The parent passed a correct `rowBg` (red), but the icon stayed green — a visual contradiction.

## Decisions Made

### Five freebie check columns per published article
- **Chose:** Entry, Name, Description, Copy (cta_copy), Kit form
- **Why:** These are the five things that must be true for a freebie to render correctly on a published article. FreebieCTA is auto-injected by the page component using `getFreebieForCategory()` which reads `mailing_form_catalog.json`. It needs: the entry to exist, `name` (used for title), `what_it_is` (used for body), `cta_copy` (catalog completeness), and a Kit form mapping (for email collection to work).

### Category-level checks applied to all published articles
- **Chose:** Compute freebie checks once per category, apply to all published articles in that category
- **Why:** FreebieCTA is the same for every article in a category — it's auto-injected, not per-article MDX. If the freebie entry is broken, ALL articles in that category are affected. Showing the same check per article is still useful because it makes the scope of the problem visible.

### Pass deploymentIssues count to FreebieRow
- **Chose:** Compute `missingArticles + checkFailures` in CheckTable, pass as prop to FreebieRow
- **Why:** FreebieRow needs this to show the correct status icon. Previously it only had `ev` (catalog errors) — now it combines catalog + deployment state.

## Key Files for Context
- `landing/src/app/api/admin/mailing/route.ts` — enriched articlesByCategory with per-article freebie checks
- `landing/src/app/admin/mailing/page.tsx` — ArticleListSubTable with 5 check columns, fixed FreebieRow status
- `landing/src/app/admin/ctas/page.tsx` — collapsed by default, visual separation
- `landing/src/app/(public)/blog/[category]/[slug]/page.tsx` — how FreebieCTA is auto-injected
- `landing/src/lib/mailing-form-catalog.ts` — getFreebieForCategory reads catalog

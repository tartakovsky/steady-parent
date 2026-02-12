# Inline deployment analysis on CTA and Mailing Forms pages

**Date:** 2026-02-12 15:03
**Scope:** landing/src/app/api/admin/ctas/route.ts, landing/src/app/admin/ctas/page.tsx, landing/src/app/api/admin/mailing/route.ts, landing/src/app/admin/mailing/page.tsx, landing/src/components/admin/admin-sidebar.tsx, content-spec/src/index.ts

## Summary
Integrated per-article deployment analysis directly into the existing CTA Validation and Mailing Forms Validation admin pages. Each per-category row now has a "Live" column showing published/total counts and is expandable to reveal per-article CTA checks. Deleted the separate `/admin/deployed` page, its API route, and sidebar entry.

## Context & Problem
The previous session created a standalone `/admin/deployed` page with its own API route and tables for "reality checking" deployed pages against catalog specs. The user rejected this approach — the analysis should be embedded INTO the existing validation tables, not in a separate page. The key requirements:
- No new tables — add columns to existing tables
- Per-category rows become expandable accordions showing per-article status
- Category status reflects children: can't be green if any article inside is red
- Checks per article: CTA presence, href correctness, copy field matching

## Decisions Made

### Inline in existing tables, not a separate page
- **Chose:** Add "Live" column + expandable accordion rows to existing CheckTable components
- **Why:** User explicitly asked for deployment data on existing pages, not a new page. The validation context is already there — adding deployment checks alongside catalog checks provides a single view.

### Per-article CTA checks via MDX regex extraction
- **Chose:** Read published MDX files, extract CTA components via regex, compare props against catalog
- **Why:** MDX CTA components have consistent JSX syntax (`<CourseCTA href="..." eyebrow="...">`). Regex extraction from `content-spec/src/validator/reality-check.ts` (extractCTAsFromMdx) handles this reliably.

### Six check columns for article sub-tables (CTA page)
- **Chose:** CTA (present?), Href (matches catalog url?), Eyebrow, Title, Body, ButtonText (match cta_copy?)
- **Why:** These are exactly the props written into MDX by the article generator. If any mismatch, the article needs regeneration.

### Simpler expansion for freebie table (Mailing page)
- **Chose:** Show article slug + published status only (no per-article CTA field checks)
- **Why:** FreebieCTA is auto-injected by the page component based on category — there are no MDX-embedded props to validate per article. The freebie catalog entry existence is already validated at the category level.

### buildArticleCTAChecks in the API route, not in content-spec
- **Chose:** Put the per-article check builder in the CTA API route file
- **Why:** It needs access to the catalog entry type from the Zod schema. Keeping it in the route alongside the MDX reading logic avoids adding more cross-package dependencies.

## Architectural Notes
- `extractCTAsFromMdx` remains in content-spec (reusable pure function)
- `buildRealityReport` and its types removed from content-spec exports — no longer needed since the analysis is done inline in each API route
- The CTA API route now reads published MDX files (via `blogPosts` registry) and returns `deployment` data alongside existing `catalog` and `validation`
- The Mailing API route returns `articlesByCategory` for freebie table expansion
- Auto-expansion: categories with deployment issues are automatically expanded on page load
- Category row status combines catalog validation errors AND deployment issues — red if either fails

## Key Files for Context
- `landing/src/app/api/admin/ctas/route.ts` — CTA API: reads MDX, extracts CTAs, builds per-category deployment data
- `landing/src/app/admin/ctas/page.tsx` — CTA page: expandable CheckTable with per-article drill-down
- `landing/src/app/api/admin/mailing/route.ts` — Mailing API: adds articlesByCategory with published status
- `landing/src/app/admin/mailing/page.tsx` — Mailing page: expandable freebie table with article list
- `content-spec/src/validator/reality-check.ts` — extractCTAsFromMdx (still used) + buildRealityReport (no longer exported)
- `landing/src/content/blog/posts.ts` — blogPosts registry (source of truth for published articles)
- `.worklogs/2026-02-12-143814-deployed-reality-check.md` — prior worklog for the rejected separate-page approach

## Open Questions / Future Considerations
- 3 categories (anxiety, sleep, tantrums) currently show deployment issues — likely the Skool URL mismatch (community CTA href `steady-parent-1727` vs catalog `steady-parent`)
- As more articles are generated, the per-article sub-tables will grow; may need pagination or collapse-all toggle
- The `buildRealityReport` function in reality-check.ts is now dead code (not exported) — could be deleted entirely

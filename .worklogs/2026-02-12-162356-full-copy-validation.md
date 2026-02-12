# Full copy validation on deployed CTA props

**Date:** 2026-02-12 16:23
**Scope:** landing/src/app/api/admin/ctas/route.ts, landing/src/app/admin/ctas/page.tsx

## Summary
Per-article CTA sub-table now runs full copy validation (word counts, forbidden terms, founder line, button text) on deployed MDX props instead of just checking "matches catalog". Added Match, Clean, Founder columns.

## Context & Problem
The per-article sub-table previously only checked whether deployed props matched the catalog copy. This missed actual content quality issues: a deployed article could have an eyebrow that's too long, missing founder line, wrong button text, or forbidden terms — and none of that would show. The catalog checks on the category row showed green because catalog data was valid, but the deployed reality had issues invisible to the admin.

## Decisions Made

### Run validateCtaCopy on deployed props, not just compare to catalog
- **Chose:** Call `validateCtaCopy` with the actual MDX-extracted props to get word count checks + forbidden terms check, then add founder line and button text checks separately
- **Why:** The catalog copy and deployed copy may differ (articles were generated with per-article creative copy). Both need to pass the same rules independently. Checking "matches catalog" is now a separate "Match" column.

### Different columns for Community vs Course sub-tables
- **Chose:** Community gets: CTA, Href, Match, Eyebrow (wc), Title (wc), Body (wc), Clean, Founder, Button. Course gets: CTA, Href, Match, Eyebrow (wc), Title (wc), Body (wc), Clean. Founder and Button show as dashes for course.
- **Why:** `COMMUNITY_FOUNDER_LINE` and `COMMUNITY_BUTTON_TEXT` are community-specific rules. Course CTAs don't have these constraints. The `buildArticleCTAChecks` function simply doesn't add those checks for CourseCTA, so `CellIcon` renders a dash.

## Key Files for Context
- `landing/src/app/api/admin/ctas/route.ts` — `buildArticleCTAChecks` now calls `validateCtaCopy` + community-specific checks
- `landing/src/app/admin/ctas/page.tsx` — ARTICLE_CHECK_COLUMNS updated with Match, Clean, Founder
- `content-spec/src/validator/cta.ts` — `validateCtaCopy`, `COMMUNITY_BUTTON_TEXT`, `COMMUNITY_FOUNDER_LINE`

# Dim catalog checks, remove Match, full freebie copy validation

**Date:** 2026-02-12 16:34
**Scope:** landing/src/app/api/admin/ctas/route.ts, landing/src/app/admin/ctas/page.tsx, landing/src/app/api/admin/mailing/route.ts, landing/src/app/admin/mailing/page.tsx

## Summary
Three fixes: (1) removed useless "Match" column from CTA article sub-table, (2) dimmed catalog check cells on category rows when deployment has issues so green catalog checks don't mislead, (3) replaced mailing freebie sub-table existence checks (Entry, Name, Desc, Copy, Kit) with actual rendered copy validation (Eyebrow, Title, Body, Clean, Kit) using `validateCtaCopy`.

## Context & Problem
User feedback identified three problems:
1. "Match" column only showed "differs from catalog" — useless information since deployed articles have per-article creative copy that intentionally differs from catalog templates.
2. Category rows showed green catalog checks (e.g., eyebrow 4w, title 5w) while all articles inside the accordion were red. This was misleading — catalog data being valid is irrelevant when nothing is deployed correctly.
3. Mailing freebie sub-table only checked whether catalog entries existed (Entry, Name, Desc, Copy, Kit) but never validated the actual rendered content. No word count checks, no forbidden term checks.

## Decisions Made

### Remove "Match" column entirely
- **Chose:** Delete the match check from `buildArticleCTAChecks` and remove from `ARTICLE_CHECK_COLUMNS`
- **Why:** Per-article creative copy intentionally differs from catalog templates. "Differs from catalog" conveys no actionable information.

### Dim catalog check cells when deployment has issues
- **Chose:** Pass `dimmed={issues > 0}` to `CellIcon` on category row catalog checks. `dimmed` renders as `opacity-30` on green checks.
- **Why:** Catalog checks being green is technically correct but misleading when deployment is broken. Dimming preserves the information but prevents the false impression that "everything is fine."
- **Applied to:** Both CTA page (CategoryRow) and mailing page (FreebieRow)

### Compute actual rendered freebie values for validation
- **Chose:** In mailing API, compute the exact values that FreebieCTA renders on the page, then run `validateCtaCopy` on them
- **Why:** FreebieCTA is auto-injected by the page component. It uses: eyebrow = "Not ready for a course yet?" (default), title = "Get [the] {name}", body = what_it_is, buttonText = "Send me the sheet" (default). These are the values that should be validated — not abstract catalog fields.

## Key Files for Context
- `landing/src/app/api/admin/ctas/route.ts` — removed match check from buildArticleCTAChecks
- `landing/src/app/admin/ctas/page.tsx` — removed Match from ARTICLE_CHECK_COLUMNS, added dimmed prop to catalog checks
- `landing/src/app/api/admin/mailing/route.ts` — freebie checks now compute rendered values and run validateCtaCopy
- `landing/src/app/admin/mailing/page.tsx` — FREEBIE_CHECK_COLUMNS now Eyebrow/Title/Body/Clean/Kit, CellIcon has dimmed prop
- `landing/src/components/blog/freebie-cta.tsx` — FreebieCTA component with defaults
- `landing/src/app/(public)/blog/[category]/[slug]/page.tsx` — how freebie title/body are computed from catalog

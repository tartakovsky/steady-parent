# Rewrite linking validator: drop link types, split cross-ref

**Date:** 2026-02-14 12:09
**Scope:** new_validation/validators/spec/linking.ts, new_validation/validators/spec/linking-cross-ref.ts, new_validation/validators/spec/index.ts, scripts/migrate_linking_spec.py, new_validation/spec/linking.json

## Summary
Rewrote linking validator for the new 3-section structure. Dropped link types entirely (links are now `{url, intent}` only). Split cross-ref validation into its own file. Navigation structure is inferred from URLs against taxonomy.

## Context & Problem
The old linking.ts used the flat structure, had freebie in CTA types, expected 3 CTAs per entry. After restructuring linking.json to blog/quiz/course sections, the validator needed a full rewrite. User also decided link types are not useful — the editorial types (cross/sibling/quiz/series_preview) are redundant with URLs, and nav structure (prev/next/pillar) can be inferred during cross-ref validation.

## Decisions Made

### Drop link types entirely (Option B)
- **Chose:** Links are `{url, intent}` — no `type` field
- **Why:** Editorial types (cross/sibling/quiz) are redundant with URLs. Nav types (pillar/prev/next) can be inferred from URL + taxonomy seriesPosition. Simplifies schema, eliminates wrong-type-for-URL bugs, removes per-page-type allowed-type nonsense. Quiz/course catalog links were awkwardly typed as "series_preview" when no series exists.
- **Alternatives considered:**
  - Keep only nav types (pillar/prev/next) — rejected because even those can be inferred from URLs
  - Keep all types — rejected as unnecessary complexity

### Cross-ref in separate file
- **Chose:** `linking-cross-ref.ts` for taxonomy-dependent validation
- **Why:** User requested it. Clean separation: linking.ts has schemas + structural checks, linking-cross-ref.ts has taxonomy-dependent checks.

### No URL prefix restrictions
- **Chose:** Don't restrict which URL prefixes can appear on which page types
- **Why:** Overfitting to current data. External URLs exist (Skool community). Quiz pages could link to courses. Restricting prefixes is arbitrary and fragile.

## Architectural Notes
- **Structural validator** infers page type from keys: `""` = catalog, `"guide"` = pillar, other = series (blog) or page (quiz/course)
- **Cross-ref validator** infers navigation from URLs + taxonomy:
  - Series articles must link to their guide URL (pillar backlink)
  - Adjacent series articles must link to each other (prev/next chain)
  - Catalog/pillar pages must link to all series articles in correct order
  - Quiz/course catalogs must link to all their pages
- 15 structural issues found: all duplicate link URLs in source data (article_link_plan.json)
- 0 cross-ref issues: all navigation chains correct, all catalogs complete

## Key Files for Context
- `new_validation/validators/spec/linking.ts` — Zod schemas + 20 structural checks
- `new_validation/validators/spec/linking-cross-ref.ts` — 22 cross-ref checks against taxonomy
- `new_validation/validators/spec/index.ts` — barrel exports
- `new_validation/spec/linking.json` — 311 entries, link `type` field removed
- `scripts/migrate_linking_spec.py` — no longer emits link `type`
- `.worklogs/2026-02-14-110014-linking-spec-restructure.md` — prior worklog

## Next Steps / Continuation Plan
1. Analyze what's actually in the spec, where we overfitted checks to data, and what else is worth validating
2. The 15 duplicate link URLs need investigation — are they bugs in article_link_plan.json or intentional?

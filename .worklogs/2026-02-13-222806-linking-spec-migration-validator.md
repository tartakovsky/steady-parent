# Linking spec — migration script + validator

**Date:** 2026-02-13 22:28
**Scope:** `scripts/migrate_linking_spec.py`, `new_validation/spec/linking.json`, `new_validation/validators/spec/linking.ts`, `new_validation/validators/spec/index.ts`

## Summary
Built the linking spec migration script and validator. Migrates `article_link_plan.json` into nested `{category}/{articleKey}` structure, remapping pillar URLs from `/blog/{cat}/` to `/blog/{cat}/guide/`. Validator catches 15 duplicate link URLs (real data bugs) and 20 missing catalog entries (expected — no source data for new catalog pages).

## Context & Problem
The link plan source (`article_link_plan.json`) is a flat array of 245 entries with old URL structure where pillar articles sat at `/blog/{cat}/`. The new taxonomy has catalogs at category root and pillars at `/blog/{cat}/guide/`. Need to migrate the link plan to the new nested key structure and remap URLs accordingly.

## Decisions Made

### Pillar URL remapping
- **Chose:** Remap pillar entry URLs and all `type: "pillar"` link targets from `/blog/{cat}/` → `/blog/{cat}/guide/`
- **Why:** The pillar article content moved to the guide slug. Series articles' `pillar` links semantically reference the guide article, not the catalog page.

### No catalog entries in migration
- **Chose:** Don't create catalog link plan entries (migration only includes the 245 entries from source data)
- **Why:** No source data exists for catalog page links. The cross-ref validator correctly flags 20 missing catalog entries. These need to be authored separately.

### Validator structure: three layers
- **Chose:** Zod schema → `validateLinking()` (structural) → `validateLinkingCrossRefs(linking, taxonomy)` (cross-ref)
- **Why:** Structural checks (duplicates, CTA counts, URL formats) don't need taxonomy. Cross-ref checks (URL resolution, completeness) do.

### Cross-ref uses real TaxonomySpec type
- **Chose:** Import `TaxonomySpec` from taxonomy.ts (not the old `TaxonomyForCrossRef` placeholder)
- **Why:** This is new code — no reason to use the deprecated interface.

## Known Issues
- **15 duplicate link URLs** in source data: real bugs where the same URL appears twice in an article's links array
- **20 missing catalog entries**: expected gap — catalog pages need link plans authored separately

## Key Files for Context
- `scripts/migrate_linking_spec.py` — migration from link_plan source
- `new_validation/spec/linking.json` — generated linking spec (20 categories, 245 articles, 1915 links, 735 CTAs)
- `new_validation/validators/spec/linking.ts` — Zod schemas + structural + cross-ref validators
- `.worklogs/2026-02-13-222015-catalog-empty-key.md` — prior: catalog empty key decision
- `.worklogs/2026-02-13-220841-catalog-migration.md` — prior: catalog migration

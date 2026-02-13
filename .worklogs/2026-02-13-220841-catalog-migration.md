# Catalog page migration — spec data updated to match new validators

**Date:** 2026-02-13 22:08
**Scope:** `scripts/migrate_taxonomy_spec.py`, `new_validation/spec/taxonomy.json`

## Summary
Updated migration script to emit catalog entries and remap pillar slugs. taxonomy.json now passes all validators: 20 catalogs at `/blog/{cat}/`, 20 pillars at `/blog/{cat}/guide/`, 225 series unchanged. Total entries: 265 (was 245).

## Changes

### Migration script
- Pillar entries now emit TWO entries: catalog (at category slug) + pillar (at "guide" slug)
- Catalog title: "{Category Name} Article Series"
- Catalog URL: `/blog/{cat}/` (takes over old pillar URL)
- Pillar URL: `/blog/{cat}/guide/` (new)
- Added safety check: error if any category has no pillar entry
- Added `catalog` page type constraint: `{ requiresDescription: true }`

### taxonomy.json
- 265 entries (was 245): +20 catalog pages
- `pageTypes.article` now has 3 types: catalog, pillar, series

## Key Files for Context
- `scripts/migrate_taxonomy_spec.py` — updated migration
- `new_validation/spec/taxonomy.json` — regenerated
- `.worklogs/2026-02-13-220357-catalog-page-validators.md` — prior: validator changes

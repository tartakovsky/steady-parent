# Catalog pages use empty string key — key path maps to URL

**Date:** 2026-02-13 22:20
**Scope:** `new_validation/validators/spec/taxonomy.ts`, `scripts/migrate_taxonomy_spec.py`, `new_validation/spec/taxonomy.json`

## Summary
Changed catalog entries from using category slug as key (`blog/tantrums/tantrums`) to empty string (`blog/tantrums/`). Key path now directly constructs the URL: empty key = category root `/blog/{cat}/`.

## Context & Problem
`blog/tantrums/tantrums` implied URL `/blog/tantrums/tantrums/` but actual URL is `/blog/tantrums/`. The double nesting was misleading. Key paths should map to URL paths.

## Decisions Made

### Empty string key for catalog
- **Chose:** `""` as the catalog entry key within each category
- **Why:** Key path `blog/{cat}/""` → URL `/blog/{cat}/`. The empty key represents "no slug after category" which is exactly what the catalog URL is.
- **Schema:** Inner record key changed to `z.union([SlugSchema, z.literal("")])` to allow the empty key alongside normal slugs.

### URL check simplified
- **Chose:** Single URL formula: `articleKey === "" ? /blog/{cat}/ : /blog/{cat}/{key}/`
- **Why:** No special-casing per pageType needed — the key directly determines the URL for all page types.

## Key Files for Context
- `new_validation/validators/spec/taxonomy.ts` — schema + structural checks updated
- `scripts/migrate_taxonomy_spec.py` — emits `""` key for catalogs
- `.worklogs/2026-02-13-220841-catalog-migration.md` — prior: catalog migration

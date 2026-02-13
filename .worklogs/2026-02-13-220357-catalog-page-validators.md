# Catalog page type + pillar slug "guide" — validator changes ahead of spec

**Date:** 2026-02-13 22:03
**Scope:** `new_validation/validators/spec/taxonomy.ts`, `new_validation/validators/spec/index.ts`

## Summary
Changed taxonomy validator to enforce new URL structure: category root (`/blog/{cat}/`) is a catalog grid page, pillar article moves to `/blog/{cat}/guide/`. Validators updated FIRST — current spec data correctly fails with 60 errors (20 missing catalogs + 20 wrong pillar slugs + 20 wrong pillar URLs).

## Context & Problem
Category root was previously the pillar article. New design: category root becomes a catalog/grid page listing all articles, pillar article gets its own slug `guide`. This means:
- `/blog/tantrums/` → catalog page (article grid)
- `/blog/tantrums/guide/` → pillar article (the comprehensive guide)
- `/blog/tantrums/why-kids-have-tantrums/` → series article (unchanged)

## Decisions Made

### Catalog page type
- **Chose:** `catalog` as third article page type alongside `pillar` and `series`
- **Why:** It's a grid/listing page at category root. Has authored content (at least a description). Needs its own page type constraints.

### Pillar slug universally "guide"
- **Chose:** Every pillar article across all 20 categories gets slug `guide`
- **Why:** Universal, SEO-friendly, matches "complete guide to X" title pattern

### CatalogPageTypeSchema placeholder
- **Chose:** Minimal `{ requiresDescription: boolean }` — will be extended when full constraints are known
- **Why:** We know a description is required but don't know the full shape yet

### Slug uniqueness changed to per-category
- **Chose:** Per-category uniqueness instead of global
- **Why:** `guide` slug appears in all 20 categories; global uniqueness impossible with universal pillar slugs. Per-category is the real constraint since URLs include category prefix.

### Linking spec will cover catalog links
- **Chose:** Catalog page's article links go in linking spec, not assumed from taxonomy
- **Why:** Linking spec is for ALL links — no assumptions about what links to what

## Structural Checks (updated)
1. Blog category keys → categories
2. Every category has ≥1 article
3. **NEW:** Exactly 1 catalog per category, slug == category slug, URL == `/blog/{cat}/`
4. **CHANGED:** Exactly 1 pillar per category, slug == `guide` (was: slug == category slug)
5. **CHANGED:** URL format: catalog `/blog/{cat}/`, pillar `/blog/{cat}/guide/`, series `/blog/{cat}/{slug}/`
6. seriesPosition sequential
7-13. (unchanged quiz/course checks)
14. **CHANGED:** Slug uniqueness per-category (was: global)

## Verification
- Current taxonomy.json correctly FAILS with 60 errors:
  - 20 "no catalog page" (every category)
  - 20 "pillar slug must be guide" (every category)
  - 20 "pillar URL expected /blog/{cat}/guide/" (every category)
- Zod also independently rejects: pageTypes.article.catalog missing

## Key Files for Context
- `new_validation/validators/spec/taxonomy.ts` — updated schemas + structural checks
- `new_validation/spec/taxonomy.json` — current data (correctly fails against new validators)
- `.worklogs/2026-02-13-214145-validator-hardening.md` — prior: 7 gaps fixed

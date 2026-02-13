# Taxonomy Zod validator — schemas + structural checks

**Date:** 2026-02-13 21:27
**Scope:** `new_validation/validators/spec/taxonomy.ts`, `new_validation/validators/spec/index.ts`, `scripts/migrate_taxonomy_spec.py`, `new_validation/spec/taxonomy.json`

## Summary
Built taxonomy.ts with Zod schemas (discriminated union for articles, three separate quiz page type schemas, slug-validated record keys) and a `validateTaxonomy()` function with 11 structural checks. Normalized quiz URLs to trailing slashes for consistency with blog/course URLs.

## Context & Problem
taxonomy.json is the master registry that all other spec files cross-reference. It needed its own Zod validator following the same two-layer pattern as ctas.ts and mailing.ts: Zod schemas for shape, a validation function for relational invariants.

## Decisions Made

### Discriminated union for articles
- **Chose:** Two variants keyed on `pageType` — pillar (no seriesPosition) vs series (required seriesPosition)
- **Why:** Zod catches missing seriesPosition on series articles at parse time, no superRefine needed

### Three separate quiz page type schemas
- **Chose:** `QuizLikertPageTypeSchema`, `QuizIdentityPageTypeSchema`, `QuizAssessmentPageTypeSchema`
- **Why:** Each corresponds to a distinct page layout; if layout changes, the page type schema changes independently

### Slug validation on record keys
- **Chose:** `z.record(SlugSchema, ...)` where SlugSchema requires `^[a-z0-9]+(-[a-z0-9]+)*$`
- **Why:** Record keys are URL path segments — invalid characters would break routing

### Trailing slashes everywhere
- **Chose:** Quiz URLs now `/quiz/{slug}/` instead of `/quiz/{slug}` (no trailing slash)
- **Why:** Consistent with blog (`/blog/{cat}/`) and course (`/course/{slug}/`) URL conventions

### No warnings — errors only
- **Chose:** `ValidationIssue` has path + message, no severity field
- **Why:** Everything is either correct or wrong — no middle ground

### Validator scope: self-contained
- **Chose:** `validateTaxonomy(spec)` validates only taxonomy.json. No cross-ref against other spec files.
- **Why:** Cross-ref across spec files will be a separate dedicated validator file later. Each file validator is independent.

### Left TaxonomyForCrossRef untouched
- **Chose:** Placeholder interface in shared.ts stays, ctas.ts and mailing.ts cross-ref functions stay
- **Why:** They'll be replaced entirely by the future cross-ref validator. No point refactoring dead code.

## Structural Validation Checks (11)
1. Article category keys exist in categories
2. Every category has ≥1 article
3. Exactly 1 pillar per category
4. Pillar slug == category slug
5. URL format: pillar `/blog/{cat}/`, series `/blog/{cat}/{slug}/`
6. Quiz URL: `/quiz/{slug}/`
7. Quiz connectsTo → valid categories
8. Course categorySlug → valid category
9. Every category has exactly 1 course
10. Course URL: `/course/{slug}/`
11. Article slugs globally unique

## Verification
- Zod parse: 20 categories, 245 articles, 24 quizzes, 20 courses — all OK
- Structural validation: 0 issues
- 6 negative tests: wrong pillar slug, duplicate slug, bad connectsTo, missing course, series without seriesPosition (Zod rejects), invalid slug key (Zod rejects)

## Key Files for Context
- `new_validation/validators/spec/taxonomy.ts` — Zod schemas + validateTaxonomy()
- `new_validation/validators/spec/index.ts` — barrel exports (updated)
- `new_validation/spec/taxonomy.json` — regenerated with trailing slashes
- `scripts/migrate_taxonomy_spec.py` — updated quiz URL normalization
- `.worklogs/2026-02-13-205103-taxonomy-spec-migration.md` — prior: taxonomy.json migration
- `.worklogs/2026-02-13-201714-validation-system-plan.md` — architecture plan

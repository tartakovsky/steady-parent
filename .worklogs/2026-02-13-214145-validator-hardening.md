# Validator hardening — 7 gaps fixed across taxonomy, CTAs, and mailing

**Date:** 2026-02-13 21:41
**Scope:** `new_validation/validators/spec/shared.ts`, `new_validation/validators/spec/taxonomy.ts`, `new_validation/validators/spec/ctas.ts`, `new_validation/validators/spec/mailing.ts`, `new_validation/validators/spec/index.ts`

## Summary
Audit of all three spec validators found 7 gaps where invalid data would pass undetected. Fixed all 7: seriesPosition continuity, connectsTo dedup in taxonomy; course buttonUrl regex and record key slugs in CTAs; record key slugs and params slug validation in mailing. Moved SlugSchema to shared.ts for reuse.

## Context & Problem
After the quizType incident (validator passed when it shouldn't have), audited all three validators for similar gaps — schemas that were too loose or checks that were missing entirely.

## Fixes

### 1. Taxonomy: seriesPosition not checked for sequential continuity
- **Was:** Only checked `z.number().int().positive()` — positions 1, 1, 5 passed
- **Fixed:** Structural check verifies positions are sequential 1..N per category with no gaps or duplicates

### 2. Taxonomy: Quiz connectsTo allows duplicate categories
- **Was:** Array of slugs with no uniqueness check — `["anxiety", "anxiety"]` passed
- **Fixed:** Structural check flags duplicate entries

### 3. CTAs: Course buttonUrl too loose
- **Was:** `startsWith("/course/")` — accepted `/course/`, `/course/foo/bar/baz`, `/course/UPPER/`
- **Fixed:** Regex `^\/course\/[a-z0-9]+(-[a-z0-9]+)*\/$` validates full `/course/{slug}/` format

### 4. CTAs: Record keys not slug-validated
- **Was:** `z.record(z.string(), ...)` — any string accepted as key
- **Fixed:** `z.record(SlugSchema, ...)` — keys must be valid URL slugs

### 5. Mailing: Record keys not slug-validated
- **Was:** Same as #4
- **Fixed:** Same as #4

### 6. Mailing: params.category not slug-validated
- **Was:** `z.string().min(1)` — accepted `"FOO BAR!"`
- **Fixed:** Uses `SlugSchema`

### 7. Mailing: params.quizSlug not slug-validated
- **Was:** `z.string().min(1)` — accepted `"NOT A SLUG"`
- **Fixed:** Uses `SlugSchema`

## Architectural Note
Moved `SlugSchema` from taxonomy.ts local definition to shared.ts export, since all three validators need it. This is the first shared schema (as opposed to shared helpers/types).

## Verification
- All 3 validators pass on real data (0 Zod errors, 0 structural issues)
- 8 negative tests: all CAUGHT (seriesPosition gap, connectsTo dupes, buttonUrl variants, bad record keys, bad params slugs)

## Key Files for Context
- `new_validation/validators/spec/shared.ts` — SlugSchema now lives here
- `new_validation/validators/spec/taxonomy.ts` — checks 6 + 9 added
- `new_validation/validators/spec/ctas.ts` — buttonUrl regex, SlugSchema keys
- `new_validation/validators/spec/mailing.ts` — SlugSchema keys + params
- `.worklogs/2026-02-13-213347-taxonomy-quiztype-fix.md` — prior: quizType fix

# Mailing form Zod validators

**Date:** 2026-02-13 18:39
**Scope:** `new_validation/validators/spec/mailing.ts`, `new_validation/validators/spec/index.ts`

## Summary

Created Zod schemas for all three mailing form types (freebie, waitlist, quiz-gate) following the exact same pattern as `ctas.ts`. All 289 entries in `spec/mailing.json` pass validation. Seven negative test cases verified that word count, exclamation mark, literal buttonText/endpoint, "lead" tag, and forbidden term checks all fire correctly.

## Context & Problem

`spec/mailing.json` was created in the previous step (289 entries: 245 blog freebies, 20 course waitlists, 24 quiz gates). Now we need Zod schemas that serve as the single source of truth for validation rules — consumed by the admin UI for error display and by generator agents for constraint awareness.

## Decisions Made

### Decision 1: Reuse FORBIDDEN_TERMS and CrossRefIssue from ctas.ts

- **Chose:** Import `FORBIDDEN_TERMS`, `CrossRefIssue`, and `TaxonomyForCrossRef` from `./ctas` instead of duplicating
- **Why:** Same forbidden terms apply to mailing forms. Same cross-ref issue shape. No reason to duplicate.

### Decision 2: Literal types for fixed values

- **Chose:** `z.literal()` for waitlist buttonText ("Reserve your spot"), quiz-gate buttonText ("Send my results"), all three endpoints, and quiz-gate `fromGate: true`
- **Why:** These values are hardcoded in the components and must never vary. Literal gives TypeScript type narrowing and makes the constraint self-documenting in the schema.

### Decision 3: superRefine for dynamic checks

- **Chose:** Word counts, "lead" tag check, and clean text (exclamation marks + forbidden terms) all go in `superRefine` blocks, same as CTAs
- **Why:** These checks need runtime computation (counting words, searching strings). Zod `.refine()` can only return boolean; `.superRefine()` lets us add multiple specific error messages with paths.

### Decision 4: Cross-ref validates params consistency

- **Chose:** `validateMailingCrossRefs` checks not just key presence but also:
  - `params.category` matches parent category key for freebies
  - `params.category` is a valid category slug for waitlists
  - `params.quizSlug` matches the quiz key for quiz gates
- **Why:** These are structural invariants that should never drift. A freebie under `blog/aggression/` must have `params.category: "aggression"`.

## Key Files for Context

- `new_validation/validators/spec/mailing.ts` — the new Zod schemas (this worklog's output)
- `new_validation/validators/spec/ctas.ts` — CTA Zod schemas (same pattern, imports shared from here)
- `new_validation/validators/spec/index.ts` — barrel export (updated to include mailing exports)
- `spec/mailing.json` — the mailing form spec (289 entries)
- `.worklogs/2026-02-13-183251-spec-mailing-migration.md` — prior worklog with spec design + validator requirements

## Next Steps / Continuation Plan

1. **Commit** all uncommitted spec/validator/worklog files
2. **Decide on product name validation** — freebie titles should contain the product name (e.g. "The 3-Step Tantrum Script Cheat Sheet"). Currently deferred. Need a lookup of product names per category — options: hardcode in validator, read from old catalog, or add to taxonomy.
3. **Migrate taxonomy.json** — same spec/validator pattern for the taxonomy file
4. **Migrate linking.json** — same pattern for the link plan
5. **Wire admin Spec/ pages** to consume from `spec/` instead of `content-plan/`
6. **Wire consumers** (landing components, generator agents) to read from `spec/` files

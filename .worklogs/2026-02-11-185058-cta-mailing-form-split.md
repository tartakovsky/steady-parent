# Split CTA Catalog from Mailing Form Catalog

**Date:** 2026-02-11 18:50
**Scope:** content-spec (schemas, validators, types, validate-plans), content-plan (data files, README), landing (admin pages, API routes, runtime loaders, build script)

## Summary
Split the monolithic `cta_catalog.json` into two separate catalogs: `cta_catalog.json` (community + course CTAs) and `mailing_form_catalog.json` (freebie + waitlist + quiz-gate mailing forms). Each has its own Zod schema, validator, runtime loader, and admin UI. Added 24 quiz community CTA placeholders.

## Context & Problem
CTAs (link-out cards to Skool/course pages) and mailing forms (email capture with tags, endpoints, page URLs) were lumped together in one `cta_catalog.json` with one schema. This was wrong: freebie/waitlist/quiz-gate are mailing forms that need tags, endpoints, pageUrlPatterns — not CTAs. Quiz community CTAs didn't exist yet (inherited from article categories, copy doesn't fit).

## Decisions Made

### Separate schemas with shared CtaCopySchema
- **Chose:** Two separate Zod schemas (`CtaCatalogSchema`, `MailingFormCatalogSchema`) sharing `CtaCopySchema`
- **Why:** Clean separation of concerns — CTAs have `url`, `can_promise`, `cant_promise`; mailing forms have `tags`, `endpoint`, `pageUrlPattern`
- **Alternatives considered:**
  - Keep one schema with optional fields — rejected because it's confusing and validation can't enforce type-specific requirements

### Self-contained mailing form entries
- **Chose:** Each mailing form entry has inline `tags`, `endpoint`, `pageUrlPattern` (duplicated from form_tag_mappings)
- **Why:** Self-containment — the mailing form catalog is the single source of truth for everything a mailing form needs. form_tag_mappings kept for backward compat and other uses
- **Alternatives considered:**
  - Reference form_tag_mappings by ID — rejected because it adds indirection and makes validation harder

### Separate PlannedCtaTypeEnum for link plan
- **Chose:** Created `PlannedCtaTypeEnum = z.enum(["course", "community", "freebie"])` in link-plan.ts
- **Why:** Link plan entries reference "freebie" CTA type (the freebie CTA component in articles). Narrowing `CtaTypeEnum` to ["course", "community"] broke link plan validation
- **Alternatives considered:**
  - Keep freebie in CtaTypeEnum — rejected because freebie is not a CTA catalog entry anymore

### Quiz community CTAs as separate entries
- **Chose:** 24 `community-quiz-{slug}` entries with copy cloned from first connectsTo category
- **Why:** Quizzes need their own community CTA copy (post-quiz moment is different from article reading). Placeholders keep validator green until Phase 2 generates proper copy
- **Alternatives considered:**
  - Inherit from category at runtime — rejected because quiz CTA copy should be quiz-specific

## Architectural Notes
- `validateCtaCopy` exported from cta.ts for reuse by mailing-form.ts
- Article validator now takes optional `mailingFormCatalog` param for FreebieCTA title matching
- CTA validator takes optional `quizSlugs` param for quiz community coverage checks
- MailingFormsTab in admin spec page now reads from `mailingFormCatalog` directly (tags, endpoints come from entries, not from formTagMappings/integrationSpec)
- CtasTab quiz section uses `quizCommunityBySlug` map instead of inheriting from category communities

## Files Changed (25 files)

### content-spec
- `src/schemas/mailing-form-catalog.ts` — CREATED: MailingFormTypeEnum, MailingFormEntrySchema, MailingFormCatalogSchema
- `src/schemas/cta-catalog.ts` — MODIFIED: narrowed CtaTypeEnum to ["course", "community"]
- `src/schemas/link-plan.ts` — MODIFIED: separate PlannedCtaTypeEnum
- `src/schemas/index.ts` — MODIFIED: new exports
- `src/types.ts` — MODIFIED: MailingFormEntry, MailingFormCatalog types
- `src/validator/mailing-form.ts` — CREATED: validateMailingFormCatalog
- `src/validator/cta.ts` — MODIFIED: exported validateCtaCopy, removed freebie/waitlist, added quizSlugs
- `src/validator/article.ts` — MODIFIED: added mailingFormCatalog param
- `src/validate-plans.ts` — MODIFIED: mailing form schema + cross-file validation
- `src/index.ts` — MODIFIED: new exports

### content-plan
- `mailing_form_catalog.json` — CREATED: 64 entries (20 freebie + 20 waitlist + 24 quiz-gate)
- `cta_catalog.json` — MODIFIED: 65 entries (removed 40 freebie/waitlist, added 24 quiz community)
- `README.md` — MODIFIED: updated inventory

### landing
- `src/lib/mailing-form-catalog.ts` — CREATED: runtime loader
- `src/lib/cta-catalog.ts` — DELETED
- `src/app/(public)/blog/[category]/[slug]/page.tsx` — MODIFIED: import
- `src/app/(public)/course/[slug]/page.tsx` — MODIFIED: import + pageUrlPattern
- `src/lib/admin/sync-orchestrator.ts` — MODIFIED: load mailing form catalog, pass to validateArticle
- `src/app/api/admin/spec/route.ts` — MODIFIED: load + return mailingFormCatalog
- `src/app/api/admin/ctas/route.ts` — MODIFIED: pass quizSlugs to validator
- `src/app/api/admin/mailing/route.ts` — MODIFIED: use mailingFormCatalog
- `src/app/admin/spec/page.tsx` — MODIFIED: MailingFormEntry type, mailingFormCatalog prop, quiz community lookup
- `src/app/admin/ctas/page.tsx` — MODIFIED: removed isMailingMsg filter
- `package.json` — MODIFIED: build script copies mailing_form_catalog.json

## Verification
- `npx tsx content-spec/src/validate-plans.ts` — ALL PASS (10 schemas + 5 cross-file)
- `npm run typecheck -w content-spec` — clean
- `npm run typecheck -w landing` — clean

## Open Questions / Future Considerations
- Phase 2 (better prompts + copy regeneration) is next — community CTA copy for quizzes is placeholder
- form_tag_mappings.json still exists and is valid; tags are duplicated in mailing_form_catalog for self-containment

## Key Files for Context
- `content-spec/src/schemas/mailing-form-catalog.ts` — new mailing form Zod schema
- `content-spec/src/schemas/cta-catalog.ts` — narrowed CTA schema (community + course only)
- `content-spec/src/validator/mailing-form.ts` — mailing form validator
- `content-spec/src/validator/cta.ts` — CTA validator (with quiz community coverage)
- `content-plan/mailing_form_catalog.json` — 64 mailing form entries
- `content-plan/cta_catalog.json` — 65 CTA entries
- `landing/src/lib/mailing-form-catalog.ts` — runtime loader
- `landing/src/app/admin/spec/page.tsx` — admin spec browser (updated tabs)
- `.claude/plans/shimmering-brewing-turtle.md` — full implementation plan

## Next Steps / Continuation Plan
1. Phase 2: Create prompt templates for community CTA copy (articles + quizzes) and course CTA copy
2. Generate improved copy via LLM agents, merge into catalogs
3. Run validate-plans.ts to verify generated copy

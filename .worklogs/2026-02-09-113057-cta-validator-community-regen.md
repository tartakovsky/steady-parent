# Systematic CTA validator + community CTA regeneration with cta_copy

**Date:** 2026-02-09 11:30
**Scope:** content-spec/src/validator/cta.ts, content-spec/src/schemas/cta-catalog.ts, research/cta_catalog.json, landing/src/app/admin/spec/, research/community_cta_prompt.md

## Summary
Built a systematic CTA catalog validator (like the quiz validator), added `cta_copy` schema for community CTA component fields (eyebrow/title/body/buttonText), regenerated all 20 per-category community entries with full CTA copy + founder presence, and wired validation into both `validate-plans.ts` and the admin dashboard.

## Context & Problem
The generated per-category community CTA entries only had a `what_it_is` field, but the CommunityCTA React component needs eyebrow, title, body, and buttonText props. Also, founder presence info wasn't in the generated pitches. User feedback: "fix the prompts, fix the validator, so it does not let you pass the shit through, fix the structured output if you need, and rerun." Additionally, the user explicitly said validation should be systematic (in the validator system), not ad-hoc one-time scripts.

## Decisions Made

### Systematic validator over ad-hoc validation
- **Chose:** Created `content-spec/src/validator/cta.ts` — a reusable CTA catalog validator with business rules
- **Why:** User explicitly said "it should be in the validator system... not one-time ad hoc... systematic validator that you run either immediately after a generation, but then again in the process of production." Follows the same pattern as `validator/quiz.ts`.
- **Alternatives considered:**
  - Ad-hoc validation script in Task agent — rejected because user explicitly said no
  - Zod refinements in schema — rejected because these are cross-field and cross-entry business rules, not individual field constraints

### cta_copy as optional field on all CTA types
- **Chose:** `cta_copy: CtaCopySchema.optional()` on CtaDefinitionSchema, with the validator enforcing it on per-category community entries
- **Why:** Course and freebie entries don't need cta_copy (their CTA components are different). Making it required in the Zod schema would break those. The business rule "community entries must have cta_copy" lives in the validator.

### Prompt rewrite to include cta_copy + founder presence
- **Chose:** Updated `community_cta_prompt.md` to generate all cta_copy fields and require mentioning founders in body
- **Why:** Previous prompt only asked for `what_it_is`. The CommunityCTA component needs eyebrow/title/body/buttonText, and user wanted founder presence in the messaging.

## Architectural Notes
- CTA validator checks: cta_copy presence, word counts (eyebrow 2-5, title 5-12, body 15-30, buttonText 2-5, what_it_is 15-30), founder mention in body, no exclamation marks, no forbidden terms, empty can/cant_promise, and category coverage
- Wired into `validate-plans.ts` as cross-file validation (reads taxonomy for category slugs, checks coverage)
- Wired into admin `/api/admin/spec` route — returns `ctaValidation: { errors, warnings }`
- Admin spec CTAs tab shows green "All CTA validation checks passed" or red error list
- Community Pitch column now shows what_it_is + dashed-border box with Eyebrow/Title/Body/Button

## Key Files for Context
- `content-spec/src/validator/cta.ts` — CTA catalog validator (business rules)
- `content-spec/src/schemas/cta-catalog.ts` — Zod schema with CtaCopySchema + cta_copy field
- `research/cta_catalog.json` — 61 entries (1 global community + 20 per-cat community with cta_copy + 20 courses + 20 freebies)
- `research/community_cta_prompt.md` — updated prompt template generating cta_copy
- `research/how-to-generate-community-ctas.md` — updated how-to for new schema
- `landing/src/app/admin/spec/page.tsx` — CTAs tab with validation banner + cta_copy display
- `landing/src/app/api/admin/spec/route.ts` — runs validateCtaCatalog and returns results
- `.worklogs/2026-02-09-111112-generate-community-ctas.md` — prior community CTA generation worklog

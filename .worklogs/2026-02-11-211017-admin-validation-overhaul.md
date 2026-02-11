# Admin validation overhaul: CTA/mailing split, per-check tables, Kit integration

**Date:** 2026-02-11 21:10
**Scope:** content-spec/src/validator/cta.ts, content-spec/src/validator/mailing-form.ts, content-spec/src/validator/kit-integration.ts, content-spec/src/schemas/*, content-spec/src/validate-plans.ts, content-spec/src/types.ts, content-spec/src/index.ts, landing/src/app/admin/ctas/, landing/src/app/admin/mailing/, landing/src/app/admin/spec/, landing/src/app/api/admin/ctas/, landing/src/app/api/admin/mailing/, content-plan/mailing_form_catalog.json, content-plan/kit_integration.json, content-plan/cta_catalog.json

## Summary
Split the monolithic CTA catalog into separate CTA and mailing form catalogs with dedicated admin pages, validators, and per-check column validation tables. Added Kit integration validation layer. Overhauled admin UI from card-based to table-based per-check validation display.

## Context & Problem
The old `/admin/spec` page had a single "CTAs" tab showing everything in a flat list. Freebies, waitlists, and quiz-gates were mixed with community and course CTAs despite having different validation rules and different purposes (link-out CTAs vs email capture forms). The validation UI showed only pass/fail with no visibility into individual checks.

## Decisions Made

### Split CTA catalog into CTA + Mailing Form catalogs
- **Chose:** Two separate JSON files and validators — `cta_catalog.json` (community + course) and `mailing_form_catalog.json` (freebie + waitlist + quiz-gate)
- **Why:** Different validation rules, different admin workflows, different generation pipelines
- **Alternatives considered:**
  - Single catalog with type filtering — rejected because validators kept growing conditional branches

### Per-check column tables instead of CheckGroup summaries
- **Chose:** HTML tables where each validator check is a visible column with ✓/✗ and detail text (word counts, error reasons)
- **Why:** User needed to see exactly what passed/failed for each entry without expanding/collapsing
- **Alternatives considered:**
  - CheckGroup expandable rows — implemented first, user rejected (couldn't see individual entry status)
  - Per-entry error/warning lists — implemented second, user wanted more granularity per field

### Missing quiz-gate cta_copy = error, not warning
- **Chose:** Show red ✗ on Copy and "N/A" on all downstream fields (button, eyebrow, title, body, clean)
- **Why:** User was clear: "it's not a warning when there is no copy, it's an error"

### Kit integration validator with offline + live modes
- **Chose:** Offline validator for CLI (cross-references data files), full validator for admin (adds Kit API + code checks)
- **Why:** CLI can't call Kit API; admin API can fetch live state for richer validation

## Architectural Notes
- `EntryCheck { ok: boolean; detail?: string }` — atomic check result per field
- `EntryValidation { errors, warnings, checks: Record<string, EntryCheck> }` — per-entry structured results
- `CheckGroup` — section-level summaries (retained for backward compat, used in CTA page)
- `validateCtaCopy()` exported from cta.ts for reuse by mailing-form.ts
- Kit integration spec lives in `content-plan/kit_integration.json`, validated by `kit-integration.ts`
- Mailing page `CheckTable` computes row status inline (accounts for Kit Form mapping column which comes from a separate data source)

## Key Files for Context
- `content-spec/src/validator/cta.ts` — CTA validator with CheckGroup + EntryCheck + byEntry
- `content-spec/src/validator/mailing-form.ts` — Mailing form validator with byEntry + per-check results
- `content-spec/src/validator/kit-integration.ts` — Kit integration cross-reference validator
- `content-plan/cta_catalog.json` — 65 CTA entries (community + course)
- `content-plan/mailing_form_catalog.json` — 64 mailing form entries (freebie + waitlist + quiz-gate)
- `content-plan/kit_integration.json` — Kit integration spec (API routes, frontend checks, tag mappings)
- `landing/src/app/admin/ctas/page.tsx` — CTA validation page with per-check columns
- `landing/src/app/admin/mailing/page.tsx` — Mailing form validation page with per-check columns
- `.worklogs/2026-02-11-185058-cta-mailing-form-split.md` — prior worklog with Phase 1/2 plan
- `.worklogs/2026-02-11-130206-cta-mailing-page-type-reorg.md` — earlier restructure worklog

## Next Steps / Continuation Plan
1. Phase 2: Generate better CTA and mailing form copy — see `research/community_cta_prompt.md` and `research/how-to-generate-community-ctas.md` for existing prompts
2. Quiz-gate cta_copy generation (24 entries currently missing)
3. Fix Kit integration infrastructure errors (missing API routes, custom fields, frontend patterns)

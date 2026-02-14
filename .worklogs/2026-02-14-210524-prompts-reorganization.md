# Reorganize generation prompts into new_validation/prompts/

**Date:** 2026-02-14 21:05
**Scope:** new_validation/prompts/ (new), content-plan/ and research/ (originals preserved)

## Summary
Audited the entire generation pipeline to map which prompts generate which spec content. Copied existing prompt files into `new_validation/prompts/` organized by spec file, alongside the existing `spec/` and `validators/` directories. Originals left in place — old system (content-plan/, research/, generate_article.py) still works.

## Context & Problem
The new_validation system has spec JSON files and validators, but no clear connection to the prompts that generate the spec content. Prompts were scattered across `content-plan/` (mixed with source data and planning docs) and `research/` (how-to guides separated from their prompts). The goal is a unified structure: prompts → spec → validators.

## Decisions Made

### Copy, don't move
- **Chose:** Copy prompt files to new location, keep originals
- **Why:** `research/generate_article.py` reads `content-plan/writer_prompt.md` at runtime. Old admin APIs and validate-plans.ts still consume old catalog JSON files. Moving would break the old system before we're ready to retire it.
- **Alternative:** `git mv` — rejected because it broke generate_article.py

### Directory structure: prompts/{spec-section}/
- **Chose:** `new_validation/prompts/ctas/`, `mailing/`, `linking/`, `articles/`, `quizzes/`
- **Why:** Each subdirectory maps directly to a spec file or output type. Clear 1:1 relationship.
- **Alternative:** Flat `prompts/` with prefixed filenames — rejected, less navigable

### Rename files to shorter names
- **Chose:** `community_cta_prompt.md` → `community.md`, `waitlist_cta_prompt.md` → `waitlist.md`, etc.
- **Why:** Directory path already provides context (`prompts/ctas/community.md`). No need for `_cta_prompt` suffix.

### Put how-to docs alongside prompts
- **Chose:** `how-to-community.md` next to `community.md`, `how-to-waitlist.md` next to `waitlist.md`
- **Why:** How-to docs describe the process of running the prompt (assemble context, run agent, validate). They're inseparable from the prompt itself.

### plan-improve-copy.md at prompts root
- **Chose:** `new_validation/prompts/plan-improve-copy.md`
- **Why:** It spans CTA and mailing prompts — doesn't belong in either subdirectory. It's a planning doc for improving the prompts, relevant context for anyone working in this directory.

## Pipeline Audit Results

### Two-layer generation model
- **Layer 1:** Prompt → agent → catalog JSON (the creative content)
- **Layer 2:** Migration script → spec JSON (structural transformation, one-off)

### Prompt coverage by spec file

**taxonomy.json** — No generation prompt needed. Structural/architectural data, manually designed from taxonomy design process (Phase 3).

**ctas.json** — 3 prompts exist, all accounted for:
- `community.md` → per-category community CTA copy (20 entries, fanned out to ~245 articles)
- `course.md` → per-category course CTA copy (20 entries, fanned out to ~245 articles)
- `quiz-community.md` → per-quiz community CTA copy (24 entries)

**mailing.json** — 1 prompt exists, 1 missing:
- `waitlist.md` → per-course waitlist form copy (20 entries) — EXISTS
- Freebie form copy → per-category freebie form eyebrow/title/body (20 entries, fanned out) — MISSING
- Quiz-gate forms → use hardcoded defaults, no prompt needed

**linking.json** — Prompt missing entirely:
- Link plans with intents were generated in Phase 5 via per-category Opus calls, but the prompt was not saved
- The migration script transforms `article_link_plan.json` to spec format, but the original generation prompt is lost

**articles** — 1 prompt exists:
- `writer.md` → assembled by `generate_article.py` with source extracts, link plans, CTA catalog

**quizzes** — Prompt exists but in TypeScript:
- `landing/src/lib/quiz/quiz-prompt.ts` (634 lines) — generates prompts programmatically per quiz type

### Source data files in content-plan/ — all still active
None are orphaned. All 11 JSON files are consumed by at least one of: old admin APIs, validate-plans.ts, build script, generate_article.py, or migration scripts.

### Kit config files
`form_tag_mappings.json`, `kit_integration.json`, `mailing_tags.json` are Kit email infrastructure config. They're consumed by admin mailing APIs and validate-plans. Not generation prompts — they stay in content-plan/.

## Architectural Notes

The current prompts output the OLD catalog format (`cta_catalog.json` shape with `id`, `type`, `name`, `url`, `cta_copy`, `can_promise`, `cant_promise`). The new spec format is different (direct `eyebrow`, `title`, `body`, `buttonText`, `buttonUrl` fields validated by Zod schemas).

For the target state, prompts should either:
1. Output directly in the spec JSON shape, with Zod schemas injected into the prompt as output constraints
2. Or output a simpler intermediate format that a deterministic script transforms to spec shape

Option 1 is preferred — it eliminates the migration layer entirely. The Zod schemas in `validators/spec/*.ts` define the exact output shape, word count ranges, forbidden terms, and literal constants. These can be serialized into the prompt as constraints.

## Information Sources
- `content-plan/README.md` — current file inventory
- `research/production_process.md` — pipeline phases
- `content-plan/plan-improve-cta-and-mailing-copy-prompts.md` — freebie/quiz-gate prompt improvement plan
- Migration scripts in `scripts/` — traced input/output file dependencies
- `research/generate_article.py` — article generation pipeline (references writer_prompt.md)

## Key Files for Context
- `new_validation/prompts/README.md` — maps prompts to spec files, documents gaps
- `new_validation/prompts/ctas/community.md` — example of a generation prompt
- `new_validation/prompts/mailing/waitlist.md` — waitlist form prompt (misnamed as "CTA" in original)
- `new_validation/prompts/plan-improve-copy.md` — requirements for missing freebie prompt
- `new_validation/validators/spec/ctas.ts` — Zod schemas that should feed back into prompts
- `new_validation/validators/spec/mailing.ts` — Zod schemas for mailing forms
- `.worklogs/2026-02-14-124129-vs-taxonomy-rename.md` — prior validator work

## Next Steps / Continuation Plan

1. **Create missing freebie form prompt** (`new_validation/prompts/mailing/freebie.md`)
   - Requirements documented in `plan-improve-copy.md`
   - Should generate per-category freebie form copy: eyebrow (2-7 words), title (3-10 words), body (8-36 words)
   - Must reference Zod schema constraints from `mailing.ts` FreebieFormSchema

2. **Reconstruct missing linking prompt** (`new_validation/prompts/linking/intents.md`)
   - Phase 5 generated link plans per-category via Opus, but the prompt was lost
   - Need to reverse-engineer from `article_link_plan.json` content and linking validator constraints
   - Must specify intent format (5+ words, topical bridge trigger)

3. **Update prompts to output spec format directly**
   - Current prompts output old catalog format (`cta_catalog.json` shape)
   - Target: prompts output new spec JSON shape, validated by Zod schemas
   - Inject serialized Zod schema constraints (word counts, forbidden terms, literals) into prompts
   - This eliminates the migration script layer entirely

4. **Decide on old system retirement timeline**
   - Old: `content-plan/*.json` → `content-spec/` validators → admin APIs
   - New: `new_validation/prompts/` → agents → `new_validation/spec/*.json` → `new_validation/validators/` → admin APIs
   - Can't retire old system until new validators are wired into admin APIs and the landing app

5. **Consider: should quiz prompt move to new_validation/prompts/quizzes/?**
   - Currently `landing/src/lib/quiz/quiz-prompt.ts` — TypeScript, 634 lines, generates prompts programmatically
   - It's runtime code (not a static prompt file), so moving it may not make sense
   - Could extract the prompt text into a .md file and have the TypeScript import it

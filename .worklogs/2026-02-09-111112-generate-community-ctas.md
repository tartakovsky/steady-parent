# Generate per-category community CTA pitches

**Date:** 2026-02-09 11:11
**Scope:** research/cta_catalog.json

## Summary
Generated 20 per-category community CTA pitches via background agent, validated, and merged into cta_catalog.json. Catalog now has 61 entries (was 41).

## Context & Problem
The CTA catalog had a single global community entry. Per the plan, each of the 20 categories needs its own community pitch — same Skool group, different messaging tailored to the category topic.

## Decisions Made

### Generation via background agent
- **Chose:** Assembled the prompt from `community_cta_prompt.md` template by filling in `{{CATEGORIES_WITH_COURSES}}` from taxonomy + catalog data, launched a Task agent
- **Why:** This is the project's generation pattern — prompt with typed output schema → background agent → runtime validation. No Python API scripts.

### Validation approach
- **Chose:** Validated word counts (15-30 range), checked for forbidden terms (cant_promise list), checked for exclamation marks, then ran `validate-plans.ts` after merge
- **Why:** Runtime validation with Zod catches schema issues; manual review of content constraints catches prompt violations

## Key Files for Context
- `research/cta_catalog.json` — now 61 entries: 1 global community + 20 per-category community + 20 courses + 20 freebies
- `research/community_cta_prompt.md` — the prompt template used
- `research/how-to-generate-community-ctas.md` — instructions for re-running if needed

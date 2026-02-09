# CTA Catalog Restructuring + Quiz Validation System

**Date:** 2026-02-09 10:51
**Scope:** content-spec (schemas, validator, validation script), landing (admin API + pages), research (data files, generation scripts)

## Summary
Built quiz validation system (schemas + validator for likert/identity/assessment quiz types) and restructured CTA catalog to support per-category community pitches. Updated admin dashboard to show quiz validation results and unified CTA view.

## Context & Problem
Two gaps in the content-spec framework:
1. Community CTA was a single global entry — but messaging should be tailored per category while the offering (Skool group) stays the same. Also missing: founder presence info.
2. No quiz validation existed. Articles have schemas → parser → validator, but quizzes had nothing. The quiz system has 3 data models (likert, identity, assessment) with distinct structural requirements.

## Decisions Made

### Quiz output schemas as Zod
- **Chose:** Three separate Zod schemas (LikertQuizOutputSchema, IdentityQuizOutputSchema, AssessmentQuizOutputSchema) sharing a common QuizMetaSchema
- **Why:** Each quiz type has fundamentally different structure — likert has statements+dimensions+scale, identity has questions+types+distributed points, assessment has questions+domains+thresholds+results. A single polymorphic schema would be less readable and harder to maintain.

### Quiz type detection strategy
- **Chose:** Check `quizType` field first, then fall back to structural markers (e.g., "statements" + "scale" → likert)
- **Why:** New quizzes will have the `quizType` field, but the 3 existing deployed quizzes may not all have it. Structural detection handles legacy gracefully.

### Community CTA generation approach
- **Chose:** Python generation script (`generate_community_ctas.py`) + prompt template (`community_cta_prompt.md`), following same pattern as article generation
- **Why:** User explicitly said "We are not writing any of that shit ourselves" — agent generates pitches via LLM. Script assembles prompt from taxonomy + catalog data, calls Sonnet, parses JSON output, optionally merges into cta_catalog.json.

### founder_presence as optional schema field
- **Chose:** Add optional `founder_presence` string to CtaDefinitionSchema
- **Why:** Only the global community entry needs it. Per-category community entries and courses/freebies don't.

## Architectural Notes
- Quiz validator follows exact same pattern as article validator: returns `{ errors, warnings }`, called from both CLI validation script and admin API
- Quiz validation runs at admin API level — reads deployed quiz JSON files from `landing/src/lib/quiz/`, validates against schemas + constraints
- Per-category community entries use `id: "community-{slug}"` pattern (same as course-/freebie- naming)
- Admin quizzes page now auto-discovers deployed quizzes from filesystem rather than hardcoded DEPLOYED_SLUGS

## Information Sources
- Existing article validator pattern: `content-spec/src/validator/index.ts`
- Quiz JSON structure from deployed files: `landing/src/lib/quiz/*.json`
- CTA catalog structure: `research/cta_catalog.json`
- Article generation script pattern: `research/generate_article.py`

## Open Questions / Future Considerations
- Per-category community pitches not yet generated (script created but not run — needs ANTHROPIC_API_KEY and `--merge` flag)
- Quiz validator may need adjustment as new quiz types get generated — current constraints based on 3 deployed quizzes
- Assessment quiz `quizType` field is `z.string().optional()` in schema to handle legacy "readiness" value — could be tightened later

## Key Files for Context

- `content-spec/src/schemas/quiz-output.ts` — Zod schemas for all 3 quiz types
- `content-spec/src/schemas/quiz-page-types.ts` — quiz constraint schema
- `content-spec/src/validator/quiz.ts` — quiz validator (likert/identity/assessment)
- `content-spec/src/schemas/cta-catalog.ts` — CTA schema with founder_presence
- `research/quiz_page_types.json` — constraint data (statement counts, dimension counts, etc.)
- `research/cta_catalog.json` — CTA catalog with founder_presence on global community
- `research/community_cta_prompt.md` — prompt template for community pitch generation
- `research/generate_community_ctas.py` — generation script for per-category community pitches
- `landing/src/app/api/admin/quizzes/route.ts` — quiz API with validation
- `landing/src/app/admin/quizzes/page.tsx` — quizzes page with validation status display
- `landing/src/app/admin/spec/page.tsx` — spec page with unified CTA table
- `.worklogs/2026-02-08-171844-full-session-canonical-ctas-pipeline.md` — prior session context

## Next Steps / Continuation Plan

1. Run `python3 research/generate_community_ctas.py --merge` with ANTHROPIC_API_KEY to generate per-category community pitches
2. Verify admin `/admin/spec` → CTAs tab shows community pitch column populated
3. Verify admin `/admin/quizzes` → deployed quizzes show validation results (errors/warnings)
4. Fix any quiz validation errors found in deployed quizzes (likely schema mismatches in older quiz JSON)
5. Continue with Phase 7: batch article generation (4/245 done)

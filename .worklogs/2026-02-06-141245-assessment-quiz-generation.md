# Batch generation of 12 assessment quizzes + registry update

**Date:** 2026-02-06 14:12
**Scope:** `landing/src/lib/quiz/*.json` (12 new), `landing/src/lib/quiz/index.ts`, `landing/src/lib/quiz/potty-training-readiness.json`, `landing/src/lib/quiz/quiz-engine.ts`, `landing/src/components/quiz/quiz-container.tsx`

## Summary
Generated 12 new assessment quiz JSON files (Type A, #13-24 from taxonomy) using parallel background agents. Fixed 5 validation issues across 4 quizzes. Updated registry to serve all 14 assessment quizzes on URLs matching taxonomy_v3.md exactly.

## Context & Problem
We had 2 working assessment quizzes (potty-training, kindergarten-readiness) and needed the remaining 12 to complete the assessment quiz set (#13-24). Identity quizzes (#1-10, Type B) are deferred. Each quiz needs research-backed domains, 9-10 questions with graded options, domain content for 3 levels, and 3 result tiers — all following the established schema validated by quiz-schema.ts.

## Decisions Made

### Parallel agent generation
- **Chose:** Launch 12 background agents simultaneously, each generating one quiz JSON
- **Why:** Each quiz is independent; parallel execution completed all 12 in ~2 minutes vs ~24 minutes sequentially
- **Template:** kindergarten-readiness.json used as the reference format for all agents

### Post-generation validation + automated fixes
- **Chose:** Node.js validation script checking maxPoints consistency, score range coverage, result IDs, and domain content completeness
- **Why:** Agent-generated content needs systematic verification; manual review of 12 files is error-prone
- **Issues found and fixed:**
  - `social-confidence`: Used custom result IDs instead of ready/almost/not-yet → renamed
  - `calm-down-toolkit`: maxPoints off (regulation-style 9→11, trigger-awareness 6→8) → fixed with proportional threshold adjustment
  - `communication-safety`: maxPoints off (repair 6→9) → fixed
  - `emotional-intelligence`: maxPoints off (frustration-tolerance 8→6) → fixed
  - `potty-training-readiness`: slug was `is-my-toddler-ready-for-potty-training` → updated to `potty-training-readiness` to match taxonomy

### Generic shareable summary
- **Chose:** Changed "your toddler" to "your child" in quiz-engine.ts shareable summary
- **Why:** Summary is now used across quizzes targeting all ages (parenting-battery, screen-dependence, etc.)

### Scroll-to-top on result
- **Chose:** Added `window.scrollTo({ top: 0 })` in quiz-container.tsx when result appears
- **Why:** Long quizzes leave user scrolled mid-page; result page should start at the top

## Architectural Notes
- All 14 quiz slugs verified 1:1 against taxonomy_v3.md lines 553-576
- Registry in index.ts uses slug as key — `getQuizBySlug()` is the lookup used by the `/quiz/[slug]` page route
- Each quiz JSON is self-contained: meta, domains, questions, domainContent, results — no external dependencies
- Quiz type is always "readiness" for assessment quizzes (vs future "identity" for Type B)

## Generated Quizzes
| Quiz | Domains | Questions | Max Score |
|------|---------|-----------|-----------|
| solid-foods-readiness | 4 | 9 | 27 |
| drop-the-nap | 4 | 9 | 27 |
| sleepover-readiness | 4 | 9 | 27 |
| second-child-readiness | 4 | 9 | 25 |
| parenting-battery | 4 | 9 | 25 |
| screen-dependence | 4 | 9 | 27 |
| emotional-intelligence | 4 | 10 | 28 |
| social-confidence | 4 | 10 | 26 |
| communication-safety | 4 | 10 | 30 |
| bedtime-routine | 3 | 9 | 27 |
| age-appropriate-chores | 3 | 9 | 24 |
| calm-down-toolkit | 3 | 9 | 25 |

## Information Sources
- `research/taxonomy_v3.md` lines 553-576 — canonical quiz URLs
- `research/quizzes/quiz-ideas.md` — quiz specs with domains, age ranges, sources
- `landing/src/lib/quiz/kindergarten-readiness.json` — template for generation
- `landing/src/lib/quiz/quiz-schema.ts` — Zod schema defining valid quiz structure

## Open Questions / Future Considerations
- Identity quizzes (#1-10, Type B) still need generation — different schema (personality mapping, no readiness tiers)
- Quiz content should get a human editorial pass before launch
- OG image routes need to be created per quiz for social sharing

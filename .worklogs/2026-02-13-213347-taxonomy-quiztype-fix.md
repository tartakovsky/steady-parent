# Fix: add quizType to quiz entries — connect quizzes to page type constraints

**Date:** 2026-02-13 21:33
**Scope:** `new_validation/validators/spec/taxonomy.ts`, `new_validation/validators/spec/index.ts`, `scripts/migrate_taxonomy_spec.py`, `new_validation/spec/taxonomy.json`

## Summary
Quiz entries were missing their `quizType` field (likert/identity/assessment), so the three separate quiz page type schemas had zero connection to actual quiz entries. Fixed by adding `quizType` from quiz-definitions.json's `dataModel` field, plus a structural check that quizType maps to a valid pageTypes.quiz key.

## Context & Problem
The initial taxonomy validator had three separate quiz page type schemas (QuizLikertPageTypeSchema, etc.) but the QuizSchema had no `quizType` field. The page type constraint definitions were validated structurally, but nothing linked individual quizzes to their page type. Validation passed with 0 issues on data that was fundamentally incomplete — a validator that can't fail is useless.

## Decisions Made

### quizType required on every quiz entry
- **Chose:** `quizType: z.enum(["likert", "identity", "assessment"])` as required field on QuizSchema
- **Why:** Without it, page type constraints are orphaned — defined but never referenced. Each quiz must declare its type.

### Source: quiz-definitions.json dataModel field
- **Chose:** Pull from `content-plan/quizzes/quiz-definitions.json` → `dataModel` field
- **Why:** quiz_taxonomy.json doesn't carry type info. quiz-definitions.json has the canonical slug → dataModel mapping for all 24 quizzes.

### Structural check: quizType → pageTypes.quiz key
- **Chose:** Check 8 in validateTaxonomy verifies every quiz's quizType exists as a key in pageTypes.quiz
- **Why:** Catches mismatches between quiz type declarations and page type constraint definitions

## Key Files for Context
- `new_validation/validators/spec/taxonomy.ts` — updated QuizSchema + check 8
- `scripts/migrate_taxonomy_spec.py` — now reads quiz-definitions.json (6 sources)
- `content-plan/quizzes/quiz-definitions.json` — source of slug → dataModel mapping
- `.worklogs/2026-02-13-212716-taxonomy-zod-validator.md` — prior: initial validator

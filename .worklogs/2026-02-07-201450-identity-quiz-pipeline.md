# Identity Quiz (Type B) Pipeline: Schema, Engine, Prompt, UI, Routing

**Date:** 2026-02-07 20:14
**Scope:** `quiz-schema.ts`, `quiz-engine.ts`, `quiz-prompt.ts`, `generate-one-quiz.ts`, `revalidate-raw.ts`, `identity-result.tsx`, `quiz-container.tsx`, `quiz-question.tsx`, `index.ts`, `og/route.tsx`

## Summary
Built the full Type B (Identity/Classification) quiz pipeline: fixed schema voice/limits, wrote scoring engine, built generation prompt, created result UI, wired routing for both quiz types, generated and tested "What's Your Parenting Style?" quiz.

## Context & Problem
Type A (Readiness/Assessment) pipeline was proven and stable (see `.worklogs/2026-02-07-191657-quiz-generation-pipeline-fixes.md`). Type B quizzes have a fundamentally different structure:
- Type A: each question → 1 domain, total score → result tier
- Type B: each option distributes points across ALL types, result = primary type + blend percentages

The Zod schema existed with 11 refinements but had old warm/therapist voice and generous limits. Everything else was missing: scoring engine, generation prompt, result UI, routing.

## Decisions Made

### Schema voice and limits migration
- **Chose:** Apply all Type A fixes to Type B schema — SP voice in `.describe()` strings, character budgets, ban URLs/citations
- **Why:** Same lessons apply — LLM fills available space, `.describe()` strings are secondary prompts
- **Limit changes:** tagline 200→120, description 800→300→400 (bumped after first generation), encouragement 700→350, growthEdge 300→200, comparativeContext 300→200
- **Added:** `themeColor` field (hex) per type for UI differentiation

### Description limit bumped 300→400
- **Chose:** Allow up to 400 chars for type descriptions
- **Why:** First generation attempt had 4/5 types over 300 (313-345). "2-3 sentences" for a personality description that makes someone think "that's me" legitimately needs more room than a domain detail paragraph. Revalidated from raw — clean pass.

### Scoring function as standalone export, not class method
- **Chose:** `export function scoreIdentityQuiz()` instead of adding to `QuizEngine` class
- **Why:** `QuizEngine` is tightly coupled to readiness quiz structure (domains, result templates, score ranges). Identity quizzes have none of these. A standalone function that takes `IdentityQuizData` + answers is cleaner than forcing it into the class.

### Blend bar visualization (not radar chart)
- **Chose:** Horizontal bars for type percentages, scaled relative to the highest percentage
- **Why:** Radar charts look cool but are harder to read and don't render well in Satori (OG images). Horizontal bars are immediately legible and familiar from every analytics dashboard.

### QuizQuestion component generalized
- **Chose:** Changed `QuizQuestion` component to accept a `DisplayQuestion` interface (`{ id, text, subtext?, options: { id, text }[] }`) instead of importing the engine's `QuizQuestion` type
- **Why:** Both `QuizQuestion` (with `points: number`) and `IdentityQuestion` (with `points: Record<string, number>`) satisfy this interface. The component only uses `id` and `text` from options anyway.

### Quiz registry uses union type
- **Chose:** `AnyQuizData = QuizData | IdentityQuizData` with `isIdentityQuiz()` type guard
- **Why:** Both types share `meta` with slug/title/etc, and `questions` array. The page routing doesn't care about the quiz type — only the container and result components do. Discriminated union on `quizType` field makes runtime detection trivial.

## Architectural Notes

### Files changed/created
- **`quiz-engine.ts`** — added `scoreIdentityQuiz()` function and `themeColor` to identity interfaces
- **`quiz-prompt.ts`** — added `IdentityQuizDef` type, `buildIdentitySystemPrompt()`, `buildIdentityUserPrompt()`
- **`quiz-schema.ts`** — bumped description max 300→400
- **`generate-one-quiz.ts`** — refactored: `READINESS_QUIZZES` + `IDENTITY_QUIZZES` maps, type detection, type-specific prompts/validation, shared `runPostChecks()`
- **`revalidate-raw.ts`** — detects quiz type from `quizType` field, applies readiness auto-fixes only for readiness quizzes
- **`identity-result.tsx`** — new component: primary type hero, comparative context, blend bars, type detail cards, encouragement, share/save CTAs, sources
- **`quiz-container.tsx`** — refactored: `computeResult()` dispatches to correct scorer, renders `IdentityResult` or `QuizResult` based on result type
- **`quiz-question.tsx`** — generalized to `DisplayQuestion` interface
- **`index.ts`** — `AnyQuizData` union type, `isIdentityQuiz()` guard, registered parenting-style
- **`og/route.tsx`** — added `renderIdentityCard()` for identity quiz OG images

### Type B result page structure
1. Shared CTA (visitors see first)
2. Primary type hero (name, percentage badge, tagline, themed gradient)
3. Comparative context (plain statistic)
4. Share/Save/Retake CTAs
5. "Your Blend" — horizontal bars for all types
6. "Your Types" — detail cards (description, strengths, growth edge)
7. Encouragement block
8. Bottom CTAs
9. Sources

### Scoring algorithm
For each type: sum points from selected options, divide by max possible (sum of max-per-question for that type), multiply by 100. Primary = highest percentage. Shareable summary: "I'm a Lighthouse Parent (50%) with Dolphin (38%) tendencies".

## Key Lessons
- **Type descriptions need more room than domain details** — personality descriptions that make someone think "that's me" need ~350 chars, not 250. Bumped to 400 after first generation.
- **Standalone functions > class methods for different quiz types** — forcing identity scoring into `QuizEngine` would have been messy. Clean separation of concerns.
- **Generalize component interfaces** — `QuizQuestion` component only needs `{ id, text }` from options, so accept that instead of the full engine type. Both quiz types work without adapter code.
- **Generation script worked first try** — parenting-style quiz passed validation after one schema bump (description 300→400). The prompt+schema constraints from Type A carry over well.
- **Content quality is strong on first generation** — wry voice, concrete scenarios, good identity badges. No platitudes, no citations.

## Key Files for Context
- `landing/src/lib/quiz/quiz-engine.ts` — `scoreIdentityQuiz()` at bottom, identity interfaces at line 93+
- `landing/src/lib/quiz/quiz-prompt.ts` — identity prompts at bottom (`buildIdentitySystemPrompt`, `buildIdentityUserPrompt`)
- `landing/src/lib/quiz/quiz-schema.ts` — identity schema at line 326+, 11 refinements
- `landing/src/components/quiz/identity-result.tsx` — Type B result page
- `landing/src/components/quiz/quiz-container.tsx` — orchestrator handling both quiz types
- `landing/src/lib/quiz/index.ts` — registry with `AnyQuizData` union, `isIdentityQuiz()` guard
- `scripts/generate-one-quiz.ts` — both readiness and identity quiz definitions + generation
- `.worklogs/2026-02-07-191657-quiz-generation-pipeline-fixes.md` — Type A pipeline lessons (prerequisite context)
- `.worklogs/2026-02-07-195820-identity-quiz-pipeline.md` — original plan for this work

## Next Steps / Continuation Plan
1. **Delete parenting-style.json** once reviewed — keep pipeline, regenerate when ready for batch
2. **Add remaining 9 identity quiz definitions** to `scripts/generate-one-quiz.ts` (bedtime-battle-style, parents-patterns, worried-parent, parenting-love-language, kid-describe-you, parenting-superpower, parent-at-2am, parenting-era, co-parent-team)
3. **Batch-generate all 14 Type A quizzes** through current pipeline
4. **Regenerate parenting-battery.json** (old source format with URLs)
5. **Quiz listing page** (`/quiz`) needs to display both types attractively
6. **OG image for identity quizzes** — currently functional but could be more visually distinctive (e.g. type color in badge)

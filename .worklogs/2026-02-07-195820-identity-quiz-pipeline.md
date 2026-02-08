# Identity Quiz (Type B) Pipeline — Schema Fix, Engine, Prompt, UI

**Date:** 2026-02-07 19:58
**Scope:** `quiz-schema.ts`, `quiz-engine.ts`, `quiz-prompt.ts`, `scripts/generate-one-quiz.ts`, new result component(s), quiz page routing

## Summary
Build the full Type B (Identity/Classification) quiz pipeline: fix schema voice/limits, write scoring engine, build generation prompt, create result UI, and test with "What's Your Parenting Style?" quiz.

## Context & Problem
Type A (Readiness/Assessment) pipeline is proven and stable. Type B quizzes have a fundamentally different structure:
- Type A: each question → 1 domain, total score → result tier
- Type B: each option distributes points across ALL types, result = primary type + blend percentages

The Zod schema exists with 11 refinements, but everything else is missing or has the old voice/limit issues we just fixed for Type A.

## Plan

### 1. Fix IdentityTypeSchema `.describe()` strings and limits
Three `.describe()` strings have old warm/therapist voice:
- `description`: "warm, validating, specific" → SP voice directive
- `encouragement`: "Warm closing message" → "Direct closing, no platitudes"
- `growthEdge`: hedging tone in example

Five limits are too generous:
- `tagline`: 200 → 120 (one shareable sentence)
- `description`: 800 → 300 (2-3 sentences)
- `encouragement`: 700 → 350 (2-3 sentences)
- `growthEdge`: 300 → 200 (1-2 sentences)
- `comparativeContext`: 300 → 200 (1 sentence)

Add `themeColor` field to IdentityTypeSchema (hex color per type for UI).

### 2. Write `scoreIdentityQuiz()` in quiz-engine.ts
- Sum points per type across all answered questions
- Calculate percentage per type (score / maxPossible * 100)
- Sort by percentage descending → primary type = highest
- Build shareable summary: "I'm a Lighthouse Parent (42%) with Dolphin (28%) tendencies"
- Return: primaryType, allTypes sorted, shareableSummary

### 3. Write `buildIdentitySystemPrompt()` in quiz-prompt.ts
Carry over all Type A lessons:
- SP voice (NEVER/INSTEAD lists)
- Citation ban (no Author et al., no URLs in sources)
- Character budgets in prompt
- Conciseness directives
- JSON structure template for identity quiz shape
- Scoring rules specific to identity: points across all types, every option covers every type, etc.

### 4. Add identity quiz definitions to generation script
Start with "parenting-style" (the flagship). Add QuizDef or similar for identity quizzes.

### 5. Build identity result UI
- Primary type hero card (name, tagline, themeColor)
- Blend percentages visualization (horizontal bars or radar?)
- Type breakdown cards (description, strengths, growthEdge)
- Comparative context
- Share/save CTAs
- Reuse existing patterns from Type A result page where possible

### 6. Wire quiz page routing
- Quiz page needs to detect quizType and render correct result component
- Index needs to handle both types

## Key Files
- `landing/src/lib/quiz/quiz-schema.ts` — Type B schema at line 326+
- `landing/src/lib/quiz/quiz-engine.ts` — interfaces at line 93+, scoring function missing
- `landing/src/lib/quiz/quiz-prompt.ts` — needs identity prompt functions
- `landing/src/components/quiz/quiz-result.tsx` — Type A result page, reference for Type B
- `research/quizzes/quiz-ideas.md` — Type B quiz specs (lines 14-173)
- `.worklogs/2026-02-07-191657-quiz-generation-pipeline-fixes.md` — Type A pipeline lessons

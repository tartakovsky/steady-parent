# Generate All 24 Quizzes

**Date:** 2026-02-10 11:24
**Scope:** landing/src/lib/quiz/*.json, landing/src/lib/quiz/index.ts

## Summary
Generated all 24 quiz JSON files covering every quiz in quiz_taxonomy.json, registered them in index.ts, and verified with a clean production build.

## Context & Problem
Previously only 5 quizzes were deployed (one per type combination). User requested generating the full set of 24 quizzes and deploying to production.

## Decisions Made

### Quiz Type Assignments
- **Chose:** Map each quiz to a type based on its title pattern and intent
- **Why:** "What kind of X are you?" → identity, "Is your child ready for X?" → readiness, "How X is your child?" → readiness+profile, "Build your X" → readiness+recommendation
- **Result:**
  - 1 Likert (parenting-style)
  - 9 Identity (bedtime-battle-style + 8 new)
  - 6 Standard Readiness (potty-training + 5 new)
  - 5 Profile Display (parenting-battery + 4 new)
  - 3 Recommendation Display (calm-down-toolkit + 2 new)

### Generation Strategy
- **Chose:** 19 parallel background Claude agents (sonnet), each reading quiz-prompt.ts and quiz-schema.ts, generating JSON, self-validating
- **Why:** Maximum parallelism, each agent independent, self-contained validation

### Identity Quiz Specs
- All 8 new identity quizzes: 4 types, 8 questions, 4 options each
- Suggested type names provided as creative direction, agents finalized
- parents-patterns, worried-parent, parenting-love-language, kid-describe-you, parenting-superpower, parent-at-2am, parenting-era, co-parent-team

### Readiness Quiz Specs
- All readiness quizzes: 4 domains, 10 questions, 2-3 per domain
- Profile display quizzes get resultDisplay: "profile" in meta
- Recommendation display quizzes get resultDisplay: "recommendation" in meta
- Standard readiness: no resultDisplay field

## Key Files for Context
- `landing/src/lib/quiz/index.ts` — registry with all 24 quizzes
- `landing/src/lib/quiz/quiz-prompt.ts` — generation prompts (readiness, identity, likert)
- `landing/src/lib/quiz/quiz-schema.ts` — Zod validation schemas
- `research/quiz_taxonomy.json` — master 24-quiz registry
- `.worklogs/2026-02-10-112409-generate-all-24-quizzes.md` — this worklog

## Next Steps
1. Visual QA of all quiz types on localhost
2. Deploy to production via Railway

# Revert broken quiz commits (52f5e05, d00fd8f)

**Date:** 2026-02-06 18:14
**Scope:** og/route.tsx, quiz-result.tsx, quiz-engine.ts, quiz-schema.ts, worklogs

## Summary
Reverted files changed in commits 52f5e05 and d00fd8f back to their pre-commit state (324c752). Excluded generate-quiz.ts and screen-dependence.json since another agent has active uncommitted work on those files.

## Context & Problem
The two commits introduced regressions across quiz UI, OG image, engine, and schema files. User requested full revert.

## Decisions Made

### Selective file revert instead of `git revert`
- **Chose:** `git checkout 324c752 -- <files>` for the 4 uncontested files + `git rm` for the 2 worklogs
- **Why:** `git revert` would conflict with the other agent's uncommitted changes to generate-quiz.ts and screen-dependence.json
- **Alternatives considered:**
  - `git revert --no-commit` for both commits — rejected because it would overwrite the other agent's in-progress work on shared files

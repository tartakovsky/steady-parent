# Quiz gate: deliver results via email only, not in browser

**Date:** 2026-02-13 12:01
**Scope:** landing/src/components/quiz/likert-quiz.tsx, landing/src/components/quiz/quiz-container.tsx

## Summary
Removed `setPreview(false)` from `subscribeForQuizResults` callback in both quiz containers so that quiz results are delivered exclusively via email, not shown in the browser after gate submission.

## Context & Problem
After the gate race condition fix (`.worklogs/2026-02-12-215400-quiz-gate-fixes.md`), the email gate was working correctly. However, `subscribeForQuizResults` called `setPreview(false)` after successful subscription, which immediately dismissed the gate and showed full results in the browser. This defeated the purpose of the email gate — the user needs to open the email to see results, building deliverability history.

## Decisions Made

### Keep gate up after email submission
- **Chose:** Remove `setPreview(false)` from subscribeForQuizResults
- **Why:** Results must be delivered via email only. The gate stays up showing the "Check your inbox" success message from FreebieCTA. This forces the email interaction needed for deliverability history.
- **Alternatives considered:**
  - Show results after a delay — rejected, defeats deliverability purpose
  - Show results only after email open tracking confirms — over-engineered, same email-first principle achieved simply

## Key Files for Context
- `landing/src/components/quiz/likert-quiz.tsx` — Likert quiz container
- `landing/src/components/quiz/quiz-container.tsx` — Identity/assessment quiz container
- `landing/src/components/blog/freebie-cta.tsx` — email form component (shows success message)
- `.worklogs/2026-02-12-215400-quiz-gate-fixes.md` — prior gate fixes

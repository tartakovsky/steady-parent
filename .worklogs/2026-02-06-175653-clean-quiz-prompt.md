# Strip leaked questions from quiz generation prompt

**Date:** 2026-02-06 17:56
**Scope:** `landing/src/lib/quiz/generate-quiz.ts`, `landing/src/lib/quiz/screen-dependence.json`

## Summary
Removed pre-written example questions from the research brief input and topic-specific examples from the system prompt. Regenerated screen-dependence quiz with clean inputs — questions are now original.

## Context & Problem
Three consecutive quiz generations produced nearly identical questions because the research brief contained a "Key Items We Can Adapt" section with 10 pre-written questions. The model copied them verbatim every time. The "Recommended Approach" section also pre-wrote domain names.

## Decisions Made

### Strip research brief to instrument metadata only
- **Removed:** "Key Items We Can Adapt" (10 example questions), "What Our Current Quiz Gets Wrong" (editorial), "Recommended Approach" (pre-written domains)
- **Kept:** Instrument names, subscale descriptions, psychometric properties, citations
- **Why:** The model needs to know WHAT the instruments measure, not HOW to phrase questions about it

### Remove topic-specific examples from system prompt
- **Removed:** Screen-specific domain name examples, screen-specific shareableSummary example, screen-specific result headline examples
- **Kept:** Generic rules about domain naming, content levels, subject awareness
- **Why:** Prompt must work for any quiz topic without biasing toward screens

# Quiz improvements: percentile scoring, preview donut, grammar fix, 3 quiz regens

**Date:** 2026-02-10 20:39
**Scope:** quiz-engine.ts, quiz-schema.ts, parenting-style.json, quiz-preview.tsx, identity-result.tsx, likert-result.tsx, quiz-container.tsx, likert-quiz.tsx, parents-patterns.json, worried-parent.json, calm-down-toolkit.json, quiz/page.tsx

## Summary
Implemented PSDQ population norm-based percentile scoring for Likert quizzes, fixed preview page to show donut charts for identity/Likert quizzes, fixed "a The Zombie" grammar bug, and regenerated 3 broken quizzes (parents-patterns, worried-parent, calm-down-toolkit).

## Context & Problem
1. Likert donut chart showed ~25% per dimension regardless of answers because raw means were close together (all dimensions rated 1-5)
2. Preview page showed progress bars while full/shared result pages showed donut charts — inconsistent
3. parent-at-2am quiz produced "You're a The Zombie" (double article)
4. parents-patterns quiz had questions assuming childhood causation
5. worried-parent quiz assumed quiz-taker IS anxious
6. calm-down-toolkit quiz had vague, non-actionable results

## Decisions Made

### Percentile-based blend for Likert scoring
- **Chose:** z-score → normalCDF → percentile, then normalize percentiles to sum to 100% for donut
- **Why:** Different population means across dimensions create natural spread. Authoritative (steady-guide) has population mean ~3.9 while permissive (gentle-connector) is ~2.7, so equal raw scores produce very different percentiles
- **Alternatives considered:**
  - Raw mean normalization — rejected because dimensions cluster near 3.0-4.0, giving ~25% each
  - Hardcoded weights — rejected because it's arbitrary; population norms are research-based

### Population norms from PSDQ research
- **Chose:** PSDQ-informed priors: steady-guide (3.9/0.55), firm-protector (3.4/0.60), gentle-connector (2.7/0.65), free-range-navigator (2.8/0.70)
- **Why:** PSDQ (Parenting Styles and Dimensions Questionnaire) is the most widely used validated instrument for these exact dimensions

### Normal CDF approximation
- **Chose:** Abramowitz & Stegun polynomial approximation (max error 7.5×10⁻⁸)
- **Why:** No external dependencies, runs client-side, mathematically precise enough

### parents-patterns quiz rewrite
- **Chose:** Current behavior scenarios (what you DO as a parent) instead of childhood introspection
- **Why:** Original questions asked "what did your parents do" — inappropriate for a parenting style quiz
- **New types:** Replayer, Rebel, Remixer, Freestyler (how you relate to inherited patterns)

### worried-parent quiz rewrite
- **Chose:** Reframed from "you ARE anxious" to "how do you handle parental worry"
- **Why:** Original was clinically judgmental; new version treats worry as universal and asks about response patterns
- **New types:** Deep Diver, Perimeter Checker, Story Builder, Steady Face, Action Taker

### calm-down-toolkit quiz rewrite
- **Chose:** 4 calming channel domains (movement, sensory, verbal, creative) with specific strategies in each level
- **Why:** Original had generic "developing/emerging" results without actionable strategies
- **New approach:** Each domain level includes concrete strategy recommendations, not just descriptions

## Architectural Notes
- `populationNorm` is optional per dimension — when ALL dimensions have it, percentile blend kicks in; otherwise falls back to raw-mean blend
- normalCDF function added to quiz-engine.ts (client-side, no server dependency)
- PreviewDonut SVG component in quiz-preview.tsx mirrors the full result BlendDonut
- `useDonut` flag on PreviewData determines which visualization to show in preview

## Information Sources
- PSDQ normative data from Robinson et al. (2001), multiple cross-cultural validation studies
- Existing parenting-style.json for dimension structure
- quiz-schema.ts for validation constraints (growthEdge max 200 chars — caught in all 3 regens)

## Key Files for Context
- `landing/src/lib/quiz/quiz-engine.ts` — normalCDF + scoreLikertQuiz percentile logic
- `landing/src/lib/quiz/quiz-schema.ts` — populationNorm optional field on LikertDimensionSchema
- `landing/src/lib/quiz/parenting-style.json` — PSDQ norms added to all 4 dimensions
- `landing/src/components/quiz/quiz-preview.tsx` — PreviewDonut + "a The" grammar fix
- `landing/src/lib/quiz/parents-patterns.json` — fully regenerated (behavior-based)
- `landing/src/lib/quiz/worried-parent.json` — fully regenerated (response-pattern-based)
- `landing/src/lib/quiz/calm-down-toolkit.json` — fully regenerated (channel-based strategies)

## Next Steps / Continuation Plan
1. Verify all 24 quizzes render correctly in browser (spot-check regenerated ones)
2. Deploy to Railway (push to trigger)
3. Continue with remaining quiz fixes if any are identified
4. Resume article generation pipeline (Phase 7)

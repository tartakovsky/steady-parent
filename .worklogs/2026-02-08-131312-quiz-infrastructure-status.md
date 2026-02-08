# Quiz Infrastructure Status & Remaining Work

**Date:** 2026-02-08 13:13
**Scope:** Quiz system architecture, data models, UI components

## Summary
Two quiz structures are fully implemented and working: **Assessment/Readiness** (Type A) and **Identity/Forced-Choice** (Type B). A third Likert type (Type C) was built but has a fundamental UX problem — users can rate everything identically, producing meaningless results. The forced-choice format guarantees differentiation and is the better structure for classification quizzes.

## What's Built & Working

### Type A — Assessment/Readiness
- **Purpose:** "Is your child ready for X?" or "How is your child doing at Y?"
- **Mechanics:** Each question belongs to one domain, each option has a point value. Total score maps to a result range (e.g., "Ready / Almost / Not Yet"). Domain-level content at high/medium/low composes into a personalized breakdown.
- **UI:** `QuizResult` component — score-based hero, domain insight cards, action plan, next steps
- **Result components:** `result-hero.tsx`, `result-domain-insight.tsx`, `result-action-plan.tsx`, `quiz-result.tsx`
- **Engine:** `QuizEngine` class in `quiz-engine.ts`
- **Schema:** `QuizData` type, validated by existing Zod schema
- **Example:** Potty Training Readiness (was committed, currently deleted from working tree)
- **Coverage:** Quizzes 11-24 in the plan (14 quizzes)

### Type B — Identity/Forced-Choice
- **Purpose:** "What type of parent are you?" — classification into personality types
- **Mechanics:** Scenario questions with 3-5 options. Each option distributes points across types. Result = primary type (highest score) + blend percentages. **Critical design lesson:** each option should give points to ONLY ONE type (no cross-distribution) to guarantee differentiation. The old 5-type quiz with cross-type points produced mushy "40% of everything" results.
- **UI:** `IdentityResult` component — type name hero, match profile bars, type detail cards, strengths, growth edge, encouragement
- **Engine:** `scoreIdentityQuiz()` in `quiz-engine.ts`
- **Schema:** `IdentityQuizData` type
- **Live:** `/quiz/parenting-approach` — 10 scenarios, 3 types (Steady Guide / Firm Protector / Free Spirit), 3 options each
- **Coverage:** Quizzes 1-10 in the plan (10 quizzes)

### Type C — Likert (built but problematic)
- **Purpose:** Rate statements on a 1-5 scale, mean per dimension, highest wins
- **Problem:** Users can (and do) rate everything identically, producing "1/5 for all types" — declaring a "dominant type" from a three-way tie is absurd. No forced differentiation.
- **Status:** Live at `/quiz/parenting-style`. Kept for now but forced-choice (Type B) is the better structure for classification quizzes.
- **UI:** `LikertQuiz` (compact scrollable form), `LikertResult` (dimension bars, detail cards)
- **Files:** `likert-quiz.tsx`, `likert-result.tsx`, Likert types/scoring in `quiz-engine.ts`

## What Quiz Structures Are Still Needed

Looking at the quiz plan (research/quizzes/quiz-ideas.md), all 24 quizzes map to either Type A or Type B:

- **Quizzes 1-10** (Identity) → Type B. Infrastructure complete. Just need content generation.
- **Quizzes 11-21** (Assessment/Readiness) → Type A. Infrastructure complete. Just need content generation.
- **Quizzes 22-24** (Builders: Bedtime Routine, Chores, Calm-Down Toolkit) → These are described as "composed recommendation" rather than a score/readiness result. However, they still use the Type A data model — domain levels at high/medium/low compose into personalized recommendations. The difference is purely in result framing (prescription vs. assessment), not in quiz mechanics or data structure.

**No new quiz STRUCTURES are needed.** The two types cover all 24 planned quizzes. What's needed is:
1. Content generation for 22 remaining quizzes
2. Possibly a variant result display for the "builder" quizzes (22-24) that frames results as recommendations rather than readiness levels — but this could be handled with a flag on the existing Type A result component rather than a new type

## Decisions Made

### Forced-choice > Likert for classification
- **Chose:** Type B (forced-choice) as the primary classification quiz structure
- **Why:** Guarantees differentiation — you literally cannot produce a flat result. Likert lets users rate everything identically.
- **Note:** Likert kept at `/quiz/parenting-style` for now as an alternative. May remove later.

### 3 types with zero cross-distribution > 5 types with point spreading
- **Chose:** 3 options per question, each giving points to exactly 1 type
- **Why:** The old 5-type quiz (Lighthouse/Dolphin/Tiger/Jellyfish/Elephant) with cross-type points (`lighthouse: 5, dolphin: 1, tiger: 1...`) produced ~40% across the board for everyone. Zero leakage = clean differentiation.

### Bright Pop color palette for parenting dimensions
- **Chose:** oklch-based palette #3 "Bright Pop" (L=0.68, higher chroma)
  - Steady Guide: `#00b86b` (bright teal-green)
  - Firm Protector: `#e07937` (warm copper-orange)
  - Free Spirit: `#9c83f2` (soft violet)
- **Why:** User tested 20 oklch variations. This set has enough saturation to feel vibrant without being aggressive. Works well at both full opacity (dimension dots, badges) and reduced opacity (progress bars at 80%, hero backgrounds at ~8%).

## Current Quiz Inventory

| Slug | Type | Status |
|------|------|--------|
| `parenting-style` | Likert (C) | Live, 18 statements, 3 dimensions |
| `parenting-approach` | Identity (B) | Live, 10 scenarios, 3 types |
| `parenting-style` (old) | Identity (B) | JSON exists, NOT registered (superseded) |

Readiness quizzes (11-24) were previously generated and committed but deleted from working tree. They can be restored from git if the content quality is acceptable.

## Key Files for Context

- `research/quizzes/quiz-ideas.md` — master plan for all 24 quizzes, types, slugs, connections
- `landing/src/lib/quiz/quiz-engine.ts` — all three quiz type definitions + scoring functions
- `landing/src/lib/quiz/quiz-schema.ts` — Zod validation schemas
- `landing/src/lib/quiz/index.ts` — quiz registry (what's actually live)
- `landing/src/lib/quiz/parenting-approach.json` — the forced-choice quiz (reference for Type B content format)
- `landing/src/lib/quiz/parenting-style-likert.json` — the Likert quiz (reference for Type C format)
- `landing/src/components/quiz/quiz-container.tsx` — routes quiz types to correct UI
- `landing/src/components/quiz/identity-result.tsx` — Type B result display
- `landing/src/components/quiz/quiz-result.tsx` — Type A result display
- `landing/src/components/quiz/likert-quiz.tsx` — Type C form UI
- `landing/src/components/quiz/likert-result.tsx` — Type C result display
- `palette-test.html` — color exploration tool (served on localhost:3005)
- `.worklogs/2026-02-08-131312-quiz-infrastructure-status.md` — this worklog

## Next Steps

1. **Decide on Likert quiz fate** — keep both `/parenting-style` (Likert) and `/parenting-approach` (forced-choice), or drop one?
2. **Generate remaining 22 quizzes** — 9 identity (Type B), 13 assessment (Type A). Need generation prompts + batch process.
3. **Check quality of previously generated readiness quizzes** — they're in git history, may be usable as-is or need regeneration
4. **Consider "builder" result variant** — quizzes 22-24 (Bedtime Routine, Chores, Calm-Down Toolkit) frame results as prescriptions not assessments. May need a display variant.

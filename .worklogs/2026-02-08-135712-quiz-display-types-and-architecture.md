# Quiz Architecture: Two Axes (Question Structures × Result Displays)

**Date:** 2026-02-08 13:57
**Scope:** Quiz engine architecture, result display components, new quiz content (emotional-intelligence, calm-down-toolkit), quiz-container branching

## Summary
Mapped the full quiz architecture into two independent axes — question input structures and result display types — built two new result display components (ProfileResult, RecommendationResult) with real quiz data, wired everything into the container and registry. Concluded that ProfileResult may not justify its existence as a separate component from IdentityResult (same visual structure), but RecommendationResult is genuinely distinct.

## Context & Problem

Coming into this session, we had:
- **Type A** (assessment/readiness) — working, one result display (`QuizResult`)
- **Type B** (identity/forced-choice) — working, one result display (`IdentityResult`)
- **Type C** (Likert) — working but problematic for classification (users can tie all dimensions)

The question was: what OTHER result displays do we need? The plan lists 24 quizzes, and some (like "Build Your Child's Calm-Down Toolkit" #24, "How Emotionally Intelligent Is Your Child?" #19) clearly need different result presentations than "you're 73% ready" or "you're a Steady Guide."

## Key Insight: Two Independent Axes

The architecture has two orthogonal dimensions:

**Question Input Structures** (how the user answers):
1. **Single-choice** — pick one option per question, each option has points (Type A) or type-distribution (Type B)
2. **Likert** — rate statements 1-5, mean per dimension (Type C)
3. ~~Multiple-choice~~ — NOT needed. No validated parenting instruments require multi-select.

**Result Display Types** (how results are presented):
1. **Readiness** (`quiz-result.tsx`) — percentage badge hero, "Ready / Almost / Not Yet", domain insights, action plan. For: potty training, kindergarten readiness, sleepover readiness, etc.
2. **Classification** (`identity-result.tsx`) — "Your type is X", blend bars, type description + strengths + growth edge. For: parenting style, bedtime battle style, 2am parent, etc.
3. **Profile** (`profile-result.tsx`) — multi-domain behavioral overview, all domains get equal visual weight, level badges (Strong/Developing/Emerging). For: emotional intelligence, social confidence, communication safety.
4. **Recommendation** (`recommendation-result.tsx`) — personalized toolkit/strategy cards, sorted by priority (Primary/Supporting/Less needed), formatted bullet-point prescriptions. For: calm-down toolkit, bedtime routine builder, age-appropriate chores.

These axes are independent: a single-choice quiz can produce a readiness result OR a profile result OR a recommendation result — it's the same scoring engine, just different rendering.

## Decisions Made

### Question structures: 2 is enough, no multiple-choice needed
- **Chose:** Single-choice and Likert only
- **Why:** Reviewed all 24 planned quizzes against validated parenting instruments. Every quiz maps to either "pick one answer" or "rate on a scale." No quiz needs "select all that apply."
- **Note:** Likert is still questionable for classification (tied scores problem), but fine for self-assessment where equal dimensions are a valid result.

### Result displays: 4 types, mapped to quiz plan
- **Readiness** → quizzes 11-18 (potty training through screen dependence) — "Are you ready for X?"
- **Classification** → quizzes 1-10 (parenting style through co-parent team) — "What type are you?"
- **Profile** → quizzes 19-21 (emotional intelligence, social confidence, communication safety) — "Here's your child's landscape"
- **Recommendation** → quizzes 22-24 (bedtime routine, chores, calm-down toolkit) — "Here's your personalized plan"

### Profile vs Classification: probably the same thing
- **Observation:** After building ProfileResult, it's structurally identical to IdentityResult — both show horizontal bars for dimensions, detail cards per dimension, action steps. The only differences are cosmetic (level badges vs percentages, "Strong" vs "72% match").
- **Decision:** Keep both for now. The user wants to see them with real data before deciding whether to collapse them.
- **If collapsed:** Profile quizzes (#19-21) could use the readiness display with tweaked labels, or the identity display with domain bars. The data model is identical.

### Recommendation is genuinely different
- **Why it's distinct:** The domain content for recommendation quizzes contains structured prescriptions — bullet-point lists with `**Bold header** — description` formatting. The result is a toolkit to USE, not a score to understand. The StrategyCard component with priority-sorted cards, formatted recommendations, and "Getting Started" section serves a fundamentally different purpose.
- **Content shape:** `domainContent.*.high.strength` contains multi-line markdown like:
  ```
  Build these into the toolkit:\n• **Jump station** — mini trampoline, jumping jacks\n• **Push & pull** — push against a wall, tug-of-war
  ```
  This needs a `FormattedContent` parser to render properly, which doesn't exist in other result types.

### resultDisplay field on QuizMeta
- **Chose:** `resultDisplay?: 'readiness' | 'profile' | 'recommendation'` on `QuizMeta`
- **Why:** The quiz container needs to know which result component to render. Default (undefined) = readiness. Identity quizzes don't need this field — they're detected by `quizType === 'identity'`.
- **Branching order in quiz-container.tsx:**
  1. `isLikert(quiz)` → LikertQuiz (own container, completely different interaction)
  2. `isIdentityResult(result)` → IdentityResult (Type B always gets identity display)
  3. `resultDisplay === 'profile'` → ProfileResult
  4. `resultDisplay === 'recommendation'` → RecommendationResult
  5. Default → QuizResult (readiness)

## What Was Built

### New quiz data files:
- **`emotional-intelligence.json`** — 10 questions, 4 domains (emotion-vocabulary, self-regulation, empathy, frustration-tolerance), `resultDisplay: "profile"`. Three result tiers: strong-eq (22-30), developing-eq (11-21), emerging-eq (0-10).
- **`calm-down-toolkit.json`** — 9 questions, 3 domains (movement, sensory, verbal), `resultDisplay: "recommendation"`. Three result tiers: movement-primary (20-27), balanced-toolkit (10-19), gentle-approach (0-9). Domain content has rich bullet-point strategies.

### New components:
- **`profile-result.tsx`** — ProfileBar (animated horizontal bars per domain, color-coded by level), DomainCard (score bar + level badge + detail text + strength/concern callouts), action plan, encouragement, sources.
- **`recommendation-result.tsx`** — StrategyCard (colored left border by priority, formatted recommendations), FormattedContent (parses `\n• **bold** — text` into React), priority sorting (high→medium→low), "Getting Started" section.

### Modified files:
- **`quiz-engine.ts`** — added `resultDisplay` field to QuizMeta type
- **`quiz-container.tsx`** — added imports for ProfileResult and RecommendationResult, added branching logic based on `quiz.meta.resultDisplay`
- **`index.ts` (registry)** — registered both new quizzes
- **`components/quiz/index.ts`** — exported new components

## What's Solved

1. **All planned quiz types have a result display.** The 24 quizzes from quiz-ideas.md now map to concrete result components.
2. **The data model works for all display types.** Type A scoring (domain-based points, result by score range) supports readiness, profile, AND recommendation displays — same engine, different rendering.
3. **The container routing is clean.** One `resultDisplay` field on the quiz meta controls which component renders. No complex logic.
4. **URL encoding works unchanged.** Both new quizzes use standard single-choice questions — no changes to quiz-url.ts needed.
5. **Build passes clean.** All 4 quizzes registered, OG images pre-rendering.

## What's NOT Solved

1. **Profile vs Classification visual distinctiveness.** These look too similar. Need to either (a) make Profile genuinely different (radar chart? different layout?) or (b) collapse them into one component with minor conditional tweaks.
2. **Likert quiz fate.** `/quiz/parenting-style` (Likert) and `/quiz/parenting-approach` (forced-choice) both exist for the same topic. Need to decide: keep both? Drop Likert? Differentiate their purposes?
3. **Content quality of the 2 new quizzes.** These were first-draft JSON written by hand, not from the generation pipeline. Questions and domain content need review.
4. **22 remaining quizzes to generate.** Infrastructure is done. Need generation prompts for each type (identity, readiness, profile, recommendation) and batch production.
5. **OG images for new display types.** The OG route doesn't have specific rendering for profile/recommendation results — it falls back to the default readiness card. Need `renderProfileCard()` and `renderRecommendationCard()` if these should look different.
6. **No quiz schema validation for new quizzes.** `quiz-schema.ts` has Zod schemas but they haven't been updated to validate the `resultDisplay` field.

## Current Quiz Inventory (4 live)

| Slug | Type | Display | Questions | Status |
|------|------|---------|-----------|--------|
| `parenting-style` | Likert (C) | LikertResult | 18 statements | Live |
| `parenting-approach` | Identity (B) | IdentityResult | 10 scenarios | Live |
| `emotional-intelligence` | Assessment (A) | ProfileResult | 10 questions, 4 domains | Live |
| `calm-down-toolkit` | Assessment (A) | RecommendationResult | 9 questions, 3 domains | Live |

Previously generated readiness quizzes (potty-training, kindergarten, etc.) are in git history but deleted from working tree.

## Key Files for Context

- `research/quizzes/quiz-ideas.md` — master plan for all 24 quizzes with types, domains, connections
- `landing/src/lib/quiz/quiz-engine.ts` — all quiz type definitions + scoring functions + `QuizMeta.resultDisplay` field
- `landing/src/lib/quiz/index.ts` — quiz registry (4 quizzes registered)
- `landing/src/components/quiz/quiz-container.tsx` — routing logic: Likert → Identity → Profile → Recommendation → Readiness
- `landing/src/components/quiz/quiz-result.tsx` — readiness display (Type A default)
- `landing/src/components/quiz/identity-result.tsx` — classification display (Type B)
- `landing/src/components/quiz/profile-result.tsx` — behavioral profile display (NEW)
- `landing/src/components/quiz/recommendation-result.tsx` — personalized toolkit display (NEW)
- `landing/src/lib/quiz/emotional-intelligence.json` — profile quiz data (NEW)
- `landing/src/lib/quiz/calm-down-toolkit.json` — recommendation quiz data (NEW)
- `landing/src/lib/quiz/parenting-approach.json` — forced-choice identity quiz data
- `.worklogs/2026-02-08-131312-quiz-infrastructure-status.md` — prior worklog with Type A/B/C analysis

## Next Steps / Continuation Plan

1. **Visually test all 4 quiz result types** — take each quiz, review result screens, decide if profile display is distinct enough or should be collapsed
2. **Decide Likert fate** — keep / remove / repurpose for non-classification quizzes
3. **Build generation prompts** — need separate prompt templates for each of the 4 content shapes (identity, readiness, profile, recommendation)
4. **Batch-generate remaining 20 quizzes** — 9 identity, 5 readiness, 3 profile, 3 recommendation
5. **Consider restoring deleted readiness quizzes from git** — if content quality is acceptable, saves regeneration work
6. **Update OG image rendering** — add cards for profile and recommendation display types

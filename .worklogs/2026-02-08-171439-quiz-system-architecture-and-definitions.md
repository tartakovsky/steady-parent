# Quiz System Architecture, Definitions File, and Email Gate Design

**Date:** 2026-02-08 17:14
**Scope:** Quiz engine (types, schema, scoring), 5 new result components, quiz container routing, quiz definitions JSON, email gate CTA design, Likert quiz type, OG route, quiz registry, deleted old readiness JSONs

## Summary
Built the complete quiz infrastructure across two axes (question structures × result displays), created 5 new display components (identity, likert, profile, recommendation + likert-quiz input), wired container routing, created the master quiz definitions file for all 25 quizzes, and designed the email-gated lead capture funnel with previewCta fields.

## Context & Problem

Starting state: one quiz type (Type A readiness) with one result display. Needed to support 25 planned quizzes across fundamentally different interaction models and result presentations. Prior work had generated readiness quiz JSONs via pipeline but those were reverted/deleted due to quality issues with the generation prompt.

## Decisions Made

### Two independent axes for quiz architecture
- **Chose:** Question input structures (single-choice, Likert) and result display types (readiness, classification, profile, recommendation) as orthogonal dimensions
- **Why:** Same scoring engine can power different displays. A single-choice quiz can render as readiness OR profile OR recommendation — it's the data model + display that varies, not the engine.
- **Alternatives considered:**
  - One component per quiz type — rejected, too much duplication
  - One uber-component with conditional rendering — rejected, too complex, each display serves fundamentally different purposes

### Result display types: 4 components
- **Readiness** (`quiz-result.tsx`) — percentage badge hero, "Ready / Almost / Not Yet", domain insights, action plan. For: potty training, kindergarten readiness, etc.
- **Classification** (`identity-result.tsx`) — "Your type is X", blend bars, type description + strengths + growth edge. For: parenting style, bedtime battle style, etc.
- **Profile** (`profile-result.tsx`) — multi-domain behavioral overview, all domains equal weight, level badges (Strong/Developing/Emerging). For: emotional intelligence, social confidence, communication safety.
- **Recommendation** (`recommendation-result.tsx`) — personalized toolkit/strategy cards, sorted by priority, formatted bullet-point prescriptions. For: calm-down toolkit, bedtime routine builder.

### Profile vs Classification: structurally identical but kept separate
- **Observation:** After building ProfileResult, it's structurally identical to IdentityResult — both show horizontal bars, detail cards, action steps. Differences are cosmetic (level badges vs percentages).
- **Decision:** Keep both for now. User wants to see them with real data before deciding whether to collapse.
- **Risk:** Maintaining two near-identical components. Acceptable for now.

### RecommendationResult is genuinely distinct
- **Why:** Domain content contains structured prescriptions — bullet-point lists with `**Bold header** — description` formatting. Needed a FormattedContent parser to render markdown-like content into React elements. Serves fundamentally different purpose (toolkit to USE vs score to understand).

### Likert quiz type for behavioral frequency assessment
- **Chose:** Likert scale (rate 1-5) as second question input structure alongside single-choice
- **Why:** Validated parenting instruments (PSDQ, PAQ) use Likert scales. Single-choice forces false dichotomies on blended behaviors. Format variety keeps quizzes interesting.
- **Mapped quizzes:** #1 (parenting-style), #17-21 (parenting-battery through communication-safety) — 6 total
- **No multiple-choice needed:** Reviewed all 24 planned quizzes against validated instruments. Every quiz maps to either "pick one" or "rate on a scale."

### resultDisplay field on QuizMeta
- **Chose:** `resultDisplay?: 'readiness' | 'profile' | 'recommendation'` on QuizMeta
- **Why:** Container needs to know which result component to render. Default (undefined) = readiness. Identity quizzes detected by `quizType === 'identity'`.
- **Container branching order:** Likert → Identity → Profile → Recommendation → Readiness (default)

### Master quiz definitions file
- **Chose:** Single JSON file (`research/quizzes/quiz-definitions.json`) with all 25 quiz entries
- **Why:** Single source of truth for generation script. Contains slug, dataModel, resultDisplay, types/dimensions/domains, previewCta, sources, connectsTo.
- **Structure:** Array of objects, each with enough info for the generation prompt to produce correct quiz JSON.

### Email-gated lead capture funnel
- **Design:** Quiz results gated behind email capture
  - `?a=00000000&p=1` = preview mode (shows hero teaser + FreebieCTA email form)
  - `?a=00000000` = full results (sent via email link)
  - `?a=00000000&s=1` = shared view (unchanged — shows results + CTA to take quiz yourself)
- **Component:** Reuse existing FreebieCTA with quiz-specific copy from `previewCta` field in definitions
- **previewCta fields:** Added to all 25 quiz definitions with compelling, quiz-specific CTA copy (eyebrow, title, body, buttonText)

### Deleted old readiness quiz JSONs
- **Why:** Previously generated via pipeline but had quality issues (leaked questions, hardcoded readiness framing). Reverted in git history. Clean slate for regeneration with improved prompts.
- **Files deleted:** age-appropriate-chores, bedtime-routine, communication-safety, drop-the-nap, kindergarten-readiness, parenting-battery, potty-training-readiness, screen-dependence, second-child-readiness, sleepover-readiness, social-confidence, solid-foods-readiness

## Architectural Notes

### Quiz container routing (quiz-container.tsx)
```
isLikert(quiz) → LikertQuiz (own container, completely different interaction)
isIdentityResult(result) → IdentityResult (Type B always gets identity display)
resultDisplay === 'profile' → ProfileResult
resultDisplay === 'recommendation' → RecommendationResult
Default → QuizResult (readiness)
```

### 4 data model × display combinations
| dataModel | resultDisplay | Quiz count | Example |
|-----------|--------------|------------|---------|
| identity | classification | 10 | parenting-approach, bedtime-battle-style |
| assessment | readiness | 6 | potty-training, kindergarten-readiness |
| likert | profile | 6 | parenting-style, parenting-battery |
| assessment | recommendation | 3 | calm-down-toolkit, bedtime-routine-builder |

### URL encoding unchanged
Likert statements modeled as "questions" with 5 options (indices 0-4 = ratings 1-5). Existing single-char encoding works for all quiz types.

## Information Sources
- Prior worklog: `.worklogs/2026-02-08-131312-quiz-infrastructure-status.md` — Type A/B/C analysis
- Prior worklog: `.worklogs/2026-02-08-135712-quiz-display-types-and-architecture.md` — two axes mapping
- `research/quizzes/quiz-ideas.md` — master plan for all 24 quizzes
- Validated instruments research (PSDQ, PAQ for Likert; various for readiness domains)

## Open Questions / Future Considerations

1. **Profile vs Classification collapse** — these two components may merge. Need to see them with real varied data first.
2. **Likert quiz generation** — parenting-style-likert.json exists as hand-written first draft. Need generation prompt for Likert type.
3. **Email gate implementation** — FreebieCTA component exists, previewCta copy exists. Need: (a) preview mode detection in quiz container, (b) mailing provider integration, (c) email template with full results link.
4. **21 remaining quizzes to generate** — 4 prompt templates needed (identity, readiness, likert-profile, recommendation).
5. **OG images for profile/recommendation** — falls back to readiness card currently. Need specific renderers.
6. **Quiz schema validation** — `resultDisplay` field not yet validated in Zod schemas.

## Key Files for Context

- `research/quizzes/quiz-definitions.json` — master quiz definitions (all 25 quizzes, generation source of truth)
- `research/quizzes/quiz-ideas.md` — original quiz specs and domain mappings
- `landing/src/lib/quiz/quiz-engine.ts` — all quiz type definitions, scoring functions, QuizMeta.resultDisplay
- `landing/src/lib/quiz/index.ts` — quiz registry (4 quizzes currently registered)
- `landing/src/components/quiz/quiz-container.tsx` — routing logic for all quiz/result types
- `landing/src/components/quiz/quiz-result.tsx` — readiness display
- `landing/src/components/quiz/identity-result.tsx` — classification display
- `landing/src/components/quiz/profile-result.tsx` — behavioral profile display
- `landing/src/components/quiz/recommendation-result.tsx` — personalized toolkit display
- `landing/src/components/quiz/likert-quiz.tsx` — Likert input form component
- `landing/src/components/quiz/likert-result.tsx` — Likert result display
- `landing/src/components/blog/freebie-cta.tsx` — email capture component (for quiz email gate)
- `.worklogs/2026-02-08-135712-quiz-display-types-and-architecture.md` — prior worklog with detailed axis analysis

## Next Steps / Continuation Plan

1. **Build 4 generation prompt templates** — `prompt-identity.md`, `prompt-readiness.md`, `prompt-likert-profile.md`, `prompt-recommendation.md` in `research/quizzes/`
2. **Build generation script** — reads quiz-definitions.json, selects prompt template by dataModel, calls Opus, writes JSON to `landing/src/lib/quiz/`
3. **Batch generate all 25 quizzes** — validate each with quiz-schema.ts
4. **Implement email gate** — add preview mode to quiz container, wire FreebieCTA with previewCta copy
5. **Decide profile vs classification** — test with real generated data, collapse if identical
6. **Add OG renderers** — profile and recommendation card types in og/route.tsx

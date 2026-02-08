# Quiz Generation Pipeline: Prompt Dedup, Voice Fix, Schema Tightening

**Date:** 2026-02-07 19:16
**Scope:** `landing/src/lib/quiz/quiz-prompt.ts` (new), `quiz-schema.ts`, `quiz-engine.ts`, `generate-quiz.ts`, `quiz-result.tsx`, `result-domain-insight.tsx`, `scripts/generate-one-quiz.ts`, `scripts/revalidate-raw.ts` (new)

## Summary
Fixed quiz generation pipeline: deduplicated prompts into single source of truth, killed hallucinated academic citations, tightened all content field limits for ~20% shorter output, fixed shared view missing domain details, and cleaned up the comparative context block.

## Context & Problem
Previous session fixed the voice (wry/direct SP voice instead of warm/therapist), the 0% edge case in quiz-engine, and the `.describe()` strings. This session addressed remaining issues found during potty-training-readiness test generations:

1. **Prompt duplication** — system prompt was copy-pasted in `generate-quiz.ts` AND `scripts/generate-one-quiz.ts`, guaranteed to drift
2. **Hallucinated URLs** — LLM generated academic citations with plausible but WRONG URLs (Schum et al., Kaerts et al. with bad DOIs). Cannot be trusted.
3. **Content too verbose** — explanations 766-952 chars, intros 334 chars, subheadlines 282 chars. Blog-article energy, not quiz energy.
4. **Subheadline quality regression** — tightening `.describe()` too aggressively turned "substantive insight" into "dry domain summary"
5. **Shared view missing domain details** — `result-domain-insight.tsx` had `{!shared && ...}` hiding all detail content on shared pages
6. **Comparative context block** — redundant shareable summary text + weird icon layout

## Decisions Made

### Single source of truth for prompts
- **Chose:** New `quiz-prompt.ts` exporting `buildSystemPrompt()`, `buildUserPrompt()`, and `QuizDef` type
- **Why:** Both `generate-quiz.ts` and `scripts/generate-one-quiz.ts` were maintaining identical copies. Any prompt fix required editing two files.
- **Alternatives considered:**
  - Markdown template file read at runtime — rejected because prompt has TypeScript logic (conditional age range, domains, context)
  - Import from generate-quiz.ts into script — rejected because generate-quiz.ts has broken OpenRouter structured output path and messy imports

### Kill all URLs from sources
- **Chose:** `sources` schema changed from `{name: string, url: string}[]` to `string[]` (plain text like "AAP toilet training guidelines")
- **Why:** LLM consistently generates plausible but WRONG URLs for academic papers. If someone verifies them, it's embarrassing. Organization names are verifiable without links.
- **Alternatives considered:**
  - Hardcode source URLs per quiz in the definition — rejected because it defeats the purpose of generation
  - Post-validate URLs with fetch — rejected because adds complexity and the URLs look real but redirect/404

### Ban academic citations in all text fields
- **Chose:** Prompt rule "NEVER include (Author et al., YYYY)" + post-generation citation scan regex
- **Why:** LLM sprinkled "(Blum et al., 2003)" style citations throughout text. These are often hallucinated or misattributed.
- **Alternative:** Allow citations but verify — rejected because verification is expensive and unreliable

### Tighten content limits for ~20% shorter output
- **Chose:** Character budgets in prompt + tighter schema maxes
- **Why:** LLM fills available space. Previous limits (explanation 1000, subheadline 300, encouragement 700) produced essay-length content inappropriate for a quiz result page.
- **Key insight:** The `.describe()` strings say "2-3 sentences" but Opus writes long sentences. Adding explicit character budgets (~N chars) to the system prompt was the fix that actually worked.

Final limits (old → new):
| Field | Old max | New max |
|-------|---------|---------|
| intro | 800 | 250 |
| subheadline | 300 | 180 |
| explanation | 1000 | 600 |
| encouragement | 700 | 350 |
| watchOutFor | 500 | 300 |
| domain detail | 500 | 300 |
| domain strength/concern | 300/400 | 250 |
| nextSteps items | 300 | 200 |

### Auto-fix maxPoints and score ranges
- **Chose:** Deterministic post-processing in generation script
- **Why:** LLM consistently gets domain maxPoints arithmetic wrong (declares 9, actual sum is 12). Also frequently leaves gaps in result score ranges. Both are deterministically fixable from the questions data.
- **Alternative:** Better prompt instructions — tried "Calculate this explicitly before writing", LLM still gets it wrong ~60% of the time

### Show domain details on shared view
- **Chose:** Removed `{!shared && ...}` guard from `result-domain-insight.tsx`
- **Why:** The detail paragraphs (headline, detail text, strength/concern callouts) are the most valuable part of domain insights. Hiding them on shared pages makes the shared view less useful and less share-worthy.

### Simplified comparative context block
- **Chose:** Removed redundant `shareableSummary` text, kept only `comparativeContext` in a clean left-aligned block with subtle icon
- **Why:** The shareable summary ("80% readiness — strongest in X, room to grow in Y") repeated information already visible in the hero ring + domain cards. The comparative context ("Research suggests 40-60%...") is the only unique, valuable content in that section.

## Architectural Notes
- `quiz-prompt.ts` is now the ONLY place to edit generation prompts. Both `generate-quiz.ts` (programmatic, currently broken due to ZodEffects) and `scripts/generate-one-quiz.ts` (CLI, working) import from it.
- The `revalidate-raw.ts` script allows re-running validation on `.raw.json` files after schema changes without burning another API call.
- Auto-fix logic (maxPoints, score ranges) lives in both `generate-one-quiz.ts` and `revalidate-raw.ts` — should probably be extracted to a shared function if we add more fixes.

## Key Lessons
- **LLM fills available space** — if max is 1000, it'll write 900. Set limits to what you actually want, not a generous ceiling.
- **`.describe()` is a secondary prompt** — the schema describe strings get embedded in the JSON schema sent to the LLM. Changing them from "warm, supportive" to "direct, no platitudes" directly improved voice.
- **Quality directives matter** — changing `.describe()` from "substantive 1-2 sentence insight" to "One sentence. What this score range means practically." lost the quality. The word "substantive" + "concrete insight they didn't already know" was doing real work.
- **LLMs can't do arithmetic** — maxPoints = sum of max options per question is trivial math, but Opus gets it wrong >50% of the time. Always auto-fix deterministic properties.
- **LLMs hallucinate URLs** — even well-known organization URLs get mangled. Kill the links entirely.

## Key Files for Context
- `landing/src/lib/quiz/quiz-prompt.ts` — SINGLE SOURCE OF TRUTH for generation prompts (system + user)
- `landing/src/lib/quiz/quiz-schema.ts` — Zod schemas with `.describe()` strings that function as secondary prompt
- `scripts/generate-one-quiz.ts` — CLI generation script with quiz definitions, auto-fixes, and validation
- `scripts/revalidate-raw.ts` — re-validate raw output after schema changes without regenerating
- `landing/src/lib/quiz/generate-quiz.ts` — programmatic generation (broken due to ZodEffects, imports from quiz-prompt.ts)
- `landing/src/lib/quiz/quiz-engine.ts` — scoring engine (0% edge case fixed in previous session)
- `landing/src/components/quiz/quiz-result.tsx` — result page layout (comparative context block simplified)
- `landing/src/components/quiz/result-domain-insight.tsx` — domain detail cards (shared view now shows details)
- `.worklogs/2026-02-07-155449-quiz-voice-and-engine-fixes.md` — previous session's worklog (voice rewrite, 0% fix)

## Validation: Kindergarten-Readiness Generation
Generated kindergarten-readiness as second test quiz — passed clean (no auto-fixes, no platitudes, no citations). Confirmed the pipeline generalizes beyond potty-training:
- Intro: 210 chars, 2 sentences, good opener ("more than finger painting")
- Sources: plain strings, no URLs
- Subheadlines: concrete insights, not domain summaries
- Questions: concrete scenarios with wry subtexts ("not their personal best", "not when they're performing for you")
- All three result tiers substantive and on-voice

## Pipeline Iteration Count
Potty-training-readiness required 5 generation attempts to converge on correct limits:
1. intro >600 + maxPoints wrong → bumped intro, added maxPoints instruction
2. concern >300 → bumped concern
3. subheadline >200, explanation >800, score range gap → bumped limits, added score range auto-fix
4. concern >200 again, explanation >600, watchOutFor >300 → added char budgets to prompt, bumped schema
5. concern >200 (215 vs 200) → bumped concern to 250, revalidated from raw

Kindergarten-readiness: 1 attempt, clean pass. The tightened prompt + schema are now stable.

## Next Steps / Continuation Plan
1. Delete all generated quiz JSONs — pipeline infrastructure is proven and stable
2. **Type B (Identity/Classification) quizzes** need entirely different schema, engine, and result UI:
   - Each option distributes points across MULTIPLE types (not single domain)
   - Result = primary type + blend percentages
   - Types have rich standalone content (name, tagline, strengths, growth edge)
   - No domains — types ARE the scoring dimensions
   - See `research/quizzes/quiz-ideas.md` lines 14-173 for all 10 Type B quizzes
   - "What's Your Parenting Style?" is the flagship
3. Batch-generate all 14 Type A quizzes once Type B is designed (run all through current pipeline)
4. parenting-battery.json needs regeneration (old source format with URLs)

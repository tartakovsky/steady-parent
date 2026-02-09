# Quiz CTA Validation + Prompt Enforcement

**Date:** 2026-02-09 19:08
**Scope:** content-spec/src/schemas/quiz-output.ts, content-spec/src/validator/quiz.ts, content-spec/src/validator/cta.ts, content-spec/src/index.ts, landing/src/lib/quiz/quiz-prompt.ts, landing/src/lib/quiz/quiz-schema.ts, landing/src/app/admin/spec/page.tsx

## Summary
Added CTA validation to the quiz validator and enforced exact CTA rules in quiz generation prompts. Previously the quiz validator had zero CTA checks — generated quizzes could have wrong button text, missing founder lines, or forbidden terms with no errors reported. Now all deployed quizzes correctly show CTA errors in the admin dashboard.

## Context & Problem
User generated a potty-training-readiness quiz and noticed:
1. Community CTA body said "bite-sized scripts, daily support from founders, and parents who've been through it" — missing the required founder line "We are there with you daily too"
2. The quiz validator said everything was fine (0 errors)
3. Preview CTA button text was not standardized to "Send my results"
4. All three quiz prompt example JSONs contained "Weekly Q&As" — a forbidden term
5. Prompt instructions said "e.g." for button text instead of making it absolute

## Decisions Made

### CTA fields required in content-spec output schema
- **Chose:** Make previewCta, previewPromises, communityCta required (not optional) with literal buttonText values
- **Why:** These are essential for the email gate and community funnel. No quiz should ship without them.
- **Alternatives considered:** Keep them optional — rejected because every quiz needs them

### Shared validateQuizCtas() function
- **Chose:** Single function called from all three quiz type validators (likert, identity, assessment)
- **Why:** Same CTA rules apply regardless of quiz type. DRY.
- **Alternatives considered:** Per-type CTA checks — rejected, no type-specific CTA rules exist

### Import CTA constants from cta.ts
- **Chose:** Reuse existing COMMUNITY_BUTTON_TEXT, COMMUNITY_FOUNDER_LINE, FORBIDDEN_TERMS from the article CTA validator
- **Why:** Single source of truth for these constants
- **Added:** PREVIEW_BUTTON_TEXT = "Send my results" (new constant)

### Prompt example JSON fixes
- **Chose:** Replace forbidden "Weekly Q&As" in all 3 example community CTA bodies with compliant text including founder line
- **Why:** The example JSON is what the LLM mimics. If the example violates rules, generated output will too.

### User prompt reinforcement
- **Chose:** Changed "Q&As" in user prompt guidance to "daily founder support", added explicit founder line and previewCta buttonText rules
- **Why:** The user prompt's "Make sure:" section is the last line of defense before generation

## Architectural Notes
- Two parallel Zod schema systems: content-spec (validator, uses zod/v4) and landing (runtime, uses zod). Both now enforce the same buttonText literals.
- Landing schema uses `.refine()` on the communityCta object for the founder line check (since the body field itself is just z.string, the semantic check must be a refinement).
- Content-spec validator does the same check imperatively in validateQuizCtas().
- All 6 currently deployed quizzes now fail validation — they need regeneration with updated prompts.

## Information Sources
- Existing article CTA validator: `content-spec/src/validator/cta.ts`
- Quiz validator pattern: `content-spec/src/validator/quiz.ts`
- Landing quiz schemas: `landing/src/lib/quiz/quiz-schema.ts`
- Plan file: `/Users/tartakovsky/.claude/plans/shimmering-brewing-turtle.md`

## Open Questions / Future Considerations
- All 6 deployed quizzes need regeneration to fix CTA errors
- The summary shows "0 passing, 6 errors" — this is expected and correct

## Key Files for Context
- `content-spec/src/schemas/quiz-output.ts` — content-spec Zod schemas with literal buttonText
- `content-spec/src/validator/quiz.ts` — quiz validator with CTA checks
- `content-spec/src/validator/cta.ts` — shared CTA constants (COMMUNITY_BUTTON_TEXT, etc.)
- `landing/src/lib/quiz/quiz-prompt.ts` — quiz generation prompts (all 3 types)
- `landing/src/lib/quiz/quiz-schema.ts` — landing-side Zod schemas with literal + refine
- `landing/src/app/admin/spec/page.tsx` — admin spec page with Quiz CTA Rules section
- `.worklogs/2026-02-08-171844-full-session-canonical-ctas-pipeline.md` — prior CTA work

## Next Steps / Continuation Plan
1. Regenerate all 6 deployed quizzes using updated prompts (they all fail CTA validation now)
2. Verify regenerated quizzes pass validation in admin dashboard
3. Consider adding community CTA copy from cta_catalog.json into quiz prompts (currently quiz agents generate their own community copy)

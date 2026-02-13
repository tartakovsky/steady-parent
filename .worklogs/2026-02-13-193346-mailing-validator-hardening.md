# Mailing validator hardening — literal placeholder, quiz-completed tag, tag format/count checks

**Date:** 2026-02-13 19:33
**Scope:** `new_validation/validators/spec/mailing.ts`, `new_validation/validators/spec/index.ts`, `scripts/migrate_mailing_spec.py`, `new_validation/spec/mailing.json`, `spec/mailing.json`

## Summary
Added three hardening checks to the mailing form Zod validators based on review: literal inputPlaceholder, quiz-completed automation tag, and tag format/count validation. All 289 entries pass, 6 negative test cases verified.

## Context & Problem
After building the initial mailing validators (schemas + cross-ref), a comprehensive schema review identified gaps: inputPlaceholder was only checked as non-empty (should be literal "Email address"), quiz gate tags were missing the "quiz-completed" automation trigger tag, and tags had no format or count validation.

## Decisions Made

### Literal inputPlaceholder for all forms
- **Chose:** `z.literal("Email address")` for all three form types
- **Why:** All forms should use consistent placeholder text. Waitlist was "Your email" (from CourseHero component hardcode), but user specified "Email address" universally.
- **Impact:** Migration script updated for waitlist, 20 waitlist entries changed.

### quiz-completed tag in quiz gate
- **Chose:** Add "quiz-completed" to quiz tags: `["lead", "quiz-{slug}", "quiz-completed"]`
- **Why:** The quiz-subscribe API route removes then re-adds this tag when `fromGate=true` to trigger Kit automation. The spec should document this expected outcome.
- **Source:** `landing/src/app/api/quiz-subscribe/route.ts` — the remove+re-add pattern for automation re-trigger.

### Tag format validation (derived from params)
- **Chose:** Verify tag names match params — freebie: `freebie-{params.category}`, waitlist: `waitlist-{params.category}`, quiz: `quiz-{params.quizSlug}`
- **Why:** Catches mismatches where the tag slug doesn't correspond to the params slug, which would cause wrong Kit tagging.

### Tag count validation (exact)
- **Chose:** Freebie=2, waitlist=3, quiz=3 (exact counts)
- **Why:** Prevents accidental extra or missing tags. Combined with format checks, this fully constrains the tag arrays.

## Key Files for Context
- `new_validation/validators/spec/mailing.ts` — mailing form Zod schemas (source of truth)
- `new_validation/validators/spec/shared.ts` — shared constants, types, helpers
- `scripts/migrate_mailing_spec.py` — generates spec JSONs from catalog
- `.worklogs/2026-02-13-183956-mailing-validators.md` — initial validator creation
- `.worklogs/2026-02-13-183251-spec-mailing-migration.md` — spec migration context

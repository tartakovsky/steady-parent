# Relax word count limits for quiz-gate and freebie forms

**Date:** 2026-02-12 16:43
**Scope:** content-spec/src/validator/cta.ts, content-spec/src/validator/mailing-form.ts, landing/src/app/api/admin/mailing/route.ts

## Summary
Relaxed eyebrow/title/body word count limits for quiz-gate and blog freebie forms so existing copy passes validation. Added eyebrowMin/eyebrowMax to `validateCtaCopy` options.

## Decisions Made

### New limits for quiz-gate and freebie
- **Eyebrow:** 2-7 words (was 2-5)
- **Title:** 3-10 words (was 3-8)
- **Body:** 8-36 words (was 8-24)
- **Why:** Existing quiz-gate and freebie copy naturally runs longer than community/course CTAs. Rather than rewriting all copy, relax the limits to match actual content needs.

### Added eyebrowMin/eyebrowMax to validateCtaCopy options
- **Chose:** Extend the existing options object with `eyebrowMin` and `eyebrowMax` (default 2/5 unchanged)
- **Why:** Eyebrow limit was previously hardcoded to 2-5. Making it configurable allows quiz/freebie to use 2-7 without affecting community/course defaults.

## Key Files for Context
- `content-spec/src/validator/cta.ts` — `validateCtaCopy` options now include eyebrowMin/eyebrowMax
- `content-spec/src/validator/mailing-form.ts` — freebie (line 84) and quiz-gate (line 182) calls pass relaxed options
- `landing/src/app/api/admin/mailing/route.ts` — admin API freebie + quiz-gate calls pass relaxed options

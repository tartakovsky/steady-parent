# Generate 20 waitlist CTAs and fix validator limits

**Date:** 2026-02-12 11:41
**Scope:** content-plan/mailing_form_catalog.json, content-spec/src/validator/cta.ts, content-spec/src/validator/mailing-form.ts

## Summary
Generated all 20 waitlist CTAs using the waitlist_cta_prompt.md, merged them into mailing_form_catalog.json, fixed validator to support configurable body limits per CTA type, and manually shortened 13 eyebrows + 10 titles to pass validation.

## Context & Problem
Waitlist CTA prompt was committed in prior session. Background agent generated all 20 entries successfully, but the merge into mailing_form_catalog.json failed (JSON extraction from JSONL agent output broke — only extracted 1 entry instead of 20, plus a junk `{type:"text"}` artifact leaked in).

## Decisions Made

### Validator body limits: configurable per type
- **Chose:** Extended `validateCtaCopy` options to include `bodyMin`/`bodyMax` alongside existing `titleMin`/`titleMax`
- **Why:** Waitlist bodies are 20-30 words (include product description), while community/freebie bodies are 8-24 words. Same pattern as title limits.
- **Mailing form validator** now passes `{ titleMin: 5, titleMax: 12, bodyMin: 20, bodyMax: 30 }` for waitlist entries

### Eyebrow/title manual fixes (same approach as course CTAs)
- **Chose:** Manually edit entries that violate word counts rather than regenerating
- **Why:** Opus generates good copy but often overshoots eyebrow (2-5w) and title (5-12w) limits. Shortening is straightforward and preserves voice. 13 eyebrows shortened, 10 titles shortened, 2 freebie bodies shortened.

## Key Files for Context
- `content-plan/mailing_form_catalog.json` — 64 entries (20 freebie + 24 quiz-gate + 20 waitlist)
- `content-plan/waitlist_cta_prompt.md` — prompt template used for generation
- `content-spec/src/validator/cta.ts` — configurable title + body limits
- `content-spec/src/validator/mailing-form.ts` — passes waitlist-specific limits
- `.worklogs/2026-02-12-113453-course-waitlist-cta-prompts.md` — prior worklog with prompt creation

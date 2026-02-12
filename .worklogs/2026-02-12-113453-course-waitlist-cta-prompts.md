# Course CTA regen + waitlist CTA prompt + validator title limits

**Date:** 2026-02-12 11:34
**Scope:** content-plan/cta_catalog.json, content-plan/course_cta_prompt.md, content-plan/waitlist_cta_prompt.md, content-plan/community_cta_prompt.md, content-plan/quiz_community_cta_prompt.md, content-spec/src/validator/cta.ts, landing/src/lib/quiz/*.json

## Summary
Regenerated all 20 course CTAs with flowing future-tense titles ("The X course will [verb] you..."), created waitlist CTA prompt following same approach, made validator title limits configurable per CTA type, and moved all CTA prompts to content-plan/.

## Context & Problem
Course CTAs had present-tense titles ("X gives you...", "X shows you...") and dash-fragment structures ("X course — your plan"). User wanted:
- Future tense: "will show", "will help", "will teach"
- Course as subject in a proper flowing sentence
- Eyebrow → title reads as one sentence
- Body shows felt relief, not product spec

Waitlist CTAs were worse: every body started with "Audio lessons and illustrated guides for..." and titles were commands ("Join the X waitlist"). Needed same treatment but with product description in body since it's the only thing users see on the course page.

## Decisions Made

### Course title structure: future-tense sentence with course as subject
- **Chose:** "The [Course Name] course will [verb] you [something]" — 9-12 words
- **Why:** Flows naturally from eyebrow ("When they hit again, the Beyond Hitting course will teach you what to do"), uses future tense as user requested
- **Alternatives considered:**
  - Present tense ("shows", "helps") — user said no, course hasn't happened yet
  - Dash-fragment ("X course — your plan") — user said not a sentence, doesn't flow
  - Course as tool ("stop freezing with the X course") — user said courses take time, not a momentary tool

### Validator title limits: configurable per type
- **Chose:** Added optional `{ titleMin, titleMax }` param to `validateCtaCopy()`. Community/quiz defaults to 3-8, course uses 5-12
- **Why:** Course titles need more words because "The [Name] course will [verb]" is 7-9 words of scaffolding. Community titles are shorter.

### Waitlist CTA body: value-first then product description
- **Chose:** Body structure: "[value clause] — with narrated audio lessons, illustrated guides, and [topic-specific community mention]"
- **Why:** Waitlist CTA is the only thing user sees on the course page — must describe what's inside. But lead with value, not format. Body limit 20-30 words (wider than course CTA's 17-24).

### Prompt files moved to content-plan/
- **Chose:** All active CTA generation prompts live in content-plan/ alongside other production files
- **Why:** User corrected earlier — research/ is for historical docs, content-plan/ is for active production files

## Key Files for Context
- `content-plan/course_cta_prompt.md` — course CTA generation prompt (future-tense, 5-12w titles)
- `content-plan/waitlist_cta_prompt.md` — waitlist CTA generation prompt (value + product desc)
- `content-plan/community_cta_prompt.md` — category community CTA prompt
- `content-plan/quiz_community_cta_prompt.md` — quiz community CTA prompt
- `content-plan/cta_catalog.json` — 65 entries (community + course + quiz)
- `content-plan/mailing_form_catalog.json` — freebie + waitlist + quiz-gate entries
- `content-spec/src/validator/cta.ts` — configurable title limits per CTA type
- `.worklogs/2026-02-11-185058-cta-mailing-form-split.md` — prior CTA/mailing split worklog

## Next Steps
1. Generate all 20 waitlist CTAs with new prompt → merge into mailing_form_catalog.json
2. Validate clean
3. Consider freebie CTA copy improvement (same approach)

# Create quiz community CTA prompt and regenerate 24 entries

**Date:** 2026-02-12 10:03
**Scope:** research/quiz_community_cta_prompt.md, content-plan/cta_catalog.json

## Summary
Created a new quiz-specific community CTA prompt and regenerated all 24 `community-quiz-{slug}` entries. Previous entries were cloned from article categories with duplicate copy and platitudes.

## Context & Problem
The 24 quiz community CTA entries in `cta_catalog.json` were placeholder clones from article category CTAs. Many were duplicates (e.g., 4 sleep-related quizzes all had identical "No sleep shaming" copy). Eyebrows were platitudes ("You are not alone", "They get it"), titles didn't reference the quiz result or community, and bodies were generic.

## Decisions Made

### Separate prompt for quiz CTAs vs category CTAs
- **Chose:** Create `research/quiz_community_cta_prompt.md` as a separate prompt, modeled after `research/community_cta_prompt.md` but quiz-specific
- **Why:** Quiz CTAs have a fundamentally different context — the reader just completed a quiz and learned something about themselves. The eyebrow should reference the result moment, the title should connect to comparing results, the body should show conversations about quiz insights. This can't be handled by the category prompt.

### Eyebrow references quiz result moment
- **Chose:** Critical rule #5: "The EYEBROW must reference the quiz result moment — what the reader just learned"
- **Why:** Category CTAs put you in a parenting moment ("When they hit again"). Quiz CTAs put you in a discovery moment ("Now you know your style", "After seeing their score"). Different trigger, different copy.

## Key Files for Context
- `research/quiz_community_cta_prompt.md` — the new quiz CTA prompt
- `research/community_cta_prompt.md` — the category CTA prompt (model for this one)
- `content-plan/cta_catalog.json` — 24 community-quiz-{slug} entries replaced
- `.worklogs/2026-02-12-095815-community-cta-copy-regen.md` — prior worklog for category CTAs

# Regenerate per-category community CTA copy with improved prompt

**Date:** 2026-02-12 09:58
**Scope:** research/community_cta_prompt.md, content-plan/cta_catalog.json

## Summary
Rewrote the community CTA generation prompt with critical rules that enforce community-focused, reader-directed copy. Regenerated all 20 per-category community CTA entries.

## Context & Problem
First-generation community CTAs used "Parents who..." pattern in titles, which talks ABOUT other parents as a third party instead of speaking TO the reader. Reads like testimonials, not community invitations. Zero clarity that the reader is being invited to join a conversation.

## Decisions Made

### Prompt critical rules
- **Chose:** Four explicit rules: (1) title must speak TO reader not ABOUT parents, never "Parents who...", (2) title must make community clear, (3) body shows what's happening IN the community, (4) every field category-specific
- **Why:** First generation without these rules produced copy that looked like resource descriptions or testimonials. The "Parents who..." pattern was the biggest failure mode — easily preventable with an explicit prohibition.

### NOT THIS EITHER example
- **Chose:** Added a second anti-pattern example showing why "Parents who stopped the hitting without losing their minds" fails
- **Why:** The first anti-pattern example (abstract label eyebrow + abstract title) wasn't enough — the agent needs to see that even a specific, engaging title fails if it talks ABOUT other parents instead of TO the reader.

### Hard constraints self-check
- **Chose:** Added explicit word count validation instructions at end of prompt
- **Why:** Previous generation had 10/20 eyebrows exceeding 5-word limit. Making the agent count and fix before outputting eliminates post-generation cleanup.

## Key Files for Context
- `research/community_cta_prompt.md` — the updated prompt template
- `content-plan/cta_catalog.json` — 20 community-{slug} entries replaced
- `.worklogs/2026-02-11-215400-quiz-gate-copy-admin-display.md` — prior session context

## Next Steps / Continuation Plan
1. Create quiz community CTA prompt (`research/quiz_community_cta_prompt.md`)
2. Regenerate 24 quiz community CTAs (`community-quiz-{slug}`)

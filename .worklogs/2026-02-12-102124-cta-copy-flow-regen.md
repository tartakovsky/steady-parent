# Improve CTA body copy: specific relief + flow + second person

**Date:** 2026-02-12 10:21
**Scope:** research/community_cta_prompt.md, research/quiz_community_cta_prompt.md, content-plan/cta_catalog.json

## Summary
Updated both community CTA prompts with three new principles and regenerated all 44 entries (20 category + 24 quiz). Bodies now show specific relief instead of "the conversation about X, Y, Z". All copy uses second person and flows as one continuous message.

## Context & Problem
All 44 community CTA bodies used the same dead formula: "The [adj] conversation about X, Y, and Z." Reads identically on every page. More importantly, it describes a conversation instead of showing what changes for the reader. Additionally, some quiz CTAs used third person ("after seeing their score") instead of addressing the reader directly. Fields were written independently rather than flowing as one message.

## Decisions Made

### Body shows specific relief, not conversation description
- **Chose:** "Next time [specific scenario], you'll have [concrete thing you gain]" pattern
- **Why:** Each CTA lives alone on its page — reader sees one, not 44. Optimization target is maximum attractiveness on THIS page. Showing what changes after joining (specific relief) is more compelling than describing what happens in the group.

### Always second person
- **Chose:** "you/your" everywhere, never "their/them/a parent"
- **Why:** "After seeing their score" creates distance — who's "their"? "Now you see the gaps" puts the reader in the moment. The CTA is talking TO this specific person.

### Eyebrow → title → body flows as one thought
- **Chose:** Explicit rule that body continues the title, doesn't repeat it
- **Why:** Reader reads these in sequence. Three disconnected fields feel like a form. One flowing message feels like someone talking to you.

## Key Files for Context
- `research/community_cta_prompt.md` — category CTA prompt with new principles
- `research/quiz_community_cta_prompt.md` — quiz CTA prompt with new principles
- `content-plan/cta_catalog.json` — all 44 community entries regenerated
- `.worklogs/2026-02-12-095815-community-cta-copy-regen.md` — prior category regen
- `.worklogs/2026-02-12-100332-quiz-community-cta-regen.md` — prior quiz regen

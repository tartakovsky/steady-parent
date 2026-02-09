# Regenerate community CTAs v2: fixed buttonText, founder line, simplified display

**Date:** 2026-02-09 11:46
**Scope:** content-spec/src/schemas/cta-catalog.ts, content-spec/src/validator/cta.ts, research/community_cta_prompt.md, research/cta_catalog.json, landing/src/app/admin/spec/page.tsx, landing/src/lib/cta-catalog.ts

## Summary
Applied user feedback to community CTA system: hardcoded buttonText to "Join the community", standardized founder line to "We are there with you daily too", removed confusing `what_it_is` from per-category community entries, simplified admin display from card to plain table text. Regenerated all 20 entries with updated prompt.

## Context & Problem
After the first round of community CTA generation (commit 0465260), the user identified three issues:
1. `buttonText` varied across entries ("Come talk to us", "Join the conversation", etc.) — should always be "Join the community"
2. The `what_it_is` text above the cta_copy card was confusing and served no purpose for per-category entries
3. The founder reference was too removed ("founders are in there daily...") — should be a fixed, short line: "We are there with you daily too"

## Decisions Made

### Fixed buttonText
- **Chose:** Validator enforces exact match `buttonText === "Join the community"`
- **Why:** User wants a single, unchangeable CTA button label for community entries

### Removed what_it_is from community entries
- **Chose:** Made `what_it_is` optional in schema, removed from per-category community entries, kept for courses/freebies
- **Why:** The what_it_is text was redundant with cta_copy for community entries and confused the user on the admin page
- **Alternatives:** Keep what_it_is as internal notes — rejected, adds confusion without value

### Fixed founder line
- **Chose:** Body must contain "We are there with you daily too" — same exact line for all 20 entries
- **Why:** User wanted minimal founder mention, peer-to-peer tone ("we" not "founders"), no category variation in the founder part

### Simplified admin display
- **Chose:** Removed dashed-border card, show eyebrow/title/body as plain text in table column
- **Why:** User said "just put it into the table like the other things in the table do"

## Key Files for Context
- `content-spec/src/validator/cta.ts` — CTA business rule validator (buttonText, founder line, word counts, forbidden terms)
- `content-spec/src/schemas/cta-catalog.ts` — Zod schema (what_it_is now optional)
- `research/community_cta_prompt.md` — generation prompt template (no what_it_is, fixed buttonText/founder line)
- `research/cta_catalog.json` — 61 entries: 1 global + 20 per-category community + 20 courses + 20 freebies
- `.worklogs/2026-02-08-171844-full-session-canonical-ctas-pipeline.md` — prior session worklog

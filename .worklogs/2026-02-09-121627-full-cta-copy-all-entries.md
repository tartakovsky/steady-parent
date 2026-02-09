# Full cta_copy for all 61 CTA catalog entries

**Date:** 2026-02-09 12:16
**Scope:** content-spec/src/schemas/cta-catalog.ts, content-spec/src/validator/cta.ts, research/cta_catalog.json, landing/src/app/admin/spec/page.tsx

## Summary
Added complete cta_copy (eyebrow, title, body, buttonText) to all 40 course+freebie entries. Removed the interim `button_text` field. Now all 61 catalog entries (community + course + freebie) have full pre-generated CTA copy that the article writer must use verbatim.

## Context & Problem
Previous session added per-entry `button_text` to courses/freebies, but user correctly pointed out: if we're pre-generating CTA body and title for community entries, we should pre-generate everything for courses/freebies too. The article writer prompt should inject exact cta_copy values, not let the writer invent eyebrow/buttonText. This makes the article validator able to deterministically check that CTA components in generated articles match the catalog exactly.

## Decisions Made

### Remove button_text, use cta_copy for all
- **Chose:** Full cta_copy object (eyebrow, title, body, buttonText) on every entry, remove button_text
- **Why:** Consistency across all three CTA types. The writer prompt injects exact copy, the validator checks it. No ambiguity.
- **Rejected:** Keeping button_text as a separate field — creates two different patterns for the same data

### Generated copy style
- **Chose:** Eyebrow sets emotional context ("When they lash out", "Worry is taking over"), title includes product name ("Start the Beyond Hitting course"), body describes value proposition
- **Why:** Eyebrow hooks the reader into the specific moment, title identifies the product, body sells the value
- **Constraints enforced:** Eyebrow 2-5 words, title 3-12 words (contains product name), body 8-35 words, no exclamation marks

### Course buttonText: always "Start the course"
- **Why:** Consistent across all 20 courses, clear call to action

### Freebie buttonText: matches freebie type
- **Pattern:** "Send me the [noun]" where noun matches the freebie type (flowchart, toolkit, poster, scripts, worksheet, cheat sheet, planner, card, checklist, agreement, cards, map, starters)

## Key Files
- `content-spec/src/schemas/cta-catalog.ts` — removed button_text (was from previous session)
- `content-spec/src/validator/cta.ts` — requires cta_copy on courses/freebies, shared validateCtaCopy helper
- `research/cta_catalog.json` — all 61 entries now have cta_copy
- `landing/src/app/admin/spec/page.tsx` — displays full cta_copy for all three columns
- `.worklogs/2026-02-09-115201-button-text-per-entry.md` — previous session's interim approach (superseded)

## Next Steps / Continuation Plan
1. Update `research/writer_prompt.md` to inject exact cta_copy values from catalog instead of letting writer invent
2. Build article-level CTA validator — parse CTA JSX components from generated MDX, extract eyebrow/title/body/buttonText props, compare against catalog
3. The article validator should be deterministic (no AI) — regex/AST extraction of JSX props

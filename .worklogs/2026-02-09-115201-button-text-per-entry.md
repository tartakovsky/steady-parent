# Add per-entry button_text to CTA catalog

**Date:** 2026-02-09 11:52
**Scope:** content-spec/src/schemas/cta-catalog.ts, content-spec/src/validator/cta.ts, research/cta_catalog.json, landing/src/app/admin/spec/page.tsx

## Summary
Added `button_text` field to CTA schema and every course/freebie entry. Freebie button text now matches the actual freebie type (flowchart, toolkit, poster, etc.) instead of hardcoded "Send me the sheet". Admin shows button text as dark pill badges on all three columns.

## Context & Problem
The freebie CTA component had "Send me the sheet" hardcoded as the default button text, but freebies include flowcharts, toolkits, posters, cards, worksheets, checklists, etc. The button text needs to be per-entry in the catalog so the writer prompt and components can use it.

## Decisions Made

### Per-entry button_text field
- **Chose:** Top-level `button_text` on CtaDefinitionSchema for courses/freebies
- **Why:** Community entries use `cta_copy.buttonText`; courses/freebies don't need full cta_copy (eyebrow/title/body are written per-article), just the button label
- **Pattern:** Courses all get "Start the course"; freebies each get "Send me the [noun]" matching their actual type

### Admin badge display
- **Chose:** Dark rounded-full pill showing the button text from data, on all three columns
- **Why:** User wants visual confirmation of what each button says, and to verify consistency

## Key Files
- `content-spec/src/schemas/cta-catalog.ts` — `button_text` field added
- `content-spec/src/validator/cta.ts` — requires button_text on courses/freebies
- `research/cta_catalog.json` — all 40 course/freebie entries now have button_text
- `landing/src/app/admin/spec/page.tsx` — badge display for all three columns

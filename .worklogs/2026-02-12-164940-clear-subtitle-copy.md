# Rewrite page subtitles with clear, concrete language

**Date:** 2026-02-12 16:49
**Scope:** landing/src/app/admin/ctas/page.tsx, landing/src/app/admin/mailing/page.tsx

## Summary
Replaced jargon-heavy subtitles ("65 catalog entries") with plain descriptions: categories, articles, quiz CTAs, freebie/waitlist/quiz-gate forms.

## Context & Problem
Subtitles said "65 catalog entries" and "catalog entries + article checks" — meaningless to anyone who doesn't know the internal data model. The user wants to see real things: how many categories, how many articles, how many are published.

## Decisions Made

### CTA page subtitle
- **Before:** "65 catalog entries + 490 article checks across 20 categories"
- **After:** "20 categories · 245 articles (5 published) · 3 quiz community CTAs"

### Mailing page subtitle
- **Before:** "64 catalog entries + 245 article checks · 46 Kit tags synced"
- **After:** "20 freebie forms · 20 waitlist forms · 24 quiz gates · 245 articles · 46 Kit tags"

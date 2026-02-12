# Structured stats subtitles for CTA and mailing pages

**Date:** 2026-02-12 16:54
**Scope:** landing/src/app/admin/ctas/page.tsx, landing/src/app/admin/mailing/page.tsx

## Summary
Replaced single-line subtitles with multi-line structured stats showing x/y fractions (green when complete, red when not) for every dimension being validated.

## CTA page stats
- Article categories: 20
- Articles: 5/245
- In-article community CTAs: x/245
- In-article course CTAs: x/245
- Quizzes: 3
- In-quiz community CTAs: x/3

## Mailing page stats
- Articles: 5/245
- Blog freebie forms: x/20
- In-article freebies: x/245
- Course waitlist forms: x/20
- Quiz gate forms: x/24
- Kit tags: x/y mapped

## Key Files
- `landing/src/app/admin/ctas/page.tsx` — Fraction component, per-article CTA pass counting
- `landing/src/app/admin/mailing/page.tsx` — Fraction component, per-type pass counting from byEntry

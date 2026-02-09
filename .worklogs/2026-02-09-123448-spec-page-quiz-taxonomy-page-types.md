# Admin spec page: quiz taxonomy + quiz page types

**Date:** 2026-02-09 12:34
**Scope:** landing/src/app/admin/spec/page.tsx, landing/src/app/api/admin/spec/route.ts

## Summary
Added quiz taxonomy and quiz page types to the admin Content Spec page. The Taxonomy tab now shows quizzes connected to each category and a separate Quizzes table. The Page Types tab now shows quiz structural constraints alongside article page types.

## Context & Problem
The spec page only displayed article taxonomy and article page types. Quiz data (`quiz_taxonomy.json` with 24 quizzes and `quiz_page_types.json` with 3 types) existed in content-spec schemas but wasn't surfaced in the admin dashboard. User requested: "I only see in the specs taxonomy only for the pages, but we must also have taxonomy for the quizzes."

## Decisions Made

### Taxonomy tab: quizzes inside category rows + separate table
- **Chose:** Show quiz count per category inline (purple badge), show quizzes with "quiz" type badge when category is expanded, plus a full Quizzes table below Articles
- **Why:** Categories and quizzes are connected via `connectsTo` — showing them together gives instant context about content density per category. The separate table gives a full quiz inventory with URL and connectsTo badges.

### Page Types tab: side-by-side quiz type cards
- **Chose:** Dynamic constraint rendering that handles Range objects ({min, max}), booleans, and scalar numbers
- **Why:** Quiz page type constraints have mixed value types (ranges like `questionCount: {min: 8, max: 12}`, scalars like `scalePoints: 5`, booleans like `requiresSources: true`). A generic renderer avoids hardcoding each constraint.

### API route: load both quiz data files
- **Chose:** Add `quiz_taxonomy.json` and `quiz_page_types.json` to the existing parallel `loadAndValidate()` calls
- **Why:** Same pattern as existing data files, minimal code addition

## Key Files
- `landing/src/app/admin/spec/page.tsx` — spec page with Taxonomy + Page Types tabs updated
- `landing/src/app/api/admin/spec/route.ts` — API route loading quiz data
- `research/quiz_taxonomy.json` — 24 quizzes with slug, title, url, connectsTo
- `research/quiz_page_types.json` — 3 quiz types with structural constraints
- `.worklogs/2026-02-09-121627-full-cta-copy-all-entries.md` — previous worklog (cta_copy merge)
- `.worklogs/2026-02-09-122414-writer-prompt-and-validator-cta-exact-match.md` — previous worklog (writer prompt + validator)

# Overhaul validation pages: category accordions, quiz types, quiz plan

**Date:** 2026-02-09 17:38
**Scope:** landing/src/app/admin/articles/page.tsx, landing/src/app/admin/quizzes/page.tsx, landing/src/app/admin/plan/page.tsx, landing/src/app/api/admin/quizzes/route.ts, landing/src/app/api/admin/plan/route.ts, landing/package.json

## Summary
Three validation pages overhauled: Articles grouped by category accordion, Quizzes shows dataModel + resultDisplay (removed useless connectsTo), Plan vs Reality adds quizzes section and groups articles by category accordion with X/Y deployed counts.

## Context & Problem
User feedback: validation pages were flat tables that didn't group by category, quizzes showed "Connected Categories" which is irrelevant metadata (not actual cross-links), and Plan vs Reality was missing quizzes entirely.

## Decisions Made

### Articles: category accordion with expand/collapse
- **Chose:** Replace TanStack React Table with manual accordion-by-category grouping
- **Why:** Category grouping is the primary organization; sorting within category less important than quick visual scan
- **Alternatives considered:**
  - Keep TanStack with grouping — rejected because TanStack grouping adds complexity for a simple group-then-list pattern

### Quizzes: dataModel + resultDisplay from quiz-definitions.json
- **Chose:** Read quiz-definitions.json in the quiz API route, merge dataModel/resultDisplay into response
- **Why:** These fields only exist in quiz-definitions.json, not in quiz_taxonomy.json. The taxonomy schema intentionally has minimal fields (slug, title, url, connectsTo)
- **Alternatives considered:**
  - Add fields to quiz_taxonomy.json — rejected because that's a different data file with different purpose

### Quizzes: remove connectsTo column
- **Chose:** Stop returning connectsTo from API, remove column from UI
- **Why:** connectsTo is category metadata, not validation data. User explicitly said "I have no idea why do we have them at all"

### Plan vs Reality: add quizzes
- **Chose:** Update plan API to return `{ articles, quizzes }` instead of flat article array. Quiz deployment detected by checking for JSON files in quiz directory.
- **Why:** Quizzes are part of the content plan and were completely missing from Plan vs Reality

### Plan vs Reality: articles grouped by category accordion
- **Chose:** Two-level collapsible: outer Articles/Quizzes sections, inner per-category accordion for articles
- **Why:** Matches the pattern established in Articles validation page, gives X/Y deployed per category at a glance

### Build command: copy quiz data files
- **Chose:** Add quiz_taxonomy.json, quiz_page_types.json, and quizzes/quiz-definitions.json to the build copy step
- **Why:** Quiz API reads these files, production build needs them in mdx-sources/

## Key Files for Context
- `landing/src/app/admin/articles/page.tsx` — articles validation with category accordion
- `landing/src/app/admin/quizzes/page.tsx` — quizzes validation with dataModel/resultDisplay
- `landing/src/app/admin/plan/page.tsx` — plan vs reality with articles + quizzes
- `landing/src/app/api/admin/quizzes/route.ts` — quiz API (reads quiz-definitions.json)
- `landing/src/app/api/admin/plan/route.ts` — plan API (returns articles + quizzes)
- `.worklogs/2026-02-09-171428-admin-nav-tree.md` — prior: sidebar tree restructuring
- `.worklogs/2026-02-09-160607-crosslink-ctas-fix.md` — prior: cross-linking fixes

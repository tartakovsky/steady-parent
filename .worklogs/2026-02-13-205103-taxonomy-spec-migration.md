# Taxonomy spec migration — master registry JSON from 5 source files

**Date:** 2026-02-13 20:51
**Scope:** `scripts/migrate_taxonomy_spec.py`, `new_validation/spec/taxonomy.json`, `spec/ctas.json` (deleted), `spec/mailing.json` (deleted)

## Summary
Built taxonomy.json migration script that merges 5 content-plan source files into one canonical master registry. Deleted legacy root `spec/` files (real files live in `new_validation/spec/`).

## Context & Problem
The validation rebuild needs a master registry (taxonomy.json) that all other validators can cross-reference. Previously, category/article/quiz/course/page-type data was scattered across 5 separate files in `content-plan/`. The root `spec/` directory contained legacy copies that are now superseded by `new_validation/spec/`.

## Decisions Made

### taxonomy.json key structure
- **Chose:** URL-path-segment keys: `blog/{cat}/{article}`, `quiz/{slug}`, `course/{slug}`
- **Why:** Matches site URL structure, consistent with ctas.json and mailing.json keying

### seriesPosition included
- **Chose:** Derive seriesPosition from array order in source (1-based per category), only on series articles
- **Why:** User decided to make ordering explicit rather than implicit from linking.json prev/next chains. 225 series articles get it, 20 pillars don't.

### No trailing slashes on quiz URLs
- **Chose:** `url.rstrip("/")` — quiz URLs stored without trailing slash
- **Why:** Source quiz_taxonomy.json lacks them; user directive to keep them off

### Courses keyed by course slug, not category slug
- **Chose:** Extract slug from URL path (`/course/beyond-hitting/` → `beyond-hitting`)
- **Why:** 12 of 20 course slugs differ from their category slug

### Page types embedded in taxonomy
- **Chose:** `pageTypes.article` (pillar/series) + `pageTypes.quiz` (likert/identity/assessment) inside taxonomy.json
- **Why:** Taxonomy = master registry of everything, no need for separate files

### Deleted legacy spec/ files
- **Chose:** Remove `spec/ctas.json` and `spec/mailing.json`
- **Why:** Real files are in `new_validation/spec/`. Root `spec/` was legacy dual-write target.

## Key Files for Context
- `scripts/migrate_taxonomy_spec.py` — migration script (5 sources → 1 output)
- `new_validation/spec/taxonomy.json` — generated output (20 cats, 245 articles, 24 quizzes, 20 courses, 5 page types)
- `content-plan/article_taxonomy.json` — source: categories + articles
- `content-plan/quiz_taxonomy.json` — source: quizzes
- `content-plan/cta_catalog.json` — source: courses (extracted from course CTA entries)
- `content-plan/page_types.json` — source: article page type constraints
- `content-plan/quiz_page_types.json` — source: quiz page type constraints
- `.worklogs/2026-02-13-201714-validation-system-plan.md` — architecture plan

# Add intent quality, cross-category, and CTA consistency checks

**Date:** 2026-02-14 12:16
**Scope:** new_validation/validators/spec/linking.ts, scripts/migrate_linking_spec.py, new_validation/spec/linking.json

## Summary
Added 5 new structural checks to the linking validator based on data analysis. Removed 3 overfitted min-link-count checks. Fixed generated intents in migration script.

## Context & Problem
After building the linking validator, analyzed the actual data to find overfitted checks and missing useful ones. Three min-link-count checks were redundant (cross-ref already enforces completeness). Five new checks identified as valuable.

## Decisions Made

### Removed overfitted checks
- **Removed:** blog catalog min 2 links, pillar min 1 link, series min 2 links
- **Why:** Cross-ref validator already enforces catalog/pillar must link to ALL series articles + guide, and series must have pillar backlink + prev/next. The structural minimums added nothing.

### Kept course CTA URL regex
- **Why:** User explicitly said to keep it. Format validation `/course/{slug}/` catches malformed URLs before cross-ref runs.

### Added intent min word count (5 words)
- **Why:** Catches lazy placeholder intents. CTA/mailing validators already check word counts on their copy — same principle. Found 53 violations in generated quiz/course intents (e.g. "related guide: Discipline" = 3 words). Fixed in migration script.

### Added duplicate intent check
- **Why:** If two links on the same page have identical intent text, one is likely a copy-paste error.

### Added cross-category link requirement for blog articles
- **Why:** Prevents content silos. Every blog article (pillar + series) should link to at least one page outside its own category. Currently 662/1614 series links are cross-category, so all pass. But this guards against future articles that only link within their category.

### Added quiz page min 1 link
- **Why:** Quiz pages should link to related guides. Currently all 24 have 1-3 links.

### Added course CTA consistency within category
- **Why:** All articles in the same category should promote the same course. Checks structurally without needing taxonomy.

## Key Files for Context
- `new_validation/validators/spec/linking.ts` — structural validator with new checks
- `.worklogs/2026-02-14-120951-linking-validator-rewrite.md` — prior worklog

## Next Steps / Continuation Plan
1. The 15 remaining structural issues are duplicate link URLs in source article_link_plan.json — need investigation

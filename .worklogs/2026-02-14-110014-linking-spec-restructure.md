# Restructure linking.json and add quiz/course catalog pages to taxonomy

**Date:** 2026-02-14 11:00
**Scope:** scripts/migrate_linking_spec.py, scripts/migrate_taxonomy_spec.py, new_validation/validators/spec/taxonomy.ts, new_validation/validators/spec/linking.ts, new_validation/validators/spec/ctas.ts, new_validation/validators/spec/mailing.ts, new_validation/validators/spec/shared.ts, new_validation/validators/spec/index.ts, new_validation/spec/taxonomy.json, new_validation/spec/linking.json

## Summary
Rewrote linking.json from flat blog-only structure to 3-section structure (blog/quiz/course) with 311 entries. Moved freebie from CTAs to mailing field. Added quiz/course root catalog pages to taxonomy. Updated all validators for union types.

## Context & Problem
The old linking.json only covered 245 blog articles in a flat structure with freebie incorrectly placed in `ctas[]`. The new spec must cover ALL page types: blog catalogs, quiz pages (with root catalog), course pages (with root catalog). Each page type has different CTA and mailing requirements:
- Blog articles: 2 CTAs (course + community) + freebie mailing
- Blog catalogs: 1 CTA (community) + no mailing
- Quiz pages: 1 CTA (community) + quiz-gate mailing
- Quiz root: links only
- Course pages: 0 CTAs + waitlist mailing
- Course root: links only

## Decisions Made

### Freebie is mailing, not CTA
- **Chose:** Extract freebie from ctas[] into a separate `mailing` field with `{type, intent}`
- **Why:** User correction — freebie is a mailing form (email capture), not a CTA block. CTAs have URLs, mailing forms have endpoints. Can't have both.

### Three-section top-level keys
- **Chose:** `blog`, `quiz`, `course` matching URL path prefixes
- **Why:** Natural mapping from URL structure. Quiz/course pages have different link/CTA/mailing patterns than blog.

### Empty string key for catalog pages
- **Chose:** `""` key represents root/catalog at `/blog/{cat}/`, `/quiz/`, `/course/`
- **Why:** Consistent with blog catalog convention. Key path constructs into URL: blog/tantrums/"" → /blog/tantrums/

### Union schemas for quiz/course records
- **Chose:** `z.union([CatalogSchema, EntrySchema])` for quiz and course records
- **Why:** Catalog entries have different shape (title/url/pageType) vs regular entries (quiz has connectsTo/quizType, course has name/categorySlug). TypeScript needs union type to handle both.
- **Structural validator uses `"pageType" in entry` to narrow** — catalog entries have pageType, regular entries don't.

## Architectural Notes
- Migration scripts now read taxonomy.json (which has catalog entries) — must skip `""` keys when iterating quiz/course entries
- Cross-ref validators in ctas.ts, mailing.ts, linking.ts must also skip catalog entries to avoid accessing properties that don't exist on the catalog shape
- The linking.ts validator itself is still the OLD structure (flat, expects freebie CTA). This is intentional — validator rewrite is deferred for separate discussion.
- 8 self-verification checks in migrate_linking_spec.py catch structural problems at generation time

## Information Sources
- User design discussion about freebie being mailing form, page type coverage, catalog/root pages
- Existing content-plan/article_link_plan.json (245 blog entries)
- new_validation/spec/taxonomy.json (quiz connectsTo, course categorySlug for deriving cross-links)
- Plan file: `.claude/plans/shimmering-brewing-turtle.md`

## Open Questions / Future Considerations
- linking.ts validator needs full rewrite for 3-section structure (deferred, separate discussion)
- Blog catalog mailing is null "for now" per user — may change later
- Quiz/course catalog CTA coverage is minimal (empty for roots) — may evolve

## Key Files for Context
- `scripts/migrate_linking_spec.py` — generates linking.json from article_link_plan.json + taxonomy.json
- `scripts/migrate_taxonomy_spec.py` — generates taxonomy.json from 6 source files
- `new_validation/validators/spec/taxonomy.ts` — Zod schemas + 16 structural checks
- `new_validation/validators/spec/linking.ts` — OLD validator, needs rewrite
- `new_validation/spec/linking.json` — 311 entries (265 blog + 25 quiz + 21 course)
- `new_validation/spec/taxonomy.json` — 20 categories, 265 blog, 25 quiz, 21 course entries
- `.claude/plans/shimmering-brewing-turtle.md` — approved plan for this work

## Next Steps / Continuation Plan
1. Discuss and implement linking.ts validator rewrite for new 3-section structure
2. Per-section CTA/mailing rules: blog articles expect 2 CTAs, quiz pages expect 1, course pages expect 0
3. Cross-ref validation: all link URLs resolve to taxonomy entries, course CTA matches category's course
4. Completeness: every taxonomy entry has a linking entry

# Validation system rebuild plan — taxonomy, linking, validators, admin pages

**Date:** 2026-02-13 20:11
**Scope:** new_validation/ (spec JSONs + validators), admin pages

## Summary
Architecture plan for rebuilding the validation system with 4 spec files, 4 spec validators, 4 prod validators, and corresponding admin pages.

## Context & Problem
The current validation system mixes spec-level checks with production-level checks in the same admin page. Spec files are scattered across content-plan/ with inconsistent structures. No unified registry exists. The admin mailing page has both "does the plan file say X" and "does Kit actually have tag X" in the same table.

## Architecture

### Spec files (new_validation/spec/)
| File | Content | Status |
|------|---------|--------|
| ctas.json | Per-article community+course CTAs, per-quiz community CTAs | DONE |
| mailing.json | Per-article freebie forms, waitlist forms, quiz gate forms | DONE |
| taxonomy.json | Master registry: categories, articles, quizzes, courses, page types | TODO |
| linking.json | Per-article link plans (internal links + CTA placement intents) | TODO |

### Validators (new_validation/validators/)
| File | Layer | Status |
|------|-------|--------|
| spec/ctas.ts | Zod schemas + cross-ref against taxonomy | DONE |
| spec/mailing.ts | Zod schemas + cross-ref against taxonomy | DONE |
| spec/taxonomy.ts | Zod schemas + internal cross-ref | TODO |
| spec/linking.ts | Zod schemas + cross-ref against taxonomy | TODO |
| prod/ctas.ts | Deployed MDX CTA components vs spec | TODO |
| prod/mailing.ts | Kit tags, API routes, frontend wiring vs spec | TODO |
| prod/taxonomy.ts | Deployed articles, quizzes vs spec | TODO |
| prod/linking.ts | Actual links in MDX vs spec link plan | TODO |

### Admin pages
| URL | Shows | Status |
|-----|-------|--------|
| /admin/spec/taxonomy | Categories, articles, quizzes, courses, page types from spec | TODO |
| /admin/spec/linking | Per-article link plans with cross-ref validation | TODO |
| /admin/spec/ctas | Per-article CTAs with field validation | Partially exists |
| /admin/spec/mailing | Per-article mailing forms with field validation | EXISTS |
| /admin/prod/articles | Deployed articles vs spec requirements | TODO |
| /admin/prod/linking | Actual MDX links vs spec link plan | TODO |
| /admin/prod/ctas | Actual CTA components vs spec | TODO |
| /admin/prod/mailing | Kit tags, API routes, frontend vs spec | TODO |

## Design Decisions

### taxonomy.json key structure
- **Chose:** URL-path-segment keys: `blog/{cat}/{article}`, `quiz/{slug}`, `course/{slug}`
- **Why:** Matches how URLs work on the site, consistent with ctas.json and mailing.json keying
- **No seriesOrder** — prev/next chain in linking.json IS the canonical order
- **No trailing slashes on quiz URLs** — keep as-is from source
- **Courses keyed by course slug** not category slug — 12 of 20 differ (e.g. aggression → beyond-hitting)
- **Page types embedded in taxonomy** — master registry of everything

### linking.json structure
- Drops redundant `article` (title) and `url` — derivable from key + taxonomy
- Keeps both links[] and ctas[] — CTA entries here are PLACEMENT INSTRUCTIONS (where to put them), CTA content is in ctas.json

### Root spec/ is legacy
- Only write to `new_validation/spec/`
- Update migration scripts to stop dual-writing

## taxonomy.json detailed structure
```json
{
  "categories": { "{slug}": { "name": "..." } },
  "blog": { "{cat}": { "{article}": { "title", "url", "pageType" } } },
  "quiz": { "{slug}": { "title", "url", "connectsTo": [...] } },
  "course": { "{slug}": { "name", "url", "categorySlug" } },
  "pageTypes": {
    "article": { "pillar": {...constraints}, "series": {...} },
    "quiz": { "likert": {...}, "identity": {...}, "assessment": {...} }
  }
}
```

## Taxonomy internal validation checks
1. Article category keys exist in categories
2. Every category has ≥1 article
3. Exactly 1 pillar per category, pillar slug == category slug
4. URL format: pillar `/blog/{cat}/`, series `/blog/{cat}/{slug}/`
5. Quiz URL: `/quiz/{slug}`
6. Quiz connectsTo → valid categories
7. Course categorySlug → valid category
8. Every category has exactly 1 course
9. Course URL: `/course/{slug}/`
10. Article slugs globally unique (warning)

## linking.json structure
```json
{
  "{cat}": {
    "{article}": {
      "links": [{ "url", "type", "intent" }],
      "ctas": [{ "url"|null, "type", "intent" }]
    }
  }
}
```

## Linking cross-ref checks
- Every key exists in taxonomy, every link URL resolves
- Every article has exactly 3 CTAs (course + community + freebie)
- Pillar has series_preview to ALL series in category
- Series has pillar link to category pillar
- Prev/next → valid articles in same category
- No duplicate link URLs per article

## Key Files for Context
- `new_validation/validators/spec/shared.ts` — shared types, helpers (TaxonomyForCrossRef placeholder to replace)
- `new_validation/validators/spec/ctas.ts` — CTA validator pattern to follow
- `new_validation/validators/spec/mailing.ts` — mailing validator pattern to follow
- `scripts/migrate_mailing_spec.py` — migration script pattern to follow
- `content-plan/article_taxonomy.json` — source: 20 categories, 245 articles
- `content-plan/quiz_taxonomy.json` — source: 24 quizzes
- `content-plan/cta_catalog.json` — source: courses derived from course CTA entries
- `content-plan/page_types.json` — source: article constraints
- `content-plan/quiz_page_types.json` — source: quiz constraints
- `content-plan/article_link_plan.json` — source: 245 link plans
- `research/refactoring-validation.md` — full analysis of current vs desired architecture
- `.worklogs/2026-02-13-193346-mailing-validator-hardening.md` — prior session context

## Next Steps
1. Build taxonomy.json migration script + verify against admin/spec
2. Build linking.json migration script
3. Build taxonomy.ts and linking.ts validators
4. Update ctas.ts and mailing.ts to use real TaxonomySpec
5. Build admin spec pages (taxonomy, linking, ctas)
6. Build admin prod pages

# Schema-validated data files + validation script

**Date:** 2026-02-08 21:48
**Scope:** research/*.json (6 new data files), content-spec/src/validate-plans.ts, landing/src/lib/admin/sync-orchestrator.ts, landing/package.json

## Summary
Created all Phase 6 data files (article taxonomy, quiz taxonomy, CTA catalog, page types, mailing tags, form-tag mappings), wrote validation script that runs all schemas against real data (all pass), and updated sync-orchestrator to load page types + CTA catalog from schema-validated data files instead of hardcoded constants.

## Context & Problem
Phase 6-7 of the content-spec plan: create the data files that the schemas validate, and prove the schemas work against real data.

## Decisions Made

### Data file generation from existing sources
- **Chose:** Python scripts to convert existing data (category_ctas.json, article_link_plan.json, kit-config.ts, quiz-definitions.json) into the new schema-validated formats
- **Why:** Existing data is the source of truth. Conversion ensures no information loss and validates the schema design against real data.

### Sync-orchestrator reads data files with schema validation
- **Chose:** Load page_types.json and cta_catalog.json at sync time, parse through Zod schemas, fallback to hardcoded constants if files missing
- **Why:** Data-driven is the goal. Fallbacks ensure the system doesn't break if data files are absent (e.g., fresh deployment).

### Build script copies new data files
- **Chose:** Updated build command to copy cta_catalog.json and page_types.json to mdx-sources/ (replaced category_ctas.json)
- **Why:** Production standalone build needs these files at runtime.

## Data Files Created

| File | Schema | Entries | Source |
|------|--------|---------|--------|
| article_taxonomy.json | ArticleTaxonomySchema | 20 categories, 245 articles | article_link_plan.json |
| quiz_taxonomy.json | QuizTaxonomySchema | 24 quizzes | quiz-definitions.json |
| cta_catalog.json | CtaCatalogSchema | 41 CTAs (1 community, 20 course, 20 freebie) | category_ctas.json |
| page_types.json | PageTypesSchema | 2 types (pillar, series) | hardcoded constants |
| mailing_tags.json | MailingTagTaxonomySchema | 46 tags | kit-config.ts |
| form_tag_mappings.json | FormTagMappingsSchema | 44 mappings | kit-config.ts |

## Key Files for Context
- `content-spec/src/validate-plans.ts` — validation script, runs all schemas
- `research/*.json` — the data files
- `landing/src/lib/admin/sync-orchestrator.ts` — now data-driven
- `.worklogs/2026-02-08-214037-wire-content-spec-to-landing.md` — prior wiring worklog

## Next Steps / Continuation Plan
1. Old category_ctas.json can be kept for backward compatibility (generate_article.py still uses it) or migrated
2. Admin CTA duplicate fix (Phase 5 item 22-23 from original plan)
3. Eventually add json_ld_requirements.json when JSON-LD generation is implemented

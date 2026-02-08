# content-spec workspace: schemas, parser, validator

**Date:** 2026-02-08 21:28
**Scope:** content-spec/ (new workspace), package.json (root)

## Summary
Created the content-spec workspace with all Zod schemas (9 schema files), moved MDX parser + article validator from landing, added coverage analysis module.

## Context & Problem
Building the typed pipeline framework described in research/decoupling-planning.md. This is the first implementation commit — scaffolding the workspace, writing all schemas, and moving parser/validator code.

## Decisions Made

### Zod v4 import path
- **Chose:** `import { z } from "zod/v4"` (Zod 4 subpath import)
- **Why:** Landing already uses zod ^4.3.6. Zod 4 has subpath exports.

### Validator refactored for PageType config
- **Chose:** `checkRange()` helper that takes `{ min, max }` from PageType instead of hardcoded constants
- **Why:** Different page types (pillar, series, standalone) have different constraints. Config-driven.

### CTA validation against catalog instead of old categoryCtas record
- **Chose:** `ctaCatalog: CtaDefinition[]` parameter, matches by type + name substring
- **Why:** The old `Record<string, { course_name, freebie_name }>` was category-coupled. New catalog is flat.

### Cross-file reference validation as functions, not Zod refinements
- **Chose:** `validateFormTagRefs()` as a standalone function, not a `.refine()` on the schema
- **Why:** Cross-file validation needs data from two different files parsed separately. Can't do that in a single schema refinement.

## Key Files for Context
- `content-spec/src/schemas/` — all 9 schema files
- `content-spec/src/parser/mdx-parser.ts` — moved from landing, unchanged logic
- `content-spec/src/validator/article.ts` — moved from landing, refactored for PageType
- `content-spec/src/validator/coverage.ts` — new, plan vs reality analysis
- `content-spec/src/types.ts` — z.infer<> re-exports for all schemas
- `research/decoupling-planning.md` — the plan this implements

## Next Steps / Continuation Plan
1. Landing doesn't depend on content-spec yet (admin decoupling is separate)
2. Create data files (cta_catalog.json, article_taxonomy.json, etc.)
3. Write validation script that runs schemas against real data files
4. Eventually wire admin to import from content-spec instead of local copies

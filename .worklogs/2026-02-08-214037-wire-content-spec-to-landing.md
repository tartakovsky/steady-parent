# Wire content-spec workspace into landing

**Date:** 2026-02-08 21:40
**Scope:** content-spec/package.json, content-spec/src/**/*.ts, landing/package.json, landing/next.config.ts, landing/src/lib/admin/sync-orchestrator.ts, landing/src/lib/db/schema.ts, landing/src/lib/admin/{types,mdx-parser,article-validator}.ts (deleted)

## Summary
Wired the content-spec workspace as a dependency of landing. Updated sync-orchestrator to import parser/validator/types from content-spec, updated DB schema to use CtaComponent type from content-spec, deleted old admin lib files. All routes (/, /blog/*, /quiz/*, /admin) return 200, sync endpoint works.

## Context & Problem
Phase 4 of the content-spec plan: landing needs to consume the parser, validator, and types from the new content-spec workspace instead of its local copies in `src/lib/admin/`.

## Decisions Made

### Package exports point to source, not dist
- **Chose:** `"main": "./src/index.ts"` and `"exports": { ".": "./src/index.ts" }` in content-spec/package.json
- **Why:** content-spec is a private workspace-only package. Since landing uses `transpilePackages` to compile it, and both use `moduleResolution: "bundler"`, pointing to .ts source avoids needing a build step. The original `./dist/` paths caused `TS2307: Cannot find module` errors because dist/ was never built.
- **Alternatives considered:**
  - Build content-spec to dist/ first — rejected because it adds an unnecessary build step for an internal-only package
  - TypeScript project references — overkill for this setup

### Remove .js extensions from all content-spec imports
- **Chose:** Extensionless imports (`from "./types"` not `from "./types.js"`)
- **Why:** Webpack (used by Next.js) can't resolve `.js` → `.ts` for source files. With `moduleResolution: "bundler"`, extensionless imports work for both tsc and webpack.
- **Alternatives considered:**
  - Configure webpack to resolve `.js` → `.ts` — adds config complexity
  - Keep `.js` and pre-build — same issue as dist/ approach above

### adaptCategoryCtas() bridge function in sync-orchestrator
- **Chose:** Keep the old category_ctas.json format, adapt at runtime in sync-orchestrator
- **Why:** The plan data files haven't been migrated yet. The adapter converts the old `Record<category, {course_name, freebie_name}>` format to `CtaDefinition[]` that content-spec expects. This will be removed when data files are migrated.

### PageType configs defined in sync-orchestrator
- **Chose:** PILLAR_PAGE_TYPE and SERIES_PAGE_TYPE constants in sync-orchestrator with constraint ranges
- **Why:** These replace the hardcoded ranges in the old article-validator.ts. Eventually they'll come from a page-types config file validated by content-spec schemas.

## Key Files for Context
- `content-spec/src/index.ts` — main barrel, exports schemas + types + parser + validator
- `content-spec/package.json` — source-pointing exports for workspace consumption
- `landing/src/lib/admin/sync-orchestrator.ts` — rewired to use content-spec, has adapter functions
- `landing/src/lib/db/schema.ts` — imports CtaComponent from content-spec for JSONB typing
- `.worklogs/2026-02-08-212843-content-spec-scaffold.md` — prior worklog for workspace creation

## Next Steps / Continuation Plan
1. Test admin dashboard pages in browser (articles table, article detail, plan view, links graph)
2. Commit and continue with remaining plan phases (data file validation, admin CTA duplicate fix)
3. Eventually migrate plan data files to schema-validated format

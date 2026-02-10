# Move active data files from research/ to data/

**Date:** 2026-02-10 18:06
**Scope:** `data/`, `content-spec/src/validate-plans.ts`, `landing/src/app/api/admin/{spec,plan,quizzes}/route.ts`, `landing/package.json`, `research/{generate_article,validate_article,assemble_one_article_bundle}.py`, `CLAUDE.md`

## Summary
Moved 11 actively consumed data files (10 JSON + 1 MD prompt template) from `research/` to a new top-level `data/` directory. Updated all 8 source files that referenced `research/` paths. Added `data/README.md` documenting each file's purpose and consumers.

## Context & Problem
The `research/` folder had ~767 files — mostly historical crawl data, competitor analyses, and superseded drafts. But 11 files were actively consumed by the build system, admin API routes, Python scripts, and the validation CLI. It was impossible to tell which files were live vs dead without tracing code.

## Decisions Made

### Move to `data/` at monorepo root
- **Chose:** Top-level `data/` directory alongside `landing/`, `content-spec/`, `research/`
- **Why:** Clear separation of live data (consumed by code) from historical research. Short path, discoverable, matches the monorepo convention.
- **Alternatives considered:**
  - `research/data/` subfolder — rejected because it doesn't solve discoverability; you'd still need to know to look inside research/
  - `content-spec/data/` — rejected because Python scripts and build scripts also consume these, not just content-spec

### Keep research/ as archive
- **Chose:** Leave everything else in research/ untouched
- **Why:** Those files are historical reference, one-time generation prompts, how-to docs. They're not consumed by code and moving them would be churn with no benefit.

### Rename getResearchPath → getDataPath
- **Chose:** Rename the helper function in all 3 admin API routes
- **Why:** Code clarity — the function now points to `data/`, naming should match

## Architectural Notes
- Dev mode: TypeScript reads from `../data/{filename}` relative to `landing/` cwd
- Production: build script copies JSON files to `.next/standalone/mdx-sources/` (unchanged)
- Python scripts: resolve via `REPO_ROOT / "data" / filename`
- validate-plans.ts: resolves via `path.join(__dirname, "..", "..", "data")`

## Information Sources
- Traced all references to `research/` across the codebase using Grep
- Found 8 source files with hardcoded paths
- Verified all 11 data files are the only ones consumed by code (others like `category_ctas.json` and `title_classification.json` are historical)

## Open Questions / Future Considerations
- The 3 Python scripts (`generate_article.py`, `validate_article.py`, `assemble_one_article_bundle.py`) still live in `research/`. They could move to a `scripts/` directory, but that's separate scope.
- Documentation files in `research/` (production_process.md, how-to-generate-*.md, image_pipeline_plan.md) reference `research/` paths in their text. These are human-facing docs and were not updated — they'll naturally be updated when next edited.

## Key Files for Context
- `data/README.md` — documents every data file's purpose, consumers, and editing rules
- `content-spec/src/validate-plans.ts` — validation CLI that reads all data files
- `landing/package.json` — build script that copies data files to mdx-sources
- `landing/src/app/api/admin/spec/route.ts` — primary admin API that loads most data files
- `.worklogs/2026-02-08-171844-full-session-canonical-ctas-pipeline.md` — prior session context

## Next Steps / Continuation Plan
1. The data file move is complete and verified (typecheck, validation, build all pass)
2. Waitlist CTAs still need generation (20 warnings expected in validation)
3. Image pipeline scripts (`research/image_pipeline_plan.md`) not yet built
4. Batch article generation (241/245 remaining) is the next major production task

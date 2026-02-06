# Article input assembly map for one article

**Date:** 2026-02-06 18:27
**Scope:** `research/assemble_one_article_bundle.py`, `research/bundles/tantrums-handle-tantrum-scripts.md`

## Summary
Implemented a lightweight “article input assembly map” generator and produced a first map for one target article. The map embeds the per-article link plan and lists which source extracts to open (by exact file path), without copying any extract contents into the bundle.

## Context & Problem
The production pipeline is defined through Phase 5.3: every target article has (a) an assigned set of source titles (`research/source_to_article_assignment.json`), (b) extract metadata + file paths (`content/blog/extracts/index.json`), and (c) a per-article internal link + CTA plan (`research/article_link_plan.json`).

The initial “bundle” approach copied full extract contents into a single markdown file. That was rejected because it creates an unmanageably large artifact and duplicates source content. The requirement for Phase 6 is a compact file that explains how everything is linked together: what to pull from where, and what link/CTA structure to apply.

## Decisions Made

### Output is a map, not a mega-bundle
- **Chose:** Generate a compact markdown “assembly map” that embeds the link plan JSON and enumerates sources as pointers (extract key, URL, extract file path, recap).
- **Why:** The writer needs linkage structure and a deterministic “where to take what from” index, not duplicated raw text. Keeping maps small also makes them reviewable and minimizes accidental drift between the bundle and the canonical sources.
- **Alternatives considered:**
  - Copy/paste all extract contents into the bundle — rejected because it creates giant files and duplicates the knowledge corpus.
  - Only output source titles with no paths — rejected because it doesn’t tell the assembler/writer exactly where to open the source material.

### Resolve sources via `content/blog/extracts/index.json` title matching
- **Chose:** Use the extracts index as the resolver from assigned source *titles* to extract file paths.
- **Why:** `research/source_to_article_assignment.json` stores titles (not keys/paths). The extracts index already contains the authoritative mapping: key → {title, source_url, file, recap}.
- **Alternatives considered:**
  - Parse filenames / heuristic slug guessing — rejected as brittle and unnecessary given the index.

### Rules are referenced, not inlined
- **Chose:** Include file references to `research/seo/article-structure.md` and `research/seo/writing-style.md` instead of inlining their full text.
- **Why:** Inlining reintroduces “giant file” problems and makes maps harder to diff/review. The rule docs are stable canonical inputs and should stay single-source-of-truth.
- **Alternatives considered:**
  - Inline both rule documents — rejected due to file size and duplication.

## Architectural Notes
The generator (`research/assemble_one_article_bundle.py`) performs a deterministic join across three registries:
- Assignments: target article title → list of source titles (`research/source_to_article_assignment.json`)
- Extracts index: source title → extract key + file path + recap (`content/blog/extracts/index.json`)
- Link plan: target article title → link/CTA plan (`research/article_link_plan.json`)

The output is written to `research/bundles/` and is meant to be consumed by a “writer run” step (Phase 7) that opens the referenced extract files and uses the embedded link plan.

Known limitation surfaced immediately: extraction coverage is incomplete (see `EXTRACTION_TASK.md`), so some assigned source titles will not resolve to an extract file yet. The map explicitly lists missing extracts so the pipeline can either (a) extract them, (b) swap sources, or (c) proceed without them.

## Information Sources
- `research/production_process.md` — pipeline definition and Phase 6/7 expectations
- `.worklogs/2026-02-06-163605-phase5-link-plan.md` — Phase 5.3 output schema decisions
- `.worklogs/2026-02-06-120000-article-generation-pipeline-experiments.md` — validated “feed raw sources to writer” approach (no Haiku pre-filter)
- `EXTRACTION_TASK.md` — extraction progress and extract/index conventions
- `content/blog/extracts/index.json` — authoritative mapping from source keys/titles to extract file paths + recaps
- `research/source_to_article_assignment.json` — source title → target article assignment list
- `research/article_link_plan.json` — per-article links + CTAs (embedded in maps)

## Open Questions / Future Considerations
- Freebie CTA URLs are `null` in link plans; decide whether the writer should omit freebie CTAs until URLs exist or insert a generic placeholder.
- Some assigned sources may not exist in the extracts index until the extraction backlog is completed (especially `peacefulparenthappykids`). Decide whether to:
  - prioritize extraction for a chosen pilot category, or
  - temporarily reassign sources to extracted material only.
- The current resolver matches on exact title. If title drift ever happens between assignment and extracts index, add a fallback (e.g., key-based mapping or normalized match).

## Key Files for Context
- `research/assemble_one_article_bundle.py` — generates per-article assembly maps (link plan + source pointers)
- `research/bundles/tantrums-handle-tantrum-scripts.md` — example output for one article
- `research/source_to_article_assignment.json` — which source titles feed which target articles
- `content/blog/extracts/index.json` — extract metadata and file paths used to resolve titles
- `research/article_link_plan.json` — link/CTA plan per article (embedded verbatim in maps)
- `research/seo/article-structure.md` — structural requirements the writer must follow
- `research/seo/writing-style.md` — voice/style constraints for the writer
- `EXTRACTION_TASK.md` — extraction completeness status and directory conventions
- `.worklogs/2026-02-06-163605-phase5-link-plan.md` — background on link plan schema and intent semantics

## Next Steps / Continuation Plan
1. Pick a pilot article (or one full category) with high extract coverage and run `python3 research/assemble_one_article_bundle.py --article "..."` to generate maps for that set.
2. For any map with missing extracts, either:
   - extract the missing sources into `content/blog/extracts/**` and re-run the map, or
   - adjust the source assignment for the pilot batch.
3. Add a Phase 7 “writer runner” (separate script) that takes a map file, opens the referenced extract files at runtime, and sends the writer prompt + link plan to the model (without ever concatenating sources into the map).

# Canonical CTA System, Validator Fixes, and Pipeline Hardening

**Date:** 2026-02-07 20:21
**Scope:** research/category_ctas.json, research/generate_article.py, research/writer_prompt.md, research/validate_article.py, research/production_process.md, landing/src/content/blog/posts.ts, landing/mdx-components.tsx

## Summary
Built a canonical CTA consistency system to ensure all articles in the same category promise the same course and freebie products. Fixed validator bugs (escaped quotes, nav link false warnings). Tightened prompt constraints (word count hard limit, FAQ answer hard limit). Updated BlogCategory type for all 20 categories. Added visible link styling to blog articles.

## Context & Problem
The article generation pipeline was tested on 2 articles (tantrums + sleep) and produced good results. But scaling to 245 articles revealed a consistency problem: each article's CTAs are written independently by Opus, so articles in the same category would promise different course names and freebie products. Also found validator bugs that produced false warnings, and the prompt needed tighter constraints to prevent word count and FAQ answer length overshoot.

## Decisions Made

### Canonical CTA definitions per category
- **Chose:** Create `category_ctas.json` with canonical course_name, course_promise, freebie_name, freebie_promise for all 20 categories. Inject into prompt, validate after.
- **Why:** Prevents inconsistency at generation time. Post-hoc deduplication would be too late (articles already promise different things).
- **Alternatives considered:**
  - Post-hoc deduplication across generated articles — rejected because fixing 245 articles after the fact violates "never manually fix generated articles"
  - Hardcoding CTA text in the prompt — rejected because body text should vary per article context

### Freebie definitions
- **Chose:** Defined one canonical freebie per category (20 total), all printable/downloadable assets
- **Why:** Printables are the simplest lead magnets to produce and deliver. Each is category-specific and directly useful.
- **Pattern:** All freebies are "A printable [thing] for [specific use case]" — cheat sheets, flowcharts, cards, checklists, worksheets, posters, planners, agreements

### Validator fixes
- **Chose:** Fix escaped quotes regex, fix nav link double-duty check, add CTA title consistency check
- **Why:** False positives waste time and erode trust in the validator
- **Technical:** Metadata regex changed from `[^"]+` to `(?:[^"\\]|\\.)*` to handle `\"` in description fields

### Prompt tightening
- **Chose:** Add "(HARD LIMIT — do not exceed the upper bound)" to word count, "35-55 words (HARD LIMIT — no answer over 55 words)" to FAQ answers
- **Why:** Without explicit hard limits, Opus overshoots by 300+ words on word count and FAQ answers balloon to 80+ words

### Blog link styling
- **Chose:** Faint blue (`text-blue-700/70`) for unvisited, faint purple (`visited:text-purple-700/60`) for visited
- **Why:** Links were invisible (same color as body text in MDX components)

## Architectural Notes
The canonical CTA system adds a new data dependency to the pipeline:
- `category_ctas.json` → `generate_article.py` (reads at assembly time) → prompt includes `{{CTA_CANONICAL}}`
- `category_ctas.json` → `validate_article.py` (reads at validation time) → checks CTA titles match

CTA title matching is case-insensitive substring (not exact match) to allow minor variations like "The Tantrum Toolkit" vs "The Tantrum Toolkit Course".

## Information Sources
- Course names/URLs from `research/taxonomy_v3.md` lines 578-603
- Existing generated articles (tantrums, sleep) for testing validator fixes
- Previous worklog `.worklogs/2026-02-07-153431-article-generation-system.md` for pipeline context

## Open Questions / Future Considerations
- Pillar articles not yet tested (different word count, series_preview links, hub page structure)
- Batch generation infrastructure not built (currently manual one-at-a-time)
- posts.ts auto-registration not built (currently manual entry per article)
- Freebie definitions are proposals — may need adjustment based on what's actually producible

## Key Files for Context
- `research/category_ctas.json` — canonical CTA definitions for all 20 categories
- `research/generate_article.py` — prompt assembler (now loads canonical CTAs)
- `research/writer_prompt.md` — writer prompt template (now includes CTA canonical section + hard limits)
- `research/validate_article.py` — validator (fixed bugs + CTA title consistency check)
- `research/production_process.md` — updated with canonical CTA system docs, validator fixes, URL prefix notes
- `landing/src/content/blog/posts.ts` — BlogCategory type with all 20 categories
- `landing/mdx-components.tsx` — link styling (blue/purple)
- `.worklogs/2026-02-07-153431-article-generation-system.md` — previous session context

## Next Steps / Continuation Plan
1. Test a pillar article (e.g., tantrums pillar) — different structure, series_preview links, higher word count
2. Build batch generation script or parallelized approach for 245 articles
3. Build posts.ts auto-registration from generated MDX files
4. Generate all 245 articles and validate
5. Run Phase 8 cross-article link graph validation

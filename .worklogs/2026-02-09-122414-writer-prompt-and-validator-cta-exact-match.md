# Writer prompt + validator: exact CTA prop matching from catalog

**Date:** 2026-02-09 12:24
**Scope:** research/writer_prompt.md, research/generate_article.py, research/validate_article.py

## Summary
Updated the article writer prompt to inject exact pre-written CTA components from `cta_catalog.json` (no more "write custom eyebrow/buttonText"). Updated the article validator to extract all four CTA props (eyebrow, title, body, buttonText) and compare them exactly against the catalog. Switched both scripts from the old `category_ctas.json` to the unified `cta_catalog.json`.

## Context & Problem
Previously the writer prompt told the LLM to use canonical course/freebie names but "write custom eyebrow and buttonText that flow from the surrounding article content." This meant every generated article had unique CTA copy, making it impossible to validate deterministically. With `cta_catalog.json` now containing full `cta_copy` for all 61 entries, the system can inject exact JSX and verify it.

## Decisions Made

### Writer prompt: verbatim CTA injection
- **Chose:** Complete JSX components with all props pre-filled, writer just copy-pastes
- **Why:** Eliminates writer creativity in CTA copy (which caused inconsistency), makes validation trivial
- **Before:** `<CourseCTA href="..." eyebrow="YOUR EYEBROW" title="YOUR TITLE" body="YOUR BODY" buttonText="YOUR BUTTON TEXT" />`
- **After:** `<CourseCTA href="/course/tantrum-toolkit/" eyebrow="Meltdowns are exhausting" title="Start The Tantrum Toolkit course" body="Audio lessons and..." buttonText="Start the course" />`

### Removed `{{CTA_CANONICAL}}` template variable
- **Why:** No longer needed — all CTA info is now embedded in `{{CTA_COMPONENTS}}`
- Community context for article body text kept as a short note in the prompt

### Validator: exact 4-prop comparison
- **Chose:** Extract all props via regex, compare each against catalog's cta_copy exactly
- **Why:** Deterministic, no AI needed, catches any deviation
- **Regex approach:** `_CTA_FULL_RE` matches full self-closing JSX component, `_CTA_PROP_RE` extracts key="value" pairs
- **Bug fixed:** Original `[^/]*?` regex failed on hrefs containing `/` — changed to `.*?` with DOTALL

### Switched from category_ctas.json to cta_catalog.json
- Both `generate_article.py` and `validate_article.py` now use `cta_catalog.json`
- `category_ctas.json` is now obsolete (can be deleted in future cleanup)
- New `_build_cta_lookup()` function builds category_slug -> {course, freebie, community} -> cta_copy lookup

## Key Files
- `research/writer_prompt.md` — updated CTA section with verbatim injection instructions
- `research/generate_article.py` — `_format_ctas()` rewritten, `_format_canonical_ctas()` removed, uses `cta_catalog.json`
- `research/validate_article.py` — new `_extract_cta_components()` + `_build_cta_lookup()`, exact prop comparison
- `research/cta_catalog.json` — the canonical source of truth for all CTA copy
- `research/category_ctas.json` — OLD file, now superseded (still referenced nowhere after this change)

## Next Steps / Continuation Plan
1. Existing 4 articles will fail validation (expected — they predate the catalog). They need regeneration.
2. `research/category_ctas.json` can be deleted (superseded by `cta_catalog.json`)
3. Consider: should the article body text around CTAs reference the community in ways consistent with cta_copy? Currently community context is a brief note in the prompt.

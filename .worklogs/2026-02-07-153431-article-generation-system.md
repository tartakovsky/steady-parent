# Article Generation System: Prompt Template, Generator, and Validator

**Date:** 2026-02-07 15:34
**Scope:** `research/writer_prompt.md`, `research/generate_article.py`, `research/validate_article.py`, `landing/src/content/blog/posts/handle-tantrum-scripts.mdx`

## Summary

Built a three-part system for generating all 245 blog articles without manual review: (1) a writer prompt template with all constraints baked in, (2) a script that assembles the prompt from template + per-article data, (3) a validation script that catches anything the prompt missed. Iterated through one full generate-review-fix-regenerate cycle to surface and fix five prompt-level bugs before settling on the final system.

## Context & Problem

Phase 6 requires generating 245 articles (20 pillar + 225 series) with correct internal links, CTAs, and structure. Manual review of each article is not feasible. The system needs to produce correct output from the prompt alone, with deterministic validation as a safety net.

Starting state: Phase 5 complete (all 245 articles have URLs, link plans, and CTA assignments). Source extracts complete (967 files). Existing experiment writer prompt in `research/experiment/prompts.md` was a starting point but missing link plan integration, CTA handling, MDX format rules, and image instructions.

## What Was Done

### Iteration 1: First generation attempt (manual prompt, failed)

Assembled a one-off writer prompt by hand and sent it to an Opus agent. The article came out, passed basic checks, but user review found five systemic issues:

1. **Duplicate description**: The prompt told the writer to output an "AI answer block" paragraph after metadata. But the page component (`landing/src/app/blog/[slug]/page.tsx`) already renders `metadata.description` as a subtitle. Result: the same text appeared twice.

2. **External links**: The prompt said "1-3 external links to authoritative sources" (copied from `article-structure.md`). The writer linked to NCBI and AAP. User decision: no external links allowed. Only URLs from the link plan registry.

3. **Video promises in CTAs**: The writer wrote "Step-by-step video walkthroughs" in the course CTA body. Courses are text + audio + illustrations only. No constraint existed in the prompt.

4. **HTML comments**: Image placeholders used `<!-- IMAGE: ... -->` but MDX requires `{/* ... */}`. The MDX compiler threw a build error.

5. **No artifact report**: The writer invented a freebie ("Mid-Tantrum Script Card") but there was no way to know what freebies were promised across 245 articles without reading each one.

I manually fixed all five issues in the article. User correctly rejected this: "Never fix anything manually. We need to create a system that generates 250 articles without reviewing them."

### Iteration 2: Build the system, regenerate

Deleted the manually-fixed article. Created three files:

#### 1. `research/writer_prompt.md` — the prompt template

A markdown file with `{{VARIABLE}}` placeholders that the generator script populates. Key constraints that prevent the five bugs:

- **Duplicate description prevented**: "The `description` field IS the AI answer block... The page component renders this as the subtitle, so DO NOT repeat it as a paragraph in the body."
- **External links prevented**: "ONLY use URLs from this list. Do not link to any other URL. Do not invent URLs. Do not link to external websites (no https:// links in markdown). The ONLY https:// URLs allowed are inside CTA component `href` props."
- **Video promises prevented**: "Course format constraint: Courses contain text lessons, audio, and illustrations. NEVER promise video, video walkthroughs, or video demonstrations."
- **MDX comments specified**: Shows `{/* IMAGE: ... */}` syntax explicitly with a note "NOT HTML comments."
- **Links split into body vs. navigation**: Body links (cross, sibling, quiz) go in article text. Navigation links (pillar, prev, next) go at the END. Each link listed with its exact URL and "use when" intent.

#### 2. `research/generate_article.py` — prompt assembler

Takes `--article "title"` and outputs an assembled prompt file. Does a deterministic join across three registries:

- `research/article_link_plan.json` → links, CTAs, article URL
- `research/source_to_article_assignment.json` → which source titles feed this article
- `content/blog/extracts/index.json` → source title → extract file path

The script:
1. Finds the article's link plan entry
2. Determines article type (pillar vs. series) by checking for `series_preview` links
3. Finds all assigned sources and reads their extract files
4. Splits links into body links vs. navigation links
5. Formats CTA component instructions with the correct href props
6. Populates the template and writes the assembled prompt to `research/bundles/{slug}.mdx.prompt.md`

Supports `--dry-run` to print the prompt without calling any LLM.

#### 3. `research/validate_article.py` — post-generation validator

Deterministic script that checks a generated MDX file against its link plan. Catches:

- **Missing required links**: Every URL from the link plan must appear in the article (as markdown link or JSX href)
- **Unauthorized URLs**: Any URL not in the registry (internal or external) is an error. This catches both hallucinated internal links and unauthorized external links.
- **Missing CTAs**: Course and community CTA hrefs must be present
- **Word count**: 1,800-2,200 for series, 2,500-3,500 for pillar
- **Heading hierarchy**: No H1 in body (MDX metadata provides it), H2/H3 only, no skipped levels
- **FAQ section**: 3-5 questions in bold format
- **AI answer block**: Checks word count of first paragraph, flags if it duplicates the metadata description
- **Anchor text diversity**: Warns if same anchor text used for different URLs
- **Artifact report**: Extracts freebie and course CTA copy (title + body) so we know what assets to produce

The validator handles both plain markdown and MDX files (detects `export const metadata` to know H1 comes from the page component, detects JSX component hrefs alongside markdown links).

### Iteration 2 result

Regenerated the article from the template. Validation: PASS with zero errors. All five original bugs prevented at the prompt level. One warning (word count 2,529, slightly over 2,200 target — hard to enforce precisely via prompt).

## Decisions Made

### No external links in articles
- **Chose:** Forbid all external links. Only URLs from the link plan registry are allowed.
- **Why:** User decision. The `article-structure.md` spec says "1-3 external links to authoritative sources" but in practice the writer hallucinated plausible-looking academic URLs. At scale, we can't verify 245 * 2 = 490 external links. Internal links are verifiable because they're in the registry.
- **Alternatives considered:**
  - Allow external links and validate them with HTTP HEAD requests — rejected: slow, fragile, links rot
  - Provide a curated list of allowed external URLs per article — rejected: too much manual curation for 245 articles

### Prompt template as a file, not inline code
- **Chose:** Store the prompt as `research/writer_prompt.md` with `{{VARIABLE}}` placeholders, read by the generator script.
- **Why:** The prompt is the most important artifact in the system. It needs to be readable, editable, and diffable. Embedding it as a Python string would make it hard to review and iterate on.
- **Alternatives considered:**
  - Inline prompt in the Python script — rejected: unreadable, hard to iterate
  - Jinja2 templates — rejected: overkill, simple string replacement works

### CTA components with custom copy, not default props
- **Chose:** Writer fills in custom eyebrow, title, body, and buttonText for each CTA.
- **Why:** Default CTA copy is generic ("Join the Steady Parent Method"). Article-specific copy flows naturally from surrounding content and converts better.
- **Consequence:** The validator extracts and reports what the writer promised (artifact report). This creates a manifest of freebies and course copy across all 245 articles.

### Body links vs. navigation links — split in the prompt
- **Chose:** Present links in two separate lists. Body links (cross, sibling, quiz) with "use when" intents for natural placement. Navigation links (pillar, prev, next) with instruction to place at the END.
- **Why:** Previous iteration mixed all links together. The writer sometimes put prev/next links mid-article. Splitting makes placement unambiguous.

### Validator errors vs. warnings
- **Chose:** Missing links, unauthorized URLs, missing CTAs, structural violations = errors (FAIL). Word count slightly off, many FAQ questions = warnings (PASS).
- **Why:** At scale, we need a binary pass/fail. Articles that fail need regeneration. Warnings are noted but acceptable.

## Architectural Notes

### Data flow

```
research/writer_prompt.md          (template)
research/article_link_plan.json    (links + CTAs per article)
research/source_to_article_assignment.json  (which sources → which article)
content/blog/extracts/index.json   (source title → extract file path)
content/blog/extracts/**/*.md      (actual source content)
         │
         ▼
research/generate_article.py --article "title"
         │
         ▼
research/bundles/{slug}.mdx.prompt.md  (assembled prompt, ~11k words)
         │
         ▼
Opus agent reads prompt, writes output
         │
         ▼
landing/src/content/blog/posts/{slug}.mdx  (generated article)
         │
         ▼
research/validate_article.py {slug}.mdx
         │
         ▼
PASS / FAIL + artifact report
```

### URL registry

The validator builds the URL registry from `article_link_plan.json` by collecting every URL that appears anywhere (article URLs, link targets, CTA targets). Total: 289 URLs (245 articles + 20 courses + 23 quizzes + 1 Skool community URL). Any URL in a generated article that's not in this set is flagged as unauthorized.

### MDX integration

The blog system uses:
- `landing/src/content/blog/posts.ts` — registry of blog posts (slug, title, description, date, category, lazy import)
- `landing/src/app/blog/[slug]/page.tsx` — renders the post (H1 from metadata, description as subtitle)
- `landing/mdx-components.tsx` — maps MDX elements to styled React components, registers `CourseCTA`, `CommunityCTA`, `FreebieCTA`, `Callout`
- Internal links (`/path/`) stay in-page, external links open new tab

For production at scale, the posts.ts registry will need to be generated automatically from the article_link_plan.json rather than manually edited.

### What the prompt prevents vs. what the validator catches

| Issue | Prevented by prompt | Caught by validator |
|---|---|---|
| Duplicate description in body | Yes ("DO NOT repeat it") | Yes (checks body start vs. description) |
| External links | Yes ("Do not link to external websites") | Yes (flags any URL not in registry) |
| Video promises | Yes ("NEVER promise video") | No (would need NLP) |
| HTML comments in MDX | Yes (shows correct syntax) | No (MDX compiler catches this at build time) |
| Missing required links | Yes (lists every URL that MUST appear) | Yes (checks each required URL) |
| Hallucinated internal URLs | Yes ("Do not invent URLs") | Yes (checks against registry) |
| Wrong heading levels | Yes ("NO H1, NEVER H4+") | Yes (checks hierarchy) |
| Missing FAQ | Yes ("End with a FAQ section") | Yes (checks for ## FAQ heading) |
| Word count off | Yes (states target range) | Yes (warns if outside range) |

The prompt is the primary defense. The validator is the safety net.

## Information Sources

- `research/experiment/prompts.md` — original experiment writer prompt (starting point)
- `research/seo/article-structure.md` — structural requirements (word count, FAQ, links, headings)
- `research/seo/writing-style.md` — voice and tone guide
- `research/production_process.md` — Phase 7.3 validation spec
- `landing/mdx-components.tsx` — MDX component registry (what components are available)
- `landing/src/app/blog/[slug]/page.tsx` — how the page renders metadata (H1 + description)
- `landing/src/components/blog/course-cta.tsx` — CourseCTA component props
- `.worklogs/2026-02-06-163605-phase5-link-plan.md` — link plan schema and intent rules

## Open Questions / Future Considerations

1. **Word count enforcement**: The prompt says 1,800-2,200 but the writer produced 2,529. LLMs are notoriously bad at word counting. Options: (a) accept ~2,500 as close enough, (b) add a post-processing trim step, (c) make the validator reject >2,400 and re-prompt. Currently it's a warning, not an error.

2. **posts.ts auto-generation**: For 245 articles, the blog post registry (`posts.ts`) needs to be generated from the link plan, not manually edited. This is a Phase 9 task.

3. **Freebie manifest**: The validator's artifact report extracts what freebies the writer promises. Across 245 articles, this produces a manifest of ~245 freebie descriptions. These need to be deduplicated (many articles in the same category should offer the same freebie) and turned into actual downloadable assets.

4. **Build-time validation**: The MDX compiler catches syntax errors (wrong comment format, unclosed tags). For production, `npm run build` should run after generation to catch these. The Python validator doesn't parse JSX.

5. **Pillar articles**: The prompt template handles both series and pillar articles (different word count, different link structure) but pillar articles haven't been tested yet. The `series_preview` link type creates a fundamentally different article structure (sequential preview of all series articles). May need a separate prompt section for pillar-specific instructions.

6. **Re-generation loop**: When the validator fails an article, the system should re-generate automatically (pass the validation errors back to the writer as feedback). Not built yet.

## Key Files for Context

- `research/writer_prompt.md` — THE prompt template. All writer constraints live here. This is the file to edit when adjusting article generation behavior.
- `research/generate_article.py` — Assembles the prompt from template + per-article data. Reads link plan, source assignments, and extract files. Supports `--dry-run`.
- `research/validate_article.py` — Post-generation validator. Checks links, CTAs, structure, word count. Produces artifact report. Exit code 0 = pass, 1 = fail.
- `research/article_link_plan.json` — Per-article links and CTAs (245 entries). The link plan is the source of truth for what URLs must appear in each article.
- `research/source_to_article_assignment.json` — Maps source titles to target articles. Used by the generator to find which extracts to feed the writer.
- `content/blog/extracts/index.json` — Maps source titles to extract file paths. 967 entries.
- `landing/src/content/blog/posts.ts` — Blog post registry. Currently manual; needs auto-generation for scale.
- `landing/mdx-components.tsx` — Defines available MDX components (CourseCTA, CommunityCTA, FreebieCTA, Callout).
- `landing/src/app/blog/[slug]/page.tsx` — Blog post page component. Renders H1 from metadata, description as subtitle.
- `research/seo/writing-style.md` — Voice guide referenced by the prompt template.
- `research/seo/article-structure.md` — Structure rules referenced by the prompt template.
- `research/production_process.md` — Master pipeline doc with Phase 7.3 validation spec.
- `.worklogs/2026-02-06-163605-phase5-link-plan.md` — Link plan decisions (intent definitions, pillar vs. series structure).

## Next Steps / Continuation Plan

### Immediate: Scale to full category test batch

1. Pick one full category (e.g., tantrums, ~12 articles) and run `generate_article.py` for each article in the category.
2. Run `validate_article.py` on the entire batch. Fix any systematic prompt issues that surface.
3. Build the auto-generation loop: for each article in a category, assemble prompt → call Opus → validate → report.

### Then: Scale to all 245

4. Run all 245 articles through the pipeline (parallel by category, ~20 batches).
5. Collect the artifact manifest (all freebie promises) and deduplicate per category.
6. Auto-generate `posts.ts` from the link plan.
7. Run `npm run build` to catch any MDX syntax errors.
8. Proceed to Phase 8 (cross-article link graph validation).

### Pipeline hardening

9. Add a re-generation loop: if validator fails, pass errors back and re-generate.
10. Test pillar article generation (different structure, longer, series_preview links).
11. Decide on word count enforcement strategy (warning vs. error vs. trim).

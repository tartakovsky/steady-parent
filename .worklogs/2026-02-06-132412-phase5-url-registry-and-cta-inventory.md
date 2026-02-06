# Phase 5.1 & 5.2: URL Registry + CTA Inventory

**Date:** 2026-02-06 13:24
**Scope:** `research/taxonomy_v3.md`, `~/.claude/CLAUDE.md`

## Summary

Completed Phase 5.1 (article URL generation) and Phase 5.2 (CTA inventory). All 245 articles now have permanent URL slugs embedded in the taxonomy. Full CTA inventory added: 21 courses, 24 quizzes, Skool community, freebies placeholder. Also fixed a bug from the previous session's sentence case conversion (`bRAND_123_MAGIC` → `1-2-3 Magic`). Updated global CLAUDE.md worklog template with two new required sections.

## Context & Problem

Phase 5 is the blocking dependency before any production article writing (Phase 6+). The writer needs real URLs for internal links and real CTAs to embed. Prior to this session:
- Taxonomy had article titles but NO article URLs (only category slugs like `/tantrums/`)
- Quiz URLs existed in `research/quizzes/quiz-ideas.md` but weren't in the taxonomy
- No CTA inventory existed anywhere
- The taxonomy had a leftover bug: `bRAND_123_MAGIC` placeholder text on line 511 from the sentence case conversion script that failed to restore the "1-2-3 Magic" brand name

This session was a continuation after context compaction. The previous worklog (`.worklogs/2026-02-06-180000-reclassification-and-phase5-plan.md`) contained the Phase 5 plan that was followed.

## What Was Done

### 1. Article URL slug generation (Phase 5.1)
- Used an Opus subagent to generate SEO-friendly URL slugs for all 225 series articles
- Pillar articles live at category root (`/tantrums/`), series articles at `/{category-slug}/{article-slug}/`
- Slug quality: 2-5 words, keyword-focused, no filler (e.g., `why-kids-have-tantrums`, `co-regulation`, `arsenic-hour`, `bedtime-routines-by-age`)
- Output: JSON file mapping titles to slugs, verified 0 duplicates across entire site
- Applied via Python script that parsed taxonomy and injected inline URLs after each article title

### 2. Taxonomy format update
Each article line now includes its URL in backticks:
```
1. "Article title" `/category/slug/`
**Pillar article**: "Pillar title" `/category/`
```

### 3. Linkable Assets section added to taxonomy
Added a new `# Linkable Assets` section to `taxonomy_v3.md` (before the Cross-Cluster Connection Map) containing:
- **Quizzes**: 24 quizzes with URLs and category connections (pulled from `research/quizzes/quiz-ideas.md`)
- **Courses**: 21 courses (1 general + 20 specialized, one per category)
- **Community**: Skool link (`https://www.skool.com/steady-parent-1727`)
- **Freebies**: Noted as embedded ConvertKit components, TBD per category

### 4. Bug fix: 1-2-3 Magic brand name
The sentence case conversion script from the previous session used placeholder `BRAND_123_MAGIC` but the restore step lowercased the first character, producing `bRAND_123_MAGIC`. Fixed to `1-2-3 Magic` in taxonomy.

### 5. CLAUDE.md worklog template update
Added two new required sections to the global worklog template:
- **Key Files for Context**: cold-start reading list for new agent sessions
- **Next Steps / Continuation Plan**: concrete actionable steps for resuming work

## Decisions Made

### Course strategy: one per category
- **Chose:** 20 specialized courses (one per category) + 1 general course
- **Why:** User decided to create specialized landing pages for each category. Each can serve as a wait list to validate demand before building the actual course. Strategy note in taxonomy says each can either frame the general course through a specific lens (hybrid) or be a true standalone — decided per-course based on wait list data.
- **Alternatives considered:**
  - One general course everywhere — rejected: too generic for readers with specific pain points
  - 10 selected courses — rejected: user preferred full coverage, and each landing page is cheap to create

### Slug generation approach: Opus agent vs. heuristic script
- **Chose:** Opus subagent for editorial slug generation
- **Why:** URL slugs require editorial judgment (what's the keyword a parent would search?). Heuristic scripts produce long, mechanical slugs. The quiz URL experience from the previous session confirmed this — automated slugs were messy, hand-crafted ones were better. At 225 articles, hand-crafting isn't feasible but Opus can do it in one pass.
- **Alternatives considered:**
  - Python heuristic script — rejected: would need extensive stop word removal, colon handling, max-length trimming rules and still produce mediocre results
  - Hand-crafting — rejected: 225 is too many

### Taxonomy as single source of truth
- **Chose:** All URLs, CTAs, and linkable assets live in `taxonomy_v3.md`
- **Why:** One file to read = one place to update. The writer, the link planner, and the validation script all read the same file. No risk of URL registries going out of sync.

## Architectural Notes

The taxonomy file is now ~700 lines and serves as the master reference for:
- 20 categories with pillar + series articles (245 total)
- Every article's URL (inline with the title)
- Cross-link maps between categories
- All linkable assets (quizzes, courses, community, freebies)
- Category coverage counts

This is the single file the Phase 6 writer agent needs to receive (along with source material and the writing style guide) to produce articles with correct internal links and CTAs.

## Information Sources

- `.worklogs/2026-02-06-180000-reclassification-and-phase5-plan.md` — Phase 5 plan followed in this session
- `research/quizzes/quiz-ideas.md` — quiz URLs and category coverage mapping (lines 283-310)
- `research/production_process.md` — master pipeline doc defining Phase 5 spec
- `research/seo/article-structure.md` — link requirements (5-10 internal links per article)
- Scratchpad files used during processing (not committed):
  - `article-slugs.json` — Opus-generated slug mappings for all 225 series articles
  - `apply_slugs.py` — Python script that injected URLs into taxonomy

## Open Questions / Future Considerations

1. **Course naming**: The specialized course names (e.g., "Beyond Hitting", "Screen Sanity", "Peaceful Mealtimes") are placeholder names. Some may need refinement when actual landing pages are built.
2. **Freebie CTAs**: Each category should eventually have a specific freebie (e.g., "Tantrum scripts PDF", "Bedtime routine checklist"). These need to be defined before the writer can embed them. For now the writer can use quiz and course CTAs.
3. **URL in source_to_article_assignment.json**: The source-to-article assignment file still uses titles only, not URLs. May want to add URLs there too for the writer's convenience, or the writer can look up URLs in taxonomy.

## Key Files for Context

- `research/taxonomy_v3.md` — THE master file. Contains all 245 articles with URLs, all linkable assets (quizzes, courses, community), cross-link maps. This is the single source of truth for the content pipeline.
- `research/production_process.md` — Master pipeline documentation. Defines all phases (1-9), current state, what's done vs. pending.
- `research/quizzes/quiz-ideas.md` — Detailed quiz descriptions, types, schemas, category coverage. Quiz URLs are ALSO in taxonomy but the full quiz specs live here.
- `research/source_to_article_assignment.json` — Maps every source title to its target article(s). Needed for Phase 6 (writing) to know which sources feed each article.
- `research/seo/article-structure.md` — Article structure rules (word count, FAQ format, AI answer block, link requirements). Writer instructions.
- `research/seo/writing-style.md` — Voice and tone guide. Writer instructions.
- `research/title_classification.json` — Master source→category classification. 965 titles mapped to 20 categories.
- `.worklogs/2026-02-06-180000-reclassification-and-phase5-plan.md` — Previous worklog with Phase 4.3/4.4 details and Phase 5 plan.
- `.worklogs/2026-02-06-120000-article-generation-pipeline-experiments.md` — Experiment results that shaped the pipeline design decisions.

## Next Steps / Continuation Plan

### Immediate next: Phase 5.3 — Per-article link plan
Build a JSON file with 5-10 outbound internal links per article. For each of the 245 articles, specify:
- Which other articles to link to (using real URLs from taxonomy)
- Brief anchor intent (what context the link serves)

**Approach**: Process one category at a time (20 batches or parallel). Each batch gets:
1. The category's articles with URLs (from taxonomy)
2. The cross-link map for that category (from taxonomy)
3. The full list of articles in connected categories with URLs
4. Available quiz and course URLs for that category

**Output**: `research/article_link_plan.json` — per-article link plans the writer receives in Phase 6.

### After link plan: Phase 6 — Article writing
The pipeline is validated (see experiment worklog). For each article:
1. Gather source material from `research/source_to_article_assignment.json`
2. Read actual source content from `research/extracted/` files
3. Feed to Opus writer with: sources, article URL, link plan, CTA list, style guide
4. Writer produces article with inline links and CTAs
5. Deterministic validation script checks link count, word count, structure

### Pipeline state after this session
- Phases 1-4.4: COMPLETE (sources crawled, extracted, classified, assigned to articles)
- Phase 5.1: COMPLETE (URL registry — all 245 articles have URLs in taxonomy)
- Phase 5.2: COMPLETE (CTA inventory — courses, quizzes, community, freebies placeholder)
- Phase 5.3: NOT STARTED (per-article link plan)
- Phases 6-9: NOT STARTED (writing, validation, publishing)

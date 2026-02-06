# Reclassification complete, Phase 4.4 done, Phase 5 plan

**Date:** 2026-02-06 18:00
**Scope:** research/title_classification.json, research/classification_by_category/, research/source_to_article_assignment.json, research/taxonomy_v3.md, research/quizzes/quiz-ideas.md

## Summary

Completed Phase 4.3 (reclassification of misclassified titles, especially the parenting-approach catch-all from 191→53 titles), Phase 4.4 (source-to-article assignment across all 20 categories), converted all taxonomy titles to sentence case, and generated quiz URLs. Phase 5 (URL registry + link planning) is next.

## What was done this session

### 1. Phase 4.3: Reclassification
- **Parenting-approach catch-all fixed**: 191→53 titles. 126 titles moved to correct specific categories, 12 newly unclassified.
- **Cross-category corrections**: ~60 corrections across 8 categories (discipline, new-parent, staying-calm, big-feelings, aggression, siblings, transitions, anxiety).
- **Duplicates resolved**: Titles appearing in multiple category files collapsed to single best-fit category.
- Files updated: `research/title_classification.json`, all 20 files in `research/classification_by_category/`.

### 2. Phase 4.4: Source-to-article assignment
- Ran 4 parallel Opus agents (5 categories each) to assign 965 source titles to specific target articles within their categories.
- Each source assigned to 1-3 target articles by title match.
- Output: `research/source_to_article_assignment.json` — maps every source title to its target article(s) using full article titles.
- **18 articles flagged as thin coverage** (0-1 sources), clustered in smaller categories: potty-training (3 thin), parenting-approach (3), tantrums (4), parenting-science (2), and scattered singles in anxiety, big-feelings, breaking-the-cycle, eating, sleep, transitions.

### 3. Sentence case conversion
- All 374 article titles in `research/taxonomy_v3.md` converted from Title Case to sentence case.
- All 1,226 target references in `research/source_to_article_assignment.json` updated to match.

### 4. Quiz URLs generated
- 24 quiz URLs added to `research/quizzes/quiz-ideas.md` (line ~281) in a "Quiz URLs" table.
- Format: `/quiz/slug/` (e.g., `/quiz/parenting-style/`, `/quiz/potty-training-readiness/`).

## Post-reclassification category counts

| Category | Sources | Target articles |
|----------|---------|-----------------|
| discipline | 125 | 15 |
| big-feelings | 78 | 13 |
| staying-calm | 78 | 12 |
| new-parent | 70 | 13 |
| transitions | 70 | 11 |
| siblings | 64 | 13 |
| parenting-approach | 53 | 12 |
| sleep | 52 | 13 |
| aggression | 50 | 14 |
| anxiety | 48 | 13 |
| social-skills | 48 | 12 |
| spirited-kids | 46 | 12 |
| tantrums | 44 | 15 |
| body-safety | 40 | 13 |
| teens | 38 | 13 |
| breaking-the-cycle | 29 | 11 |
| eating | 25 | 10 |
| potty-training | 21 | 11 |
| screens | 16 | 9 |
| parenting-science | 16 | 10 |
| **Total** | **1011** | **245** |

Unclassified: 42

## Phase 5 plan: What's next

Phase 5 is the **blocking dependency** before any production article writing. It has three sub-steps, and they should be done in this order:

### Step 1: Generate article URLs and add them to taxonomy

We have 245 article titles in `research/taxonomy_v3.md` but NO URLs yet (only category slugs like `/tantrums/`). We need to:

1. Generate a URL slug for every article: `/{category-slug}/{article-slug}/`
2. Pillar articles live at the category root: `/{category-slug}/` (already defined)
3. Add the URL directly to each article line in `research/taxonomy_v3.md` so taxonomy becomes the single source of truth for article→URL mapping
4. Verify no duplicate slugs across the entire site
5. Add the 24 quiz URLs to the taxonomy as linkable assets (they already exist in `research/quizzes/quiz-ideas.md`)

The taxonomy should become the **master URL registry** — every article line includes its URL, and quiz/asset URLs are listed in a new section.

### Step 2: Build CTA inventory

Define the actual CTAs the writer will receive. Each CTA needs:
- URL
- Short description
- Usage context (when to use it)
- CTA type (community, course, freebie, quiz, tool)

The quiz URLs from Step 1 become quiz CTAs. We also need to define:
- Community CTA (what is it? Discord? Facebook group? Newsletter?)
- Course CTAs (what courses exist or are planned?)
- Freebie CTAs (downloadable resources — tantrum scripts PDF, bedtime routine checklist, etc.)

**This needs user input** — we don't know what the actual products/community are yet. The quizzes are the only concrete linkable assets so far.

### Step 3: Build per-article link plan

For each of the 245 articles, define 5-10 outbound internal links:
- Which other articles to link to (use real URLs from Step 1)
- Brief anchor intent (what context the link serves)

Approach: process one category at a time. Each call gets:
- The category's articles with URLs
- The cross-link map from taxonomy (which other categories connect)
- The full list of articles in connected categories with their URLs
- Available quiz/asset URLs

Output: a JSON file with per-article link plans that the writer receives in Phase 6.

## Files needed for Phase 5

| File | Purpose |
|------|---------|
| `research/taxonomy_v3.md` | Master taxonomy — will become the URL registry |
| `research/quizzes/quiz-ideas.md` | Quiz URLs + category coverage mapping |
| `research/production_process.md` | Pipeline documentation (Phase 5 spec) |
| `research/seo/article-structure.md` | Link requirements (5-10 per article, varied anchor text) |
| `research/source_to_article_assignment.json` | Source→article mapping (needs URL references updated after Step 1) |

## Decisions made

### Taxonomy as single source of truth for URLs
- **Chose:** Add URLs directly to taxonomy_v3.md article lines rather than a separate URL registry file
- **Why:** The taxonomy already has all article titles, categories, and cross-links. Adding URLs makes it the complete reference. A separate registry would just duplicate information and risk going out of sync.

### Quiz URLs in taxonomy
- **Chose:** Add quizzes to taxonomy as a new "Linkable Assets" section
- **Why:** The writer needs to know about quizzes when writing articles. Having them in the same file as the articles they connect to makes the link planning step cleaner.

## Open questions for user

1. **Community/course/freebie CTAs**: What products exist? Newsletter? Course? Downloadable PDFs? These need to be defined before the CTA inventory can be built.
2. **Other linkable assets**: Are there planned tools (sleep calculator, milestone tracker) or stats pages? The production process mentions these but they haven't been defined.
3. **Link plan granularity**: Should every article get a hand-crafted link plan, or is it enough to give the writer the full URL list + cross-link map and let Opus decide?

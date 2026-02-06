# Content Production Process

Architectural plan for producing publishable blog content from raw source material.

---

## Overview

The pipeline transforms ~965 crawled articles into ~245 publishable blog posts (20 categories × ~12 articles each, including pillar articles), plus linkable assets (tools, quizzes, stats pages). The core challenge is managing **cross-article dependencies**—internal linking, series structure, and linkable assets—which require a global plan before individual articles can be finalized.

---

## Phase 1: Source Acquisition

### 1.1 Source Identification
Web search to identify the most relevant parenting content sources, then manually select which blogs to include.

- Identify high-quality parenting content sources (blogs, expert sites, research summaries)
- Prioritize sources with substantive, evidence-based content
- Avoid thin content farms, ad-heavy listicles, purely promotional content

### 1.2 Crawling & Ingestion
Give an agent blog links and have it use crawl4AI configured for markdown body extraction on each article.

- Crawl identified sources systematically
- Store raw HTML/markdown per source article
- Maintain provenance metadata (source URL, crawl date, author if available)

**Output:** ~1000 raw source articles with provenance tracking

---

## Phase 2: Knowledge Extraction

### 2.1: Extract structured knowledge
One Opus 4.6 knowledge-extractor run per article, no batching. It will strip authors' style and tone, re-organize the article into logically coherent sequence of knowledge written in punchy hook→paragraph style without losing any info.

### 2.2: Gather metadata
Cheap LLM run per knowledge object to populate index. Fields: {title, source_url, source_blog, file path}.

```json
{
  "biglittlefeelings/handling-toddler-fears-and-tears": {
    "title": "Handling Toddler Fears and Tears",
    "source_url": "https://biglittlefeelings.com/blogs/blf/...",
    "source_blog": "biglittlefeelings",
    "file": "biglittlefeelings/handling-toddler-fears-and-tears.md"
  }
}
```

**Output:** `content/blog/extracts/index.json` with ~965 entries

---

## Phase 3: Taxonomy Design

### 3.1 Build title corpus
Extract all titles from `index.json` into a flat list (`research/all_titles.txt`). This is the primary input for taxonomy work — ~11k tokens, fits in a single LLM context window. Only titles are needed.

### 3.2 Generate initial taxonomy
One Opus run over the full title list + model's own parenting domain knowledge. Prompt: produce a taxonomy of parent-problem categories, each with a pillar article concept plus 8-15 series article titles.

Key structural rules:
- **Flat structure**: Category → Pillar article + series articles. No subcategories.
- **Parent-problem framing**: each category represents a specific problem a parent searches for (e.g., "my kid hits" not "behavioral development")
- **No age-based categories**: age is a modifier within articles, not a category axis
- **No school-based categories**: school topics distribute to behavioral categories

### 3.3 Iterate with human review
Multiple rounds of review and regeneration. The taxonomy output is a `.md` file containing for each category:
- Slug (used for URLs)
- Core parent thought (the search intent)
- Pillar article title
- 8-15 series article titles (each line is an actual article that will be written)
- Cross-link map (which specific articles in other categories connect here)

This step is inherently interactive — expect 2-4 revision rounds. Common corrections: categories that are too broad (catch-alls), missing niche categories, overlapping article scopes between categories.

**Output:** `research/taxonomy_v3.md` — 20 categories, ~245 articles (20 pillars + ~225 series), with cross-link annotations

### Current taxonomy (v3): 20 categories
tantrums, aggression, sleep, siblings, anxiety, discipline, staying-calm, breaking-the-cycle, big-feelings, potty-training, eating, screens, social-skills, body-safety, new-parent, teens, transitions, spirited-kids, parenting-approach, parenting-science

---

## Phase 4: Source Classification

### 4.1 Classify source titles into taxonomy categories
One Opus run over all ~965 titles + the 20 category definitions. The full title list + category definitions fit in a single context (~15k tokens), so use the best model available — classification accuracy here directly reduces reclassification iterations later. Each source title gets assigned to 1-2 best-fit categories. Titles that don't fit any category (gift guides, broken URLs, holiday listicles) are marked unclassified.

**Output:** `research/title_classification.json` — maps each source title to its assigned categories. Also split into per-category files in `research/classification_by_category/` for human review.

### 4.2 Verify classification quality
Run parallel verification agents (one per batch of 5 categories, Opus). Each agent reads the category's assigned titles + all 20 category definitions and flags misclassifications.

Common classification errors to watch for:
- **Catch-all categories** absorbing titles that belong in more specific categories (e.g., parenting-approach getting everything "general")
- **Context vs. behavior confusion**: a title about hitting at playdates is aggression, not social-skills
- **Sensory/temperament modifier confusion**: "sensory-related hitting" is aggression, not spirited-kids
- **Dual-topic titles**: classify by the primary problem, not the secondary context

### 4.3 Reclassify corrections
Re-run classification (Opus) on flagged titles with a tighter prompt that includes disambiguation rules learned from verification. Repeat 4.2→4.3 until catch-all categories stabilize.

**Budget note:** Phases 3-4 are cheap — the full title corpus is ~11k tokens, so even multiple Opus runs total under 200k tokens. The expensive phase is Phase 2 (knowledge extraction), which runs Opus on ~1000 full articles. Taxonomy and classification work should always use the best available model.

### 4.4 Source-to-article assignment
Two-level title-based assignment, no content reading required:

**Level 1** (done in 4.1): sources → categories.
**Level 2**: Within each category, Opus assigns source titles to specific target articles. One call per category — input is just the source titles in that category + the target article titles. Each source gets assigned to 1-3 target articles. ~20 cheap Opus calls total.

Experimentally validated: title-based assignment produces clean mappings. Haiku-based content filtering was tested and rejected — it either keeps everything (no-op on relevant sources) or makes editorial decisions that belong to the writer. Sources are fed to the writer raw, unfiltered.

Flag articles where source coverage is thin (0-1 sources) — may need cross-category source pulling or the writer generates from general knowledge.

**Output:** Per-article source assignment (which source files feed each target article)

---

## Phase 5: URL Registry & Link Planning

**This is the critical dependency-resolution phase.** Nothing can be finalized until this is complete.

### 5.1 URL Inventory
LLM run over big batches of article titles and category names to generate slugs. Important to verify no duplicates after, since long article names get compressed into shorter slugs.

Create canonical URLs for **every planned page** before any content is written:

**Blog articles:**
```
/tantrums/why-toddlers-have-tantrums/
/tantrums/how-to-handle-tantrum-in-progress/
/tantrums/preventing-meltdowns/
...
```

**Linkable assets:**
```
/tools/sleep-calculator/
/tools/milestone-tracker/
/quizzes/parenting-style/
/stats/parenting-statistics-2026/
...
```

**Series landing pages** (pillar articles live at these URLs):
```
/tantrums/
/sleep/
/discipline/
...
```

### 5.2 Link Plan
One shot with Opus 4.6 over the full taxonomy might be enough for smaller sites, but at ~245 articles it probably needs a few shots. Approach: first figure out dependencies between series, then one shot per series with that series' taxonomy + cross-series connections + tool URLs.

For each article, define intended internal links:
- **Outbound links**: which other articles/assets this article should link to (5-10 per article)
- **Anchor intent**: brief note on what context the link serves

This is a **list per article**, not a graph visualization—executable data.

### 5.3 Linkable Assets & CTA Inventory
Linkable assets (tools, quizzes, stats pages) must be planned first because:
- Many articles will link to them
- They serve as hub pages for backlink acquisition
- Their existence shapes what articles can reference

Build a structured CTA inventory that the writer receives as input. Each CTA entry includes:
- URL
- Short description (what it is)
- Usage context (when to use it — e.g., "use when discussing parent regulation" or "use when giving scripts")
- CTA type (community, course, freebie, quiz, tool)

Example:
```
- [Quiz] /quiz/parenting-style/ — "Take the parenting style quiz" — use when discussing parenting approaches
- [Freebie] /resources/tantrum-scripts-pdf/ — "Free tantrum scripts cheatsheet" — use when giving step-by-step scripts
- [Course] /courses/calm-parent/ — "The Staying Calm course" — use when discussing parent regulation
```

**Output:** Complete URL registry + per-article link plan + CTA inventory (all frozen before writing begins)

---

## Phase 6: Article Input Assembly

No consolidation or re-extraction step. The writer handles raw multi-source input directly (experimentally validated — no quality loss vs. pre-consolidated input, and avoids an intermediate LLM step that could lose content or make unwanted editorial decisions).

### 6.1 Assemble Writer Input Bundle
For each target article, collect:

1. **Raw source files**: Full, unmodified knowledge extracts from Phase 4.4 assignment (typically 3-8 files, ~4-15k words total)
2. **Link plan**: Available internal links with URLs and one-line descriptions (from Phase 5.2)
3. **CTA inventory**: Available CTAs with URLs, descriptions, and usage context (from Phase 5.3)
4. **Article context**: Category name, pillar vs. series designation, position in series
5. **Style and structure rules**: `article-structure.md` + `writing-style.md` (inlined into prompt)

**Output:** One input bundle per target article — no LLM cost in this phase, just file assembly

---

## Phase 7: Article Generation

### 7.1 Article Writing
One Opus 4.6 run per article. The writer receives the full input bundle from Phase 6 and outputs a complete article with links and images inline.

The writer prompt has this structure:
1. **Role and task**: article title, category, word count target
2. **Article structure rules**: inlined from `article-structure.md`
3. **Writing style rules**: inlined from `writing-style.md`
4. **Creative task instructions**: synthesize fragments into coherent narrative, build a story arc, add the Steady Parent voice, verify psychological correctness
5. **Available internal links**: real URLs with one-line descriptions — writer picks 5-10 and weaves them in with natural anchor text
6. **Available CTAs**: real URLs with descriptions and usage context — writer picks 3 and leads into them with copy matching surrounding content
7. **Image instructions**: writer suggests 3 images (1 cover + 2 inline) with scene descriptions that are specific and memorable, not generic
8. **Raw source material**: full content of all assigned source knowledge files

The writer outputs:
- Complete article in markdown with real internal links embedded
- 3 CTA placements with real URLs and lead-in copy
- 3 image placeholders with scene descriptions and alt text
- FAQ section with schema-ready Q&A pairs

### 7.2 Image Generation
Separate step after article writing. For each article's 3 image descriptions:
- Prepend the Steady Parent image style prefix (minimalist line art, defined in style guide)
- Generate via image API
- Images are horizontal format, one-shot generation (no collages or multi-panel)
- The style handles environments (sketched airports, stores, parks), large-scale facial expressions (wide eyes, open mouth, tears, grimaces), and body language
- Image descriptions from the writer should be specific and memorable, not generic stock-art scenes

### 7.3 Article Validation
Cheap model (Haiku/Sonnet) checks each article against structural requirements. Plus a **deterministic script** that:
- Extracts all URLs from the article
- Validates each URL exists in the URL registry from Phase 5
- Flags any URLs that are not in the registry (hallucinated links)
- Counts internal links (target: 5-10)
- Checks word count, heading hierarchy, FAQ count
- Verifies all 3 CTAs are present and use real URLs

**Output:** Complete article markdown with embedded links, CTAs, and image placeholders + generated images

---

## Phase 8: Cross-Article Link Graph Validation

This phase runs once, after all articles are generated. It is a deterministic script, not an LLM step.

### 8.1 Build Link Graph
Parse all generated articles and extract every internal link. Build a directed graph: article → linked articles.

### 8.2 Validate Graph Health
- **Orphan check**: Every article must have at least 2 inbound links. Flag orphans.
- **Overlink check**: No single article should receive more than ~20 inbound links (suggests over-concentration). Flag hot spots.
- **Pillar connectivity**: Every series article must link to its category's pillar. Every pillar must link to all its series articles.
- **Cross-category links**: Verify the cross-link map from the taxonomy is reflected in actual articles. Flag missing cross-category connections.
- **Dead link check**: Every URL in every article must exist in the URL registry.
- **Anchor text diversity**: Flag articles where the same anchor text is used for multiple different URLs, or where the same URL always gets the same anchor text.

### 8.3 Fix Passes
For orphans and missing required links, run targeted LLM edits on specific articles to add the missing links naturally. This is a surgical fix pass, not a full rewrite.

**Output:** Validated link graph + fix report

---

## Phase 9: Blog Post Packaging

### 9.1 SEO Metadata Extraction
Per-article metadata generation (see `metadata-extraction.md`):
- AI extraction: slug, keywords, meta_title, meta_description, headline, ai_answer, faq_items
- Deterministic enrichment: dates, author, publisher, word count, featured image

### 9.2 Schema Generation
- Article JSON-LD
- FAQPage JSON-LD
- BreadcrumbList JSON-LD
- HowTo JSON-LD (if applicable)

### 9.3 Asset Integration
- Replace image placeholders with generated images from Phase 7.2
- Featured image (cover) with proper dimensions (1200x630px minimum for OG/social)
- In-content images at marked positions
- CTA components already embedded by writer with real URLs

**Output:** Publishable blog post artifact (markdown + metadata + schema + images)

---

## Dependency Graph Summary

```
Phase 1-2: Source Acquisition + Knowledge Extraction
    ↓
Phase 3: Taxonomy Design (iterative: generate → review → revise)
    ↓
Phase 4: Source Classification (iterative: classify → verify → reclassify → source-to-article assignment)
    ↓
Phase 5: URL Registry + Link Planning + CTA Inventory  ← BLOCKING DEPENDENCY
    ↓
    ├── Phase 6: Article Input Assembly (parallelize across articles, no LLM cost)
    │       ↓
    │   Phase 7: Article Generation + Image Generation + Validation (parallelize across articles)
    │       ↓
    │   Phase 8: Cross-Article Link Graph Validation (runs once after ALL articles complete)
    │       ↓
    │   Phase 9: Blog Post Packaging
    │
    └── Linkable Assets (tools/quizzes/stats) can be built in parallel with Phase 6-7
```

**Key insight:** Phases 1-5 are **sequential and blocking**. Phase 3 and 4 are iterative within themselves but sequential relative to each other (classification requires a stable taxonomy). Once Phase 5 is complete, Phase 6 (assembly) and Phase 7 (writing + images) can run **in parallel per article**. Phase 8 (link graph) must wait for all articles to complete. Phase 9 (packaging) can start per-article as soon as Phase 8 validates each article's links.
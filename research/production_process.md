# Content Production Process

Architectural plan for producing publishable blog content from raw source material.

---

## Overview

The pipeline transforms ~1000 crawled articles into ~170 publishable blog posts (17 categories × ~10 articles each), plus ~20 linkable assets (tools, quizzes, stats pages). The core challenge is managing **cross-article dependencies**—internal linking, series structure, and linkable assets—which require a global plan before individual articles can be finalized.

---

## Phase 1: Source Acquisition

### 1.1 Source Identification
<!-- Web search to identify most relevant content, manually select blogs you want -->

- Identify high-quality parenting content sources (blogs, expert sites, research summaries)
- Prioritize sources with substantive, evidence-based content
- Avoid thin content farms, ad-heavy listicles, purely promotional content

### 1.2 Crawling & Ingestion
<!-- Give an agent blog links and tell it to use crawl4AI configured for markdown body extraction for each article -->

- Crawl identified sources systematically
- Store raw HTML/markdown per source article
- Maintain provenance metadata (source URL, crawl date, author if available)

**Output:** ~1000 raw source articles with provenance tracking

---

## Phase 2: Knowledge Extraction
<!-- LLM-run per article -->

### 2.1: Extract structured knowledge
Use specifically Opus 4.5 with knowledge-extractor skill, one run per article, no batching. It will strip authors' style and tone, re-organize the article into logically coherent sequence of knowlege written in punchy hook->paragraph style without losing any info. 

### 2.2: Gather metadata
Cheap LLM run per knowledge object to get small summary, save into index. Put word count there, source link, file path and so on

blog/index.json:
```
"biglittlefeelings/handling-toddler-fears-and-tears": {
    "title": "Handling Toddler Fears and Tears",
    "source_url": "https://biglittlefeelings.com/blogs/blf/handling-toddler-fears-and-tears",
    "source_blog": "biglittlefeelings",
    "file": "biglittlefeelings/handling-toddler-fears-and-tears.md",
    "word_count": null,
    "summary": null,
  },
```
---

## Phase 3: Taxonomy & Classification

### 3.1 Taxonomy Definition
<!-- 
- One LLM run over all article titles in batch + ask to use it's own domain knowledge + discussion 
- Then maybe a few LLM runs with taxonomy + e.g. 20 pairs (title, summary) per batch to detail the taxonomy better. So we know which topics we actually have data for. Categories are extracting well from just titles. Making series would probably better with summaries too.
-->

Define the parent problem-space taxonomy (see `taxonomy.md`):
- Currently, 17 top-level clusters (Tantrums, Hitting, Sleep, Siblings, Anxiety, etc.)
- Subcategories within each cluster
- Cross-cluster connection points

---

## Phase 4: Editorial Planning

### 4.1 Series Planning
<!-- LLM run over taxonomy + discussion -->

For each taxonomy cluster, define the target article series:
- **Series scope**: which subcategories to cover
- **Article count**: typically 8-15 articles per series
- **Article topics**: specific angles/questions each article addresses
- **Pillar vs. standard**: identify pillar articles (broader, link to cluster articles)

### 4.2 Category/Title tree generation

Need to turn the series plan into series tree with finalized article and category names. We can't change it easily after it's done and used for URL generation, so think carefully here and freeze it.

```
Tantrum Series
- Why toddlers have tantrums and what to do about it
- How to prevent meltdowns before they happen
- etc etc
Aggression
- How to deal with hitting
- ...
```

### 4.3 Source Mapping
<!-- 
- Decent LLM run in batches over [title, summary]
- Give it high-level taxonomy as input and ask to assign knowledge object from the batch to one or more most relevant taxonomy clusters
- Maybe 20 knowledge object (title+summary, not text) per batch
-->

For each planned article:
- Identify relevant knowledge objects (typically 1-5 sources per article)
- Map which source knowledge object contribute to each target article
- Note gaps where additional research may be needed

**Output:** Editorial plan with article-to-source mappings

---

## Phase 5: URL Registry & Link Planning

**This is the critical dependency-resolution phase.** Nothing can be finalized until this is complete.

### 5.1 URL Inventory
<!-- LLM run over big batches of article titles and category names. Important to verify that there are no duplicates after, as we're compressing long article names into shorter slugs. -->
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

**Series landing pages:**
<!-- Pillar articles on them? -->
```
/tantrums/
/sleep/
/discipline/
...
```

### 5.2 Link Plan
<!-- 
LLM over taxonomy, one shot with Opus 4.5 might be enough, the other models will skip stuff. Not for my amount of data though. Probably needs a few shots. First figuring out dependencies between series. Then one shot on each series with one series taxonomy + cross-series connections + tool urls. 
 -->

For each article, define intended internal links:
- **Outbound links**: which other articles/assets this article should link to (5-10 per article)
- **Anchor intent**: brief note on what context the link serves

This is a **list per article**, not a graph visualization—executable data.

### 5.3 Linkable Assets Priority
Linkable assets (tools, quizzes, stats pages) must be planned first because:
- Many articles will link to them
- They serve as hub pages for backlink acquisition
- Their existence shapes what articles can reference

**Output:** Complete URL registry + per-article link plan (frozen before writing begins)

---

## Phase 6: Content Synthesis

### 6.1 Per-Article Source File
<!-- 
Merge 1-5 knowledge files, run one Opus 4.5 knowledge-extraction per merged file. That would give aggregated knowledge file source for actual article.

Put linking plan nearby

```
article1/
- knowledge_source.md
- category_taxonomy.md
- linking.md
```

 -->
For each target article, create a single consolidated source file:
- Aggregate relevant knowledge objects from mapped sources
- Re-extract/reorganize into article-specific structure
- Include the link plan (what this article must reference)
- Note the article's role in the series (pillar? which pillar does it support?)

### 6.2 Link Hooks
The source file should specify **link hook points**—topics that must be mentioned to enable natural linking later:
- "Mention bedtime routine in context of wind-down" (enables link to bedtime routine article)
- "Reference age-appropriate expectations" (enables link to developmental milestones)

**Output:** One source file per target article, containing all inputs needed for generation

---

## Phase 7: Article Generation (Pass 1 - Draft)

### 7.1 Raw Text Generation
<!-- One LLM run per source file. Probably Opus 4.5, but run Gemini 3 Pro, Opus 4.5 and GPT 5.2 and compare on one article, I forgot which one I wrote the good stuff with -->
Generate article body text from the per-article source file:
- Follow structure requirements (`article-structure.md`)
- In required writing style (`writing-style.md`)
- Write with link hooks in place (mentions exist, but links not yet embedded)

### 7.2 Draft Validation
<!-- One Haiku/Sonnet run per article-->
- Cheap model run that checks the article against requirements and highlight if something is really wrong

**Output:** Near-final markdown text per article (links not yet embedded)

---

## Phase 8: Link Injection (Pass 2)

### 8.1 Link Embedding
Given:
- The draft markdown from Phase 7
- The link plan from Phase 5
- The frozen URL registry

Inject internal links:
- Find optimal anchor text for each planned link
- Embed links at natural positions (not forced)
- Vary anchor text (avoid repetition)

### 8.2 Link Validation
- Count internal links (target: 5-10)
- Verify all planned links were placed (or flag if no natural placement found)
- After all articles finihes, build a graph of cross-links and check for orphan pages (every article must have inbound links)

**Output:** Markdown with embedded internal links

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
- Featured image assignment
- In-content image placement
- CTA component insertion

**Output:** Publishable blog post artifact (markdown + metadata + schema)

---

## Dependency Graph Summary

```
Phase 1-2: Source Acquisition + Knowledge Extraction
    ↓
Phase 3: Taxonomy & Classification
    ↓
Phase 4: Editorial Planning (series + source mapping)
    ↓
Phase 5: URL Registry + Link Planning  ← BLOCKING DEPENDENCY
    ↓
    ├── Phase 6: Content Synthesis (can parallelize across articles)
    │       ↓
    │   Phase 7: Article Generation (Pass 1)
    │       ↓
    │   Phase 8: Link Injection (Pass 2)
    │       ↓
    │   Phase 9: Blog Post Packaging
    │
    └── Linkable Assets (tools/quizzes/stats) can be built in parallel
```

**Key insight:** Phases 1-5 are **sequential and blocking**. Once Phase 5 (URL registry + link plan) is complete, Phases 6-9 can run **in parallel per article**.
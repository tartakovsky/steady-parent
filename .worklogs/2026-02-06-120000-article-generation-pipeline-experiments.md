# Article Generation Pipeline: Experiments and Discoveries

**Date:** 2026-02-06 12:00
**Scope:** research/experiment/, research/seo/article-structure.md, research/seo/writing-style.md, research/production_process.md

## Summary

Ran end-to-end experiments on the article generation pipeline to determine: (1) whether Haiku extraction adds value as a pre-filtering step, (2) how to map ~965 source knowledge files to ~245 target articles, and (3) whether Opus can produce quality articles from raw multi-source input. Conclusion: Haiku extraction is unnecessary; title-based two-level classification + raw source feeding to Opus is the optimal pipeline.

## Context & Problem

We have ~965 source knowledge files (extracted from crawled parenting blogs) that need to become ~245 original blog articles across 20 categories. The original 1:1 pipeline (one source = one article) doesn't apply because multiple sources feed into each target article.

The key questions:
- How do we assign sources to target articles?
- Do we need an intermediate extraction/filtering step to reduce input volume before the writer model?
- Can the writer model handle raw, overlapping, multi-source input directly?

## Experiments Run

### Experiment 1: Haiku Extraction (Opinionated Prompt)

**Setup:** 4 source knowledge files about tantrums (~5,426 words total). Haiku told to extract content relevant to "How to Handle a Tantrum That's Already Happening" with specific instructions to skip neurological explanations, prevention, post-tantrum repair.

**Result:** 5,426 → 3,217 words (41% reduction). Haiku extracted well but the prompt made editorial decisions that constrained what Opus could later work with.

**Problem identified:** The extraction prompt hardcoded editorial choices into the cheapest, dumbest part of the pipeline. "Skip neurological explanations" is an editorial call that should belong to the writer, not to a pre-filter.

### Experiment 2: Haiku Extraction (Open-Ended Prompt)

**Setup:** Same 4 sources. Prompt changed to: "extract everything that could be used to construct a coherent, useful narrative around this article's topic." No skip instructions.

**Result:** 5,426 → 5,122 words (6% reduction). Haiku kept essentially everything from 3 of 4 sources verbatim. Only Source 3 got minor trimming (26%).

**Conclusion:** When not told what to skip, Haiku doesn't skip anything from relevant sources. The extraction step becomes a no-op.

### Experiment 3: Haiku on Completely Unrelated Sources

**Setup:** Target article about tantrums. Fed Haiku a pacifier article, a food fights article, and tantrum sources with target = potty training article.

**Results:**
- Tantrum target + pacifier source: Extracted 509 words of emotional validation patterns (arguably correct)
- Tantrum target + food fights source: Extracted 317 words of calm/narration patterns (arguably correct)
- Potty training target + tantrum sources: "NO RELEVANT CONTENT" (clean rejection)
- Potty training target + food fights source: "NO RELEVANT CONTENT" (clean rejection)

**Conclusion:** Haiku correctly rejects truly unrelated sources. But this filtering is equivalent to what title-based classification already does for free.

### Experiment 4: Haiku on Gray-Zone Sources

**Setup:** Target article about tantrums. Fed Haiku 4 gray-zone sources: "so you lost your cool" (parent regulation), "coping skills" (prevention), "cozy corner" (calm-down tool), "stop hitting" (aggression).

**Results:**
| Source | Original | Extracted | % Kept |
|--------|----------|-----------|--------|
| Lost your cool (696w) | 696 | 696 | 100% |
| Coping skills (1,229w) | 1,229 | 425 | 35% |
| Cozy corner (847w) | 847 | 563 | 66% |
| Stop hitting (1,781w) | 1,781 | 1,231 | 69% |

**Conclusion:** Haiku keeps 35-100% from gray-zone sources. The content it pulled was arguably correct (transferable principles). The content it dropped might have been useful to Opus. The filtering adds marginal volume reduction at the cost of potential editorial damage.

### Experiment 5: Full Article Generation (With Haiku Extraction)

**Setup:** 4 Haiku extracts merged → Opus writer with article-structure.md + writing-style.md rules.

**Result:** 2,496 word article. Voice was excellent ("delivering a TED Talk to someone neurologically incapable of attending"). Narrative arc was coherent. Sources synthesized without visible seams. FAQ answers ran slightly long.

### Experiment 6: Full Article Generation (No Haiku, Raw Sources)

**Setup:** 3 raw source files (~4k words) fed directly to Opus. No extraction step. Different target article ("How to Handle Tantrums in Public").

**Result:** 2,200 word article. Same quality voice and synthesis. All 3 sources woven together (preparation from Source 1, airport father story from Source 2, Stop-Drop-Breathe from Source 3). No degradation from skipping Haiku.

### Experiment 7: Title-Based Source Assignment

**Setup:** Opus received 43 source titles + 14 target article titles within the tantrums category. Asked to assign each source to 1-3 target articles.

**Result:** Clean mapping in one cheap call (~25k tokens). Distribution made sense: A2 (in-the-moment handling) got 12 sources, A11 (big-kid tantrums) got 14, A5 (public tantrums) got 3. Some articles like A10 (holiday tantrums) only got 1 source.

## Decisions Made

### Decision 1: Drop Haiku Extraction from Pipeline
- **Chose:** No Haiku extraction step at all
- **Why:** Haiku either keeps everything (no-op on relevant sources) or makes editorial decisions that should belong to Opus. The only filtering it does well (rejecting unrelated sources) is already handled by title-based classification for free.
- **Alternatives considered:**
  - Opinionated Haiku extraction — rejected because it hardcodes editorial decisions at the dumbest pipeline stage
  - Open-ended Haiku extraction — rejected because it's a no-op (keeps 94-100% of relevant content)
  - Haiku as binary relevance gate — rejected because title classification does this for free

### Decision 2: Two-Level Title-Based Classification
- **Chose:** Level 1: sources → categories (done). Level 2: sources → target articles within category (Opus, one call per category, titles only)
- **Why:** Cheap, fast, and Opus makes good assignment decisions from titles alone. No need to read source content for assignment.
- **Alternatives considered:**
  - Content-based assignment (read sources to assign) — rejected as unnecessary cost; titles carry sufficient signal
  - Haiku-based relevance scoring — rejected; titles work just as well

### Decision 3: Feed Raw Sources Directly to Writer
- **Chose:** Opus writer receives full, unmodified source knowledge files
- **Why:** No quality loss vs extracted input. Source files are typically 1-2k words each, 4-8 per article = 4-16k words input, trivially fits in context.
- **Alternatives considered:**
  - Haiku pre-filtering — rejected per Decision 1
  - Opus consolidation step before writing — rejected as unnecessary for these input sizes; writer can synthesize directly

### Decision 4: Updated Article Requirements
- **Chose:** Word count 1,800-2,200 (was 2,000-2,500), FAQ/AI answers target ~45 words (safety buffer within 40-60 range)
- **Why:** First experiment produced 2,496 words which felt right but was at the top of range. Lowering target gives breathing room. Targeting 45 words for constrained blocks means slight overruns still land in acceptable range.

### Decision 5: Added Inline Formatting Rules
- **Chose:** Added bold/italics guidance to writing-style.md
- **Why:** Generated articles were walls of text without visual accents. Bold for key takeaways/punchlines, italics for internal voice/emphasis.

## Architectural Notes

### Final Pipeline (Validated)

```
Phase 4.1: Classify sources → categories (title-based, done)
Phase 4.2: Assign sources → target articles within category (Opus, titles only, 20 calls)
Phase 7:   Write article (Opus gets raw source files + structure rules + style rules)
```

No Phase 6 consolidation or Haiku extraction needed. The pipeline is simpler than originally planned.

### Writer Prompt Structure

The writer prompt has 4 sections:
1. Role and task (article title, category, word count)
2. Article structure rules (inlined from article-structure.md)
3. Writing style rules (inlined from writing-style.md)
4. Creative task instructions (synthesize fragments, build narrative, add voice)
5. Raw source material (full content of all assigned sources)

The creative task section is critical: it tells Opus to reconstruct a coherent narrative from disjointed fragments, not just merge them. This is what produces articles that read like original pieces rather than patchwork.

### Scale Considerations

For articles with many assigned sources (A11 got 14 sources, potentially ~20k words input), the raw-feed approach still works within Opus context limits. If any article exceeds ~50k words of source input, consider either:
- Dropping the least-relevant sources (based on title match quality from the assignment step)
- Running a simple "top N" selection

This is unlikely to be needed for most articles.

## Information Sources

- Experiment files: `research/experiment/` (extracts, merged sources, final articles, prompts)
- Article structure rules: `research/seo/article-structure.md`
- Writing style rules: `research/seo/writing-style.md`
- Taxonomy: `research/taxonomy_v3.md` (20 categories, 245 articles)
- Source classification: `research/title_classification.json`, `research/classification_by_category/`
- Production process: `research/production_process.md`

## Open Questions / Future Considerations

- Production process doc needs updating to reflect the simplified pipeline (no Haiku, no consolidation step)
- The writer prompt template in `research/experiment/prompts.md` should be updated to remove the Haiku extraction prompt and document the final writer-only approach
- Articles with very few sources (A10 Holiday Tantrums got only 1 source) may need cross-category source pulling or the writer may need to generate more from general knowledge
- The Level 2 assignment (sources → target articles) has not been validated at scale across all 20 categories yet
- CTA copy needs templating (currently just placeholders)
- Internal link targets are invented titles that need mapping to actual taxonomy articles

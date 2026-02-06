# Article Structure Specification

This document defines the structure requirements for Steady Parent blog articles, optimized for SEO, AI citation, and reader experience.

## Requirements Summary

| Requirement | Value | Source |
|-------------|-------|--------|
| Minimum word count | 1,800 words | Long-form = 9x more leads, 37% strong results vs 20% for 1,000-1,500 |
| Maximum word count for normal articles | 2,200 words | Long-form = 9x more leads, 37% strong results vs 20% for 1,000-1,500 |
| Maximum word count for pillar articles | 3,500 words | Avoid filler, pillar articles aggregate a bunch of normal articles by covering road, strokes, providing previews of each of the smaller articles and linking to them. |
| Heading hierarchy | H1 → H2 → H3 only | 2.8x higher AI citation likelihood |
| H1 count | Exactly 1 per page | Reserved for title/hook |
| AI answer length | ~45 words  | Optimal for AI extraction and featured snippets. Target 45 as safety buffer. |
| FAQ count | 3-5 questions | Schema requirement |
| FAQ answer length | ~45 words each | Optimal for FAQPage schema. Target 45 as safety buffer so slight overruns stay in range. |
| Internal links | 5-10 per article | ~1 per 200-300 words |
| External links | 1-3 authoritative sources | Citing research, guidelines, experts |
| Reading time | 7-15 minutes | Based on 250 wpm average |

## Article Structure (Top to Bottom)

### 1. Title/Hook (H1)
- The single H1 on the page
- Maps to `headline` in JSON-LD
- Max 110 characters
- Must contain primary keyword
- Compelling hook that promises value

### 2. AI Answer Block
- Immediately after H1
- 40-60 words exactly
- Self-contained summary that answers the headline's implied question
- Dense with value, no filler
- Write this in the same voice as the rest of the article. It should be interesting to read and extractable by AI, not a Wikipedia abstract.
- Maps to `description` in Article schema
- This is what AI systems extract for citations

### 3. TLDR or Table of Contents
**For standard articles (under 3,000 words):**
- TLDR: 3-5 bullet points summarizing key takeaways
- Scannable for readers who want the gist

**For pillar articles (3,000+ words):**
- Table of Contents with anchor links
- Lists all H2 sections
- Clickable navigation
- Can generate sitelinks in search results

### 4. Body Content
**Heading structure:**
- H2 for major sections (5-8 per article)
- H3 for subsections within H2s
- Never skip levels (no H1 → H3)
- Question-based headings preferred for AI ("How do I..." / "What causes...")

**Section pattern (for each H2):**
1. Lead with a 40-60 word direct answer to the section's implied question
2. Elaborate with details, examples, research
3. Include actionable advice where relevant

**Content quality:**
- No filler paragraphs
- Every section must add value
- Use bullet points and numbered lists for scannability
- Include examples and specific advice
- Cite sources for statistics and claims

### 5. FAQ Section
- 3-5 questions minimum
- Each answer: ~45 words (40-60 acceptable)
- Always visible (non-interactive, no accordion collapse)
- Questions should be actual queries people search for
- Answers must be self-contained
- Maps directly to FAQPage schema
- Uses standard FAQ component we use

### 6. CTA Blocks (3 placements)
Three CTAs integrated into the article:
1. **Community CTA** - Join the Steady Parent community
2. **Course CTA** - Relevant course offering
3. **Freebie CTA** - Lead magnet / free resource

**Placement rules:**
- CTAs should flow naturally from surrounding content
- Writer/agent chooses optimal placement based on content context
- Each CTA gets a short description matching what's being discussed
- Never cluster all 3 together
- Suggested positions: after intro, mid-article, before FAQ

## Heading Hierarchy Example

```
H1: The Complete Guide to Toddler Bedtime Routines

  H2: Why Bedtime Routines Matter for Toddlers
    H3: The Science of Sleep Pressure
    H3: How Consistency Builds Security

  H2: The 5-Step Bedtime Routine That Works
    H3: Step 1: Wind-Down Activities
    H3: Step 2: Bath Time
    H3: Step 3: Pajamas and Teeth
    H3: Step 4: Stories and Songs
    H3: Step 5: Lights Out Ritual

  H2: Common Bedtime Problems and Solutions
    H3: The "One More Story" Loop
    H3: Fear of the Dark
    H3: Night Waking

  H2: FAQ
    (no H3s, questions are bold text or styled differently)
```

## Internal Linking Requirements

- 5-10 internal links per article
- Link to pillar page if article is part of a cluster
- Link to 1-2 sibling cluster articles
- Vary anchor text (don't repeat exact phrases)
- Place links where reader would naturally want more info
- Every new article must receive 2-3 incoming links from existing articles

## Image Requirements

- 1 featured image (1200x630px minimum for OG/social)
- 2-5 in-content images for long articles
- Descriptive file names with keywords (`toddler-bedtime-routine-steps.jpg`)
- Alt text describes image content, not keyword stuffing
- Images break up text every 300-500 words

## Quality Checklist

Before publishing, verify:

- [ ] Word count ≥ 1,800
- [ ] Single H1 (title)
- [ ] H2 → H3 hierarchy only (no skipped levels)
- [ ] AI answer block: 40-60 words
- [ ] Each H2 section leads with direct answer
- [ ] 3-5 FAQs with 40-60 word answers each
- [ ] 5-10 internal links with varied anchor text
- [ ] 1-3 external links to authoritative sources
- [ ] 3 CTAs placed naturally
- [ ] Featured image with proper dimensions
- [ ] No orphan page (has incoming links)
- [ ] Primary keyword in H1, meta title, first paragraph
- [ ] No duplicate content / keyword cannibalization with other articles

## Schema Types Generated

Each article generates:
1. **Article** - headline, author, dates, wordCount, image
2. **FAQPage** - question/answer pairs from FAQ section
3. **BreadcrumbList** - navigation path (Home → Category → Article)
4. **HowTo** (optional) - if article contains step-by-step instructions

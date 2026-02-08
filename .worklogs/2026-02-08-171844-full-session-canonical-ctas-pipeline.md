# Full Session: Canonical CTA System, Validator Hardening, Prompt Constraints, Blog Styling, and 4-Article Test Run

**Date:** 2026-02-08 (session spanning 2026-02-07 evening through 2026-02-08)
**Scope:** research/category_ctas.json, research/generate_article.py, research/writer_prompt.md, research/validate_article.py, research/production_process.md, landing/src/content/blog/posts.ts, landing/mdx-components.tsx, landing/src/content/blog/posts/*.mdx, landing/src/app/blog/[category]/[slug]/page.tsx

## Summary
This session covered six major areas: (1) saving/validating articles from a prior session, (2) styling blog links to be visible, (3) building a canonical CTA consistency system across 20 categories, (4) fixing validator bugs and tightening prompt constraints, (5) updating the BlogCategory type, and (6) generating two new anxiety-category articles in parallel to test cross-linking within a category. 4 articles now exist across 3 categories, all passing validation. The production pipeline is ready for batch generation.

## Context & Problem
The article generation pipeline was built and tested on 2 articles (tantrums + sleep) in the prior session. This session started by recovering those articles and validating them, then expanded to address several issues discovered during testing:
1. Blog links were invisible (same color as body text)
2. No mechanism to ensure articles in the same category promise the same course/freebie products
3. Validator had bugs: regex broke on escaped quotes in descriptions, nav link position check produced false positives for URLs that appear as both body and nav links
4. Prompt lacked hard limits on word count and FAQ answer length
5. BlogCategory type was incomplete (6 categories instead of 20)
6. No testing of same-category articles that cross-link to each other

## Decisions Made

### Decision 1: Canonical CTA consistency system
- **Chose:** Create `category_ctas.json` defining course_name, course_url, course_promise, freebie_name, freebie_promise for all 20 categories. Inject into prompt via `{{CTA_CANONICAL}}`. Validate after generation.
- **Why:** Prevents inconsistency at generation time. Post-hoc deduplication would require manually fixing articles (violates "never manually fix generated articles"). Injection at prompt time means the writer knows the canonical names before writing, so it gets them right on the first pass.
- **Alternatives considered:**
  - Post-hoc deduplication after all 245 articles generated — rejected because fixing articles after the fact is the exact workflow we're avoiding
  - Hardcoding all CTA text in the prompt — rejected because CTA body text should vary per article context (same product, different pitch angle)

### Decision 2: Freebie definitions for all 20 categories
- **Chose:** All freebies are printable/downloadable assets (cheat sheets, flowcharts, cards, checklists, worksheets, posters, planners, agreements)
- **Why:** Printables are the simplest lead magnets to produce and deliver via ConvertKit. Each is category-specific and directly useful.
- **Pattern:** "A printable [thing] for [specific use case]"
- **Note:** These are proposals. May need adjustment based on what's actually producible.

### Decision 3: Link styling
- **Chose:** `text-blue-700/70` for unvisited, `visited:text-purple-700/60` for visited, with `decoration-blue-700/30` underline
- **Why:** Links were previously invisible — inheriting `text-muted-foreground` from parent `<p>` element with no color differentiation. Users couldn't tell what was clickable.

### Decision 4: Hard limits in prompt
- **Chose:** Add "(HARD LIMIT — do not exceed the upper bound)" to word count, change FAQ to "35-55 words (HARD LIMIT — no answer over 55 words)"
- **Why:** Without explicit hard limits, Opus overshoots. Sleep article came in at 2,540 words (target 1,800-2,200) and FAQ answer #5 was 84 words. Adding "HARD LIMIT" to the prompt fixed this for subsequent articles (anxiety articles both came in under 2,400).

### Decision 5: Skip batch infrastructure for now
- **Chose:** Manual one-at-a-time generation, defer batch scripts and auto-registration
- **Why:** User decision — infrastructure can come later, focus on validating the system first

### Decision 6: Defer pillar article testing
- **Chose:** Test pillar articles later, after series articles are proven
- **Why:** User decision — pillar articles have different structure (series_preview links, higher word count, hub page format). Better to validate the common case first.

## Architectural Notes

### End-to-end article generation flow
```
category_ctas.json ─┐
writer_prompt.md ────┤
article_link_plan.json──┤
source_to_article_assignment.json──┤──→ generate_article.py ──→ assembled prompt (~7-15k words)
content/blog/extracts/index.json──┘        │
                                           ↓
                                    Opus 4.6 (one call)
                                           │
                                           ↓
                              {slug}.mdx (complete article)
                                           │
                                           ↓
                              validate_article.py ──→ PASS/FAIL + artifact report
                                           │
                                           ↓
                              landing/src/content/blog/posts/{slug}.mdx
                              + register in posts.ts
```

### Prompt template variables
The writer prompt (`research/writer_prompt.md`) uses these `{{VARIABLES}}`:
- `{{ARTICLE_TITLE}}` — exact title from taxonomy
- `{{CATEGORY}}` — slug (e.g., "anxiety")
- `{{CATEGORY_DISPLAY}}` — display name (e.g., "Anxiety")
- `{{ARTICLE_TYPE}}` — "series" or "pillar"
- `{{WORD_COUNT_TARGET}}` — "1,800-2,200" for series, "2,500-3,500" for pillar
- `{{DATE}}` — ISO date (today)
- `{{BODY_LINKS}}` — bullet list of cross/sibling/quiz links with URLs, types, intents
- `{{NAV_LINKS}}` — bullet list of pillar/prev/next links
- `{{CTA_COMPONENTS}}` — CTA component templates with href props and intents
- `{{CTA_CANONICAL}}` — canonical course/freebie names and promises for this category
- `{{SOURCE_COUNT}}` — number of source extracts
- `{{SOURCE_MATERIAL}}` — full text of all source extracts

### Canonical CTA injection format
The `{{CTA_CANONICAL}}` variable expands to:
```
**Course:** "Childhood Anxiety"
  Promise: Audio lessons and illustrated guides for helping your child manage worry, fear, and avoidance behaviors.

**Freebie:** "The Worry Time Toolkit"
  Promise: A printable worry journal page and worry time rules card for kids.

**Community:** "Steady Parent Community" (same for all categories)
```

### Validator checks — complete list
**Errors (FAIL):**
1. Could not match article to link plan entry
2. Article too short (< 1,600 series / < 2,500 pillar)
3. HTML comments found (must use `{/* */}`)
4. Missing metadata fields (title, description, date, category)
5. No TLDR section
6. No FAQ section or < 3 questions
7. Too few image placeholders (< 3)
8. Too few internal links (< 5)
9. Heading level H4+ used
10. Skipped heading levels
11. Multiple H1s
12. Missing required links from plan
13. Hallucinated internal URLs (not in registry)
14. Unauthorized external URLs (not in registry)
15. Missing CTA components (< 3)
16. Video promise in CTA body text
17. CTA title doesn't match canonical name
18. AI answer block duplicates metadata description

**Warnings (PASS):**
1. Word count over target (> 2,400 series / > 4,000 pillar)
2. Word count slightly short (1,600-1,800)
3. FAQ answer too short (< 25 words)
4. FAQ answer too long (> 80 words)
5. Em-dashes found (style forbids)
6. Gendered language found
7. Title too long (> 110 chars)
8. Description word count off target
9. Cover image not before first H2
10. Navigation-only links before FAQ section
11. Too many image/CTA/FAQ items
12. MDX has both metadata export and H1
13. Same anchor text for different URLs
14. TLDR not first H2
15. Only 2 H2 sections

**Info (artifact report):**
- Word count, title length, description word count
- H2 count, FAQ question count, internal link count
- Markdown links + JSX component hrefs counts
- Required links present/total, CTAs present/total
- CTA components found
- Artifact promises (freebie title+body, course title+body)
- Image descriptions (cover + 2 inline)

### Validator fixes applied this session

**Fix 1 — Escaped quotes regex:**
The metadata regex `description:\s*"([^"]+)"` broke on escaped quotes like `\"I see you're upset\"` in description fields, stopping at the first `\"`. Changed to `"((?:[^"\\]|\\.)*)"` which correctly handles backslash-escaped characters. Applied in 3 places: metadata field existence check, description word count, and duplicate description check.

**Fix 2 — Nav link double-duty:**
URLs that appear as both body link types (cross/sibling/quiz) AND nav link types (pillar/prev/next) were falsely flagged for appearing before the FAQ section. Fix computes `nav_only_urls = nav_urls - body_urls` and only checks position of nav-only URLs.

### CTA component architecture (for ConvertKit integration)
Three CTA components exist at `landing/src/components/blog/`:

**FreebieCTA** (`freebie-cta.tsx`):
- Props: eyebrow, title, body, inputPlaceholder, buttonText, fullWidth, variant
- NO href prop — renders an email capture form (Input + Button)
- Currently has `onSubmit={(e) => { e.preventDefault(); }}` — does nothing
- **NEEDS ConvertKit integration**: form submission should subscribe email to category-specific ConvertKit tag/form
- Has `fullWidth` variant used at page level (blog post page renders `<FreebieCTA fullWidth />` at bottom)
- Defaults are hardcoded to tantrum-specific copy (stale — each article overrides via props)

**CourseCTA** (`course-cta.tsx`):
- Props: eyebrow, title, body, buttonText, href, fullWidth, variant
- Has href prop — renders a link button with ArrowRight icon
- Course pages don't exist yet (href like `/course/childhood-anxiety/` will 404)
- External detection: `!href.startsWith("/") && !href.startsWith("#")`

**CommunityCTA** (`community-cta.tsx`):
- Same structure as CourseCTA
- Default href: `https://www.skool.com/steady-parent` (slightly wrong — full URL in link plans is `https://www.skool.com/steady-parent-1727`)

### Blog routing architecture
- Route: `/blog/[category]/[slug]/page.tsx`
- `generateStaticParams()` builds from `blogPosts` array in `posts.ts`
- Page renders: category + date badge, H1 from metadata.title, description from metadata.description, then `<Post />` component
- After article: `<FreebieCTA fullWidth />` (hardcoded — always shows default freebie, not article-specific)
- MDX components from `landing/mdx-components.tsx` provide styling + CTA/Callout components

### Blog post page issue — FreebieCTA at bottom
The blog post page (`landing/src/app/blog/[category]/[slug]/page.tsx` line 57) renders `<FreebieCTA fullWidth />` with no props, meaning it shows default tantrum-specific copy regardless of the article category. This should either:
1. Be removed (articles already contain their own FreebieCTA inline), or
2. Be made category-aware by passing the article's category and looking up canonical CTA data

## Generated Articles — Current State

### 4 articles across 3 categories, all passing validation:

| Slug | Category | Words | Errors | Warnings | Generated |
|------|----------|-------|--------|----------|-----------|
| handle-tantrum-scripts | tantrums | 2,208 | 0 | 0 | 2026-02-07 (re-gen after prompt fixes) |
| bedtime-routines-by-age | sleep | 2,540 | 0 | 3 | 2026-02-07 (before hard limits) |
| childhood-fears-by-age | anxiety | ~2,370 | 0 | 0 | 2026-02-07 (after all fixes) |
| specific-phobias | anxiety | ~2,314 | 0 | 0 | 2026-02-07 (after all fixes) |

Sleep article has 3 warnings because it was generated before the hard limits were added to the prompt. The two anxiety articles (generated after all fixes) have 0 errors and 0 warnings.

The anxiety articles were specifically chosen because they cross-link to each other in the taxonomy (`childhood-fears-by-age` links to `specific-phobias` and vice versa). Both articles correctly include the cross-links, and both use the canonical CTA names ("Childhood Anxiety" for course, "The Worry Time Toolkit" for freebie).

### Registration in posts.ts
All 4 articles + welcome post are registered in `landing/src/content/blog/posts.ts`:
```typescript
blogPosts: BlogPostEntry[] = [
  { meta: { slug: "bedtime-routines-by-age", categorySlug: "sleep", category: "Sleep", ... } },
  { meta: { slug: "handle-tantrum-scripts", categorySlug: "tantrums", category: "Tantrums", ... } },
  { meta: { slug: "childhood-fears-by-age", categorySlug: "anxiety", category: "Anxiety", ... } },
  { meta: { slug: "specific-phobias", categorySlug: "anxiety", category: "Anxiety", ... } },
  { meta: { slug: "welcome", categorySlug: "tools", category: "Tools", ... } },
]
```

### BlogCategory type — all 20 pipeline categories + Tools
```typescript
export type BlogCategory =
  | "Tantrums" | "Aggression" | "Sleep" | "Siblings" | "Anxiety"
  | "Discipline" | "Staying Calm" | "Breaking The Cycle" | "Big Feelings"
  | "Potty Training" | "Eating" | "Screens" | "Social Skills" | "Body Safety"
  | "New Parent" | "Teens" | "Transitions" | "Spirited Kids"
  | "Parenting Approach" | "Parenting Science" | "Tools";
```

## Information Sources
- `research/taxonomy_v3.md` lines 578-603 — course names and URLs for all 20 categories
- Prior worklogs: `.worklogs/2026-02-07-153431-article-generation-system.md`, `.worklogs/2026-02-07-202102-canonical-ctas-and-validator-fixes.md`
- Generated articles from test runs — validated fixes empirically
- `research/production_process.md` — master pipeline doc (updated during this session)

## Open Questions / Future Considerations

### Must do before batch generation
1. **Pillar article testing** — not yet tested. Different structure (series_preview links, 2,500-3,500 words, hub page format). Should test at least one before generating all 245.
2. **FreebieCTA at bottom of blog post page** — currently renders default tantrum copy on every article. Either remove or make category-aware.

### ConvertKit integration (user's stated next priority)
The FreebieCTA component currently has a dead form (`e.preventDefault()` on submit). Next steps:
1. Set up ConvertKit account + forms/tags for each category
2. Wire FreebieCTA form submission to ConvertKit API (likely via Next.js API route)
3. Each article's FreebieCTA uses custom title/body from the article, but the actual form submission needs to know which category freebie to deliver
4. Options: (a) pass a `formId` prop from the MDX, (b) infer category from the page route, (c) use a single ConvertKit form with tags

### Deferred items
- Batch generation script (manual process works, just slower)
- Auto-registration in posts.ts (manual entry per article)
- Phase 8: Cross-article link graph validation (runs once after all 245 generated)
- Phase 9: Blog post packaging
- Image generation (Phase 7.2)

## Key Files for Context

### Pipeline system files
- `research/writer_prompt.md` — THE writer prompt template. All constraints for article generation. Variables: `{{ARTICLE_TITLE}}`, `{{CATEGORY}}`, `{{BODY_LINKS}}`, `{{NAV_LINKS}}`, `{{CTA_COMPONENTS}}`, `{{CTA_CANONICAL}}`, `{{SOURCE_MATERIAL}}`, etc.
- `research/generate_article.py` — prompt assembler (264 lines). Reads template + 5 data sources, populates variables, writes assembled prompt. Key function: `assemble_prompt()`.
- `research/validate_article.py` — post-generation validator (568 lines). Checks structure, links, CTAs, style, CTA title consistency. Returns errors/warnings/info.
- `research/category_ctas.json` — canonical CTA definitions for all 20 categories. Source of truth for course/freebie names and promises.
- `research/article_link_plan.json` — per-article link plans (245 articles). All URLs have `/blog/` prefix.
- `research/source_to_article_assignment.json` — which source extracts feed each article
- `research/production_process.md` — master pipeline documentation (all phases)

### Blog infrastructure files
- `landing/src/content/blog/posts.ts` — BlogCategory type, BlogPostMeta/BlogPostEntry interfaces, blogPosts array, postHref() helper, blogCategories array
- `landing/src/app/blog/[category]/[slug]/page.tsx` — blog post page component. Renders metadata as header, MDX content as body, fullWidth FreebieCTA at bottom.
- `landing/mdx-components.tsx` — MDX component overrides: link styling (blue/purple), heading styles, CTA components (CourseCTA, CommunityCTA, FreebieCTA, Callout)

### CTA components
- `landing/src/components/blog/freebie-cta.tsx` — email capture form, NO href, needs ConvertKit integration
- `landing/src/components/blog/course-cta.tsx` — link button with href to course page
- `landing/src/components/blog/community-cta.tsx` — link button with href to Skool

### Generated articles
- `landing/src/content/blog/posts/handle-tantrum-scripts.mdx`
- `landing/src/content/blog/posts/bedtime-routines-by-age.mdx`
- `landing/src/content/blog/posts/childhood-fears-by-age.mdx`
- `landing/src/content/blog/posts/specific-phobias.mdx`

### Prior worklogs
- `.worklogs/2026-02-07-153431-article-generation-system.md` — initial pipeline build
- `.worklogs/2026-02-07-202102-canonical-ctas-and-validator-fixes.md` — canonical CTA system build (subset of this session)

## Next Steps / Continuation Plan

1. **ConvertKit mailing list integration** (user's stated next priority):
   - Research ConvertKit API for form submission / subscriber creation
   - Design: how to map FreebieCTA in each article to a category-specific ConvertKit form/tag
   - Options: (a) API route at `/api/subscribe` that accepts email + category, (b) ConvertKit's JS embed, (c) direct API call from client
   - Wire up the FreebieCTA component's form `onSubmit` to actually subscribe
   - Consider: the page-level `<FreebieCTA fullWidth />` at the bottom of every blog post — should it show the article's category freebie or be removed?

2. **Fix page-level FreebieCTA** (`landing/src/app/blog/[category]/[slug]/page.tsx` line 57):
   - Currently shows hardcoded default copy on every article
   - Either remove (articles have their own inline FreebieCTA) or pass category-specific props

3. **Test a pillar article** before batch generation:
   - Pick one category (e.g., tantrums pillar)
   - Generate with `generate_article.py`, validate, check series_preview links structure

4. **Batch generation** (when ready):
   - Generate all 245 articles (could parallelize with background agents)
   - Validate all with `validate_article.py landing/src/content/blog/posts/`
   - Auto-register in `posts.ts` (script TBD)
   - Run Phase 8 cross-article link graph validation

5. **Production process status**: Phases 1-5 COMPLETE, Phase 6 COMPLETE (system built + canonical CTAs), Phase 7 IN PROGRESS (4/245 articles generated, validator working). Phases 7.2, 8, 9 NOT STARTED.

# Replicating the Content Pipeline for Another Project

Reference guide for applying the Steady Parent content pipeline to a different niche. This is a template-based approach: fork, gut the content, adjust the types, keep the infrastructure.

## What You Get

The pipeline gives you:
- **Taxonomy-driven content planning** — define categories and articles in JSON, everything flows from there
- **Link plan system** — cross-linking, series navigation, CTA placement, all pre-planned and validated
- **CTA catalog** — per-category CTAs with copy, validated against business rules
- **LLM article generation** — prompt template + source material → Opus → finished MDX, validated automatically
- **Admin dashboard** — spec browser, validation status, link graph, deployment tracking
- **Quiz system** — type-safe quiz definitions with generation prompts and validators

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│  content-plan/          ← YOUR CONTENT (replace)    │
│  article_taxonomy.json, cta_catalog.json, etc.      │
├─────────────────────────────────────────────────────┤
│  content-spec/          ← SCHEMAS + VALIDATORS      │
│  Zod schemas, business rule validators              │
│  (tweak types and rules, keep structure)             │
├─────────────────────────────────────────────────────┤
│  research/*.py          ← GENERATION SCRIPTS        │
│  Prompt assembly, article validation                │
│  (update link/CTA types, keep flow)                 │
├─────────────────────────────────────────────────────┤
│  landing/               ← NEXT.JS APP               │
│  Blog rendering, admin pages, MDX components        │
│  (reskin components, keep routing/admin structure)   │
└─────────────────────────────────────────────────────┘
```

## Step-by-Step Migration

### Phase 1: Define Your Content Plan

This is the real work. Everything else is mechanical.

**1. Categories and articles** (`content-plan/article_taxonomy.json`)
- Define your categories (e.g., "Meal Prep", "Macros", "Recipes" for a nutrition site)
- List all target articles with slugs, URLs, types (pillar vs series)
- This is the master registry — everything references it

**2. Page type constraints** (`content-plan/page_types.json`)
- Define word counts, heading limits, CTA counts, image counts per article type
- Current values: pillar 2500-4000 words, series 1600-2400 words
- Adjust for your niche's content depth

**3. CTA catalog** (`content-plan/cta_catalog.json`)
- Define your product offerings: courses, community, freebies, guides, waitlists
- Per-category CTA copy (eyebrow, title, body, buttonText)
- The CTA types are an enum in `content-spec/src/schemas/cta-catalog.ts` — add/remove types there

**4. Link plans** (`content-plan/article_link_plan.json`)
- Per-article: which articles link to which, with intent descriptions
- Link types: cross, sibling, quiz, series_preview, pillar, prev, next
- CTA assignments: which CTA types appear in each article

**5. Writer prompt** (`content-plan/writer_prompt.md`)
- Rewrite the voice/style section entirely — this IS your brand
- Keep the structural rules (headings, FAQ format, CTA placement, image placeholders)
- Keep the `{{PLACEHOLDER}}` variables — the generation script fills these

**6. Source material** — whatever raw content feeds your articles
- Current: `content/blog/extracts/` with ~965 crawled articles
- Your version: whatever research, notes, expert interviews feed your writer

### Phase 2: Adjust Schemas and Validators

**`content-spec/src/schemas/`**

| File | What to change |
|------|---------------|
| `taxonomy.ts` | Nothing — fully generic |
| `cta-catalog.ts` | Add/remove CTA types in `CtaTypeEnum` |
| `composition.ts` | Nothing — fully generic |
| `parsed-article.ts` | Nothing — fully generic |
| `quiz-output.ts` | Rewrite if your quizzes have different structures |
| `mailing.ts` | Nothing — generic tag/form mapping |

**`content-spec/src/validator/`**

| File | What to change |
|------|---------------|
| `cta.ts` | Replace `FORBIDDEN_TERMS` with your niche's terms. Replace `COMMUNITY_FOUNDER_LINE`. Adjust word count ranges. Update coverage checks for your CTA types. |
| `article.ts` | Nothing — reads constraints from page_types.json |
| `quiz.ts` | Adjust if your quiz types differ |
| `cross-links.ts` | Nothing — generic |

### Phase 3: Adjust Components

**CTA components** (`landing/src/components/blog/`)
- `course-cta.tsx`, `community-cta.tsx`, `freebie-cta.tsx` — rename or reskin
- Same prop interface (eyebrow, title, body, buttonText, href)
- Change default copy, colors, button text
- Add new CTA components if you have different product types

**MDX components** (`landing/mdx-components.tsx`)
- Update imports to match your CTA component names
- Adjust link colors, heading styles to match your brand

**Blog category type** (`landing/src/content/blog/posts.ts`)
- Replace the `BlogCategory` union type with your categories
- Ideally: generate this from `article_taxonomy.json` instead of hardcoding

### Phase 4: Adjust Generation Scripts

**`research/generate_article.py`**
- `_format_body_links()` — update link type list if you added/removed types
- `_format_ctas()` — map your CTA types to your component names
- Word count targets — read from page_types.json (already does this)
- URL pattern — adjust if not `/blog/{category}/{slug}/`

**`research/validate_article.py`**
- `_CTA_COMPONENT_RE` — update regex for your CTA component names
- `_GENDERED_RE` — remove parenting-specific checks, add your own
- Everything else reads from link plan and CTA catalog dynamically

**`research/assemble_one_article_bundle.py`**
- Mostly generic — just reads source assignments and assembles

### Phase 5: Admin Dashboard

The admin pages mostly render whatever the API returns. Changes needed:

- **Link type colors** in `landing/src/app/admin/spec/page.tsx` — update the color map
- **CTA rules display** — update the rules cards to show your CTA types
- Everything else auto-generates from the data

### Phase 6: Email/Mailing Integration

- `content-plan/mailing_tags.json` — define your Kit/ConvertKit tags
- `content-plan/form_tag_mappings.json` — map forms to tags
- These are just data — the validator checks references are valid

## What's Truly Generic (don't touch)

- `content-spec/src/validate-plans.ts` — reads all JSON, runs all validators
- `content-spec/src/parser/mdx-parser.ts` — parses MDX into structured data
- Admin API routes (`landing/src/app/api/admin/`) — load JSON, run validators, return data
- Build script pattern in `landing/package.json` — copies plan files to standalone build
- Image pipeline plan (`research/image_pipeline_plan.md`) — extract prompts, generate, upload, insert

## What's Always Custom

- Your categories and articles (the taxonomy)
- Your voice and style (the writer prompt)
- Your product offerings (CTA types and copy)
- Your source material
- Your quiz designs (if any)
- Your brand colors and typography

## Key Insight

The hard part isn't the code — that's mechanical (swap enum values, update regex, change default copy). The hard part is the **content planning**: defining 200+ articles, figuring out how they link together, writing CTA copy that converts, and tuning a writer prompt that produces consistent quality.

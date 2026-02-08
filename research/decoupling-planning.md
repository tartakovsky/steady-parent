# content-spec: Reusable Content Site Framework

## Feedback Log

### RESOLVED

1. **Article types: add "standalone"** — Not just pillar/series.
2. **CTA types: add "guide"** — Enum: course, community, freebie, guide.
3. **Link type "series_preview"** — Pillar→series links. Distinct from cross, next/prev.
4. **Page types are a registry, not hardcoded** — Articles, quizzes, stories, comparisons, etc. Each gets its own taxonomy. Authored separately, mergeable.
5. **CTAs are standalone entities** — Not coupled to categories. Mapping lives in the link plan.
6. **CTA definitions are generic** — Same shape for all: name, url, type, what_it_is, can_promise, cant_promise. These are INPUT requirements for what the human must provide to the page generator.
7. **Clear separation: prompt inputs vs output validation.**
8. **Mailing list tags** — Tag taxonomy (validates against Kit) + form-to-tags mapping.
9. **Taxonomy entries need consistent convention** — Every entry gets `slug` + `url`. `categorySlug` is optional (standalone articles may not have a category).
10. **CTA url is optional** — Freebie/mailing CTAs may not have a URL.
11. **Range max can be zero** — e.g. no FAQs allowed. Both min and max are nonnegative.
12. **JSON-LD requirements** — Need input schema, prompt, and validation for structured data.
13. **Full pipeline typing** — Every stage of the pipeline is typed: input types → input prompts → inputs → output types → output prompts → outputs → validation types. Each page "part" (article body, CTAs, JSON-LD, quiz, etc.) has its own type and prompt. Composable.
14. **Humans give loose input, agents generate everything typed** — Human says "I have 3 CTAs, roughly like this." Agent takes the schema + a generation prompt and produces the actual typed CTA definitions. This applies to ALL plan data — every plan file needs its own generation prompt so agents can produce it from loose human input.
15. **Landing doesn't depend on content-spec** — Landing just serves pages. The parser/validator are used by admin, which is a separate service. Content-spec is a dependency of admin, not landing.

### SEPARATE TASKS

16. **ConvertKit clients** — Each landing and admin gets its own Kit client. No cross-imports.
17. **Admin dashboard decoupling** — Separate attachable service/package.

---

## Plan

### Context

Reusable framework for content landing sites. Typed plan in, validated site out. Agents can't break the spec because Zod schemas guard every stage of the pipeline.

### Architecture: Typed Pipeline

The pipeline has 3 stages. Each stage has **types** (Zod schemas), **prompts** (what to tell the agent), and **data** (the actual content). Parts are composable — run as one shot or separately.

```
┌─────────────────────────────────────────────────────────┐
│  STAGE 1: PLAN (what the site SHOULD be)                 │
│                                                           │
│  Input Types    → what shape must the plan data have?     │
│  Input Prompts  → how to tell a planning agent to fill it │
│  Input Data     → the actual plan files (human or agent)  │
│                                                           │
│  Taxonomies, CTA catalog, cross-link plan, mailing tags,  │
│  JSON-LD requirements, page type constraints               │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  STAGE 2: GENERATION (producing the content)              │
│                                                           │
│  Output Types   → what shape must each page part have?    │
│  Output Prompts → how to tell a writer agent to produce   │
│                    (composite: article body prompt,        │
│                     CTA prompt, JSON-LD prompt, etc.)      │
│  Output Data    → the actual generated pages              │
│                                                           │
│  Each page type composes different parts:                  │
│    Article = body + CTAs + images + FAQ + JSON-LD          │
│    Quiz    = questions + scoring + result types + JSON-LD  │
│    Story   = narrative + images + JSON-LD                  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  STAGE 3: VALIDATION (plan vs reality)                    │
│                                                           │
│  Parsed Types   → what the parser extracts from deployed  │
│  Validator      → checks parsed output against plan       │
│  Coverage       → X/N deployed, per-category, per-type    │
└─────────────────────────────────────────────────────────┘
```

### Stage 1: Plan Schemas (Input Types)

These define the shape of each plan file. Humans give loose input ("I have 3 courses, a community, and freebies for each category"). An agent uses the schema + a generation prompt to produce the actual typed data. Every plan file has a corresponding generation prompt.

#### Taxonomy Entry Convention

All taxonomy entries follow the same convention:

```typescript
// Every taxonomy entry has at minimum:
//   slug  — the entry's own identifier
//   url   — the full URL path
// Additional fields are content-type-specific.
```

#### Category Schema (reusable)

```typescript
const CategorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
});
```

#### Article Taxonomy

```typescript
const ArticleEntrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  url: z.string().startsWith("/"),
  categorySlug: z.string().optional(),              // standalone articles may have no category
  type: z.enum(["pillar", "series", "standalone"]),
  seriesPosition: z.number().int().positive().optional(),
});

const ArticleTaxonomySchema = z.object({
  categories: z.array(CategorySchema),              // can be empty if all articles are standalone
  entries: z.array(ArticleEntrySchema).min(1),
}).refine(
  (data) => {
    const slugs = new Set(data.categories.map(c => c.slug));
    return data.entries.every(e => !e.categorySlug || slugs.has(e.categorySlug));
  },
  { message: "Every article with a categorySlug must reference a valid category" }
);
```

#### Quiz Taxonomy

```typescript
const QuizEntrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  url: z.string().startsWith("/"),
  connectsTo: z.array(z.string()),                  // category slugs
});

const QuizTaxonomySchema = z.object({
  entries: z.array(QuizEntrySchema),
});
```

#### CTA Catalog

All CTAs are standalone entities. Same shape. Human gives a loose description ("I have a tantrum course, a community on Skool, freebies for each category"). An agent uses the schema + CTA generation prompt to produce the full typed catalog.

```typescript
const CtaTypeEnum = z.enum(["course", "community", "freebie", "guide"]);

const CtaDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: CtaTypeEnum,
  name: z.string(),
  url: z.string().optional(),                        // freebies/mailing CTAs may have no URL
  what_it_is: z.string(),                            // short description of what we are selling
  can_promise: z.array(z.string()),
  cant_promise: z.array(z.string()),
});

const CtaCatalogSchema = z.array(CtaDefinitionSchema);
```

Which CTAs appear on which pages is determined by the link plan.

#### Cross-Link Plan

Standalone file. Every URL in `links[]` must exist in some taxonomy.

```typescript
const LinkTypeEnum = z.enum([
  "series_preview", "pillar", "prev", "next", "cross", "sibling", "quiz"
]);

const PlannedLinkSchema = z.object({
  url: z.string().min(1),
  type: LinkTypeEnum,
  intent: z.string().min(1),
});

const PlannedCtaSchema = z.object({
  url: z.string().nullable(),
  type: CtaTypeEnum,
  intent: z.string().min(1),
});

const LinkPlanEntrySchema = z.object({
  article: z.string().min(1),
  url: z.string().startsWith("/"),
  category: z.string().optional(),
  links: z.array(PlannedLinkSchema),
  ctas: z.array(PlannedCtaSchema),
});

const LinkPlanSchema = z.array(LinkPlanEntrySchema);
```

#### Mailing Tag Taxonomy

```typescript
const MailingTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  kitTagId: z.number().int().optional(),             // filled after sync with Kit
});

const MailingTagTaxonomySchema = z.array(MailingTagSchema);
```

#### Form-to-Tags Mapping

```typescript
const FormTagMappingSchema = z.object({
  formId: z.string(),
  description: z.string(),
  tagIds: z.array(z.string()),                       // references MailingTagSchema.id
});

const FormTagMappingsSchema = z.array(FormTagMappingSchema);
// refine: every tagId references a valid MailingTagSchema.id
```

#### JSON-LD Requirements

Defines what structured data each page type must include. This is input for the generation agent (what to produce) AND for the validator (what to check).

```typescript
const JsonLdFieldSchema = z.object({
  property: z.string(),                              // "@type", "headline", "author.name", etc.
  required: z.boolean(),
  source: z.enum(["metadata", "content", "static"]), // where the value comes from
  staticValue: z.string().optional(),                // if source is "static"
});

const JsonLdRequirementSchema = z.object({
  pageType: z.string(),                              // "article", "quiz", "faq"
  schemaType: z.string(),                            // "Article", "FAQPage", "Quiz"
  fields: z.array(JsonLdFieldSchema),
});

const JsonLdRequirementsSchema = z.array(JsonLdRequirementSchema);
```

#### Page Type Constraints

```typescript
const RangeSchema = z.object({
  min: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),               // 0 means "not allowed"
}).refine(
  (data) => data.max >= data.min,
  { message: "max must be >= min" }
);

const PageTypeSchema = z.object({
  name: z.string(),
  constraints: z.object({
    wordCount: RangeSchema,
    h2Count: RangeSchema,
    ctaCount: RangeSchema,
    imageCount: RangeSchema,
    faqQuestionCount: RangeSchema,
    requiresTldr: z.boolean(),
    requiresFaq: z.boolean(),
    minInternalLinks: z.number().int().nonnegative(),
  }),
});

const PageTypesSchema = z.array(PageTypeSchema).min(1);
```

### Stage 2: Generation (Output Types + Prompts)

Each page type is a composition of **parts**. Each part has its own output type (what shape the agent must produce) and its own prompt section. The generation system assembles the composite prompt and validates the composite output.

#### Page Parts

```
Article page = ArticleBody + CtaComponents + ImagePlaceholders + FaqSection + JsonLd
Quiz page    = QuizDefinition + ResultTypes + JsonLd
Story page   = NarrativeBody + ImagePlaceholders + JsonLd
```

Each part has:
- **Output type** — Zod schema for what the agent must generate for this part
- **Prompt template** — instructions for this part (with {{VARIABLES}})
- **Validator** — checks the generated output matches the type

#### Article Body Output Type

```typescript
const ArticleBodyOutputSchema = z.object({
  metadata: z.object({
    title: z.string(),
    description: z.string().min(40).max(60),         // AI answer block, word count enforced
    date: z.string(),
    category: z.string(),
  }),
  body: z.string(),                                   // the MDX body content
});
```

#### CTA Component Output Type

```typescript
const CtaComponentOutputSchema = z.object({
  type: z.string(),                                   // CourseCTA, CommunityCTA, FreebieCTA
  eyebrow: z.string(),
  title: z.string(),                                  // must match canonical name from CTA catalog
  body: z.string(),
  buttonText: z.string(),
  href: z.string().optional(),
});
```

#### JSON-LD Output Type

```typescript
const JsonLdOutputSchema = z.object({
  schemaType: z.string(),
  data: z.record(z.unknown()),                        // validated against JsonLdRequirementSchema
});
```

#### Composite Page Output

A page type declares which parts it's composed of. The generation system knows which prompt sections to assemble and which output schemas to validate.

```typescript
const PageCompositionSchema = z.object({
  pageType: z.string(),                               // "pillar", "series", "quiz"
  parts: z.array(z.object({
    partType: z.string(),                             // "article-body", "cta-components", "json-ld"
    promptTemplate: z.string(),                       // path to prompt template for this part
    outputSchema: z.string(),                         // reference to which output schema to use
  })),
});
```

### Stage 3: Validation (Parsed Types + Checks)

#### ParsedArticle Schema

What the parser extracts from a deployed page. Single source of truth.

```typescript
const CtaComponentSchema = z.object({
  type: z.string(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  buttonText: z.string().optional(),
  href: z.string().optional(),
});

const ParsedMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  category: z.string(),
});

const ParsedArticleSchema = z.object({
  slug: z.string(),
  metadata: ParsedMetadataSchema,
  wordCount: z.number().int(),
  h2Count: z.number().int(),
  ctaCount: z.number().int(),
  linkCount: z.number().int(),
  internalLinkCount: z.number().int(),
  imageCount: z.number().int(),
  faqQuestionCount: z.number().int(),
  hasTldr: z.boolean(),
  hasFaq: z.boolean(),
  links: z.array(z.object({ anchor: z.string(), url: z.string() })),
  ctaComponents: z.array(CtaComponentSchema),
  imageDescriptions: z.array(z.string()),
  jsonLd: z.record(z.unknown()).optional(),           // parsed JSON-LD if present
});
```

All types derived via `z.infer<>`. Replaces manual interfaces everywhere.

#### Validator

Takes `ParsedArticle` + `LinkPlanEntry` + `PageType` config + `CtaCatalog` + `JsonLdRequirements` → errors/warnings.

Checks:
- Structural constraints (word count, headings, CTAs, images, FAQ) against PageType
- Link plan compliance (all planned links present, no unauthorized URLs)
- CTA title/type matching against catalog
- JSON-LD presence and field completeness
- Coverage analysis (X/N deployed, per-category, per-type)

### Workspace Structure

```
content-spec/
├── package.json
├── tsconfig.json
├── src/
│   ├── schemas/
│   │   ├── taxonomy.ts         ← CategorySchema, ArticleTaxonomySchema, QuizTaxonomySchema
│   │   ├── link-plan.ts        ← LinkPlanSchema, enums
│   │   ├── cta-catalog.ts      ← CtaCatalogSchema, CtaDefinitionSchema
│   │   ├── mailing.ts          ← MailingTagTaxonomySchema, FormTagMappingsSchema
│   │   ├── page-types.ts       ← PageTypesSchema, RangeSchema
│   │   ├── json-ld.ts          ← JsonLdRequirementsSchema
│   │   ├── generation.ts       ← output schemas (ArticleBodyOutput, CtaComponentOutput, etc.)
│   │   ├── parsed-article.ts   ← ParsedArticleSchema (what parser extracts)
│   │   ├── composition.ts      ← PageCompositionSchema (how parts assemble)
│   │   └── index.ts
│   ├── parser/
│   │   ├── mdx-parser.ts       ← moved from landing
│   │   └── index.ts
│   ├── validator/
│   │   ├── article.ts          ← structural + link + CTA + JSON-LD checks
│   │   ├── coverage.ts         ← plan vs reality coverage report
│   │   └── index.ts
│   ├── types.ts                ← z.infer<> re-exports
│   └── index.ts
```

### Data Files (research/, validated by content-spec)

| File | Schema | Purpose |
|------|--------|---------|
| `article_link_plan.json` | LinkPlanSchema | Per-article cross-linking requirements |
| `cta_catalog.json` (rewrite from category_ctas) | CtaCatalogSchema | All CTAs with can/cant promise |
| `article_taxonomy.json` (new) | ArticleTaxonomySchema | Categories + 245 entries |
| `mailing_tags.json` (new) | MailingTagTaxonomySchema | Tags, validated against Kit |
| `form_tag_mappings.json` (new) | FormTagMappingsSchema | Forms → tags |
| `page_types.json` (new) | PageTypesSchema | Structural constraints |
| `quiz_taxonomy.json` (new) | QuizTaxonomySchema | Quiz entries with slugs, URLs, category connections |
| `json_ld_requirements.json` (new) | JsonLdRequirementsSchema | Required structured data per page type |

### Migration

**Moves to content-spec:**

| From | To |
|------|----|
| `landing/src/lib/admin/mdx-parser.ts` | `content-spec/src/parser/mdx-parser.ts` |
| `landing/src/lib/admin/article-validator.ts` | `content-spec/src/validator/article.ts` (refactored) |

**Deleted:**

| File | Reason |
|------|--------|
| `landing/src/lib/admin/types.ts` | Replaced by content-spec types |

**Depends on content-spec:** Admin (once decoupled). NOT landing.

**Changed in landing (temporary, until admin decouples):**

| File | Change |
|------|--------|
| `landing/src/lib/admin/sync-orchestrator.ts` | Import parser + validator from content-spec (moves to admin later) |
| `landing/src/lib/db/schema.ts` | Import types from content-spec for JSONB annotations (moves to admin later) |

### Implementation Phases

#### Phase 1: Scaffold workspace
1. `content-spec/` with package.json, tsconfig.json
2. Add to root workspaces, add zod, npm install

#### Phase 2: Plan schemas (Stage 1 types)
3. taxonomy.ts (Category, Article, Quiz)
4. cta-catalog.ts
5. mailing.ts
6. link-plan.ts
7. page-types.ts
8. json-ld.ts
9. index.ts + types.ts

#### Phase 3: Generation schemas (Stage 2 types)
10. generation.ts (ArticleBodyOutput, CtaComponentOutput, JsonLdOutput)
11. composition.ts (PageComposition — which parts make a page type)

#### Phase 4: Parser + validator (Stage 3)
12. Move mdx-parser.ts, typed output
13. Move article-validator.ts, refactored for PageType + JsonLd config
14. coverage.ts

#### Phase 5: Wire imports (temporary — admin code still in landing)
15. Update sync-orchestrator imports to use content-spec
16. Update schema.ts JSONB annotations to use content-spec types
17. Delete landing/src/lib/admin/types.ts

#### Phase 6: Create data files (agent-generated from loose human input)
18. cta_catalog.json (rewrite from category_ctas.json)
19. article_taxonomy.json (from taxonomy_v3.md)
20. quiz_taxonomy.json
21. mailing_tags.json, form_tag_mappings.json
22. page_types.json, json_ld_requirements.json

#### Phase 7: Validate
23. Script to run all schemas against real data
24. Verify admin sync works with new imports

### Open Questions

1. **Parser generalization** — Current parser is MDX-specific. Other formats needed?
2. **Admin decoupling** — Separate task.
3. **Kit client decoupling** — Separate task.
4. **Prompt template storage** — Do prompt templates live in content-spec or in research/?

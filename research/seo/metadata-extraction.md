# Metadata Extraction Schemas

This document defines the data structures and pipeline for the "Steady Parent" SEO metadata workflow: raw article markdown in, SEO metadata out.

## 1. AI Extraction Schema (Source Data)
This is the strict JSON object the AI Agent must extract from the raw article text. The agent does not invent facts or assets and does not emit any deterministic fields.

```typescript
import { z } from "zod";

export const AiExtractionSchema = z.object({
  // --- CORE IDENTITY ---
  slug: z
    .string()
    .describe("SEO-friendly slug derived from the content. Lowercase, hyphens, max 3-5 words."),
  primary_keyword: z.string().describe("The main topic/keyword extracted from the content."),
  category: z
    .string()
    .describe("The most fitting category (e.g., Behavior, Sleep, Development, Emotional Health)."),

  // --- SEO METADATA ---
  meta_title: z.string().max(60).describe("Optimized title tag (Keyword + Hook). Max 60 chars."),
  meta_description: z
    .string()
    .max(105)
    .describe("Optimized meta description (Value prop). Max 105 chars."),
  headline: z
    .string()
    .max(110)
    .describe("The visible H1 hook title. Maps to JSON-LD 'headline'."),

  // --- STRUCTURED DATA BLOCKS ---
  ai_answer: z
    .string()
    .describe("EXACTLY 40-60 words. Dense, self-contained summary for AI citation."),
  faq_items: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string().describe("40-60 words. Direct answer."),
      })
    )
    .min(3)
    .max(5)
    .describe("3-5 FAQs extracted or generated from content."),

  // --- OPTIONAL STRUCTURED BLOCKS ---
  howto_schema: z
    .object({
      title: z.string(),
      supplies: z.array(z.string()),
      steps: z.array(
        z.object({
          name: z.string(),
          text: z.string(),
        })
      ),
    })
    .optional(),

  // --- KEYWORDS ---
  keywords: z.array(z.string()).min(3).max(5).describe("3-5 relevant keywords for Schema."),

});
```

## 2. Deterministic Data Schema (System Input)
This is the data provided by the codebase, config files, or external tools (like the Vision Agent). The AI Extraction Agent does not touch this and must not guess any of it.

```typescript
export const DeterministicDataSchema = z.object({
  // --- DATES (From Git/CMS) ---
  published_date: z.string().datetime().describe("ISO 8601 format."),
  modified_date: z.string().datetime().describe("ISO 8601 format."),
  
  // --- METRICS (Computed) ---
  word_count: z.number().int().describe("Computed word count of the body text."),
  
  // --- AUTHORSHIP (From Config based on Category) ---
  author: z.object({
    name: z.string(),
    title: z.string().describe("Niche-specific job title (e.g., 'Certified Sleep Consultant')."),
    url: z.string().describe("Link to author bio page."),
    sameAs: z.array(z.string()).describe("Social profiles.")
  }),
  
  // --- PUBLISHER (Static Config) ---
  publisher: z.object({
    name: z.string(),
    logo_url: z.string()
  }),

  // --- ASSETS (From Vision Pipeline) ---
  featured_image: z.object({
    url: z.string().describe("Absolute URL to the optimized image."),
    alt_text: z.string().describe("Used for og:image:alt or accessibility if needed.")
  }),

  // --- CANONICAL & SITE DATA (From Config) ---
  canonical_base_url: z.string().describe("Site base URL used to build canonicals and OG URLs."),
  site_name: z.string().describe("Brand name for Open Graph and meta tags."),

});
```

## 3. SEO Metadata Schema (Merged Output)
This is the final object consumed by the SEO metadata generator (meta tags + JSON-LD). It is the union of the extracted and deterministic data.

```typescript
export const SeoMetadataSchema = AiExtractionSchema.merge(DeterministicDataSchema).extend({
  // Cleaned markdown body is passed through for word count and validation only
  markdown_body: z.string()
});

export type SeoMetadata = z.infer<typeof SeoMetadataSchema>;
```

## 4. Pipeline (Raw Markdown -> SEO Metadata)
The pipeline is deterministic after the AI extraction step. The output is a single SEO metadata object.

1. Ingest raw article markdown (no front matter).
2. AI extraction step:
   - Input: raw markdown
   - Output: `AiExtractionSchema` only
   - Strict JSON schema validation, reject on mismatch.
3. Deterministic enrichment:
   - Word count from markdown body.
   - Dates from git history or CMS.
   - Author/publisher from config by category.
   - Featured image from vision pipeline or editor.
   - Canonical base URL + site name from config.
4. Merge into `SeoMetadata`.
5. SEO metadata generator renders:
   - Meta tags (title/description/OG/Twitter/canonical).
   - JSON-LD (Article + FAQPage + BreadcrumbList).

## 5. Guardrails and Mistake Fixes
This section captures corrections to the previous plan and constraints the agent must follow.

- No front matter. The agent produces only strict JSON.
- The agent does not invent assets, dates, author info, or URLs.
- FAQ count is 3-5 (not unlimited).
- `headline` max set to 110 characters (aligns with best practice stated in SEO doc).
- If `howto_schema` is present, it must align with visible page content.
- All JSON-LD is generated from `SeoMetadata`, not from raw markdown.
- For Article JSON-LD, prefer `image` as an array of URLs (recommended by Google). Only use `ImageObject` if you intentionally want to provide width/height metadata.

## 6. Image Metadata Decision (SEO-Only)
This pipeline is about SEO metadata, not page rendering. The image fields exist only to populate Open Graph/Twitter and JSON-LD.

**What Google documents for Article structured data:**
- The `image` field is recommended and can be a repeated field of URLs or ImageObjects.
- Google’s examples show URL arrays for `image`.

**Decision:**
- Use **URL array** for JSON-LD `image` to avoid width/height requirements.
- Keep **featured_image.url** for OG/Twitter + JSON-LD.
- Keep **featured_image.alt_text** only if you output `og:image:alt`.

Reference: https://developers.google.com/search/docs/appearance/structured-data/article


## 7. Extraction Implementation
Uses OpenAI structured output with Zod. The `zodResponseFormat` helper converts Zod → JSON Schema automatically.

```typescript
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { AiExtractionSchema } from "./schemas";

const client = new OpenAI();

export async function extractSeoMetadata(articleMarkdown: string) {
  const completion = await client.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content:
          "You are an SEO metadata extraction agent for parenting articles. Derive all values from the article text. Never invent external sources, dates, URLs, or images.",
      },
      {
        role: "user",
        content: `Extract SEO metadata from this article.

Rules:
- ai_answer: exactly 40-60 words, self-contained summary
- Each FAQ answer: exactly 40-60 words
- slug: 3-5 words, lowercase, hyphen-separated
- If the article has no step-by-step instructions, leave howto_schema null

Article:
${articleMarkdown}`,
      },
    ],
    response_format: zodResponseFormat(AiExtractionSchema, "seo_metadata"),
  });

  return completion.choices[0].message.parsed;
}
```

**Post-validation (word counts not enforceable in JSON Schema):**
- `ai_answer` word count: 40–60
- FAQ answer word count: 40–60 each

## 8. JSON-LD Generation with schema-dts
Use Google's `schema-dts` library for type-safe JSON-LD generation. It provides TypeScript types for all Schema.org vocabulary.

**Install:**
```bash
npm install schema-dts
```

**Why schema-dts:**
- TypeScript definitions for all Schema.org types (Article, FAQPage, Person, Organization, etc.)
- Compile-time validation via TypeScript (wrong property names or types cause errors)
- IDE autocomplete for all properties
- No runtime overhead (types only)

**Usage example:**

```typescript
import type { Article, FAQPage, WithContext, Graph } from "schema-dts";
import type { SeoMetadata } from "./schemas";

export function buildJsonLd(data: SeoMetadata): WithContext<Graph> {
  const canonicalUrl = `${data.canonical_base_url}/${data.slug}/`;

  const article: Article = {
    "@type": "Article",
    "@id": `${canonicalUrl}#article`,
    headline: data.headline,
    description: data.ai_answer,
    image: [data.featured_image.url],
    datePublished: data.published_date,
    dateModified: data.modified_date,
    wordCount: data.word_count,
    articleSection: data.category,
    keywords: data.keywords,
    author: {
      "@type": "Person",
      "@id": `${data.canonical_base_url}/about/#author`,
      name: data.author.name,
      url: data.author.url,
      jobTitle: data.author.title,
      sameAs: data.author.sameAs,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${data.canonical_base_url}/#organization`,
      name: data.publisher.name,
      logo: {
        "@type": "ImageObject",
        url: data.publisher.logo_url,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  const faqPage: FAQPage = {
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    mainEntity: data.faq_items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [article, faqPage],
  };
}
```

**Key points:**
- `WithContext<T>` wraps any schema type with `@context`
- `Graph` allows multiple schema objects in `@graph`
- TypeScript catches invalid property names or types at compile time
- No runtime validation needed since data comes from our own pipeline

Reference: https://github.com/google/schema-dts

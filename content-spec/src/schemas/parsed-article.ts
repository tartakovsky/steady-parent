import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Stage 3: What the parser extracts from deployed content
// Single source of truth for parsed article structure.
// ---------------------------------------------------------------------------

export const CtaComponentSchema = z.object({
  type: z.string(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  buttonText: z.string().optional(),
  href: z.string().optional(),
});

export const ParsedMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  category: z.string(),
});

export const ParsedArticleSchema = z.object({
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
  jsonLd: z.record(z.string(), z.unknown()).optional(),
});

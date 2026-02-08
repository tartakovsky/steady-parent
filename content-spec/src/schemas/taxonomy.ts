import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

export const CategorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Article taxonomy
// ---------------------------------------------------------------------------

export const ArticleTypeEnum = z.enum(["pillar", "series", "standalone"]);

export const ArticleEntrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  url: z.string().startsWith("/"),
  categorySlug: z.string().optional(),
  type: ArticleTypeEnum,
  seriesPosition: z.number().int().positive().optional(),
});

export const ArticleTaxonomySchema = z
  .object({
    categories: z.array(CategorySchema),
    entries: z.array(ArticleEntrySchema).min(1),
  })
  .refine(
    (data) => {
      const slugs = new Set(data.categories.map((c) => c.slug));
      return data.entries.every(
        (e) => !e.categorySlug || slugs.has(e.categorySlug),
      );
    },
    {
      message:
        "Every article with a categorySlug must reference a valid category",
    },
  );

// ---------------------------------------------------------------------------
// Quiz taxonomy
// ---------------------------------------------------------------------------

export const QuizEntrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  url: z.string().startsWith("/"),
  connectsTo: z.array(z.string()),
});

export const QuizTaxonomySchema = z.object({
  entries: z.array(QuizEntrySchema),
});

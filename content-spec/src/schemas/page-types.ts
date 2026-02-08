import { z } from "zod/v4";

export const RangeSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
  })
  .refine((data) => data.max >= data.min, {
    message: "max must be >= min",
  });

export const PageTypeSchema = z.object({
  name: z.string().min(1),
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

export const PageTypesSchema = z.array(PageTypeSchema).min(1);

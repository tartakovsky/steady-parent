import { z } from "zod/v4";

export const LinkTypeEnum = z.enum([
  "series_preview",
  "pillar",
  "prev",
  "next",
  "cross",
  "sibling",
  "quiz",
]);

// Link plan CTA types include freebie (appears on article pages) even though
// freebie is a mailing form, not a CTA — the link plan tracks all page-level
// call-to-action placements regardless of implementation type.
export const PlannedCtaTypeEnum = z.enum(["course", "community", "freebie"]);

export const PlannedLinkSchema = z.object({
  url: z.string().min(1),
  type: LinkTypeEnum,
  intent: z.string().min(1),
});

export const PlannedCtaSchema = z.object({
  url: z.string().nullable(),
  type: PlannedCtaTypeEnum,
  intent: z.string().min(1),
});

export const LinkPlanEntrySchema = z.object({
  article: z.string().min(1),
  url: z.string().startsWith("/"),
  category: z.string().optional(),
  links: z.array(PlannedLinkSchema),
  ctas: z.array(PlannedCtaSchema),
});

export const LinkPlanSchema = z.array(LinkPlanEntrySchema);

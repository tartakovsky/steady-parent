import { z } from "zod/v4";
import { CtaTypeEnum } from "./cta-catalog";

export const LinkTypeEnum = z.enum([
  "series_preview",
  "pillar",
  "prev",
  "next",
  "cross",
  "sibling",
  "quiz",
]);

export const PlannedLinkSchema = z.object({
  url: z.string().min(1),
  type: LinkTypeEnum,
  intent: z.string().min(1),
});

export const PlannedCtaSchema = z.object({
  url: z.string().nullable(),
  type: CtaTypeEnum,
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

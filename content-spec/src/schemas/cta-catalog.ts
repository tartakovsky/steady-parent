import { z } from "zod/v4";

export const CtaTypeEnum = z.enum(["course", "community", "freebie", "guide"]);

export const CtaCopySchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  buttonText: z.string().min(1),
});

export const CtaDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: CtaTypeEnum,
  name: z.string().min(1),
  url: z.string().optional(),
  what_it_is: z.string().min(1),
  founder_presence: z.string().optional(),
  cta_copy: CtaCopySchema.optional(),
  can_promise: z.array(z.string()),
  cant_promise: z.array(z.string()),
});

export const CtaCatalogSchema = z.array(CtaDefinitionSchema);

import { z } from "zod/v4";
import { CtaCopySchema } from "./cta-catalog";

export const MailingFormTypeEnum = z.enum(["freebie", "waitlist", "quiz-gate"]);

export const MailingFormEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: MailingFormTypeEnum,
  name: z.string().min(1),
  what_it_is: z.string().min(1).optional(),
  pageUrlPattern: z.string().min(1),
  endpoint: z.string().min(1),
  tags: z.array(z.string()).min(1),
  cta_copy: CtaCopySchema.optional(),
});

export const MailingFormCatalogSchema = z.array(MailingFormEntrySchema);

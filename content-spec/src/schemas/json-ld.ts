import { z } from "zod/v4";

export const JsonLdFieldSchema = z.object({
  property: z.string().min(1),
  required: z.boolean(),
  source: z.enum(["metadata", "content", "static"]),
  staticValue: z.string().optional(),
});

export const JsonLdRequirementSchema = z.object({
  pageType: z.string().min(1),
  schemaType: z.string().min(1),
  fields: z.array(JsonLdFieldSchema),
});

export const JsonLdRequirementsSchema = z.array(JsonLdRequirementSchema);

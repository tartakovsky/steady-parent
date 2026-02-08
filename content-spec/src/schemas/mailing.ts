import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Mailing tag taxonomy — what tags must exist on the mailing provider
// ---------------------------------------------------------------------------

export const MailingTagSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kitTagId: z.number().int().optional(),
});

export const MailingTagTaxonomySchema = z.array(MailingTagSchema);

// ---------------------------------------------------------------------------
// Form-to-tags mapping — which email collection points create which tags
// ---------------------------------------------------------------------------

export const FormTagMappingSchema = z.object({
  formId: z.string().min(1),
  description: z.string().min(1),
  tagIds: z.array(z.string().min(1)),
});

export const FormTagMappingsSchema = z.array(FormTagMappingSchema);

/**
 * Validate that every tagId in the form mappings references a valid tag.
 * Call this after parsing both files.
 */
export function validateFormTagRefs(
  tags: z.infer<typeof MailingTagTaxonomySchema>,
  mappings: z.infer<typeof FormTagMappingsSchema>,
): string[] {
  const validIds = new Set(tags.map((t) => t.id));
  const errors: string[] = [];
  for (const mapping of mappings) {
    for (const tagId of mapping.tagIds) {
      if (!validIds.has(tagId)) {
        errors.push(
          `Form "${mapping.formId}" references unknown tag "${tagId}"`,
        );
      }
    }
  }
  return errors;
}

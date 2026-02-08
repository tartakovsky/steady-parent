import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Page composition — which parts make up a page type
// ---------------------------------------------------------------------------

export const PagePartSchema = z.object({
  partType: z.string().min(1),
  promptTemplate: z.string().min(1),
  outputSchema: z.string().min(1),
});

export const PageCompositionSchema = z.object({
  pageType: z.string().min(1),
  parts: z.array(PagePartSchema).min(1),
});

export const PageCompositionsSchema = z.array(PageCompositionSchema);

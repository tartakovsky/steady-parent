import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Kit integration spec — defines expected setup for all email forms
// (quiz email gates + blog freebie forms)
// ---------------------------------------------------------------------------

export const FrontendCheckSchema = z.object({
  file: z.string().min(1),
  requiredProps: z.array(z.string().min(1)).optional(),
  requiredPatterns: z.array(z.string().min(1)).optional(),
});

export const QuizSubscribeFlowSchema = z.object({
  description: z.string().min(1),
  requiredTags: z.array(z.string().min(1)),
  tagPrefix: z.string().min(1),
  customFieldOnSubmit: z.string().min(1),
});

export const BlogFreebieFlowSchema = z.object({
  description: z.string().min(1),
  requiredTags: z.array(z.string().min(1)),
  tagPrefix: z.string().min(1),
});

export const KitIntegrationSpecSchema = z.object({
  customFields: z.array(z.string().min(1)),
  subscriberApiRoutes: z.record(z.string(), z.string().min(1)),
  localStorageKey: z.string().min(1),
  quizSubscribeFlow: QuizSubscribeFlowSchema,
  blogFreebieFlow: BlogFreebieFlowSchema,
  frontendChecks: z.record(z.string(), FrontendCheckSchema),
});

export type KitIntegrationSpec = z.infer<typeof KitIntegrationSpecSchema>;

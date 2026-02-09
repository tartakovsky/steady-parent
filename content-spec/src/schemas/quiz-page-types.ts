import { z } from "zod/v4";

import { RangeSchema } from "./page-types";

export const QuizTypeEnum = z.enum(["likert", "identity", "assessment"]);

export const QuizPageTypeSchema = z.object({
  name: QuizTypeEnum,
  constraints: z.object({
    statementCount: RangeSchema.optional(), // likert only
    questionCount: RangeSchema.optional(), // identity + assessment
    dimensionCount: RangeSchema.optional(), // likert
    typeCount: RangeSchema.optional(), // identity
    domainCount: RangeSchema.optional(), // assessment
    scalePoints: z.number().int().optional(), // likert
    optionsPerQuestion: RangeSchema,
    requiresSources: z.boolean(),
    requiresIntro: z.boolean(),
  }),
});

export const QuizPageTypesSchema = z.array(QuizPageTypeSchema).min(1);

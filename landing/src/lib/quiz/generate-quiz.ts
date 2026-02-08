/**
 * Quiz Generation via LLM
 *
 * Uses the OpenRouter client with Claude Opus to generate complete
 * quiz data that conforms to our Zod schema via structured output.
 *
 * NOTE: The structured output path (responseSchema) is broken because
 * ReadinessQuizDataSchema uses .refine() which produces ZodEffects that
 * zod-to-json-schema can't serialize. Use scripts/generate-one-quiz.ts
 * for actual generation (calls API directly, validates with Zod afterward).
 *
 * Prompts live in quiz-prompt.ts (single source of truth).
 */

import { QuizDataSchema, type QuizDataFromSchema } from "./quiz-schema";
import { buildSystemPrompt, buildUserPrompt, type QuizDef } from "./quiz-prompt";

export type GenerateQuizInput = QuizDef;

const MODEL = "anthropic/claude-opus-4-6";

export async function generateQuiz(
  input: GenerateQuizInput,
  apiKey?: string
): Promise<QuizDataFromSchema> {
  const key = apiKey ?? process.env["OPENROUTER_API_KEY"];
  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY is required. Pass it directly or set it in .env.local"
    );
  }

  // Dynamic import — the clients/ package lives outside the landing/ root
  // and isn't available during Next.js build on Railway.
  // @ts-ignore — module is outside the deploy root on Railway
  const { OpenRouterLLMClient } = await import("../../../../clients/openrouter");
  const client = new OpenRouterLLMClient(key);

  const result = await client.ask({
    model: MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(input) },
    ],
    responseSchema: QuizDataSchema,
    schemaName: "QuizData",
  });

  return result;
}

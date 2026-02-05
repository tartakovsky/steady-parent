/**
 * Quiz Generation via LLM
 *
 * Uses the OpenRouter client with Claude Opus to generate complete
 * quiz data that conforms to our Zod schema via structured output.
 *
 * Usage:
 *   const quiz = await generateQuiz({
 *     topic: "Is my toddler ready for preschool?",
 *     description: "Assessment covering social, academic, and emotional readiness",
 *     domainCount: 3,
 *     questionCount: 10,
 *   });
 */

import { OpenRouterLLMClient } from "../../../../clients/openrouter";
import { QuizDataSchema, type QuizDataFromSchema } from "./quiz-schema";

export interface GenerateQuizInput {
  /** Topic in question form, e.g. "Is my baby ready for solid foods?" */
  topic: string;
  /** Brief description of what the quiz assesses */
  description: string;
  /** Number of scoring domains (2-5) */
  domainCount: number;
  /** Number of questions (5-20) */
  questionCount: number;
  /** Target age range if applicable */
  ageRange?: { min: number; max: number; unit: string };
  /** Specific domains to include (optional — LLM will choose if omitted) */
  suggestedDomains?: string[];
  /** Additional context or requirements for the LLM */
  additionalContext?: string;
}

const MODEL = "anthropic/claude-opus-4-6";

function buildSystemPrompt(): string {
  return `You are an expert child development researcher who creates evidence-based parenting assessment quizzes.

You produce quiz data as structured JSON. Every quiz must:
1. Be grounded in published research (AAP, WHO, peer-reviewed journals)
2. Use warm, non-judgmental language — parents should feel supported, not tested
3. Have clear scoring domains with meaningful thresholds
4. Include result templates that are encouraging regardless of score
5. Provide actionable next steps, not generic advice

Scoring rules:
- Each question has 2-4 options with points ranging from 0 to the max for that question
- Every question MUST have at least one 0-point option (the "not yet" answer)
- The highest-point option should reflect the strongest readiness signal
- Domain maxPoints must equal the sum of max points per question in that domain
- Result score ranges must cover 0 to the total max score with no gaps or overlaps
- Result ranges go from min (inclusive) to max (inclusive)

Content rules:
- Questions should be observable behaviors, not parent opinions
- Subtext should clarify what to look for
- Domain content should explain what each level means practically
- "watchOutFor" should be a thoughtful nuance, not a warning
- "encouragement" should be warm and specific to the result level
- Sources must be real, verifiable URLs`;
}

function buildUserPrompt(input: GenerateQuizInput): string {
  const parts = [
    `Create a complete quiz for the topic: "${input.topic}"`,
    `Description: ${input.description}`,
    `Number of domains: ${input.domainCount}`,
    `Number of questions: ${input.questionCount}`,
  ];

  if (input.ageRange) {
    parts.push(
      `Target age range: ${input.ageRange.min}-${input.ageRange.max} ${input.ageRange.unit}`
    );
  }

  if (input.suggestedDomains?.length) {
    parts.push(`Suggested domains: ${input.suggestedDomains.join(", ")}`);
  }

  if (input.additionalContext) {
    parts.push(`Additional context: ${input.additionalContext}`);
  }

  parts.push(
    "",
    "Generate the complete quiz JSON. Make sure:",
    "- meta.questionCount matches the actual number of questions",
    "- All question domain IDs match keys in the domains record",
    "- domainContent has entries for every domain at every level (high, medium, low)",
    "- Score ranges in results cover exactly 0 to the sum of all domain maxPoints",
    "- Every question has at least one 0-point option",
    "- Use a URL-friendly slug (lowercase, hyphens) for meta.slug",
    "- Include 2-3 real research sources with valid URLs"
  );

  return parts.join("\n");
}

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

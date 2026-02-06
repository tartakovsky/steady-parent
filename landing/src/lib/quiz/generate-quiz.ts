/**
 * Quiz Generation via LLM
 *
 * Uses the OpenRouter client with Claude Opus to generate complete
 * quiz data that conforms to our Zod schema via structured output.
 *
 * Each quiz is adapted from validated psychometric instruments identified
 * in the research brief. The research brief is REQUIRED — we never
 * invent quiz content from scratch.
 */

import { QuizDataSchema, type QuizDataFromSchema } from "./quiz-schema";

export interface GenerateQuizInput {
  /** Topic in question form, e.g. "Is my baby ready for solid foods?" */
  topic: string;
  /** Brief description of what the quiz assesses */
  description: string;
  /** Number of scoring domains (2-5) */
  domainCount: number;
  /** Number of questions (8-15) */
  questionCount: number;
  /** Who/what the quiz assesses — drives all pronoun/framing choices in content */
  subject: "your child" | "your family" | "you as a parent";
  /** The research brief for this quiz topic — validated instruments, domains, items */
  researchBrief: string;
  /** Target age range if applicable */
  ageRange?: { min: number; max: number; unit: string };
  /** Specific domains to include (mapped from validated instrument subscales) */
  suggestedDomains?: string[];
  /** Additional context or requirements */
  additionalContext?: string;
}

const MODEL = "anthropic/claude-opus-4-6";

function buildSystemPrompt(): string {
  return `You are an expert child development researcher who adapts validated psychometric instruments into engaging parenting assessment quizzes.

You produce quiz data as structured JSON. Every quiz is adapted from real, published instruments — never invented from scratch.

## DOMAIN NAMING (CRITICAL)

Domain names are inserted into UI sentences like "Your strongest area is [domain name]" and "needs more time with [domain name]." They MUST be short noun phrases that work grammatically in those contexts.

GOOD domain names: "Physical Readiness", "Media Environment", "Screen Motivation", "Social Skills", "Emotional Regulation", "Content Quality", "Family Flexibility"
BAD domain names: "Why Screens Come Out", "How Screens Fit In", "Is Your Child Ready", "What Happens at Bedtime"

Rule: 1-3 words, noun phrase, works in "strong [name]" and "developing [name]".

## QUESTION DESIGN

- Each option describes a CONCRETE situation a real family would recognize — a specific scene, not a vague frequency
- Options must capture WHO is driving the behavior. If parents initiate screen use, the option says "I hand them a screen" not "they watch screens." If the child initiates, say so.
- NEVER use severity/frequency scales (always/sometimes/rarely/never). Every option is a distinct scenario.
- Each question cites which validated instrument it adapts from in the "source" field
- 3-5 options per question, points 0 to 3. Every question has exactly one 0-point option.

## DOMAIN CONTENT LEVELS (CRITICAL — READ CAREFULLY)

The score bar shows the numerical score prominently (e.g., "6/9"). The text must match what that score looks like visually.

**HIGH** (top ~25% of range): Celebrate what's working. Name the specific positive pattern. Include a "strength" field.

**MEDIUM** (middle ~40% of range): This person scored 50-75%. That's a solid B. The text MUST:
  - Open by acknowledging what IS working at this level — they got more right than wrong
  - Then note what could improve
  - Tone: "You're doing well here, and here's what would make it even better"
  - NEVER frame medium as "it's bad but common" or describe only what's lacking
  Include a "concern" field framed as a specific, actionable next step (not a problem statement).

**LOW** (bottom ~35% of range): Gentle, normalizing, concrete direction. Include a "concern" field framed as opportunity.

## RESULT TEMPLATES

- Headlines and text MUST match the quiz topic. A screen quiz says "Balanced Screen Use" not "Green Light." A burnout quiz says "Running on Fumes" not "Not Yet Ready."
- "comparativeContext" must cite what research shows about families in this score range — specific, not filler
- "shareableSummary" is a standalone sentence summarizing the result WITHOUT cramming domain names into it. It should read naturally, like something you'd text a friend: "Your family has a pretty healthy screen balance — intentional about when and why screens come out, with room to tighten up the environment."

## SUBJECT AWARENESS

The input specifies the quiz subject: "your child", "your family", or "you as a parent".
ALL content must use the correct subject:
- Strength text about a family quiz → "Your family has genuine flexibility around screens"
- NOT: "Your child shines at screen flexibility" (wrong subject)
- Domain detail about a parent quiz → "You have strategies beyond screens for hard moments"
- NOT: "Your child has strategies" (wrong subject)

## SCORING

- Each question: 3-5 options, points 0 to 3
- Every question MUST have exactly one 0-point option
- Domain maxPoints = sum of max option points for that domain's questions
- Result score ranges cover 0 to totalMax with no gaps or overlaps (inclusive)
- 3 result tiers: top tier ~75-100%, middle ~40-74%, bottom ~0-39%

## SOURCES

- meta.sources: 3-5 validated instruments with real PubMed/DOI URLs
- Each question's "source" field names which instrument it adapts from`;
}

function buildUserPrompt(input: GenerateQuizInput): string {
  const parts = [
    `Create a complete quiz for the topic: "${input.topic}"`,
    `Description: ${input.description}`,
    `Quiz subject (use this for all pronouns and framing): ${input.subject}`,
    `Number of domains: ${input.domainCount}`,
    `Number of questions: ${input.questionCount}`,
  ];

  if (input.ageRange) {
    parts.push(
      `Target age range: ${input.ageRange.min}-${input.ageRange.max} ${input.ageRange.unit}`
    );
  }

  if (input.suggestedDomains?.length) {
    parts.push(
      `Domains (mapped from validated instrument subscales): ${input.suggestedDomains.join(", ")}`
    );
  }

  if (input.additionalContext) {
    parts.push(`\nAdditional context: ${input.additionalContext}`);
  }

  parts.push(
    "",
    "## Research Brief",
    "",
    "The following research brief describes validated instruments for this topic.",
    "You MUST adapt questions from these instruments — do not invent questions.",
    "Map your domains to the instrument subscales described below.",
    "",
    input.researchBrief,
    "",
    "## Output Requirements",
    "",
    "Generate the complete quiz JSON. Verify before outputting:",
    "- meta.questionCount matches the actual number of questions",
    "- All question domain IDs exist in the domains record",
    "- Domain names are 1-3 word noun phrases (NOT questions or clauses)",
    "- domainContent exists for every domain at every level (high, medium, low)",
    "- Medium-level content acknowledges what's working BEFORE noting what could improve",
    "- Score ranges cover exactly 0 to sum of all domain maxPoints, no gaps",
    "- Every question has exactly one 0-point option",
    "- All pronouns and framing match the quiz subject specified above",
    "- shareableSummary in each result reads as a natural standalone sentence",
    "- Sources are real, verifiable URLs from published research"
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

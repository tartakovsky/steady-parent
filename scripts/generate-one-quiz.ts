/**
 * Generate a single quiz via OpenRouter + Zod validation.
 * Supports both Readiness (Type A) and Identity (Type B) quizzes.
 *
 * Usage:
 *   export $(grep OPENROUTER_API_KEY .env.local)
 *   npx tsx scripts/generate-one-quiz.ts <quiz-key>
 *
 * Quiz definitions are in READINESS_QUIZZES and IDENTITY_QUIZZES below.
 */
import { writeFileSync } from "fs";
import { ReadinessQuizDataSchema, IdentityQuizDataSchema, LikertQuizDataSchema } from "../landing/src/lib/quiz/quiz-schema";
import {
  buildSystemPrompt, buildUserPrompt, type QuizDef,
  buildIdentitySystemPrompt, buildIdentityUserPrompt, type IdentityQuizDef,
  buildLikertSystemPrompt, buildLikertUserPrompt, type LikertQuizDef,
} from "../landing/src/lib/quiz/quiz-prompt";

const READINESS_QUIZZES: Record<string, QuizDef> = {
  "parenting-battery": {
    slug: "parenting-battery",
    topic: "How's Your Parenting Battery Right Now?",
    description:
      "A check-in on the parent's own reserves: energy, emotional connection with their kids, sense of identity, and recovery/support system. Based on parental burnout research (Roskam et al., Mikolajczak & Roskam).",
    domainCount: 4,
    questionCount: 10,
    suggestedDomains: [
      "Energy",
      "Connection",
      "Identity",
      "Recovery",
    ],
    additionalContext:
      "This quiz is about the PARENT, not the child. Subject is 'you'. Questions should describe concrete daily situations parents recognize — morning energy, bedtime, patience with kids, sense of self, support system. Use the Parental Burnout Assessment (PBA) and Balance Between Risks and Resources (BR2) frameworks as evidence base. Score label should be 'Battery'. Include 3 or 4 result tiers.",
  },
  "solid-foods-readiness": {
    slug: "solid-foods-readiness",
    topic: "Is Your Baby Ready for Solid Foods?",
    description:
      "Assessment covering oral motor readiness, interest signals, digestive readiness, and sitting stability. For babies 4-8 months.",
    domainCount: 4,
    questionCount: 9,
    ageRange: { min: 4, max: 8, unit: "months" },
    suggestedDomains: [
      "Oral Motor Skills",
      "Interest Signals",
      "Digestive Readiness",
      "Sitting Stability",
    ],
  },
  "potty-training-readiness": {
    slug: "potty-training-readiness",
    topic: "Is My Toddler Ready for Potty Training?",
    description:
      "Assessment of physical readiness, cognitive awareness, and emotional readiness for potty training. Based on AAP guidelines.",
    domainCount: 3,
    questionCount: 10,
    ageRange: { min: 18, max: 42, unit: "months" },
    suggestedDomains: [
      "Physical Readiness",
      "Cognitive Awareness",
      "Emotional & Social Readiness",
    ],
  },
  "kindergarten-readiness": {
    slug: "kindergarten-readiness",
    topic: "Is Your Child Ready for Kindergarten?",
    description:
      "Assessment covering social-emotional skills, self-help independence, academic foundations, and communication skills.",
    domainCount: 4,
    questionCount: 10,
    ageRange: { min: 4, max: 6, unit: "years" },
    suggestedDomains: [
      "Social & Emotional Skills",
      "Self-Help & Independence",
      "Academic Foundations",
      "Communication Skills",
    ],
  },
  "drop-the-nap": {
    slug: "drop-the-nap",
    topic: "Is Your Child Ready to Drop the Nap?",
    description:
      "Assessment of whether your toddler or preschooler is ready to transition away from daytime naps, covering sleep duration, mood indicators, age-appropriate signs, and bedtime impact.",
    domainCount: 4,
    questionCount: 9,
    ageRange: { min: 2, max: 5, unit: "years" },
    suggestedDomains: [
      "Sleep Duration",
      "Mood Without Nap",
      "Age-Appropriate Signs",
      "Bedtime Impact",
    ],
  },
  "sleepover-readiness": {
    slug: "sleepover-readiness",
    topic: "Is Your Child Ready for a Sleepover?",
    description:
      "Assessment of separation comfort, self-care independence, communication skills, and emotional regulation away from home.",
    domainCount: 4,
    questionCount: 10,
    ageRange: { min: 5, max: 12, unit: "years" },
    suggestedDomains: [
      "Separation Comfort",
      "Self-Care Independence",
      "Communication Skills",
      "Emotional Regulation Away From Home",
    ],
  },
  "second-child-readiness": {
    slug: "second-child-readiness",
    topic: "Is Your Family Ready for a Second Child?",
    description:
      "Assessment of emotional bandwidth, logistical readiness, relationship stability, and first child's developmental stage.",
    domainCount: 4,
    questionCount: 10,
    suggestedDomains: [
      "Emotional Bandwidth",
      "Logistical Readiness",
      "Relationship Stability",
      "First Child's Stage",
    ],
    additionalContext:
      "This quiz is about the FAMILY, not a child. Subject is 'your family'. Questions should describe real scenarios parents face when considering another child — sleep recovery, partner dynamics, financial strain, emotional reserves. No 'right time' moralizing. Score label should be 'Readiness'. Include 3 result tiers.",
  },
  "screen-dependence": {
    slug: "screen-dependence",
    topic: "How Screen-Dependent Is Your Family?",
    description:
      "Guilt-free assessment of child screen habits, parent modeling, screen-free alternatives, and transition ease.",
    domainCount: 4,
    questionCount: 10,
    ageRange: { min: 2, max: 12, unit: "years" },
    suggestedDomains: [
      "Child Screen Habits",
      "Parent Modeling",
      "Screen-Free Alternatives",
      "Transition Ease",
    ],
    additionalContext:
      "This quiz covers the whole family, not just the child. Subject is 'your family'. Absolutely NO preachy tone about screens — acknowledge that screens are a tool and sometimes a survival mechanism. Questions should describe recognizable daily scenarios. Score label should be 'Independence'. Include 3 result tiers.",
  },
  "emotional-intelligence": {
    slug: "emotional-intelligence",
    topic: "How Emotionally Intelligent Is Your Child?",
    description:
      "Strength-focused assessment of emotion vocabulary, self-regulation, empathy, and frustration tolerance.",
    domainCount: 4,
    questionCount: 10,
    ageRange: { min: 3, max: 10, unit: "years" },
    suggestedDomains: [
      "Emotion Vocabulary",
      "Self-Regulation",
      "Empathy",
      "Frustration Tolerance",
    ],
  },
  "social-confidence": {
    slug: "social-confidence",
    topic: "How Strong Is Your Child's Social Confidence?",
    description:
      "Strengths-based assessment of peer comfort, conflict navigation, empathy expression, and assertiveness. Not 'is your kid popular' — focused on social skills that matter.",
    domainCount: 4,
    questionCount: 10,
    ageRange: { min: 3, max: 10, unit: "years" },
    suggestedDomains: [
      "Peer Comfort",
      "Conflict Navigation",
      "Empathy Expression",
      "Assertiveness",
    ],
  },
  "communication-safety": {
    slug: "communication-safety",
    topic: "How Safe Does Your Child Feel Talking to You?",
    description:
      "Measures communication openness between parent and child — emotional safety, repair after conflict, judgment-free responses, and vulnerability comfort.",
    domainCount: 4,
    questionCount: 10,
    ageRange: { min: 4, max: 14, unit: "years" },
    suggestedDomains: [
      "Emotional Safety",
      "Repair After Conflict",
      "Judgment-Free Responses",
      "Vulnerability Comfort",
    ],
    additionalContext:
      "This quiz assesses the PARENT's behavior as experienced by the child — subject is 'your child' but questions describe what the PARENT does. Questions should describe concrete interactions: how you respond when they confess something, how you handle disagreements, whether they come to you first with problems.",
  },
  "bedtime-routine": {
    slug: "bedtime-routine",
    topic: "Build Your Child's Bedtime Routine",
    description:
      "Personalized sleep assessment covering sleep hygiene, schedule consistency, and sleep environment. Results give composed recommendations for your child.",
    domainCount: 3,
    questionCount: 9,
    ageRange: { min: 1, max: 10, unit: "years" },
    suggestedDomains: [
      "Sleep Hygiene",
      "Schedule Consistency",
      "Sleep Environment",
    ],
    additionalContext:
      "This is a 'builder' quiz — results should give specific, actionable recommendations rather than just readiness scores. Domain content at each level should include concrete suggestions. Score label should be 'Routine'. Result headlines should frame as toolkit quality, not pass/fail.",
  },
  "age-appropriate-chores": {
    slug: "age-appropriate-chores",
    topic: "What Chores Can Your Child Handle?",
    description:
      "Personalized age-appropriate chore assessment covering age-readiness, independence level, and household setup.",
    domainCount: 3,
    questionCount: 9,
    ageRange: { min: 2, max: 12, unit: "years" },
    suggestedDomains: [
      "Age-Readiness",
      "Independence Level",
      "Household Setup",
    ],
    additionalContext:
      "Results should include specific chore suggestions matched to the child's level. Domain content should name actual chores appropriate for each tier. Score label should be 'Independence'. No guilt about what kids 'should' be doing — meet them where they are.",
  },
  "calm-down-toolkit": {
    slug: "calm-down-toolkit",
    topic: "Build Your Child's Calm-Down Toolkit",
    description:
      "Personalized strategy toolkit assessment covering your child's regulation style, trigger types, and environment. Results give matched calming strategies.",
    domainCount: 3,
    questionCount: 9,
    ageRange: { min: 2, max: 10, unit: "years" },
    suggestedDomains: [
      "Regulation Style",
      "Trigger Type",
      "Environment",
    ],
    additionalContext:
      "This is a 'builder' quiz — results should provide specific calming strategies matched to the child's profile, not just a score. Domain content should name actual techniques (sensory tools, breathing exercises, movement breaks, etc.). Score label should be 'Toolkit'. Result headlines should frame as toolkit completeness.",
  },
};

const IDENTITY_QUIZZES: Record<string, IdentityQuizDef> = {};

const LIKERT_QUIZZES: Record<string, LikertQuizDef> = {
  "parenting-style": {
    slug: "parenting-style",
    topic: "What's Your Parenting Style?",
    description:
      "Rate how often each parenting behavior describes you. Reveals your blend across authoritative, authoritarian, and permissive approaches using validated dimensions from PSDQ research.",
    statementCount: 18,
    scale: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    suggestedDimensions: [
      { id: "steady-guide", name: "The Steady Guide" },
      { id: "firm-protector", name: "The Firm Protector" },
      { id: "free-spirit", name: "The Free Spirit" },
    ],
    additionalContext:
      "This is the flagship parenting style quiz. Based on Baumrind's typology and PSDQ dimensions. 6 statements per dimension (18 total). Include 2-3 reverse-scored statements spread across dimensions. Statements should describe concrete daily behaviors (not beliefs). Subject is 'you'. The dimension names (Steady Guide, Firm Protector, Free Spirit) are our branded versions of authoritative, authoritarian, and permissive — use exactly these names and IDs.",
  },
};

// ── Main ────────────────────────────────────────────────────────────

const MODEL = "anthropic/claude-opus-4-6";

const ALL_KEYS = [...Object.keys(READINESS_QUIZZES), ...Object.keys(IDENTITY_QUIZZES), ...Object.keys(LIKERT_QUIZZES)];

function getQuizType(key: string): "readiness" | "identity" | "likert" | null {
  if (READINESS_QUIZZES[key]) return "readiness";
  if (IDENTITY_QUIZZES[key]) return "identity";
  if (LIKERT_QUIZZES[key]) return "likert";
  return null;
}

function getSlug(key: string, quizType: "readiness" | "identity" | "likert"): string {
  if (quizType === "readiness") return READINESS_QUIZZES[key]!.slug;
  if (quizType === "identity") return IDENTITY_QUIZZES[key]!.slug;
  return LIKERT_QUIZZES[key]!.slug;
}

async function main() {
  const quizKey = process.argv[2];
  const quizType = quizKey ? getQuizType(quizKey) : null;
  if (!quizKey || !quizType) {
    console.error(`Usage: npx tsx scripts/generate-one-quiz.ts <quiz-key>`);
    console.error(`Readiness: ${Object.keys(READINESS_QUIZZES).join(", ")}`);
    console.error(`Identity:  ${Object.keys(IDENTITY_QUIZZES).join(", ")}`);
    console.error(`Likert:    ${Object.keys(LIKERT_QUIZZES).join(", ")}`);
    process.exit(1);
  }

  const slug = getSlug(quizKey, quizType);
  const outputPath = `landing/src/lib/quiz/${slug}.json`;
  const apiKey = process.env["OPENROUTER_API_KEY"];
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  console.log(`Generating: ${slug} (${quizType})`);
  console.log(`Model: ${MODEL}`);

  // Build prompts based on quiz type
  let systemPrompt: string;
  let userPrompt: string;
  if (quizType === "identity") {
    systemPrompt = buildIdentitySystemPrompt();
    userPrompt = buildIdentityUserPrompt(IDENTITY_QUIZZES[quizKey]!);
  } else if (quizType === "likert") {
    systemPrompt = buildLikertSystemPrompt();
    userPrompt = buildLikertUserPrompt(LIKERT_QUIZZES[quizKey]!);
  } else {
    systemPrompt = buildSystemPrompt();
    userPrompt = buildUserPrompt(READINESS_QUIZZES[quizKey]!);
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const raw = (await res.json()) as any;
  if (!res.ok) {
    console.error("API error:", raw?.error?.message || res.status);
    process.exit(1);
  }

  let content = raw?.choices?.[0]?.message?.content as string;
  if (!content) {
    console.error("Empty response");
    process.exit(1);
  }

  // Strip markdown fences if present
  content = content.trim();
  if (content.startsWith("```")) {
    const firstNl = content.indexOf("\n");
    const lastFence = content.lastIndexOf("```");
    content = content.slice(firstNl + 1, lastFence).trim();
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error("JSON parse failed. First 500 chars:");
    console.error(content.slice(0, 500));
    process.exit(1);
  }

  // Type-specific auto-fixes and validation
  if (quizType === "readiness") {
    // Auto-fix domain maxPoints — LLM consistently gets this math wrong
    if (parsed.domains && parsed.questions) {
      const calculated: Record<string, number> = {};
      for (const q of parsed.questions) {
        const maxPts = Math.max(...q.options.map((o: any) => o.points));
        calculated[q.domain] = (calculated[q.domain] || 0) + maxPts;
      }
      for (const [id, domain] of Object.entries(parsed.domains) as any) {
        if (calculated[id] !== undefined && domain.maxPoints !== calculated[id]) {
          console.log(`  Auto-fixed ${id} maxPoints: ${domain.maxPoints} → ${calculated[id]}`);
          domain.maxPoints = calculated[id];
        }
      }
    }

    // Auto-fix result score ranges — ensure highest tier covers up to actual total
    if (parsed.domains && parsed.results) {
      const totalMax = Object.values(parsed.domains).reduce((s: number, d: any) => s + d.maxPoints, 0);
      const results = Object.values(parsed.results) as any[];
      results.sort((a: any, b: any) => a.scoreRange.min - b.scoreRange.min);
      const highestResult = results[results.length - 1];
      if (highestResult && highestResult.scoreRange.max !== totalMax) {
        console.log(`  Auto-fixed top result max: ${highestResult.scoreRange.max} → ${totalMax}`);
        highestResult.scoreRange.max = totalMax;
      }
    }

    const result = ReadinessQuizDataSchema.safeParse(parsed);
    if (!result.success) {
      writeFileSync(outputPath + ".raw.json", JSON.stringify(parsed, null, 2) + "\n");
      console.error("\nZod validation errors:");
      for (const issue of result.error.issues) {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      }
      console.error(`\nRaw saved to: ${outputPath}.raw.json`);
      process.exit(1);
    }

    const json = JSON.stringify(result.data, null, 2);
    writeFileSync(outputPath, json + "\n");
    console.log(`\nWritten: ${outputPath}`);
    console.log(`Questions: ${result.data.questions.length}`);
    console.log(`Domains: ${Object.keys(result.data.domains).join(", ")}`);
    console.log(`Results: ${Object.keys(result.data.results).join(", ")}`);
    runPostChecks(json);
  } else if (quizType === "identity") {
    // Identity quiz validation
    const result = IdentityQuizDataSchema.safeParse(parsed);
    if (!result.success) {
      writeFileSync(outputPath + ".raw.json", JSON.stringify(parsed, null, 2) + "\n");
      console.error("\nZod validation errors:");
      for (const issue of result.error.issues) {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      }
      console.error(`\nRaw saved to: ${outputPath}.raw.json`);
      process.exit(1);
    }

    const json = JSON.stringify(result.data, null, 2);
    writeFileSync(outputPath, json + "\n");
    console.log(`\nWritten: ${outputPath}`);
    console.log(`Questions: ${result.data.questions.length}`);
    console.log(`Types: ${Object.keys(result.data.types).join(", ")}`);
    runPostChecks(json);
  } else {
    // Likert quiz validation
    const result = LikertQuizDataSchema.safeParse(parsed);
    if (!result.success) {
      writeFileSync(outputPath + ".raw.json", JSON.stringify(parsed, null, 2) + "\n");
      console.error("\nZod validation errors:");
      for (const issue of result.error.issues) {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      }
      console.error(`\nRaw saved to: ${outputPath}.raw.json`);
      process.exit(1);
    }

    const json = JSON.stringify(result.data, null, 2);
    writeFileSync(outputPath, json + "\n");
    console.log(`\nWritten: ${outputPath}`);
    console.log(`Statements: ${result.data.statements.length}`);
    console.log(`Dimensions: ${Object.keys(result.data.dimensions).join(", ")}`);
    runPostChecks(json);
  }
}

function runPostChecks(json: string) {
  // Platitude scan
  const banned = [
    "you're not alone", "you are not alone", "you're doing great",
    "that matters", "not a reflection", "not weak", "just by being here",
    "mama", "you've got this", "every moment is a gift",
  ];
  const lower = json.toLowerCase();
  const found = banned.filter((p) => lower.includes(p));
  if (found.length > 0) {
    console.log(`\n⚠️  PLATITUDE CHECK FAILED: ${found.join(", ")}`);
  } else {
    console.log(`\n✓ Platitude check passed`);
  }

  // Citation scan — no academic citations allowed
  const cites = json.match(/\([A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4}\)/g);
  if (cites) {
    console.log(`⚠️  CITATION CHECK FAILED: ${cites.join(", ")}`);
  } else {
    console.log(`✓ Citation check passed`);
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

/**
 * Quiz validator — checks deployed quiz JSON files against output schemas
 * and quiz page type constraints.
 *
 * Follows the same pattern as the article validator:
 * returns { errors: string[], warnings: string[] }.
 */

import {
  LikertQuizOutputSchema,
  IdentityQuizOutputSchema,
  AssessmentQuizOutputSchema,
} from "../schemas/quiz-output";
import type { QuizPageType } from "../types";

interface QuizValidationResult {
  errors: string[];
  warnings: string[];
}

type DetectedType = "likert" | "identity" | "assessment" | "unknown";

function detectQuizType(data: Record<string, unknown>): DetectedType {
  if (data["quizType"] === "likert") return "likert";
  if (data["quizType"] === "identity") return "identity";
  if ("statements" in data && "scale" in data && "dimensions" in data)
    return "likert";
  if ("types" in data && !("domains" in data)) return "identity";
  if ("domains" in data && "domainContent" in data && "results" in data)
    return "assessment";
  return "unknown";
}

function inRange(
  value: number,
  range: { min: number; max: number } | undefined,
  label: string,
): string | null {
  if (!range) return null;
  if (value < range.min) return `${label}: ${value} is below minimum ${range.min}`;
  if (value > range.max) return `${label}: ${value} is above maximum ${range.max}`;
  return null;
}

function validateLikert(
  data: Record<string, unknown>,
  constraints: QuizPageType["constraints"] | undefined,
): QuizValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const result = LikertQuizOutputSchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues.slice(0, 20)) {
      errors.push(`Schema: ${issue.path.join(".")}: ${issue.message}`);
    }
    return { errors, warnings };
  }

  const quiz = result.data;

  // Structural checks
  const stmtCount = quiz.statements.length;
  const dimCount = Object.keys(quiz.dimensions).length;
  const scaleLen = quiz.scale.points.length;

  if (constraints) {
    const e1 = inRange(stmtCount, constraints.statementCount, "Statement count");
    if (e1) errors.push(e1);
    const e2 = inRange(dimCount, constraints.dimensionCount, "Dimension count");
    if (e2) errors.push(e2);
    if (constraints.scalePoints != null && scaleLen !== constraints.scalePoints) {
      errors.push(`Scale points: ${scaleLen} (expected ${constraints.scalePoints})`);
    }
  }

  // Scale labels must match points length
  if (quiz.scale.labels.length !== scaleLen) {
    errors.push(`Scale labels (${quiz.scale.labels.length}) must match points (${scaleLen})`);
  }

  // All statements must reference valid dimensions
  const dimIds = new Set(Object.keys(quiz.dimensions));
  for (const stmt of quiz.statements) {
    if (!dimIds.has(stmt.dimension)) {
      errors.push(`Statement "${stmt.id}" references unknown dimension "${stmt.dimension}"`);
    }
  }

  // Meta questionCount should match actual statement count
  if (quiz.meta.questionCount !== stmtCount) {
    warnings.push(`meta.questionCount (${quiz.meta.questionCount}) differs from actual statements (${stmtCount})`);
  }

  // Sources check
  if (constraints?.requiresSources && quiz.meta.sources.length === 0) {
    errors.push("Missing sources");
  }

  // Intro check
  if (constraints?.requiresIntro && !quiz.meta.intro) {
    errors.push("Missing intro text");
  }

  return { errors, warnings };
}

function validateIdentity(
  data: Record<string, unknown>,
  constraints: QuizPageType["constraints"] | undefined,
): QuizValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const result = IdentityQuizOutputSchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues.slice(0, 20)) {
      errors.push(`Schema: ${issue.path.join(".")}: ${issue.message}`);
    }
    return { errors, warnings };
  }

  const quiz = result.data;
  const qCount = quiz.questions.length;
  const typeCount = Object.keys(quiz.types).length;
  const typeIds = new Set(Object.keys(quiz.types));

  if (constraints) {
    const e1 = inRange(qCount, constraints.questionCount, "Question count");
    if (e1) errors.push(e1);
    const e2 = inRange(typeCount, constraints.typeCount, "Type count");
    if (e2) errors.push(e2);
  }

  // Validate options per question
  for (const q of quiz.questions) {
    const optCount = q.options.length;
    if (constraints?.optionsPerQuestion) {
      const e = inRange(optCount, constraints.optionsPerQuestion, `Question "${q.id}" options`);
      if (e) errors.push(e);
    }

    // All option point maps must reference valid types
    for (const opt of q.options) {
      for (const typeId of Object.keys(opt.points)) {
        if (!typeIds.has(typeId)) {
          errors.push(`Question "${q.id}" option "${opt.id}" references unknown type "${typeId}"`);
        }
      }
    }
  }

  // Meta questionCount should match
  if (quiz.meta.questionCount !== qCount) {
    warnings.push(`meta.questionCount (${quiz.meta.questionCount}) differs from actual questions (${qCount})`);
  }

  if (constraints?.requiresSources && quiz.meta.sources.length === 0) {
    errors.push("Missing sources");
  }
  if (constraints?.requiresIntro && !quiz.meta.intro) {
    errors.push("Missing intro text");
  }

  return { errors, warnings };
}

function validateAssessment(
  data: Record<string, unknown>,
  constraints: QuizPageType["constraints"] | undefined,
): QuizValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const result = AssessmentQuizOutputSchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues.slice(0, 20)) {
      errors.push(`Schema: ${issue.path.join(".")}: ${issue.message}`);
    }
    return { errors, warnings };
  }

  const quiz = result.data;
  const qCount = quiz.questions.length;
  const domainCount = Object.keys(quiz.domains).length;
  const domainIds = new Set(Object.keys(quiz.domains));

  if (constraints) {
    const e1 = inRange(qCount, constraints.questionCount, "Question count");
    if (e1) errors.push(e1);
    const e2 = inRange(domainCount, constraints.domainCount, "Domain count");
    if (e2) errors.push(e2);
  }

  // Validate options per question
  for (const q of quiz.questions) {
    const optCount = q.options.length;
    if (constraints?.optionsPerQuestion) {
      const e = inRange(optCount, constraints.optionsPerQuestion, `Question "${q.id}" options`);
      if (e) errors.push(e);
    }

    // Question must reference valid domain
    if (!domainIds.has(q.domain)) {
      errors.push(`Question "${q.id}" references unknown domain "${q.domain}"`);
    }
  }

  // domainContent must have all 3 levels for each domain
  for (const domainId of domainIds) {
    if (!quiz.domainContent[domainId]) {
      errors.push(`Missing domainContent for domain "${domainId}"`);
    }
  }

  // Result score ranges should cover 0 to max
  const totalMax = Object.values(quiz.domains).reduce((sum, d) => sum + d.maxPoints, 0);
  const covered = new Set<number>();
  for (const template of Object.values(quiz.results)) {
    for (let i = template.scoreRange.min; i <= template.scoreRange.max; i++) {
      covered.add(i);
    }
  }
  const uncovered: number[] = [];
  for (let i = 0; i <= totalMax; i++) {
    if (!covered.has(i)) uncovered.push(i);
  }
  if (uncovered.length > 0) {
    const range =
      uncovered.length <= 5
        ? uncovered.join(", ")
        : `${uncovered[0]}..${uncovered[uncovered.length - 1]} (${uncovered.length} scores)`;
    errors.push(`Result templates don't cover scores: ${range}`);
  }

  // Calculated maxPoints should match declared
  const calculatedMax: Record<string, number> = {};
  for (const q of quiz.questions) {
    const maxOpt = Math.max(...q.options.map((o) => o.points));
    calculatedMax[q.domain] = (calculatedMax[q.domain] ?? 0) + maxOpt;
  }
  for (const [domainId, config] of Object.entries(quiz.domains)) {
    if ((calculatedMax[domainId] ?? 0) !== config.maxPoints) {
      warnings.push(
        `Domain "${domainId}" declares maxPoints=${config.maxPoints} but questions sum to ${calculatedMax[domainId] ?? 0}`,
      );
    }
  }

  if (quiz.meta.questionCount !== qCount) {
    warnings.push(`meta.questionCount (${quiz.meta.questionCount}) differs from actual questions (${qCount})`);
  }

  if (constraints?.requiresSources && quiz.meta.sources.length === 0) {
    errors.push("Missing sources");
  }
  if (constraints?.requiresIntro && !quiz.meta.intro) {
    errors.push("Missing intro text");
  }

  return { errors, warnings };
}

/**
 * Validate a quiz JSON object against its detected type schema + constraints.
 */
export function validateQuiz(
  data: unknown,
  quizPageTypes: QuizPageType[],
): QuizValidationResult & { detectedType: DetectedType } {
  if (typeof data !== "object" || data === null) {
    return { detectedType: "unknown", errors: ["Not a valid object"], warnings: [] };
  }

  const obj = data as Record<string, unknown>;
  const detectedType = detectQuizType(obj);

  if (detectedType === "unknown") {
    return {
      detectedType,
      errors: ["Could not detect quiz type (missing quizType field or structural markers)"],
      warnings: [],
    };
  }

  const constraints = quizPageTypes.find((pt) => pt.name === detectedType)?.constraints;

  let result: QuizValidationResult;
  switch (detectedType) {
    case "likert":
      result = validateLikert(obj, constraints);
      break;
    case "identity":
      result = validateIdentity(obj, constraints);
      break;
    case "assessment":
      result = validateAssessment(obj, constraints);
      break;
  }

  return { detectedType, ...result };
}

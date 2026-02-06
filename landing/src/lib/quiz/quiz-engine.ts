/**
 * Generic Quiz Engine
 *
 * Works with any quiz JSON that follows the standard schema.
 * No AI needed at runtime - all results are pre-computed from combinations.
 */

// ============================================================================
// TYPES (shared across all quizzes)
// ============================================================================

export interface QuizOption {
  id: string;
  text: string;
  points: number;
}

export interface QuizQuestion {
  id: string;
  domain: string;
  text: string;
  subtext?: string;
  options: QuizOption[];
  source?: string;
}

export interface DomainConfig {
  id: string;
  name: string;
  maxPoints: number;
  thresholds: {
    high: number;
    medium: number;
  };
}

export interface DomainLevelContent {
  level: 'high' | 'medium' | 'low';
  headline: string;
  detail: string;
  strength?: string;
  concern?: string;
}

export interface ResultTemplate {
  id: string;
  scoreRange: { min: number; max: number };
  headline: string;
  subheadline: string;
  explanation: string;
  nextSteps: string[];
  watchOutFor: string;
  encouragement: string;
  comparativeContext: string;
  retakeAdvice?: string;
}

export interface QuizMeta {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  intro: string;
  estimatedTime: string;
  questionCount: number;
  ageRange?: { min: number; max: number; unit: string };
  sources: { name: string; url: string }[];
}

export interface QuizData {
  quizType?: string;
  meta: QuizMeta;
  domains: Record<string, DomainConfig>;
  questions: QuizQuestion[];
  domainContent: Record<string, Record<'high' | 'medium' | 'low', DomainLevelContent>>;
  results: Record<string, ResultTemplate>;
}

// ── Identity quiz types (Type B) ──

export interface IdentityType {
  id: string;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  growthEdge: string;
  encouragement: string;
  comparativeContext: string;
}

export interface IdentityOption {
  id: string;
  text: string;
  points: Record<string, number>;
}

export interface IdentityQuestion {
  id: string;
  text: string;
  subtext?: string;
  options: IdentityOption[];
}

export interface IdentityQuizData {
  quizType: 'identity';
  meta: QuizMeta;
  types: Record<string, IdentityType>;
  questions: IdentityQuestion[];
}

export interface IdentityTypeResult {
  id: string;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  growthEdge: string;
  encouragement: string;
  comparativeContext: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface IdentityQuizResult {
  quizId: string;
  primaryType: IdentityTypeResult;
  allTypes: IdentityTypeResult[];
  shareableSummary: string;
}

export interface DomainResult {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'high' | 'medium' | 'low';
  headline: string;
  detail: string;
  strength?: string | undefined;
  concern?: string | undefined;
}

export interface QuizResult {
  quizId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  resultId: string;
  headline: string;
  subheadline: string;
  explanation: string;
  domains: DomainResult[];
  strengths: string[];
  concerns: string[];
  nextSteps: string[];
  watchOutFor: string;
  encouragement: string;
  comparativeContext: string;
  shareableSummary: string;
  strongestDomain: { name: string; percentage: number };
  weakestDomain: { name: string; percentage: number };
  retakeAdvice?: string | undefined;
}

export interface ShareableCard {
  quizId: string;
  quizTitle: string;
  resultHeadline: string;
  resultId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  domains: {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
  }[];
  url: string;
}

// ============================================================================
// QUIZ ENGINE
// ============================================================================

export class QuizEngine {
  private quiz: QuizData;

  constructor(quizData: QuizData) {
    this.quiz = quizData;
  }

  /**
   * Get quiz metadata for display
   */
  getMeta() {
    return this.quiz.meta;
  }

  /**
   * Get all questions in order
   */
  getQuestions(): QuizQuestion[] {
    return this.quiz.questions;
  }

  /**
   * Get a single question by ID
   */
  getQuestion(questionId: string): QuizQuestion | undefined {
    return this.quiz.questions.find(q => q.id === questionId);
  }

  /**
   * Calculate scores from user answers
   */
  calculateScores(answers: Record<string, string>): {
    total: number;
    maxTotal: number;
    byDomain: Record<string, number>;
  } {
    const byDomain: Record<string, number> = {};

    // Initialize all domains to 0
    for (const domainId of Object.keys(this.quiz.domains)) {
      byDomain[domainId] = 0;
    }

    // Sum up points from answers
    for (const question of this.quiz.questions) {
      const selectedOptionId = answers[question.id];
      if (!selectedOptionId) continue;

      const selectedOption = question.options.find(o => o.id === selectedOptionId);
      if (selectedOption) {
        byDomain[question.domain] = (byDomain[question.domain] || 0) + selectedOption.points;
      }
    }

    const total = Object.values(byDomain).reduce((sum, score) => sum + score, 0);
    const maxTotal = Object.values(this.quiz.domains).reduce((sum, d) => sum + d.maxPoints, 0);

    return { total, maxTotal, byDomain };
  }

  /**
   * Determine the level (high/medium/low) for a domain score
   */
  getDomainLevel(domainId: string, score: number): 'high' | 'medium' | 'low' {
    const config = this.quiz.domains[domainId];
    if (!config) return 'low';

    if (score >= config.thresholds.high) return 'high';
    if (score >= config.thresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Find the matching result template based on total score
   */
  getResultTemplate(totalScore: number): ResultTemplate {
    for (const template of Object.values(this.quiz.results)) {
      if (totalScore >= template.scoreRange.min && totalScore <= template.scoreRange.max) {
        return template;
      }
    }
    // Fallback to first result if no match (shouldn't happen with proper config)
    const firstResult = Object.values(this.quiz.results)[0];
    if (!firstResult) {
      throw new Error('Quiz has no result templates configured');
    }
    return firstResult;
  }

  /**
   * Assemble the complete result from user answers
   */
  assembleResult(answers: Record<string, string>): QuizResult {
    const { total, maxTotal, byDomain } = this.calculateScores(answers);
    const template = this.getResultTemplate(total);

    // Build domain results
    const domainResults: DomainResult[] = Object.entries(this.quiz.domains).map(([id, config]) => {
      const score = byDomain[id] || 0;
      const level = this.getDomainLevel(id, score);
      const content = this.quiz.domainContent[id]?.[level];

      return {
        id,
        name: config.name,
        score,
        maxScore: config.maxPoints,
        percentage: Math.round((score / config.maxPoints) * 100),
        level,
        headline: content?.headline || '',
        detail: content?.detail || '',
        strength: content?.strength,
        concern: content?.concern,
      };
    });

    // Collect strengths (from high-level domains)
    const strengths = domainResults
      .filter(d => d.level === 'high' && d.strength)
      .map(d => d.strength!);

    // Collect concerns (from medium/low-level domains)
    const concerns = domainResults
      .filter(d => d.level !== 'high' && d.concern)
      .map(d => d.concern!);

    // Strongest and weakest domains
    const sorted = [...domainResults].sort((a, b) => b.percentage - a.percentage);
    const strongestDomain = { name: sorted[0]!.name, percentage: sorted[0]!.percentage };
    const weakestDomain = { name: sorted[sorted.length - 1]!.name, percentage: sorted[sorted.length - 1]!.percentage };

    // Shareable summary
    const pct = Math.round((total / maxTotal) * 100);
    const shareableSummary =
      strongestDomain.name === weakestDomain.name
        ? `At ${pct}% readiness, your toddler is developing evenly across all areas.`
        : `At ${pct}% readiness, your toddler is showing strong ${strongestDomain.name} but needs more time with ${weakestDomain.name}.`;

    return {
      quizId: this.quiz.meta.id,
      totalScore: total,
      maxScore: maxTotal,
      percentage: pct,
      resultId: template.id,
      headline: template.headline,
      subheadline: template.subheadline,
      explanation: template.explanation,
      domains: domainResults,
      strengths,
      concerns,
      nextSteps: template.nextSteps,
      watchOutFor: template.watchOutFor,
      encouragement: template.encouragement,
      comparativeContext: template.comparativeContext,
      shareableSummary,
      strongestDomain,
      weakestDomain,
      retakeAdvice: template.retakeAdvice,
    };
  }

  /**
   * Generate shareable card data
   */
  generateShareableCard(result: QuizResult): ShareableCard {
    return {
      quizId: this.quiz.meta.id,
      quizTitle: this.quiz.meta.shortTitle,
      resultHeadline: result.headline,
      resultId: result.resultId,
      totalScore: result.totalScore,
      maxScore: result.maxScore,
      percentage: result.percentage,
      domains: result.domains.map(d => ({
        name: d.name,
        score: d.score,
        maxScore: d.maxScore,
        percentage: d.percentage,
      })),
      url: `steady-parent.com/quiz/${this.quiz.meta.slug}`,
    };
  }

  /**
   * Validate quiz configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check all questions have valid domains
    for (const question of this.quiz.questions) {
      if (!this.quiz.domains[question.domain]) {
        errors.push(`Question ${question.id} references unknown domain: ${question.domain}`);
      }
    }

    // Check max points match
    const calculatedMax: Record<string, number> = {};
    for (const question of this.quiz.questions) {
      const maxOption = Math.max(...question.options.map(o => o.points));
      calculatedMax[question.domain] = (calculatedMax[question.domain] || 0) + maxOption;
    }

    for (const [domainId, config] of Object.entries(this.quiz.domains)) {
      if (calculatedMax[domainId] !== config.maxPoints) {
        errors.push(
          `Domain ${domainId} declares maxPoints=${config.maxPoints} but questions sum to ${calculatedMax[domainId]}`
        );
      }
    }

    // Check result ranges cover all possible scores
    const totalMax = Object.values(this.quiz.domains).reduce((sum, d) => sum + d.maxPoints, 0);
    const covered = new Set<number>();
    for (const template of Object.values(this.quiz.results)) {
      for (let i = template.scoreRange.min; i <= template.scoreRange.max; i++) {
        covered.add(i);
      }
    }
    for (let i = 0; i <= totalMax; i++) {
      if (!covered.has(i)) {
        errors.push(`Score ${i} is not covered by any result template`);
      }
    }

    // Check domain content exists for all levels
    for (const domainId of Object.keys(this.quiz.domains)) {
      for (const level of ['high', 'medium', 'low'] as const) {
        if (!this.quiz.domainContent[domainId]?.[level]) {
          errors.push(`Missing domainContent for ${domainId}.${level}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

// ============================================================================
// USAGE
// ============================================================================

/*
import quizData from './potty-training-readiness.json';

const engine = new QuizEngine(quizData);

// Validate the quiz configuration
const validation = engine.validate();
if (!validation.valid) {
  console.error('Quiz validation failed:', validation.errors);
}

// Get questions for display
const questions = engine.getQuestions();

// After user completes quiz, assemble result
const userAnswers = {
  q1: 'q1a',
  q2: 'q2b',
  // ... etc
};

const result = engine.assembleResult(userAnswers);
const card = engine.generateShareableCard(result);
*/

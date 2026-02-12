// Schemas
export * from "./schemas/index";

// Types
export * from "./types";

// Parser
export { parseMdxArticle } from "./parser/index";

// Validator
export {
  validateArticle,
  buildUrlRegistry,
  findPlanEntry,
} from "./validator/index";
export { analyzeCoverage } from "./validator/coverage";
export type { CoverageReport } from "./validator/coverage";
export {
  computeCrossLinkStats,
  validateCrossLinks,
  buildCrossLinkDetail,
} from "./validator/cross-links";
export type {
  CrossLinkStats,
  CrossLinkDetail,
  CrossLinkCategory,
  CrossLinkArticle,
  ResolvedLink,
  ResolvedCta,
} from "./validator/cross-links";
export { validateQuiz } from "./validator/quiz";
export {
  validateCtaCatalog,
  validateCtaCopy,
  COMMUNITY_BUTTON_TEXT,
  COMMUNITY_FOUNDER_LINE,
  PREVIEW_BUTTON_TEXT,
  WAITLIST_BUTTON_TEXT,
  FORBIDDEN_TERMS,
} from "./validator/cta";
export type { CheckGroup, EntryValidation, EntryCheck } from "./validator/cta";
export { validateMailingFormCatalog } from "./validator/mailing-form";
export {
  validateKitIntegration,
  validateKitIntegrationOffline,
} from "./validator/kit-integration";
export type {
  IntegrationCheck,
  IntegrationValidationResult,
  LiveKitState,
  CodeChecks,
} from "./validator/kit-integration";
export { extractCTAsFromMdx } from "./validator/reality-check";
export type { ExtractedCTA } from "./validator/reality-check";

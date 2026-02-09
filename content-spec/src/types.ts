import { z } from "zod/v4";
import type {
  CategorySchema,
  ArticleEntrySchema,
  ArticleTaxonomySchema,
  QuizEntrySchema,
  QuizTaxonomySchema,
  CtaDefinitionSchema,
  CtaCatalogSchema,
  MailingTagSchema,
  MailingTagTaxonomySchema,
  FormTagMappingSchema,
  FormTagMappingsSchema,
  PlannedLinkSchema,
  PlannedCtaSchema,
  LinkPlanEntrySchema,
  LinkPlanSchema,
  PageTypeSchema,
  PageTypesSchema,
  QuizPageTypeSchema,
  QuizPageTypesSchema,
  QuizMetaSchema,
  LikertQuizOutputSchema,
  IdentityQuizOutputSchema,
  AssessmentQuizOutputSchema,
  JsonLdFieldSchema,
  JsonLdRequirementSchema,
  JsonLdRequirementsSchema,
  ArticleBodyOutputSchema,
  CtaComponentOutputSchema,
  JsonLdOutputSchema,
  PagePartSchema,
  PageCompositionSchema,
  PageCompositionsSchema,
  CtaComponentSchema,
  ParsedMetadataSchema,
  ParsedArticleSchema,
} from "./schemas/index";

// ---------------------------------------------------------------------------
// Stage 1: Plan types
// ---------------------------------------------------------------------------

export type Category = z.infer<typeof CategorySchema>;
export type ArticleEntry = z.infer<typeof ArticleEntrySchema>;
export type ArticleTaxonomy = z.infer<typeof ArticleTaxonomySchema>;
export type QuizEntry = z.infer<typeof QuizEntrySchema>;
export type QuizTaxonomy = z.infer<typeof QuizTaxonomySchema>;
export type CtaDefinition = z.infer<typeof CtaDefinitionSchema>;
export type CtaCatalog = z.infer<typeof CtaCatalogSchema>;
export type MailingTag = z.infer<typeof MailingTagSchema>;
export type MailingTagTaxonomy = z.infer<typeof MailingTagTaxonomySchema>;
export type FormTagMapping = z.infer<typeof FormTagMappingSchema>;
export type FormTagMappings = z.infer<typeof FormTagMappingsSchema>;
export type PlannedLink = z.infer<typeof PlannedLinkSchema>;
export type PlannedCta = z.infer<typeof PlannedCtaSchema>;
export type LinkPlanEntry = z.infer<typeof LinkPlanEntrySchema>;
export type LinkPlan = z.infer<typeof LinkPlanSchema>;
export type PageType = z.infer<typeof PageTypeSchema>;
export type PageTypes = z.infer<typeof PageTypesSchema>;
export type QuizPageType = z.infer<typeof QuizPageTypeSchema>;
export type QuizPageTypes = z.infer<typeof QuizPageTypesSchema>;
export type QuizMeta = z.infer<typeof QuizMetaSchema>;
export type LikertQuizOutput = z.infer<typeof LikertQuizOutputSchema>;
export type IdentityQuizOutput = z.infer<typeof IdentityQuizOutputSchema>;
export type AssessmentQuizOutput = z.infer<typeof AssessmentQuizOutputSchema>;
export type JsonLdField = z.infer<typeof JsonLdFieldSchema>;
export type JsonLdRequirement = z.infer<typeof JsonLdRequirementSchema>;
export type JsonLdRequirements = z.infer<typeof JsonLdRequirementsSchema>;

// ---------------------------------------------------------------------------
// Stage 2: Generation output types
// ---------------------------------------------------------------------------

export type ArticleBodyOutput = z.infer<typeof ArticleBodyOutputSchema>;
export type CtaComponentOutput = z.infer<typeof CtaComponentOutputSchema>;
export type JsonLdOutput = z.infer<typeof JsonLdOutputSchema>;
export type PagePart = z.infer<typeof PagePartSchema>;
export type PageComposition = z.infer<typeof PageCompositionSchema>;
export type PageCompositions = z.infer<typeof PageCompositionsSchema>;

// ---------------------------------------------------------------------------
// Stage 3: Parser output types
// ---------------------------------------------------------------------------

export type CtaComponent = z.infer<typeof CtaComponentSchema>;
export type ParsedMetadata = z.infer<typeof ParsedMetadataSchema>;
export type ParsedArticle = z.infer<typeof ParsedArticleSchema>;

// ---------------------------------------------------------------------------
// Validation result (used by validator)
// ---------------------------------------------------------------------------

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

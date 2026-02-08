// Stage 1: Plan schemas (input types)
export {
  CategorySchema,
  ArticleTypeEnum,
  ArticleEntrySchema,
  ArticleTaxonomySchema,
  QuizEntrySchema,
  QuizTaxonomySchema,
} from "./taxonomy.js";

export {
  CtaTypeEnum,
  CtaDefinitionSchema,
  CtaCatalogSchema,
} from "./cta-catalog.js";

export {
  MailingTagSchema,
  MailingTagTaxonomySchema,
  FormTagMappingSchema,
  FormTagMappingsSchema,
  validateFormTagRefs,
} from "./mailing.js";

export {
  LinkTypeEnum,
  PlannedLinkSchema,
  PlannedCtaSchema,
  LinkPlanEntrySchema,
  LinkPlanSchema,
} from "./link-plan.js";

export {
  RangeSchema,
  PageTypeSchema,
  PageTypesSchema,
} from "./page-types.js";

export {
  JsonLdFieldSchema,
  JsonLdRequirementSchema,
  JsonLdRequirementsSchema,
} from "./json-ld.js";

// Stage 2: Generation output schemas
export {
  ArticleBodyOutputSchema,
  CtaComponentOutputSchema,
  JsonLdOutputSchema,
} from "./generation.js";

export {
  PagePartSchema,
  PageCompositionSchema,
  PageCompositionsSchema,
} from "./composition.js";

// Stage 3: Parser output schemas
export {
  CtaComponentSchema,
  ParsedMetadataSchema,
  ParsedArticleSchema,
} from "./parsed-article.js";

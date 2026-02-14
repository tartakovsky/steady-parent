export {
  // Shared constants, types, helpers
  SlugSchema,
  FORBIDDEN_TERMS,
  wc,
  checkWordCount,
  checkCleanText,
} from "./shared";

export {
  // CTA schemas
  CommunityCopySchema,
  CourseCopySchema,
  BlogArticleCtaSchema,
  QuizCtaSchema,
  CtaSpecSchema,
  // CTA types
  type CommunityCopy,
  type CourseCopy,
  type BlogArticleCta,
  type QuizCta,
  type CtaSpec,
  // CTA constants
  COMMUNITY_BUTTON_TEXT,
  COMMUNITY_FOUNDER_LINE,
  COMMUNITY_URL,
  // CTA cross-reference validator
  validateCtaCrossRefs,
} from "./ctas";

export {
  // Mailing schemas
  FreebieFormSchema,
  WaitlistFormSchema,
  QuizGateFormSchema,
  MailingSpecSchema,
  // Mailing types
  type FreebieForm,
  type WaitlistForm,
  type QuizGateForm,
  type MailingSpec,
  // Mailing constants
  FREEBIE_ENDPOINT,
  WAITLIST_ENDPOINT,
  QUIZ_GATE_ENDPOINT,
  WAITLIST_BUTTON_TEXT,
  WAITLIST_JOINED_TAG,
  QUIZ_GATE_BUTTON_TEXT,
  QUIZ_COMPLETED_TAG,
  INPUT_PLACEHOLDER,
  // Mailing cross-reference validator
  validateMailingCrossRefs,
} from "./mailing";

export {
  // Taxonomy schemas
  TaxonomySpecSchema,
  CategorySchema,
  CatalogArticleSchema,
  PillarArticleSchema,
  SeriesArticleSchema,
  ArticleSchema,
  QuizTypeEnum,
  QuizCatalogSchema,
  QuizSchema,
  QuizEntrySchema,
  CourseCatalogSchema,
  CourseSchema,
  CourseEntrySchema,
  RangeSchema,
  CatalogPageTypeSchema,
  ArticlePageTypeSchema,
  QuizLikertPageTypeSchema,
  QuizIdentityPageTypeSchema,
  QuizAssessmentPageTypeSchema,
  // Taxonomy types
  type TaxonomySpec,
  type ValidationIssue,
  // Taxonomy validator
  validateTaxonomy,
} from "./taxonomy";

export {
  // Linking schemas
  LinkingSpecSchema,
  LinkSchema,
  CtaTypeEnum,
  CtaPlacementSchema,
  MailingTypeEnum,
  MailingRefSchema,
  PageLinkPlanSchema,
  // Linking types
  type LinkingSpec,
  // Linking constants
  COMMUNITY_URL as LINKING_COMMUNITY_URL,
  // Linking structural validator
  validateLinking,
} from "./linking";

export {
  // Linking cross-reference validator
  validateLinkingCrossRefs,
} from "./linking-cross-ref";

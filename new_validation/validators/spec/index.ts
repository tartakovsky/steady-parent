export {
  // Shared constants, types, helpers
  SlugSchema,
  COMMUNITY_URL,
  COURSE_URL_REGEX,
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
} from "./ctas";

export {
  // CTA vs taxonomy validator
  validateCtaVsTaxonomy,
} from "./cta-vs-taxonomy";

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
} from "./mailing";

export {
  // Mailing vs taxonomy validator
  validateMailingVsTaxonomy,
} from "./mailing-vs-taxonomy";

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
  // Linking structural validator
  validateLinking,
} from "./linking";

export {
  // Linking vs taxonomy validator
  validateLinkingVsTaxonomy,
} from "./linking-vs-taxonomy";

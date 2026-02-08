// Shared types for the admin sync engine

/** Parsed metadata from an MDX file's `export const metadata = { ... }` block. */
export interface ParsedMetadata {
  title: string;
  description: string;
  date: string;
  category: string;
}

/** All extracted data from a single MDX article. */
export interface ParsedArticle {
  slug: string;
  metadata: ParsedMetadata;
  wordCount: number;
  h2Count: number;
  ctaCount: number;
  linkCount: number;
  internalLinkCount: number;
  imageCount: number;
  faqQuestionCount: number;
  hasTldr: boolean;
  hasFaq: boolean;
  links: { anchor: string; url: string }[];
  ctaComponents: {
    type: string;
    title?: string;
    body?: string;
    href?: string;
  }[];
  imageDescriptions: string[];
}

/** Result of validating a parsed article against its link plan. */
export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

/** A single entry from article_link_plan.json. */
export interface LinkPlanEntry {
  article: string;
  url: string;
  category: string;
  links: { url: string; type: string; intent: string }[];
  ctas: { url: string | null; type: string; intent: string }[];
}

/** Summary returned after a full sync run. */
export interface SyncSummary {
  syncId: number;
  articleCount: number;
  registeredCount: number;
  errorCount: number;
  warningCount: number;
  planEntryCount: number;
  deployedCount: number;
}

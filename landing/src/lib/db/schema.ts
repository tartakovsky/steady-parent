import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import type { CtaComponent } from "@steady-parent/content-spec";

// --- Syncs (audit log) ---

export const syncs = pgTable("syncs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  status: varchar("status", { length: 50 }).notNull(), // running | completed | failed
  articleCount: integer("article_count"),
  registeredCount: integer("registered_count"),
  errorCount: integer("error_count"),
  warningCount: integer("warning_count"),
  planEntryCount: integer("plan_entry_count"),
  deployedCount: integer("deployed_count"),
  summary: text("summary"),
});

// --- Articles (deployed article state) ---

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  categorySlug: varchar("category_slug", { length: 100 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: varchar("date", { length: 10 }),
  category: varchar("category", { length: 100 }),
  wordCount: integer("word_count").notNull(),
  h2Count: integer("h2_count").notNull(),
  ctaCount: integer("cta_count").notNull(),
  linkCount: integer("link_count").notNull(),
  internalLinkCount: integer("internal_link_count").notNull(),
  imageCount: integer("image_count").notNull(),
  faqQuestionCount: integer("faq_question_count").notNull(),
  isRegistered: boolean("is_registered").notNull(),
  hasTldr: boolean("has_tldr").notNull(),
  hasFaq: boolean("has_faq").notNull(),
  validationErrors: jsonb("validation_errors").$type<string[]>().notNull(),
  validationWarnings: jsonb("validation_warnings").$type<string[]>().notNull(),
  links: jsonb("links")
    .$type<{ anchor: string; url: string }[]>()
    .notNull(),
  ctaComponents: jsonb("cta_components")
    .$type<CtaComponent[]>()
    .notNull(),
  imageDescriptions: jsonb("image_descriptions").$type<string[]>().notNull(),
  syncId: integer("sync_id").references(() => syncs.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Kit Tags (live ConvertKit state) ---

export const kitTags = pgTable("kit_tags", {
  id: serial("id").primaryKey(),
  kitId: integer("kit_id").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  subscriberCount: integer("subscriber_count").notNull(),
  configName: varchar("config_name", { length: 255 }), // key in kit-config.ts, null if orphaned
  syncId: integer("sync_id").references(() => syncs.id),
  lastSynced: timestamp("last_synced").defaultNow().notNull(),
});

// --- Link Plan Entries (planned state) ---

export const linkPlanEntries = pgTable("link_plan_entries", {
  id: serial("id").primaryKey(),
  articleTitle: text("article_title").notNull(),
  url: varchar("url", { length: 500 }).notNull().unique(),
  categorySlug: varchar("category_slug", { length: 100 }).notNull(),
  links: jsonb("links")
    .$type<{ url: string; type: string; intent: string }[]>()
    .notNull(),
  ctas: jsonb("ctas")
    .$type<{ url: string | null; type: string; intent: string }[]>()
    .notNull(),
  isDeployed: boolean("is_deployed").notNull().default(false),
  deployedSlug: varchar("deployed_slug", { length: 255 }),
  syncId: integer("sync_id").references(() => syncs.id),
});

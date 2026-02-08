/**
 * Sync orchestrator — reads real artifacts, validates, writes to DB.
 *
 * Triggered by POST /api/admin/sync. Reads MDX files from disk,
 * parses them, validates against link plan, queries Kit API for tags,
 * and upserts everything into the Postgres tables.
 */

import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

import { db } from "@/lib/db";
import {
  articles as articlesTable,
  kitTags as kitTagsTable,
  linkPlanEntries as linkPlanTable,
  syncs as syncsTable,
} from "@/lib/db/schema";
import { kitTags as kitTagConfig } from "@/lib/kit-config";

import {
  buildUrlRegistry,
  findPlanEntry,
  validateArticle,
} from "./article-validator";
import { parseMdxArticle } from "./mdx-parser";
import type { LinkPlanEntry, SyncSummary } from "./types";

// ---------------------------------------------------------------------------
// File paths — dev vs prod
// ---------------------------------------------------------------------------

function getMdxDir(): string {
  const prodPath = path.join(process.cwd(), "mdx-sources");
  const devPath = path.join(
    process.cwd(),
    "src",
    "content",
    "blog",
    "posts",
  );
  return process.env["NODE_ENV"] === "production" ? prodPath : devPath;
}

function getLinkPlanPath(): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", "article_link_plan.json");
  }
  return path.join(process.cwd(), "..", "research", "article_link_plan.json");
}

function getCategoryCtasPath(): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", "category_ctas.json");
  }
  return path.join(process.cwd(), "..", "research", "category_ctas.json");
}

// ---------------------------------------------------------------------------
// Kit API helper
// ---------------------------------------------------------------------------

interface KitTag {
  id: number;
  name: string;
  subscribers_count?: number;
}

async function fetchKitTags(): Promise<KitTag[]> {
  const apiKey = process.env["KIT_API_KEY"];
  if (!apiKey) return [];

  const allTags: KitTag[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < 20; page++) {
    const url = new URL("https://api.kit.com/v4/tags");
    url.searchParams.set("per_page", "100");
    if (cursor) url.searchParams.set("after", cursor);

    const res = await fetch(url.toString(), {
      headers: {
        "X-Kit-Api-Key": apiKey,
        Accept: "application/json",
      },
    });

    if (!res.ok) break;

    const data = (await res.json()) as {
      tags: KitTag[];
      pagination?: { end_cursor?: string; has_next_page?: boolean };
    };
    allTags.push(...data.tags);

    if (!data.pagination?.has_next_page) break;
    cursor = data.pagination.end_cursor ?? null;
  }

  return allTags;
}

// ---------------------------------------------------------------------------
// Posts registry check
// ---------------------------------------------------------------------------

async function getRegisteredSlugs(): Promise<Set<string>> {
  const postsPath = path.join(
    process.cwd(),
    "src",
    "content",
    "blog",
    "posts.ts",
  );
  try {
    const content = await fs.readFile(postsPath, "utf-8");
    const slugMatches = content.matchAll(/slug:\s*"([^"]+)"/g);
    const slugs: string[] = [];
    for (const m of slugMatches) {
      const slug = m[1];
      if (slug != null) slugs.push(slug);
    }
    return new Set(slugs);
  } catch {
    return new Set();
  }
}

// ---------------------------------------------------------------------------
// Main sync
// ---------------------------------------------------------------------------

export async function runFullSync(): Promise<SyncSummary> {
  // 1. Create sync record
  const syncRows = await db
    .insert(syncsTable)
    .values({
      startedAt: new Date(),
      status: "running",
    })
    .returning();

  const sync = syncRows[0];
  if (!sync) throw new Error("Failed to create sync record");

  try {
    // 2. Read link plan
    let linkPlan: LinkPlanEntry[] = [];
    try {
      const planRaw = await fs.readFile(getLinkPlanPath(), "utf-8");
      linkPlan = JSON.parse(planRaw) as LinkPlanEntry[];
    } catch {
      // Link plan might not exist yet
    }
    const urlRegistry = buildUrlRegistry(linkPlan);

    // 3. Read category CTAs
    let categoryCtas:
      | Record<string, { course_name: string; freebie_name: string }>
      | undefined;
    try {
      const ctasRaw = await fs.readFile(getCategoryCtasPath(), "utf-8");
      categoryCtas = JSON.parse(ctasRaw) as Record<
        string,
        { course_name: string; freebie_name: string }
      >;
    } catch {
      // Category CTAs might not exist yet
    }

    // 4. Read all MDX files
    const mdxDir = getMdxDir();
    let mdxFiles: string[] = [];
    try {
      const entries = await fs.readdir(mdxDir);
      mdxFiles = entries.filter((f) => f.endsWith(".mdx")).sort();
    } catch {
      // No MDX files yet
    }

    // 5. Get registered slugs from posts.ts
    const registeredSlugs = await getRegisteredSlugs();

    // 6. Parse and validate each article
    let totalErrors = 0;
    let totalWarnings = 0;
    let registeredCount = 0;

    // Delete existing articles for this fresh sync
    await db.delete(articlesTable);

    for (const filename of mdxFiles) {
      const slug = filename.replace(/\.mdx$/, "");
      const content = await fs.readFile(path.join(mdxDir, filename), "utf-8");
      const parsed = parseMdxArticle(slug, content);
      if (!parsed) continue;

      const plan = findPlanEntry(linkPlan, parsed);
      const validation = validateArticle(
        parsed,
        plan,
        urlRegistry,
        categoryCtas,
      );

      const isRegistered = registeredSlugs.has(slug);
      if (isRegistered) registeredCount++;

      totalErrors += validation.errors.length;
      totalWarnings += validation.warnings.length;

      // Derive category slug from plan URL or metadata
      let categorySlug = "";
      if (plan) {
        const parts = plan.url.replace(/^\/|\/$/g, "").split("/");
        categorySlug =
          parts[0] === "blog" && parts.length > 1
            ? (parts[1] ?? "")
            : (parts[0] ?? "");
      } else {
        categorySlug = parsed.metadata.category
          .toLowerCase()
          .replace(/ /g, "-");
      }

      await db
        .insert(articlesTable)
        .values({
          slug,
          categorySlug,
          title: parsed.metadata.title,
          description: parsed.metadata.description,
          date: parsed.metadata.date,
          category: parsed.metadata.category,
          wordCount: parsed.wordCount,
          h2Count: parsed.h2Count,
          ctaCount: parsed.ctaCount,
          linkCount: parsed.linkCount,
          internalLinkCount: parsed.internalLinkCount,
          imageCount: parsed.imageCount,
          faqQuestionCount: parsed.faqQuestionCount,
          isRegistered,
          hasTldr: parsed.hasTldr,
          hasFaq: parsed.hasFaq,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          links: parsed.links,
          ctaComponents: parsed.ctaComponents,
          imageDescriptions: parsed.imageDescriptions,
          syncId: sync.id,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: articlesTable.slug,
          set: {
            categorySlug,
            title: parsed.metadata.title,
            description: parsed.metadata.description,
            date: parsed.metadata.date,
            category: parsed.metadata.category,
            wordCount: parsed.wordCount,
            h2Count: parsed.h2Count,
            ctaCount: parsed.ctaCount,
            linkCount: parsed.linkCount,
            internalLinkCount: parsed.internalLinkCount,
            imageCount: parsed.imageCount,
            faqQuestionCount: parsed.faqQuestionCount,
            isRegistered,
            hasTldr: parsed.hasTldr,
            hasFaq: parsed.hasFaq,
            validationErrors: validation.errors,
            validationWarnings: validation.warnings,
            links: parsed.links,
            ctaComponents: parsed.ctaComponents,
            imageDescriptions: parsed.imageDescriptions,
            syncId: sync.id,
            updatedAt: new Date(),
          },
        });
    }

    // 7. Upsert link plan entries
    await db.delete(linkPlanTable);
    let deployedCount = 0;

    for (const entry of linkPlan) {
      const urlSlug = entry.url.replace(/\/$/, "").split("/").pop() ?? "";
      const parts = entry.url.replace(/^\/|\/$/g, "").split("/");
      const catSlug =
        parts[0] === "blog" && parts.length > 1
          ? (parts[1] ?? "")
          : (parts[0] ?? "");

      const isDeployed = mdxFiles.some(
        (f) => f.replace(/\.mdx$/, "") === urlSlug,
      );
      if (isDeployed) deployedCount++;

      await db.insert(linkPlanTable).values({
        articleTitle: entry.article,
        url: entry.url,
        categorySlug: catSlug,
        links: entry.links ?? [],
        ctas: entry.ctas ?? [],
        isDeployed,
        deployedSlug: isDeployed ? urlSlug : null,
        syncId: sync.id,
      });
    }

    // 8. Sync Kit tags
    const kitApiTags = await fetchKitTags();
    if (kitApiTags.length > 0) {
      // Build reverse map: Kit tag ID → config name
      const idToConfigName = new Map<number, string>();
      for (const [name, id] of Object.entries(kitTagConfig)) {
        idToConfigName.set(id, name);
      }

      await db.delete(kitTagsTable);
      for (const tag of kitApiTags) {
        await db.insert(kitTagsTable).values({
          kitId: tag.id,
          name: tag.name,
          subscriberCount: tag.subscribers_count ?? 0,
          configName: idToConfigName.get(tag.id) ?? null,
          syncId: sync.id,
          lastSynced: new Date(),
        });
      }
    }

    // 9. Update sync record
    const summary: SyncSummary = {
      syncId: sync.id,
      articleCount: mdxFiles.length,
      registeredCount,
      errorCount: totalErrors,
      warningCount: totalWarnings,
      planEntryCount: linkPlan.length,
      deployedCount,
    };

    await db
      .update(syncsTable)
      .set({
        completedAt: new Date(),
        status: "completed",
        articleCount: summary.articleCount,
        registeredCount: summary.registeredCount,
        errorCount: summary.errorCount,
        warningCount: summary.warningCount,
        planEntryCount: summary.planEntryCount,
        deployedCount: summary.deployedCount,
        summary: `${summary.articleCount} articles, ${summary.deployedCount}/${summary.planEntryCount} deployed, ${summary.errorCount} errors, ${summary.warningCount} warnings`,
      })
      .where(eq(syncsTable.id, sync.id));

    return summary;
  } catch (error) {
    // Mark sync as failed
    await db
      .update(syncsTable)
      .set({
        completedAt: new Date(),
        status: "failed",
        summary: error instanceof Error ? error.message : String(error),
      })
      .where(eq(syncsTable.id, sync.id));

    throw error;
  }
}

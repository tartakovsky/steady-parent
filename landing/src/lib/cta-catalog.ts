/**
 * CTA catalog lookup — reads cta_catalog.json and provides
 * category-specific freebie/course data for page rendering.
 */

import fs from "fs/promises";
import path from "path";

import type { CtaDefinition } from "@steady-parent/content-spec";

function getCtaCatalogPath(): string {
  if (process.env["NODE_ENV"] === "production") {
    return path.join(process.cwd(), "mdx-sources", "cta_catalog.json");
  }
  return path.join(process.cwd(), "..", "research", "cta_catalog.json");
}

let catalogCache: CtaDefinition[] | null = null;

async function loadCatalog(): Promise<CtaDefinition[]> {
  if (catalogCache) return catalogCache;
  try {
    const raw = await fs.readFile(getCtaCatalogPath(), "utf-8");
    catalogCache = JSON.parse(raw) as CtaDefinition[];
    return catalogCache;
  } catch {
    return [];
  }
}

export async function getFreebieForCategory(
  categorySlug: string,
): Promise<{ name: string; description: string } | null> {
  const catalog = await loadCatalog();
  const freebie = catalog.find(
    (c) => c.type === "freebie" && c.id === `freebie-${categorySlug}`,
  );
  if (!freebie) return null;
  return { name: freebie.name, description: freebie.what_it_is };
}

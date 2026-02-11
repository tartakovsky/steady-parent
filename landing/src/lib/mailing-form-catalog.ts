/**
 * Mailing form catalog lookup — reads mailing_form_catalog.json and provides
 * category-specific freebie/waitlist data for page rendering.
 */

import fs from "fs/promises";
import path from "path";

import type { MailingFormEntry } from "@steady-parent/content-spec";

const CATALOG_PATHS = [
  path.join(process.cwd(), "mdx-sources", "mailing_form_catalog.json"),
  path.join(process.cwd(), "..", "content-plan", "mailing_form_catalog.json"),
];

let catalogCache: MailingFormEntry[] | null = null;

async function loadCatalog(): Promise<MailingFormEntry[]> {
  if (catalogCache) return catalogCache;
  for (const p of CATALOG_PATHS) {
    try {
      const raw = await fs.readFile(p, "utf-8");
      catalogCache = JSON.parse(raw) as MailingFormEntry[];
      return catalogCache;
    } catch {
      continue;
    }
  }
  return [];
}

export async function getAllWaitlists(): Promise<MailingFormEntry[]> {
  const catalog = await loadCatalog();
  return catalog.filter((c) => c.type === "waitlist");
}

export async function getWaitlistBySlug(
  slug: string,
): Promise<MailingFormEntry | null> {
  const catalog = await loadCatalog();
  const waitlist = catalog.find(
    (c) => c.type === "waitlist" && c.pageUrlPattern === `/course/${slug}/`,
  );
  return waitlist ?? null;
}

export async function getFreebieForCategory(
  categorySlug: string,
): Promise<{ name: string; description: string } | null> {
  const catalog = await loadCatalog();
  const freebie = catalog.find(
    (c) => c.type === "freebie" && c.id === `freebie-${categorySlug}`,
  );
  if (!freebie) return null;
  return { name: freebie.name, description: freebie.what_it_is ?? "" };
}

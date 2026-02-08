/**
 * Coverage analysis — plan vs reality.
 * Shows how many planned entries are deployed, per-category breakdown.
 */

import type { LinkPlanEntry, ParsedArticle } from "../types.js";
import { findPlanEntry } from "./article.js";

export interface CoverageReport {
  totalPlanned: number;
  totalDeployed: number;
  coveragePercent: number;
  perCategory: {
    category: string;
    planned: number;
    deployed: number;
    coveragePercent: number;
  }[];
  unmatched: string[]; // deployed articles with no plan entry
  missing: string[]; // plan entries with no deployed article
}

export function analyzeCoverage(
  linkPlan: LinkPlanEntry[],
  articles: ParsedArticle[],
): CoverageReport {
  const matchedPlanUrls = new Set<string>();
  const unmatched: string[] = [];

  for (const article of articles) {
    const entry = findPlanEntry(linkPlan, article);
    if (entry) {
      matchedPlanUrls.add(entry.url);
    } else {
      unmatched.push(article.slug);
    }
  }

  const missing = linkPlan
    .filter((e) => !matchedPlanUrls.has(e.url))
    .map((e) => e.article);

  // Per-category breakdown
  const catPlanned = new Map<string, number>();
  const catDeployed = new Map<string, number>();

  for (const entry of linkPlan) {
    const cat = entry.category ?? "uncategorized";
    catPlanned.set(cat, (catPlanned.get(cat) ?? 0) + 1);
    if (matchedPlanUrls.has(entry.url)) {
      catDeployed.set(cat, (catDeployed.get(cat) ?? 0) + 1);
    }
  }

  const perCategory = [...catPlanned.entries()]
    .map(([category, planned]) => {
      const deployed = catDeployed.get(category) ?? 0;
      return {
        category,
        planned,
        deployed,
        coveragePercent: planned > 0 ? Math.round((deployed / planned) * 100) : 0,
      };
    })
    .sort((a, b) => b.planned - a.planned);

  const totalPlanned = linkPlan.length;
  const totalDeployed = matchedPlanUrls.size;

  return {
    totalPlanned,
    totalDeployed,
    coveragePercent:
      totalPlanned > 0 ? Math.round((totalDeployed / totalPlanned) * 100) : 0,
    perCategory,
    unmatched,
    missing,
  };
}

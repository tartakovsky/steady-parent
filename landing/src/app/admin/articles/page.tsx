"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ValidationBadge } from "@/components/admin/validation-badge";

interface ArticleRow {
  id: number;
  slug: string;
  categorySlug: string;
  title: string;
  wordCount: number;
  ctaCount: number;
  linkCount: number;
  internalLinkCount: number;
  imageCount: number;
  faqQuestionCount: number;
  isRegistered: boolean;
  validationErrors: string[];
  validationWarnings: string[];
}

interface CategoryGroup {
  slug: string;
  articles: ArticleRow[];
  errorCount: number;
  warningCount: number;
}

function groupByCategory(articles: ArticleRow[]): CategoryGroup[] {
  const map = new Map<string, ArticleRow[]>();
  for (const a of articles) {
    const cat = a.categorySlug || "uncategorized";
    const list = map.get(cat) ?? [];
    list.push(a);
    map.set(cat, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([slug, articles]) => ({
      slug,
      articles,
      errorCount: articles.reduce(
        (s, a) => s + a.validationErrors.length,
        0,
      ),
      warningCount: articles.reduce(
        (s, a) => s + a.validationWarnings.length,
        0,
      ),
    }));
}

export default function ArticlesPage() {
  const [data, setData] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json() as Promise<ArticleRow[]>)
      .then((rows) => {
        setData(rows);
        // Expand all categories by default
        const cats = new Set(rows.map((r) => r.categorySlug || "uncategorized"));
        setExpanded(cats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading articles...</p>;
  }

  const filtered = globalFilter
    ? data.filter(
        (a) =>
          a.slug.includes(globalFilter.toLowerCase()) ||
          a.categorySlug.includes(globalFilter.toLowerCase()) ||
          a.title.toLowerCase().includes(globalFilter.toLowerCase()),
      )
    : data;

  const groups = groupByCategory(filtered);

  function toggle(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(groups.map((g) => g.slug)));
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  const totalErrors = data.reduce(
    (s, a) => s + a.validationErrors.length,
    0,
  );
  const totalWarnings = data.reduce(
    (s, a) => s + a.validationWarnings.length,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Articles ({data.length})</h1>
          <p className="text-sm text-muted-foreground">
            {groups.length} categories
            {totalErrors > 0 && (
              <span className="text-red-600"> — {totalErrors} errors</span>
            )}
            {totalWarnings > 0 && (
              <span className="text-amber-600">
                {totalErrors > 0 ? ", " : " — "}
                {totalWarnings} warnings
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            Expand all
          </button>
          <button
            onClick={collapseAll}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            Collapse all
          </button>
          <Input
            placeholder="Filter articles..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        {groups.map((group) => {
          const isOpen = expanded.has(group.slug);
          return (
            <div key={group.slug} className="rounded-md border">
              <button
                onClick={() => toggle(group.slug)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-muted/30"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="font-medium">{group.slug}</span>
                <span className="text-sm text-muted-foreground">
                  ({group.articles.length})
                </span>
                {group.errorCount > 0 && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {group.errorCount} errors
                  </span>
                )}
                {group.warningCount > 0 && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {group.warningCount} warnings
                  </span>
                )}
              </button>
              {isOpen && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t bg-muted/50">
                      <th className="px-4 py-1.5 text-left font-medium text-muted-foreground">
                        Slug
                      </th>
                      <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">
                        Words
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">
                        CTAs
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">
                        Links
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">
                        Images
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">
                        FAQs
                      </th>
                      <th className="px-3 py-1.5 text-center font-medium text-muted-foreground">
                        Reg
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.articles.map((article) => (
                      <tr
                        key={article.slug}
                        className="border-t hover:bg-muted/30"
                      >
                        <td className="px-4 py-1.5">
                          <Link
                            href={`/admin/articles/${article.slug}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {article.slug}
                          </Link>
                        </td>
                        <td className="px-3 py-1.5">
                          <ValidationBadge
                            errors={article.validationErrors.length}
                            warnings={article.validationWarnings.length}
                          />
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums">
                          {article.wordCount.toLocaleString()}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums">
                          {article.ctaCount}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums">
                          {article.linkCount}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums">
                          {article.imageCount}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums">
                          {article.faqQuestionCount}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          {article.isRegistered ? (
                            <Check className="mx-auto h-4 w-4 text-emerald-600" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-red-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

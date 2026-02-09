"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  XCircle,
  Map,
  Clock,
  ChevronRight,
  X,
} from "lucide-react";

import { StatsCard } from "@/components/admin/stats-card";
import { SyncButton } from "@/components/admin/sync-button";

interface SyncData {
  id: number;
  startedAt: string;
  completedAt: string | null;
  status: string;
  articleCount: number | null;
  registeredCount: number | null;
  errorCount: number | null;
  warningCount: number | null;
  planEntryCount: number | null;
  deployedCount: number | null;
  summary: string | null;
}

interface ArticleRow {
  slug: string;
  title: string;
  categorySlug: string;
  validationErrors: string[];
  validationWarnings: string[];
}

type DetailPanel = "errors" | "warnings" | null;

export default function AdminDashboard() {
  const [sync, setSync] = useState<SyncData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailPanel, setDetailPanel] = useState<DetailPanel>(null);
  const [articleData, setArticleData] = useState<ArticleRow[] | null>(null);
  const [articlesLoading, setArticlesLoading] = useState(false);

  const fetchSync = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sync");
      const data = (await res.json()) as SyncData | { status: "never_run" };
      if ("id" in data) {
        setSync(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSync();
  }, [fetchSync]);

  const fetchArticles = useCallback(async () => {
    if (articleData) return;
    setArticlesLoading(true);
    try {
      const res = await fetch("/api/admin/articles");
      const data = (await res.json()) as ArticleRow[];
      setArticleData(data);
    } finally {
      setArticlesLoading(false);
    }
  }, [articleData]);

  function handleCardClick(panel: "errors" | "warnings") {
    if (detailPanel === panel) {
      setDetailPanel(null);
      return;
    }
    setDetailPanel(panel);
    void fetchArticles();
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const articleCount = sync?.articleCount ?? 0;
  const planCount = sync?.planEntryCount ?? 245;
  const deployedCount = sync?.deployedCount ?? 0;
  const errorCount = sync?.errorCount ?? 0;
  const warningCount = sync?.warningCount ?? 0;
  const registeredCount = sync?.registeredCount ?? 0;

  const filteredArticles = articleData
    ? articleData.filter((a) =>
        detailPanel === "errors"
          ? a.validationErrors.length > 0
          : a.validationWarnings.length > 0,
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {sync && (
            <p className="text-sm text-muted-foreground">
              Last sync:{" "}
              {sync.completedAt
                ? new Date(sync.completedAt).toLocaleString()
                : "in progress"}{" "}
              — {sync.status}
            </p>
          )}
          {!sync && (
            <p className="text-sm text-muted-foreground">
              No sync has been run yet. Click Sync Now.
            </p>
          )}
        </div>
        <SyncButton onSyncComplete={() => void fetchSync()} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Deployed Articles"
          value={`${articleCount}`}
          subtitle={`${registeredCount} registered in posts.ts`}
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Plan Coverage"
          value={`${deployedCount} / ${planCount}`}
          subtitle={`${planCount > 0 ? Math.round((deployedCount / planCount) * 100) : 0}% deployed`}
          icon={Map}
          variant={deployedCount === planCount ? "success" : "default"}
        />
        <StatsCard
          title="Errors"
          value={errorCount}
          subtitle="Across all articles"
          icon={XCircle}
          variant={errorCount > 0 ? "error" : "success"}
          onClick={errorCount > 0 ? () => handleCardClick("errors") : undefined}
          active={detailPanel === "errors"}
        />
        <StatsCard
          title="Warnings"
          value={warningCount}
          subtitle="Across all articles"
          icon={AlertTriangle}
          variant={warningCount > 0 ? "warning" : "success"}
          onClick={
            warningCount > 0 ? () => handleCardClick("warnings") : undefined
          }
          active={detailPanel === "warnings"}
        />
      </div>

      {detailPanel && (
        <div
          className={`rounded-lg border p-4 ${
            detailPanel === "errors"
              ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
              : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {detailPanel === "errors" ? "All Errors" : "All Warnings"} by
              Article
            </h2>
            <button
              onClick={() => setDetailPanel(null)}
              className="rounded p-1 hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {articlesLoading && (
            <p className="text-sm text-muted-foreground">Loading articles...</p>
          )}

          {!articlesLoading && filteredArticles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No {detailPanel} found.
            </p>
          )}

          {!articlesLoading && filteredArticles.length > 0 && (
            <div className="space-y-3">
              {filteredArticles.map((article) => {
                const items =
                  detailPanel === "errors"
                    ? article.validationErrors
                    : article.validationWarnings;
                return (
                  <div
                    key={article.slug}
                    className="rounded-md border bg-white/60 p-3 dark:bg-black/10"
                  >
                    <Link
                      href={`/admin/articles/${article.slug}`}
                      className="group mb-1.5 flex items-center gap-1.5 text-sm font-medium hover:underline"
                    >
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {article.categorySlug}
                      </span>
                      {article.slug}
                      <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <ul className="space-y-0.5">
                      {items.map((msg, i) => (
                        <li
                          key={i}
                          className={`text-xs ${
                            detailPanel === "errors"
                              ? "text-red-700 dark:text-red-400"
                              : "text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          &bull; {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {sync?.summary && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Sync Summary
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{sync.summary}</p>
        </div>
      )}
    </div>
  );
}

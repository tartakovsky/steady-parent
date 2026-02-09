"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Minus, ChevronDown, ChevronRight } from "lucide-react";

interface PlanArticle {
  id: number;
  articleTitle: string;
  url: string;
  categorySlug: string;
  isDeployed: boolean;
  deployedSlug: string | null;
}

interface PlanQuiz {
  slug: string;
  title: string;
  url: string;
  isDeployed: boolean;
}

interface PlanData {
  articles: PlanArticle[];
  quizzes: PlanQuiz[];
}

interface CategoryGroup {
  slug: string;
  articles: PlanArticle[];
  deployed: number;
  total: number;
}

function groupByCategory(articles: PlanArticle[]): CategoryGroup[] {
  const map = new Map<string, PlanArticle[]>();
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
      deployed: articles.filter((a) => a.isDeployed).length,
      total: articles.length,
    }));
}

export default function PlanPage() {
  const [data, setData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [showArticles, setShowArticles] = useState(true);
  const [showQuizzes, setShowQuizzes] = useState(true);

  useEffect(() => {
    fetch("/api/admin/plan")
      .then((r) => r.json() as Promise<PlanData>)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!data) return <p className="text-muted-foreground">Failed to load.</p>;

  const { articles, quizzes } = data;
  const articleGroups = groupByCategory(articles);
  const deployedArticles = articles.filter((a) => a.isDeployed).length;
  const deployedQuizzes = quizzes.filter((q) => q.isDeployed).length;

  function toggleCat(slug: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function expandAllCats() {
    setExpandedCats(new Set(articleGroups.map((g) => g.slug)));
  }

  function collapseAllCats() {
    setExpandedCats(new Set());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plan vs Reality</h1>
        <p className="text-sm text-muted-foreground">
          Articles: {deployedArticles}/{articles.length} deployed (
          {articles.length > 0
            ? Math.round((deployedArticles / articles.length) * 100)
            : 0}
          %) — Quizzes: {deployedQuizzes}/{quizzes.length} deployed (
          {quizzes.length > 0
            ? Math.round((deployedQuizzes / quizzes.length) * 100)
            : 0}
          %)
        </p>
      </div>

      {/* Articles section */}
      <div className="rounded-md border">
        <button
          onClick={() => setShowArticles((v) => !v)}
          className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/30"
        >
          {showArticles ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="text-lg font-semibold">Articles</span>
          <span className="text-sm text-muted-foreground">
            {deployedArticles}/{articles.length}
          </span>
          {deployedArticles === articles.length && articles.length > 0 && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              complete
            </span>
          )}
        </button>

        {showArticles && (
          <div className="border-t px-4 py-2">
            <div className="mb-2 flex gap-2">
              <button
                onClick={expandAllCats}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                Expand all
              </button>
              <button
                onClick={collapseAllCats}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                Collapse all
              </button>
            </div>
            <div className="space-y-1">
              {articleGroups.map((group) => {
                const isOpen = expandedCats.has(group.slug);
                const allDone = group.deployed === group.total;
                return (
                  <div
                    key={group.slug}
                    className="rounded border"
                  >
                    <button
                      onClick={() => toggleCat(group.slug)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/30"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="font-medium">{group.slug}</span>
                      <span
                        className={`text-xs ${allDone ? "text-emerald-600" : "text-muted-foreground"}`}
                      >
                        {group.deployed}/{group.total}
                      </span>
                      {allDone && (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </button>
                    {isOpen && (
                      <table className="w-full text-sm">
                        <tbody>
                          {group.articles.map((entry) => (
                            <tr
                              key={entry.id}
                              className="border-t hover:bg-muted/30"
                            >
                              <td className="w-10 px-3 py-1 text-center">
                                {entry.isDeployed ? (
                                  <Check className="mx-auto h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Minus className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </td>
                              <td className="px-3 py-1">
                                {entry.isDeployed && entry.deployedSlug ? (
                                  <Link
                                    href={`/admin/articles/${entry.deployedSlug}`}
                                    className="text-primary hover:underline"
                                  >
                                    {entry.articleTitle}
                                  </Link>
                                ) : (
                                  <span className="text-muted-foreground">
                                    {entry.articleTitle}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-1 text-right font-mono text-xs text-muted-foreground">
                                {entry.url}
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
        )}
      </div>

      {/* Quizzes section */}
      <div className="rounded-md border">
        <button
          onClick={() => setShowQuizzes((v) => !v)}
          className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/30"
        >
          {showQuizzes ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="text-lg font-semibold">Quizzes</span>
          <span className="text-sm text-muted-foreground">
            {deployedQuizzes}/{quizzes.length}
          </span>
          {deployedQuizzes === quizzes.length && quizzes.length > 0 && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              complete
            </span>
          )}
        </button>

        {showQuizzes && (
          <table className="w-full border-t text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="w-10 px-3 py-1.5 text-center font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                  Title
                </th>
                <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                  URL
                </th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr
                  key={quiz.slug}
                  className="border-t hover:bg-muted/30"
                >
                  <td className="px-3 py-1.5 text-center">
                    {quiz.isDeployed ? (
                      <Check className="mx-auto h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Minus className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {quiz.isDeployed ? (
                      <Link
                        href={quiz.url}
                        className="text-primary hover:underline"
                      >
                        {quiz.title}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">
                        {quiz.title}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">
                    {quiz.url}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

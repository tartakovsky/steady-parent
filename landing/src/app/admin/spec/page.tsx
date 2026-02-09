"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Types matching the API response (mirrors content-spec Zod shapes)
// ---------------------------------------------------------------------------

interface Category {
  slug: string;
  name: string;
}

interface ArticleEntry {
  slug: string;
  title: string;
  url: string;
  categorySlug?: string | undefined;
  type: "pillar" | "series" | "standalone";
  seriesPosition?: number | undefined;
}

interface PageType {
  name: string;
  constraints: {
    wordCount: { min: number; max: number };
    h2Count: { min: number; max: number };
    ctaCount: { min: number; max: number };
    imageCount: { min: number; max: number };
    faqQuestionCount: { min: number; max: number };
    requiresTldr: boolean;
    requiresFaq: boolean;
    minInternalLinks: number;
  };
}

interface CtaCopy {
  eyebrow: string;
  title: string;
  body: string;
  buttonText: string;
}

interface CtaDefinition {
  id: string;
  type: string;
  name: string;
  url?: string | undefined;
  what_it_is: string;
  founder_presence?: string | undefined;
  cta_copy?: CtaCopy | undefined;
  can_promise: string[];
  cant_promise: string[];
}

interface QuizEntry {
  slug: string;
  title: string;
  url: string;
  connectsTo: string[];
}

interface QuizPageType {
  name: string;
  constraints: Record<string, unknown>;
}

interface ResolvedLink {
  url: string;
  type: string;
  intent: string;
  targetTitle: string | null;
  valid: boolean;
}

interface ResolvedCta {
  url: string | null;
  type: string;
  intent: string;
}

interface CrossLinkArticle {
  title: string;
  url: string;
  links: ResolvedLink[];
  ctas: ResolvedCta[];
}

interface CrossLinkCategory {
  slug: string;
  name: string;
  articles: CrossLinkArticle[];
}

interface CrossLinkDetail {
  stats: {
    articleCount: number;
    totalLinks: number;
    linksByType: Record<string, number>;
    totalCtas: number;
    ctasByType: Record<string, number>;
  };
  categories: CrossLinkCategory[];
  orphanedArticles: string[];
  validation: ValidationResult;
}

interface MailingTag {
  id: string;
  name: string;
  kitTagId?: number | undefined;
}

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

interface SpecData {
  taxonomy: { categories: Category[]; entries: ArticleEntry[] } | null;
  quizTaxonomy: { entries: QuizEntry[] } | null;
  pageTypes: PageType[] | null;
  quizPageTypes: QuizPageType[] | null;
  ctaCatalog: CtaDefinition[] | null;
  mailingTags: MailingTag[] | null;
  ctaValidation: ValidationResult | null;
  crossLinkDetail: CrossLinkDetail | null;
}

type Tab = "taxonomy" | "pageTypes" | "crossLinks" | "ctas" | "mailing";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SpecPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
      <SpecPageInner />
    </Suspense>
  );
}

function SpecPageInner() {
  const [data, setData] = useState<SpecData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as Tab) ?? "taxonomy";

  useEffect(() => {
    fetch("/api/admin/spec")
      .then((r) => r.json() as Promise<SpecData>)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!data) return <p className="text-muted-foreground">Failed to load spec data.</p>;

  return (
    <div className="space-y-6">
      {tab === "taxonomy" && (
        <TaxonomyTab
          data={data.taxonomy}
          quizData={data.quizTaxonomy}
        />
      )}
      {tab === "pageTypes" && (
        <PageTypesTab data={data.pageTypes} quizData={data.quizPageTypes} />
      )}
      {tab === "crossLinks" && (
        <CrossLinksTab data={data.crossLinkDetail} />
      )}
      {tab === "ctas" && (
        <CtasTab data={data.ctaCatalog} validation={data.ctaValidation} />
      )}
      {tab === "mailing" && <MailingTab data={data.mailingTags} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Taxonomy tab
// ---------------------------------------------------------------------------

function TaxonomyTab({
  data,
  quizData,
}: {
  data: { categories: Category[]; entries: ArticleEntry[] } | null;
  quizData: { entries: QuizEntry[] } | null;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!data && !quizData)
    return <p className="text-muted-foreground">No taxonomy data.</p>;

  const categories = data?.categories ?? [];
  const entries = data?.entries ?? [];
  const pillarCount = entries.filter((e) => e.type === "pillar").length;
  const seriesCount = entries.filter((e) => e.type === "series").length;
  const quizzes = quizData?.entries ?? [];

  const entriesByCategory = new Map<string, ArticleEntry[]>();
  for (const entry of entries) {
    const cat = entry.categorySlug ?? "uncategorized";
    const list = entriesByCategory.get(cat) ?? [];
    list.push(entry);
    entriesByCategory.set(cat, list);
  }

  function toggle(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Articles */}
      {data && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Articles</h3>
          <p className="text-sm text-muted-foreground">
            {categories.length} categories, {entries.length} articles ({pillarCount}{" "}
            pillar, {seriesCount} series)
          </p>

          <div className="space-y-2">
            {categories.map((cat) => {
              const articles = entriesByCategory.get(cat.slug) ?? [];
              const isOpen = expanded.has(cat.slug);
              const pillar = articles.find((a) => a.type === "pillar");
              return (
                <div key={cat.slug} className="rounded-lg border">
                  <button
                    onClick={() => toggle(cat.slug)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-muted/30"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {articles.length} articles
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t px-4 py-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-muted-foreground">
                            <th className="pb-1 font-medium">Type</th>
                            <th className="pb-1 font-medium">Title</th>
                            <th className="pb-1 font-medium">URL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {articles
                            .sort((a, b) => {
                              if (a.type === "pillar") return -1;
                              if (b.type === "pillar") return 1;
                              return (a.seriesPosition ?? 99) - (b.seriesPosition ?? 99);
                            })
                            .map((a) => (
                              <tr key={a.slug} className="border-t border-dashed">
                                <td className="py-1 pr-2">
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-xs ${
                                      a.type === "pillar"
                                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {a.type}
                                    {a.seriesPosition != null
                                      ? ` #${a.seriesPosition}`
                                      : ""}
                                  </span>
                                </td>
                                <td className="py-1 pr-2">{a.title}</td>
                                <td className="py-1 font-mono text-xs text-muted-foreground">
                                  {a.url}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {pillar && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Pillar: {pillar.title}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quizzes</h3>
          <p className="text-sm text-muted-foreground">
            {quizzes.length} quizzes
          </p>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">Title</th>
                  <th className="px-3 py-2 text-left font-medium">URL</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q.slug} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">{q.title}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {q.url}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Types tab
// ---------------------------------------------------------------------------

function PageTypesTab({
  data,
  quizData,
}: {
  data: PageType[] | null;
  quizData: QuizPageType[] | null;
}) {
  if (!data && !quizData)
    return <p className="text-muted-foreground">No page type data.</p>;

  return (
    <div className="space-y-6">
      {/* Article page types */}
      {data && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Article Page Types</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.map((pt) => (
              <div key={pt.name} className="rounded-lg border p-4">
                <h4 className="mb-3 text-base font-semibold capitalize">
                  {pt.name}
                </h4>
                <dl className="space-y-1.5 text-sm">
                  <Row label="Word count" value={`${pt.constraints.wordCount.min} – ${pt.constraints.wordCount.max}`} />
                  <Row label="H2 headings" value={`${pt.constraints.h2Count.min} – ${pt.constraints.h2Count.max}`} />
                  <Row label="CTA components" value={`${pt.constraints.ctaCount.min} – ${pt.constraints.ctaCount.max}`} />
                  <Row label="Image slots" value={`${pt.constraints.imageCount.min} – ${pt.constraints.imageCount.max}`} />
                  <Row label="FAQ questions" value={`${pt.constraints.faqQuestionCount.min} – ${pt.constraints.faqQuestionCount.max}`} />
                  <Row label="Min internal links" value={`${pt.constraints.minInternalLinks}`} />
                  <Row label="Requires TL;DR" value={pt.constraints.requiresTldr ? "Yes" : "No"} />
                  <Row label="Requires FAQ" value={pt.constraints.requiresFaq ? "Yes" : "No"} />
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz page types */}
      {quizData && quizData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quiz Page Types</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {quizData.map((qt) => (
              <div key={qt.name} className="rounded-lg border p-4">
                <h4 className="mb-3 text-base font-semibold capitalize">
                  {qt.name}
                </h4>
                <dl className="space-y-1.5 text-sm">
                  {Object.entries(qt.constraints).map(([key, value]) => {
                    let display: string;
                    if (
                      typeof value === "object" &&
                      value !== null &&
                      "min" in value &&
                      "max" in value
                    ) {
                      const range = value as { min: number; max: number };
                      display = `${range.min} – ${range.max}`;
                    } else if (typeof value === "boolean") {
                      display = value ? "Yes" : "No";
                    } else {
                      display = String(value);
                    }
                    const label = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase());
                    return <Row key={key} label={label} value={display} />;
                  })}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cross-Linking tab
// ---------------------------------------------------------------------------

const LINK_TYPE_COLORS: Record<string, string> = {
  cross: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  sibling: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  quiz: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  series_preview: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pillar: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  prev: "bg-muted text-muted-foreground",
  next: "bg-muted text-muted-foreground",
  course: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  community: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  freebie: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

function CrossLinksTab({ data }: { data: CrossLinkDetail | null }) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  if (!data)
    return <p className="text-muted-foreground">No cross-linking data.</p>;

  const { stats, categories, orphanedArticles, validation } = data;

  function toggleCat(slug: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleArticle(url: string) {
    setExpandedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Validation */}
      {validation.errors.length > 0 || validation.warnings.length > 0 ? (
        <div className="rounded-lg border bg-red-50 p-4 dark:bg-red-950/20">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
            Validation ({validation.errors.length} errors, {validation.warnings.length} warnings)
          </h3>
          {validation.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-red-600 dark:text-red-400">
              {validation.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          {validation.warnings.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-amber-600 dark:text-amber-400">
              {validation.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950/20">
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            All cross-link validation checks passed
          </p>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold">{stats.articleCount}</div>
          <div className="text-xs text-muted-foreground">articles with link plans</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold">{stats.totalLinks}</div>
          <div className="text-xs text-muted-foreground">total links</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold">{stats.totalCtas}</div>
          <div className="text-xs text-muted-foreground">total CTAs</div>
        </div>
      </div>

      {/* Articles (nested: category → article → outgoing links) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Articles</h3>
        <div className="space-y-2">
          {categories.map((cat) => {
            const catOpen = expandedCats.has(cat.slug);
            const totalCatLinks = cat.articles.reduce((n, a) => n + a.links.length + a.ctas.length, 0);
            const invalidCount = cat.articles.reduce(
              (n, a) => n + a.links.filter((l) => !l.valid).length,
              0,
            );
            return (
              <div key={cat.slug} className="rounded-lg border">
                <button
                  onClick={() => toggleCat(cat.slug)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-muted/30"
                >
                  {catOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {cat.articles.length} articles, {totalCatLinks} links
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {invalidCount} invalid
                    </span>
                  )}
                </button>
                {catOpen && (
                  <div className="border-t">
                    {cat.articles.map((article) => {
                      const artOpen = expandedArticles.has(article.url);
                      const artInvalid = article.links.filter((l) => !l.valid).length;
                      return (
                        <div key={article.url} className="border-b last:border-b-0">
                          <button
                            onClick={() => toggleArticle(article.url)}
                            className="flex w-full items-center gap-2 px-6 py-2 text-left text-sm hover:bg-muted/20"
                          >
                            {artOpen ? (
                              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                            )}
                            <span className="truncate">{article.title}</span>
                            <span className="shrink-0 font-mono text-xs text-muted-foreground">
                              {article.url}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {article.links.length} links, {article.ctas.length} CTAs
                            </span>
                            {artInvalid > 0 ? (
                              <span className="shrink-0 text-xs text-red-600">
                                {artInvalid} invalid
                              </span>
                            ) : (
                              <span className="shrink-0 text-xs text-emerald-600">✓</span>
                            )}
                          </button>
                          {artOpen && (
                            <div className="bg-muted/10 px-8 py-2">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-left text-muted-foreground">
                                    <th className="pb-1 pr-2 font-medium">Status</th>
                                    <th className="pb-1 pr-2 font-medium">Type</th>
                                    <th className="pb-1 pr-2 font-medium">Target</th>
                                    <th className="pb-1 font-medium">URL</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {article.links.map((link, i) => (
                                    <tr key={`link-${i}`} className="border-t border-dashed">
                                      <td className="py-1 pr-2">
                                        {link.valid ? (
                                          <span className="text-emerald-600">✓</span>
                                        ) : (
                                          <span className="text-red-600">✗</span>
                                        )}
                                      </td>
                                      <td className="py-1 pr-2">
                                        <span
                                          className={`rounded px-1.5 py-0.5 text-[10px] ${
                                            LINK_TYPE_COLORS[link.type] ?? "bg-muted text-muted-foreground"
                                          }`}
                                        >
                                          {link.type}
                                        </span>
                                      </td>
                                      <td className="py-1 pr-2">
                                        {link.targetTitle ?? (
                                          <span className="text-red-600">Unknown</span>
                                        )}
                                      </td>
                                      <td className="py-1 font-mono text-muted-foreground">
                                        {link.url}
                                      </td>
                                    </tr>
                                  ))}
                                  {article.ctas.map((cta, i) => (
                                    <tr key={`cta-${i}`} className="border-t border-dashed">
                                      <td className="py-1 pr-2">
                                        <span className="text-emerald-600">✓</span>
                                      </td>
                                      <td className="py-1 pr-2">
                                        <span
                                          className={`rounded px-1.5 py-0.5 text-[10px] ${
                                            LINK_TYPE_COLORS[cta.type] ?? "bg-muted text-muted-foreground"
                                          }`}
                                        >
                                          {cta.type}
                                        </span>
                                      </td>
                                      <td className="py-1 pr-2 text-muted-foreground">
                                        {cta.intent}
                                      </td>
                                      <td className="py-1 font-mono text-muted-foreground">
                                        {cta.url ?? "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Orphaned articles */}
      {orphanedArticles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400">
            Orphaned Articles ({orphanedArticles.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Articles in taxonomy with no link plan entry
          </p>
          <ul className="list-inside list-disc text-sm text-amber-600 dark:text-amber-400">
            {orphanedArticles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CTAs tab
// ---------------------------------------------------------------------------

function CtasTab({
  data,
  validation,
}: {
  data: CtaDefinition[] | null;
  validation: ValidationResult | null;
}) {
  if (!data) return <p className="text-muted-foreground">No CTA data.</p>;

  const globalCommunity = data.find(
    (c) => c.type === "community" && c.id === "community",
  );
  const perCatCommunities = data.filter(
    (c) => c.type === "community" && c.id !== "community",
  );
  const courses = data.filter((c) => c.type === "course");
  const freebies = data.filter((c) => c.type === "freebie");

  const categorySlug = (id: string) =>
    id.replace(/^(course|freebie|community)-/, "");

  const communityBySlug = new Map(
    perCatCommunities.map((c) => [categorySlug(c.id), c]),
  );

  return (
    <div className="space-y-6">
      {/* Global community info */}
      {globalCommunity && (
        <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/20">
          <h3 className="text-sm font-semibold">
            Community: {globalCommunity.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {globalCommunity.what_it_is}
          </p>
          {globalCommunity.url && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {globalCommunity.url}
            </p>
          )}
          {globalCommunity.founder_presence && (
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
              {globalCommunity.founder_presence}
            </p>
          )}
          {globalCommunity.cant_promise.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                Do not promise:
              </p>
              <ul className="mt-0.5 list-inside list-disc text-xs text-muted-foreground">
                {globalCommunity.cant_promise.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Validation results */}
      {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="rounded-lg border bg-red-50 p-4 dark:bg-red-950/20">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
            CTA Validation ({validation.errors.length} errors, {validation.warnings.length} warnings)
          </h3>
          {validation.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-red-600 dark:text-red-400">
              {validation.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          {validation.warnings.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-amber-600 dark:text-amber-400">
              {validation.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {validation && validation.errors.length === 0 && validation.warnings.length === 0 && (
        <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950/20">
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            All CTA validation checks passed
          </p>
        </div>
      )}

      {/* Quiz CTA rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quiz CTA Rules</h3>
        <p className="text-sm text-muted-foreground">
          Every quiz must include these CTA blocks in its meta. The validator checks all rules below.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 text-sm font-semibold">Community CTA</h4>
            <dl className="space-y-1.5 text-xs">
              <Row label="buttonText" value='"Join the community"' />
              <Row label="Required in body" value='"We are there with you daily too"' />
              <Row label="Eyebrow" value="2-5 words" />
              <Row label="Title" value="3-12 words" />
              <Row label="Body" value="8-35 words" />
            </dl>
            <div className="mt-2 text-[10px] text-red-600 dark:text-red-400">
              No exclamation marks. No forbidden terms.
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 text-sm font-semibold">Preview CTA</h4>
            <dl className="space-y-1.5 text-xs">
              <Row label="buttonText" value='"Send my results"' />
              <Row label="eyebrow" value="required" />
              <Row label="title" value="required" />
              <Row label="body" value="required" />
            </dl>
          </div>
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 text-sm font-semibold">Preview Promises</h4>
            <dl className="space-y-1.5 text-xs">
              <Row label="Count" value="3-5 items" />
              <Row label="Content" value="Must match what the result page renders" />
            </dl>
          </div>
        </div>
      </div>

      {/* Per-category table: Community + Course + Freebie */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">Category</th>
              <th className="px-3 py-2 text-left font-medium">
                Community Pitch
              </th>
              <th className="px-3 py-2 text-left font-medium">Course</th>
              <th className="px-3 py-2 text-left font-medium">Freebie</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const slug = categorySlug(course.id);
              const freebie = freebies.find(
                (f) => categorySlug(f.id) === slug,
              );
              const community = communityBySlug.get(slug);
              return (
                <tr key={course.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {slug}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {community?.cta_copy ? (
                      <div className="text-xs">
                        <div className="text-muted-foreground">
                          {community.cta_copy.eyebrow}
                        </div>
                        <div className="font-medium">
                          {community.cta_copy.title}
                        </div>
                        <div className="text-muted-foreground">
                          {community.cta_copy.body}
                        </div>
                        <div className="mt-1">
                          <span className="inline-block rounded-full bg-stone-800 px-2.5 py-0.5 text-[10px] font-medium text-white dark:bg-stone-200 dark:text-stone-900">
                            {community.cta_copy.buttonText}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        Not generated
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {course.cta_copy ? (
                      <div className="text-xs">
                        <div className="text-muted-foreground">
                          {course.cta_copy.eyebrow}
                        </div>
                        <div className="font-medium">
                          {course.cta_copy.title}
                        </div>
                        <div className="text-muted-foreground">
                          {course.cta_copy.body}
                        </div>
                        {course.url && (
                          <div className="mt-0.5 font-mono text-muted-foreground">
                            {course.url}
                          </div>
                        )}
                        <div className="mt-1">
                          <span className="inline-block rounded-full bg-stone-800 px-2.5 py-0.5 text-[10px] font-medium text-white dark:bg-stone-200 dark:text-stone-900">
                            {course.cta_copy.buttonText}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          No cta_copy
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {freebie?.cta_copy ? (
                      <div className="text-xs">
                        <div className="text-muted-foreground">
                          {freebie.cta_copy.eyebrow}
                        </div>
                        <div className="font-medium">
                          {freebie.cta_copy.title}
                        </div>
                        <div className="text-muted-foreground">
                          {freebie.cta_copy.body}
                        </div>
                        <div className="mt-1">
                          <span className="inline-block rounded-full bg-stone-800 px-2.5 py-0.5 text-[10px] font-medium text-white dark:bg-stone-200 dark:text-stone-900">
                            {freebie.cta_copy.buttonText}
                          </span>
                        </div>
                      </div>
                    ) : freebie ? (
                      <div>
                        <div className="font-medium">{freebie.name}</div>
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          No cta_copy
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mailing tab
// ---------------------------------------------------------------------------

function MailingTab({ data }: { data: MailingTag[] | null }) {
  if (!data) return <p className="text-muted-foreground">No mailing tag data.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {data.length} tags defined
      </p>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">ID</th>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Kit Tag ID</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tag) => (
              <tr key={tag.id} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs">{tag.id}</td>
                <td className="px-3 py-2">{tag.name}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                  {tag.kitTagId ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

interface MailingFormEntry {
  id: string;
  type: string;
  name: string;
  what_it_is?: string | undefined;
  pageUrlPattern: string;
  endpoint: string;
  tags: string[];
  cta_copy?: CtaCopy | undefined;
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

interface FormTagMapping {
  formId: string;
  description: string;
  tagIds: string[];
}

interface FrontendCheck {
  file: string;
  requiredProps?: string[];
  requiredPatterns?: string[];
}

interface IntegrationSpec {
  customFields: string[];
  subscriberApiRoutes: Record<string, string>;
  localStorageKey: string;
  quizSubscribeFlow: {
    description: string;
    requiredTags: string[];
    tagPrefix: string;
    customFieldOnSubmit: string;
  };
  blogFreebieFlow: {
    description: string;
    requiredTags: string[];
    tagPrefix: string;
  };
  frontendChecks: Record<string, FrontendCheck>;
}

interface SpecData {
  taxonomy: { categories: Category[]; entries: ArticleEntry[] } | null;
  quizTaxonomy: { entries: QuizEntry[] } | null;
  pageTypes: PageType[] | null;
  quizPageTypes: QuizPageType[] | null;
  ctaCatalog: CtaDefinition[] | null;
  mailingFormCatalog: MailingFormEntry[] | null;
  mailingTags: MailingTag[] | null;
  crossLinkDetail: CrossLinkDetail | null;
  formTagMappings: FormTagMapping[] | null;
  integrationSpec: IntegrationSpec | null;
  quizPreviewCtas: Record<string, CtaCopy> | null;
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
        <CtasTab data={data.ctaCatalog} quizTaxonomy={data.quizTaxonomy} />
      )}
      {tab === "mailing" && (
        <MailingFormsTab
          mailingTags={data.mailingTags}
          formTagMappings={data.formTagMappings}
          integrationSpec={data.integrationSpec}
          mailingFormCatalog={data.mailingFormCatalog}
          quizTaxonomy={data.quizTaxonomy}
          quizPreviewCtas={data.quizPreviewCtas}
        />
      )}
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
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
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
// Shared: CTA copy preview cell
// ---------------------------------------------------------------------------

function CtaCopyCell({ copy, url }: { copy?: CtaCopy | undefined; url?: string | undefined }) {
  if (!copy) {
    return <span className="text-xs text-amber-600 dark:text-amber-400">No copy</span>;
  }
  return (
    <div className="text-xs">
      <div className="text-muted-foreground">{copy.eyebrow}</div>
      <div className="font-medium">{copy.title}</div>
      <div className="text-muted-foreground">{copy.body}</div>
      {url && (
        <div className="mt-0.5 font-mono text-muted-foreground">{url}</div>
      )}
      <div className="mt-1">
        <span className="inline-block rounded-full bg-stone-800 px-2.5 py-0.5 text-[10px] font-medium text-white dark:bg-stone-200 dark:text-stone-900">
          {copy.buttonText}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CTAs tab — community + course only, organized by page type
// ---------------------------------------------------------------------------

function CtasTab({
  data,
  quizTaxonomy,
}: {
  data: CtaDefinition[] | null;
  quizTaxonomy: { entries: QuizEntry[] } | null;
}) {
  if (!data) return <p className="text-muted-foreground">No CTA data.</p>;

  const globalCommunity = data.find(
    (c) => c.type === "community" && c.id === "community",
  );
  const perCatCommunities = data.filter(
    (c) => c.type === "community" && c.id !== "community" && !c.id.startsWith("community-quiz-"),
  );
  const quizCommunities = data.filter(
    (c) => c.type === "community" && c.id.startsWith("community-quiz-"),
  );
  const courses = data.filter((c) => c.type === "course");

  const categorySlug = (id: string) =>
    id.replace(/^(course|community)-/, "");

  const communityBySlug = new Map(
    perCatCommunities.map((c) => [categorySlug(c.id), c]),
  );
  const quizCommunityBySlug = new Map(
    quizCommunities.map((c) => [c.id.replace(/^community-quiz-/, ""), c]),
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

      {/* Blog Article CTAs */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Blog Article CTAs</h3>
        <p className="text-sm text-muted-foreground">
          {courses.length} categories — each blog article shows a community CTA and a course CTA
        </p>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Category</th>
                <th className="px-3 py-2 text-left font-medium">Page Location</th>
                <th className="px-3 py-2 text-left font-medium">Community CTA</th>
                <th className="px-3 py-2 text-left font-medium">Course CTA</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const slug = categorySlug(course.id);
                const community = communityBySlug.get(slug);
                return (
                  <tr key={course.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {slug}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      /blog/{slug}/*
                    </td>
                    <td className="px-3 py-2">
                      <CtaCopyCell
                        copy={community?.cta_copy}
                        url={globalCommunity?.url}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <CtaCopyCell
                        copy={course.cta_copy}
                        url={course.url}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiz Page CTAs */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Quiz Page CTAs</h3>
        <p className="text-sm text-muted-foreground">
          {quizCommunities.length} quiz community CTAs. The email gate (preview
          CTA) is a mailing form — see the Mailing Forms tab.
        </p>
        {quizTaxonomy && quizTaxonomy.entries.length > 0 && (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">Quiz</th>
                  <th className="px-3 py-2 text-left font-medium">Page URL</th>
                  <th className="px-3 py-2 text-left font-medium">Community CTA</th>
                </tr>
              </thead>
              <tbody>
                {quizTaxonomy.entries.map((quiz) => {
                  const community = quizCommunityBySlug.get(quiz.slug);
                  return (
                    <tr key={quiz.slug} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {quiz.slug}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {quiz.url}
                      </td>
                      <td className="px-3 py-2">
                        <CtaCopyCell
                          copy={community?.cta_copy}
                          url={globalCommunity?.url}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mailing Forms tab — freebie + waitlist + quiz gates, organized by page type
// ---------------------------------------------------------------------------

function MailingFormsTab({
  mailingTags,
  formTagMappings,
  integrationSpec,
  mailingFormCatalog,
  quizTaxonomy,
  quizPreviewCtas,
}: {
  mailingTags: MailingTag[] | null;
  formTagMappings: FormTagMapping[] | null;
  integrationSpec: IntegrationSpec | null;
  mailingFormCatalog: MailingFormEntry[] | null;
  quizTaxonomy: { entries: QuizEntry[] } | null;
  quizPreviewCtas: Record<string, CtaCopy> | null;
}) {
  if (!mailingTags && !formTagMappings && !integrationSpec && !mailingFormCatalog)
    return <p className="text-muted-foreground">No mailing form data.</p>;

  const catalog = mailingFormCatalog ?? [];
  const freebies = catalog.filter((m) => m.type === "freebie");
  const waitlists = catalog.filter((m) => m.type === "waitlist");
  const quizGates = catalog.filter((m) => m.type === "quiz-gate");

  const quizBySlug = new Map(
    (quizTaxonomy?.entries ?? []).map((q) => [q.slug, q]),
  );

  return (
    <div className="space-y-8">
      {/* 1. Blog Freebie Forms */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Blog Freebie Forms</h3>
        <p className="text-sm text-muted-foreground">
          {freebies.length} forms — one per category, each delivers a freebie PDF on blog articles
        </p>
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Category</th>
                <th className="px-3 py-2 text-left font-medium">Page URL</th>
                <th className="px-3 py-2 text-left font-medium">Freebie Name</th>
                <th className="px-3 py-2 text-left font-medium">Copy</th>
                <th className="px-3 py-2 text-left font-medium">Tags</th>
                <th className="px-3 py-2 text-left font-medium">Endpoint</th>
              </tr>
            </thead>
            <tbody>
              {freebies.map((freebie) => {
                const slug = freebie.id.replace(/^freebie-/, "");
                return (
                  <tr key={freebie.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {slug}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {freebie.pageUrlPattern}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {freebie.name}
                    </td>
                    <td className="px-3 py-2">
                      <CtaCopyCell copy={freebie.cta_copy} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {freebie.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {freebie.endpoint}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Course Waitlist Forms */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Course Waitlist Forms</h3>
        <p className="text-sm text-muted-foreground">
          {waitlists.length} forms — one per course page, shown while course is not yet available
        </p>

        {/* Waitlist form rules */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 text-sm font-semibold">Copy Rules</h4>
            <dl className="space-y-1.5 text-xs">
              <Row label="buttonText" value='"Reserve your spot"' />
              <Row label="Eyebrow" value="2-5 words" />
              <Row label="Title" value="3-12 words" />
              <Row label="Body" value="8-35 words" />
            </dl>
            <div className="mt-2 text-[10px] text-red-600 dark:text-red-400">
              No exclamation marks. No forbidden terms. No video promises.
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 text-sm font-semibold">Data Rules</h4>
            <dl className="space-y-1.5 text-xs">
              <Row label="pageUrlPattern" value='must start with "/course/"' />
              <Row label="what_it_is" value="required (course description)" />
              <Row label="name" value="must match course entry" />
              <Row label="Coverage" value="1 per category (20 total)" />
            </dl>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Category</th>
                <th className="px-3 py-2 text-left font-medium">Page URL</th>
                <th className="px-3 py-2 text-left font-medium">Copy</th>
                <th className="px-3 py-2 text-left font-medium">Tags</th>
                <th className="px-3 py-2 text-left font-medium">Endpoint</th>
              </tr>
            </thead>
            <tbody>
              {waitlists.map((waitlist) => {
                const slug = waitlist.id.replace(/^waitlist-/, "");
                return (
                  <tr key={waitlist.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {slug}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {waitlist.pageUrlPattern}
                    </td>
                    <td className="px-3 py-2">
                      <CtaCopyCell copy={waitlist.cta_copy} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {waitlist.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {waitlist.endpoint}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Quiz Email Gates */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Quiz Email Gates</h3>
        <p className="text-sm text-muted-foreground">
          {quizGates.length} forms — email gate before quiz results, sets custom field
        </p>

        {/* Quiz email gate rules */}
        <div className="grid gap-4 sm:grid-cols-2">
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

        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Quiz</th>
                <th className="px-3 py-2 text-left font-medium">Page URL</th>
                <th className="px-3 py-2 text-left font-medium">Copy</th>
                <th className="px-3 py-2 text-left font-medium">Tags</th>
                <th className="px-3 py-2 text-left font-medium">Endpoint</th>
              </tr>
            </thead>
            <tbody>
              {quizGates.map((gate) => {
                const quizSlug = gate.id.replace(/^quiz-gate-/, "");
                const quiz = quizBySlug.get(quizSlug);
                const previewCopy = quizPreviewCtas?.[quizSlug];
                return (
                  <tr key={gate.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <div>
                        <span className="rounded bg-violet-100 px-1.5 py-0.5 text-xs text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                          {quizSlug}
                        </span>
                        {quiz && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {quiz.title}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {gate.pageUrlPattern}
                    </td>
                    <td className="px-3 py-2">
                      <CtaCopyCell copy={previewCopy} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {gate.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {gate.endpoint}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Integration Requirements */}
      {integrationSpec && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Integration Requirements</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 text-sm font-semibold">Blog Freebie Flow</h4>
              <dl className="space-y-1.5 text-xs">
                <Row label="Description" value={integrationSpec.blogFreebieFlow.description} />
                <Row label="Required tags" value={integrationSpec.blogFreebieFlow.requiredTags.join(", ")} />
                <Row label="Tag prefix" value={integrationSpec.blogFreebieFlow.tagPrefix} />
                <Row label="API route" value={integrationSpec.subscriberApiRoutes["blogFreebie"] ?? "—"} />
              </dl>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 text-sm font-semibold">Quiz Subscribe Flow</h4>
              <dl className="space-y-1.5 text-xs">
                <Row label="Description" value={integrationSpec.quizSubscribeFlow.description} />
                <Row label="Required tags" value={integrationSpec.quizSubscribeFlow.requiredTags.join(", ")} />
                <Row label="Tag prefix" value={integrationSpec.quizSubscribeFlow.tagPrefix} />
                <Row label="Custom field" value={integrationSpec.quizSubscribeFlow.customFieldOnSubmit} />
                <Row label="API route" value={integrationSpec.subscriberApiRoutes["quiz"] ?? "—"} />
              </dl>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 text-sm font-semibold">Shared Config</h4>
              <dl className="space-y-1.5 text-xs">
                <Row label="localStorage key" value={integrationSpec.localStorageKey} />
                <Row label="Custom fields" value={integrationSpec.customFields.join(", ")} />
              </dl>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 text-sm font-semibold">Frontend Checks</h4>
              <div className="space-y-2">
                {Object.entries(integrationSpec.frontendChecks).map(
                  ([key, check]) => (
                    <div key={key} className="text-xs">
                      <div className="font-medium">{key}</div>
                      <div className="font-mono text-muted-foreground">{check.file}</div>
                      {check.requiredProps && (
                        <div className="text-muted-foreground">Props: {check.requiredProps.join(", ")}</div>
                      )}
                      {check.requiredPatterns && (
                        <div className="text-muted-foreground">Patterns: {check.requiredPatterns.join(", ")}</div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tag Registry */}
      {mailingTags && mailingTags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Tag Registry</h3>
          <p className="text-sm text-muted-foreground">
            {mailingTags.length} tags defined
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
                {mailingTags.map((tag) => (
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
      )}
    </div>
  );
}

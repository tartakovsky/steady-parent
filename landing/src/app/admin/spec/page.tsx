"use client";

import { useEffect, useState } from "react";
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
  pageTypes: PageType[] | null;
  ctaCatalog: CtaDefinition[] | null;
  mailingTags: MailingTag[] | null;
  ctaValidation: ValidationResult | null;
}

type Tab = "taxonomy" | "pageTypes" | "ctas" | "mailing";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SpecPage() {
  const [data, setData] = useState<SpecData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("taxonomy");

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

  const tabs: { key: Tab; label: string }[] = [
    { key: "taxonomy", label: "Taxonomy" },
    { key: "pageTypes", label: "Page Types" },
    { key: "ctas", label: "CTAs" },
    { key: "mailing", label: "Mailing Tags" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Spec</h1>
        <p className="text-sm text-muted-foreground">
          Plan data files that define what the site should contain
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "taxonomy" && <TaxonomyTab data={data.taxonomy} />}
      {tab === "pageTypes" && <PageTypesTab data={data.pageTypes} />}
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
}: {
  data: { categories: Category[]; entries: ArticleEntry[] } | null;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!data) return <p className="text-muted-foreground">No taxonomy data.</p>;

  const { categories, entries } = data;
  const pillarCount = entries.filter((e) => e.type === "pillar").length;
  const seriesCount = entries.filter((e) => e.type === "series").length;

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
    <div className="space-y-4">
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
  );
}

// ---------------------------------------------------------------------------
// Page Types tab
// ---------------------------------------------------------------------------

function PageTypesTab({ data }: { data: PageType[] | null }) {
  if (!data) return <p className="text-muted-foreground">No page type data.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.map((pt) => (
        <div key={pt.name} className="rounded-lg border p-4">
          <h3 className="mb-3 text-lg font-semibold capitalize">{pt.name}</h3>
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
                    {community ? (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {community.what_it_is}
                        </div>
                        {community.cta_copy && (
                          <div className="rounded border border-dashed border-border p-2 text-xs">
                            <div className="text-muted-foreground">
                              <span className="font-medium text-foreground">Eyebrow:</span>{" "}
                              {community.cta_copy.eyebrow}
                            </div>
                            <div className="text-muted-foreground">
                              <span className="font-medium text-foreground">Title:</span>{" "}
                              {community.cta_copy.title}
                            </div>
                            <div className="text-muted-foreground">
                              <span className="font-medium text-foreground">Body:</span>{" "}
                              {community.cta_copy.body}
                            </div>
                            <div className="text-muted-foreground">
                              <span className="font-medium text-foreground">Button:</span>{" "}
                              {community.cta_copy.buttonText}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        Not generated
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{course.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {course.what_it_is}
                    </div>
                    {course.url && (
                      <div className="font-mono text-xs text-muted-foreground">
                        {course.url}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {freebie ? (
                      <>
                        <div className="font-medium">{freebie.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {freebie.what_it_is}
                        </div>
                      </>
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

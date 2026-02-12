"use client";

import { useEffect, useState } from "react";
import {
  Check,
  X,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Minus,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EntryCheck {
  ok: boolean;
  detail?: string | undefined;
}

interface EntryValidation {
  errors: string[];
  warnings: string[];
  checks: Record<string, EntryCheck>;
}

interface CtaDefinition {
  id: string;
  type: string;
  name: string;
  url?: string | undefined;
  what_it_is?: string | undefined;
  founder_presence?: string | undefined;
  cta_copy?: { eyebrow: string; title: string; body: string; buttonText: string } | undefined;
  can_promise: string[];
  cant_promise: string[];
}

interface CheckGroup {
  name: string;
  description: string;
  itemCount: number;
  errors: string[];
  warnings: string[];
}

interface ArticleDeployment {
  slug: string;
  title: string;
  published: boolean;
  community: Record<string, EntryCheck>;
  course: Record<string, EntryCheck>;
}

interface CategoryDeployment {
  articles: ArticleDeployment[];
  publishedCount: number;
  totalCount: number;
  communityIssues: number;
  courseIssues: number;
}

interface CtaResponse {
  catalog: CtaDefinition[] | null;
  categorySlugs: string[];
  validation: {
    errors: string[];
    warnings: string[];
    groups: CheckGroup[];
    byEntry: Record<string, EntryValidation>;
  } | null;
  deployment: Record<string, CategoryDeployment> | null;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CtaValidationPage() {
  const [data, setData] = useState<CtaResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ctas")
      .then((r) => r.json() as Promise<CtaResponse>)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!data?.catalog || !data.validation)
    return <p className="text-muted-foreground">Could not load CTA data.</p>;

  const { catalog, categorySlugs, validation, deployment } = data;
  const { errors, warnings, byEntry } = validation;

  const perCatCommunities = catalog.filter(
    (c) => c.type === "community" && c.id !== "community" && !c.id.startsWith("community-quiz-"),
  );
  const quizCommunities = catalog.filter(
    (c) => c.type === "community" && c.id.startsWith("community-quiz-"),
  );
  const courses = catalog.filter((c) => c.type === "course");

  const communityColumns = [
    { key: "pageUrl", label: "Page" },
    { key: "url", label: "Link" },
    { key: "cta_copy", label: "Copy" },
    { key: "buttonText", label: "Button" },
    { key: "founderLine", label: "Founder" },
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
    { key: "body", label: "Body" },
    { key: "clean", label: "No !/bans" },
  ];

  const courseColumns = [
    { key: "pageUrl", label: "Page" },
    { key: "url", label: "Link" },
    { key: "what_it_is", label: "Desc" },
    { key: "cta_copy", label: "Copy" },
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
    { key: "body", label: "Body" },
    { key: "nameInTitle", label: "Name" },
    { key: "clean", label: "No !/bans" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">CTA Validation</h1>
        <p className="text-sm text-muted-foreground">
          {catalog.length} entries across {categorySlugs.length} categories
        </p>
      </div>

      <SummaryBanner errors={errors.length} warnings={warnings.length} total={catalog.length} />

      {/* Global Community */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Global Community</h2>
        <GlobalCommunityRow entry={byEntry["community"]} />
      </section>

      {/* Per-Category Community */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Per-Category Community CTAs <CountBadge n={perCatCommunities.length} />
        </h2>
        <CheckTable
          slugs={categorySlugs}
          columns={communityColumns}
          byEntry={byEntry}
          idPrefix="community-"
          deployment={deployment}
          deploymentKey="community"
        />
      </section>

      {/* Quiz Community */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Quiz Community CTAs <CountBadge n={quizCommunities.length} />
        </h2>
        <CheckTable
          slugs={quizCommunities.map((c) => c.id.replace(/^community-quiz-/, ""))}
          columns={communityColumns}
          byEntry={byEntry}
          idPrefix="community-quiz-"
        />
      </section>

      {/* Courses */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Course CTAs <CountBadge n={courses.length} />
        </h2>
        <CheckTable
          slugs={categorySlugs}
          columns={courseColumns}
          byEntry={byEntry}
          idPrefix="course-"
          deployment={deployment}
          deploymentKey="course"
        />
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

function SummaryBanner({ errors, warnings, total }: { errors: number; warnings: number; total: number }) {
  if (errors === 0 && warnings === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950/20">
        <Check className="h-4 w-4 text-emerald-600" />
        <span className="text-sm text-emerald-700 dark:text-emerald-400">
          All checks passed — {total} entries validated
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-red-50 p-3 dark:bg-red-950/20">
      {errors > 0 && (
        <span className="flex items-center gap-1 text-sm text-red-600">
          <XCircle className="h-4 w-4" /> {errors} error{errors !== 1 ? "s" : ""}
        </span>
      )}
      {warnings > 0 && (
        <span className="flex items-center gap-1 text-sm text-amber-600">
          <AlertTriangle className="h-4 w-4" /> {warnings} warning{warnings !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
      {n}
    </span>
  );
}

function CellIcon({ check, dimmed }: { check?: EntryCheck | undefined; dimmed?: boolean }) {
  if (!check) return <span className="text-muted-foreground/40">&mdash;</span>;
  if (check.ok) {
    return (
      <span className={`flex items-center justify-center gap-1.5 whitespace-nowrap ${dimmed ? "opacity-30" : ""}`} title={check.detail}>
        <Check className="h-4 w-4 text-emerald-600" />
        {check.detail && <span className="text-muted-foreground">{check.detail}</span>}
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center gap-1.5 whitespace-nowrap" title={check.detail}>
      <X className="h-4 w-4 text-red-500" />
      {check.detail && <span className="text-red-600">{check.detail}</span>}
    </span>
  );
}

function RowStatus({ ev, deploymentIssues }: { ev?: EntryValidation | undefined; deploymentIssues?: number }) {
  const hasDeployIssues = (deploymentIssues ?? 0) > 0;
  if (hasDeployIssues || (ev && ev.errors.length > 0)) {
    return <XCircle className="h-4 w-4 text-red-600" />;
  }
  if (ev && ev.warnings.length > 0) {
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }
  return <Check className="h-4 w-4 text-emerald-600" />;
}

// ---------------------------------------------------------------------------
// Global community (single row)
// ---------------------------------------------------------------------------

function GlobalCommunityRow({ entry }: { entry?: EntryValidation | undefined }) {
  if (!entry) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50/50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/10">
        Missing global community entry (id: &quot;community&quot;)
      </div>
    );
  }
  const cols = ["exists", "founder_presence", "cant_promise"];
  const labels = ["Exists", "Founder Presence", "Can\u2019t Promise"];
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-8 px-2 py-1.5" />
            <th className="px-3 py-1.5 text-left font-medium">ID</th>
            {labels.map((l, i) => (
              <th key={cols[i]} className="px-3 py-1.5 text-center font-medium whitespace-nowrap">
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-2 py-1.5 text-center"><RowStatus ev={entry} /></td>
            <td className="px-3 py-1.5">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono whitespace-nowrap">community</span>
            </td>
            {cols.map((c) => (
              <td key={c} className="px-3 py-1.5 text-center">
                <CellIcon check={entry.checks[c]} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expandable check table with per-article deployment drill-down
// ---------------------------------------------------------------------------

const ARTICLE_CHECK_COLUMNS = [
  { key: "cta", label: "CTA" },
  { key: "href", label: "Href" },
  { key: "eyebrow", label: "Eyebrow" },
  { key: "title", label: "Title" },
  { key: "body", label: "Body" },
  { key: "clean", label: "Clean" },
  { key: "founder", label: "Founder" },
  { key: "buttonText", label: "Button" },
];

function CheckTable({
  slugs,
  columns,
  byEntry,
  idPrefix,
  deployment,
  deploymentKey,
}: {
  slugs: string[];
  columns: { key: string; label: string }[];
  byEntry: Record<string, EntryValidation>;
  idPrefix: string;
  deployment?: Record<string, CategoryDeployment> | null;
  deploymentKey?: "community" | "course";
}) {
  const hasDeployment = !!deployment && !!deploymentKey;
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());

  const toggleExpand = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const totalCols = 2 + columns.length + (hasDeployment ? 2 : 0); // status + slug + columns + live + chevron

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-8 px-2 py-1.5" />
            <th className="px-3 py-1.5 text-left font-medium">Slug</th>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-1.5 text-center font-medium whitespace-nowrap">
                {col.label}
              </th>
            ))}
            {hasDeployment && (
              <th className="px-3 py-1.5 text-center font-medium whitespace-nowrap">
                Live
              </th>
            )}
            {hasDeployment && <th className="w-8 px-2 py-1.5" />}
          </tr>
        </thead>
        <tbody>
          {slugs.map((slug) => {
            const id = `${idPrefix}${slug}`;
            const ev = byEntry[id];
            const dep = hasDeployment ? (deployment![slug] ?? null) : null;
            const missingCount = dep ? dep.totalCount - dep.publishedCount : 0;
            const ctaIssues = dep
              ? deploymentKey === "community"
                ? dep.communityIssues
                : dep.courseIssues
              : 0;
            const issues = ctaIssues + missingCount;
            const hasErrors = (ev && ev.errors.length > 0) || issues > 0;
            const hasWarnings = ev && ev.warnings.length > 0;
            const rowBg = hasErrors
              ? "bg-red-50/50 dark:bg-red-950/10"
              : hasWarnings
                ? "bg-amber-50/30 dark:bg-amber-950/10"
                : "";
            const isExpanded = expandedSlugs.has(slug);

            return (
              <CategoryRow
                key={slug}
                slug={slug}
                ev={ev}
                columns={columns}
                rowBg={rowBg}
                hasDeployment={hasDeployment}
                dep={dep}
                deploymentKey={deploymentKey}
                issues={issues}
                isExpanded={isExpanded}
                onToggle={() => toggleExpand(slug)}
                totalCols={totalCols}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CategoryRow({
  slug,
  ev,
  columns,
  rowBg,
  hasDeployment,
  dep,
  deploymentKey,
  issues,
  isExpanded,
  onToggle,
  totalCols,
}: {
  slug: string;
  ev?: EntryValidation | undefined;
  columns: { key: string; label: string }[];
  rowBg: string;
  hasDeployment: boolean;
  dep: CategoryDeployment | null;
  deploymentKey?: "community" | "course" | undefined;
  issues: number;
  isExpanded: boolean;
  onToggle: () => void;
  totalCols: number;
}) {
  return (
    <>
      <tr
        className={`border-b ${isExpanded ? "border-b-transparent" : ""} ${rowBg} ${hasDeployment ? "cursor-pointer hover:bg-muted/30" : ""}`}
        onClick={hasDeployment ? onToggle : undefined}
      >
        <td className="px-2 py-1.5 text-center">
          <RowStatus ev={ev} deploymentIssues={issues} />
        </td>
        <td className="px-3 py-1.5">
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono whitespace-nowrap">{slug}</span>
        </td>
        {columns.map((col) => (
          <td key={col.key} className="px-3 py-1.5 text-center">
            <CellIcon check={ev?.checks[col.key]} dimmed={issues > 0} />
          </td>
        ))}
        {hasDeployment && dep && (
          <td className="px-3 py-1.5 text-center">
            <LiveBadge dep={dep} issues={issues} />
          </td>
        )}
        {hasDeployment && !dep && (
          <td className="px-3 py-1.5 text-center">
            <span className="text-muted-foreground/40">&mdash;</span>
          </td>
        )}
        {hasDeployment && (
          <td className="px-2 py-1.5 text-center">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </td>
        )}
      </tr>
      {isExpanded && dep && deploymentKey && (
        <tr>
          <td colSpan={totalCols} className="p-0">
            <div className="ml-6 mr-2 my-2 border-l-2 border-muted-foreground/25 rounded-r-md overflow-hidden shadow-sm">
              <ArticleSubTable
                articles={dep.articles}
                deploymentKey={deploymentKey}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function LiveBadge({ dep, issues }: { dep: CategoryDeployment; issues: number }) {
  const ok = issues === 0 && dep.publishedCount === dep.totalCount;
  return (
    <span
      className={`inline-flex items-center gap-1 ${ok ? "text-emerald-600" : "text-red-600"}`}
    >
      {ok ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
      <span className="text-xs font-medium">
        {dep.publishedCount}/{dep.totalCount}
      </span>
    </span>
  );
}

function ArticleSubTable({
  articles,
  deploymentKey,
}: {
  articles: ArticleDeployment[];
  deploymentKey: "community" | "course";
}) {
  // Published articles first
  const sorted = [...articles].sort((a, b) => {
    if (a.published !== b.published) return a.published ? -1 : 1;
    return a.slug.localeCompare(b.slug);
  });

  return (
    <div className="border-t bg-muted/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="w-8 px-2 py-1" />
            <th className="px-3 py-1 text-left font-medium text-xs">Article</th>
            <th className="px-3 py-1 text-center font-medium text-xs">Live</th>
            {ARTICLE_CHECK_COLUMNS.map((col) => (
              <th
                key={col.key}
                className="px-3 py-1 text-center font-medium text-xs whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((article) => {
            const checks = article[deploymentKey];
            if (!article.published) {
              return (
                <tr key={article.slug} className="border-b bg-red-50/30 dark:bg-red-950/5">
                  <td className="px-2 py-1 text-center">
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                  </td>
                  <td
                    className="px-3 py-1 font-mono text-xs truncate max-w-[220px] text-red-600/70"
                    title={article.title}
                  >
                    {article.slug}
                  </td>
                  <td className="px-3 py-1 text-center">
                    <X className="mx-auto h-3.5 w-3.5 text-red-400" />
                  </td>
                  {ARTICLE_CHECK_COLUMNS.map((col) => (
                    <td key={col.key} className="px-3 py-1 text-center">
                      <Minus className="mx-auto h-3 w-3 text-red-300" />
                    </td>
                  ))}
                </tr>
              );
            }

            const hasIssue = Object.values(checks).some((c) => !c.ok);
            return (
              <tr
                key={article.slug}
                className={`border-b ${hasIssue ? "bg-red-50/50 dark:bg-red-950/10" : ""}`}
              >
                <td className="px-2 py-1 text-center">
                  {hasIssue ? (
                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </td>
                <td
                  className="px-3 py-1 font-mono text-xs truncate max-w-[220px]"
                  title={article.title}
                >
                  {article.slug}
                </td>
                <td className="px-3 py-1 text-center">
                  <Check className="mx-auto h-3.5 w-3.5 text-emerald-600" />
                </td>
                {ARTICLE_CHECK_COLUMNS.map((col) => (
                  <td key={col.key} className="px-3 py-1 text-center">
                    <CellIcon check={checks[col.key]} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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

interface EntryCheck {
  ok: boolean;
  detail?: string | undefined;
}

interface EntryValidation {
  errors: string[];
  warnings: string[];
  checks: Record<string, EntryCheck>;
}

interface IntegrationCheck {
  label: string;
  status: "pass" | "fail" | "warn";
  detail?: string;
}

interface IntegrationResult {
  errors: string[];
  warnings: string[];
  checks: IntegrationCheck[];
}

interface KitTagRow {
  id: number;
  kitId: number;
  name: string;
  subscriberCount: number;
  configName: string | null;
}

interface CoverageData {
  categorySlugs: string[];
  quizSlugs: string[];
  freebySlugs: string[];
  waitlistSlugs: string[];
  blogMappings: string[];
  waitlistMappings: string[];
  quizMappings: string[];
}

interface ArticleInfo {
  slug: string;
  title: string;
  published: boolean;
  checks: Record<string, EntryCheck>;
}

interface Infrastructure {
  freebieApiRoute: boolean;
  quizApiRoute: boolean;
  waitlistApiRoute: boolean;
  freebieFrontendReady: boolean;
  quizFrontendReady: boolean;
  waitlistFrontendReady: boolean;
  kitCustomFieldReady: boolean;
  kitFreebieTagsReady: boolean;
  kitQuizTagsReady: boolean;
  freebieTagCount: number;
  quizTagCount: number;
  quizResultsSequenceReady: boolean;
  freebieSequenceReady: boolean;
  waitlistSequenceReady: boolean;
}

interface MailingResponse {
  tags: KitTagRow[];
  integration: IntegrationResult | null;
  mailingByEntry: Record<string, EntryValidation> | null;
  articlesByCategory: Record<string, ArticleInfo[]> | null;
  coverage: CoverageData | null;
  infrastructure: Infrastructure | null;
}

export default function MailingFormsValidationPage() {
  const [data, setData] = useState<MailingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/mailing")
      .then((r) => r.json() as Promise<MailingResponse>)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!data) return <p className="text-muted-foreground">Failed to load mailing data.</p>;

  const { tags, integration, mailingByEntry, articlesByCategory, coverage, infrastructure } = data;
  const byEntry = mailingByEntry ?? {};

  // Count all errors/warnings from byEntry (catalog-level)
  let catalogErrors = 0;
  let catalogWarnings = 0;
  for (const ev of Object.values(byEntry)) {
    catalogErrors += ev.errors.length;
    catalogWarnings += ev.warnings.length;
  }

  // Count deployment issues from articlesByCategory
  let deploymentIssues = 0;
  let totalArticles = 0;
  let publishedArticles = 0;
  let articlesWithValidFreebies = 0;
  if (articlesByCategory) {
    for (const articles of Object.values(articlesByCategory)) {
      totalArticles += articles.length;
      for (const a of articles) {
        if (!a.published) {
          deploymentIssues++;
        } else {
          publishedArticles++;
          if (Object.keys(a.checks).length > 0 && Object.values(a.checks).every((c) => c.ok)) {
            articlesWithValidFreebies++;
          } else {
            deploymentIssues++;
          }
        }
      }
    }
  }
  const infraFailures = infrastructure
    ? [
        infrastructure.freebieApiRoute,
        infrastructure.quizApiRoute,
        infrastructure.waitlistApiRoute,
        infrastructure.freebieFrontendReady,
        infrastructure.quizFrontendReady,
        infrastructure.waitlistFrontendReady,
        infrastructure.kitCustomFieldReady,
        infrastructure.kitFreebieTagsReady,
        infrastructure.kitQuizTagsReady,
        infrastructure.quizResultsSequenceReady,
        infrastructure.freebieSequenceReady,
        infrastructure.waitlistSequenceReady,
      ].filter((v) => !v).length
    : 0;
  const totalErrors = catalogErrors + deploymentIssues + infraFailures;
  const totalWarnings = catalogWarnings;
  const totalScope = Object.keys(byEntry).length + totalArticles + (infrastructure ? 12 : 0);

  // Coverage sets for Kit form mapping column
  const blogMappingSet = new Set(coverage?.blogMappings ?? []);
  const waitlistMappingSet = new Set(coverage?.waitlistMappings ?? []);
  const quizMappingSet = new Set(coverage?.quizMappings ?? []);

  // Per-type passing counts: catalog validation + Kit wiring
  const waitlistsPassing = coverage
    ? coverage.categorySlugs.filter((s) => {
        const ev = byEntry[`waitlist-${s}`];
        return ev && ev.errors.length === 0 && waitlistMappingSet.has(s);
      }).length
    : 0;
  // Quiz-gate and waitlist byEntry now include infrastructure errors directly,
  // so ev.errors.length === 0 already catches infrastructure failures
  const quizGatesPassing = coverage
    ? coverage.quizSlugs.filter((s) => {
        const ev = byEntry[`quiz-gate-${s}`];
        return ev && ev.errors.length === 0 && quizMappingSet.has(s);
      }).length
    : 0;

  // Tag mapping stats
  const mapped = tags.filter((t) => t.configName != null);
  const orphaned = tags.filter((t) => t.configName == null);

  // Integration check groups
  const blogChecks = integration?.checks.filter(
    (c) => c.label.startsWith("Freebie") || c.label.startsWith("Blog"),
  ) ?? [];
  const quizChecks = integration?.checks.filter(
    (c) => c.label.startsWith("Quiz"),
  ) ?? [];
  const infraChecks = integration?.checks.filter(
    (c) =>
      !c.label.startsWith("Freebie") &&
      !c.label.startsWith("Blog") &&
      !c.label.startsWith("Quiz"),
  ) ?? [];

  const freebieColumns = [
    { key: "what_it_is", label: "Desc" },
    { key: "urlPattern", label: "URL" },
    { key: "tags", label: "Tags" },
    { key: "cta_copy", label: "Copy" },
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
    { key: "body", label: "Body" },
    { key: "nameInTitle", label: "Name" },
    { key: "clean", label: "No !/bans" },
  ];

  const waitlistColumns = [
    { key: "what_it_is", label: "Desc" },
    { key: "urlPattern", label: "URL" },
    { key: "tags", label: "Tags" },
    { key: "cta_copy", label: "Copy" },
    { key: "buttonText", label: "Button" },
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
    { key: "body", label: "Body" },
    { key: "clean", label: "No !/bans" },
    { key: "api_route", label: "API" },
    { key: "frontend", label: "Frontend" },
    { key: "kit_seq", label: "Kit Seq" },
  ];

  const quizGateColumns = [
    { key: "urlPattern", label: "URL" },
    { key: "tags", label: "Tags" },
    { key: "cta_copy", label: "Copy" },
    { key: "buttonText", label: "Button" },
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
    { key: "body", label: "Body" },
    { key: "clean", label: "No !/bans" },
    { key: "api_route", label: "API" },
    { key: "frontend", label: "Frontend" },
    { key: "kit_field", label: "Kit Field" },
    { key: "kit_tag", label: "Kit Tag" },
    { key: "kit_seq", label: "Kit Seq" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mailing Forms Validation</h1>
        <div className="mt-1 text-sm text-muted-foreground space-y-0.5">
          {coverage ? (
            <>
              <div>Articles: <Fraction n={publishedArticles} total={totalArticles} /></div>
              <div>In-article freebies: <Fraction n={articlesWithValidFreebies} total={totalArticles} /></div>
              <div>Course waitlist forms: <Fraction n={waitlistsPassing} total={coverage.categorySlugs.length} /></div>
              <div>Quiz gate forms: <Fraction n={quizGatesPassing} total={coverage.quizSlugs.length} /></div>
            </>
          ) : (
            <div>{Object.keys(byEntry).length} forms</div>
          )}
          <div>Kit tags: {mapped.length}/{tags.length} mapped{orphaned.length > 0 ? `, ${orphaned.length} orphaned` : ""}</div>
          {infrastructure && (
            <>
              <div className="border-t border-muted-foreground/20 mt-1.5 pt-1.5" />
              <div>Freebie API route: <BoolStat ok={infrastructure.freebieApiRoute} label="/api/freebie-subscribe" /></div>
              <div>Quiz API route: <BoolStat ok={infrastructure.quizApiRoute} label="/api/quiz-subscribe" /></div>
              <div>Waitlist API route: <BoolStat ok={infrastructure.waitlistApiRoute} label="/api/waitlist-subscribe" /></div>
              <div>Freebie frontend: <BoolStat ok={infrastructure.freebieFrontendReady} label="FreebieCTA onSubmit handler" /></div>
              <div>Quiz frontend: <BoolStat ok={infrastructure.quizFrontendReady} label="quiz subscribe logic" /></div>
              <div>Waitlist frontend: <BoolStat ok={infrastructure.waitlistFrontendReady} label="CourseHero submit handler" /></div>
              <div>Kit custom field: <BoolStat ok={infrastructure.kitCustomFieldReady} label="quiz_result_url" /></div>
              <div>Kit freebie tags: <BoolStat ok={infrastructure.kitFreebieTagsReady} label={`${infrastructure.freebieTagCount} tags in Kit`} /></div>
              <div>Kit quiz tags: <BoolStat ok={infrastructure.kitQuizTagsReady} label={`${infrastructure.quizTagCount} tags in Kit`} /></div>
              <div>Quiz results sequence: <BoolStat ok={infrastructure.quizResultsSequenceReady} label="Kit email sequence" /></div>
              <div>Freebie delivery sequence: <BoolStat ok={infrastructure.freebieSequenceReady} label="Kit email sequence" /></div>
              <div>Waitlist confirmation sequence: <BoolStat ok={infrastructure.waitlistSequenceReady} label="Kit email sequence" /></div>
            </>
          )}
        </div>
      </div>

      <SummaryBanner errors={totalErrors} warnings={totalWarnings} total={totalScope} />

      {/* Freebie Forms */}
      {coverage && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">
            Blog Freebie Forms <CountBadge n={coverage.categorySlugs.length} />
          </h2>
          <CheckTable
            slugs={coverage.categorySlugs}
            columns={freebieColumns}
            byEntry={byEntry}
            idPrefix="freebie-"
            kitMappingSet={blogMappingSet}
            articlesByCategory={articlesByCategory}
          />
        </section>
      )}

      {/* Waitlist Forms */}
      {coverage && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">
            Course Waitlist Forms <CountBadge n={coverage.categorySlugs.length} />
          </h2>
          <CheckTable
            slugs={coverage.categorySlugs}
            columns={waitlistColumns}
            byEntry={byEntry}
            idPrefix="waitlist-"
            kitMappingSet={waitlistMappingSet}
          />
        </section>
      )}

      {/* Quiz Gate Forms */}
      {coverage && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">
            Quiz Gate Forms <CountBadge n={coverage.quizSlugs.length} />
          </h2>
          <CheckTable
            slugs={coverage.quizSlugs}
            columns={quizGateColumns}
            byEntry={byEntry}
            idPrefix="quiz-gate-"
            kitMappingSet={quizMappingSet}
          />
        </section>
      )}

      {/* Integration Checks */}
      {blogChecks.length > 0 && (
        <ChecklistSection title="Blog Freebie Integration" checks={blogChecks} />
      )}
      {quizChecks.length > 0 && (
        <ChecklistSection title="Quiz Gate Integration" checks={quizChecks} />
      )}
      {infraChecks.length > 0 && (
        <ChecklistSection title="Integration Infrastructure" checks={infraChecks} />
      )}

      {/* Tag Mapping Table */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Kit Tag Mapping <CountBadge n={tags.length} />
        </h2>
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Tag Name</th>
                <th className="px-3 py-2 text-left font-medium">Kit ID</th>
                <th className="px-3 py-2 text-left font-medium">Config Key</th>
                <th className="px-3 py-2 text-right font-medium">Subscribers</th>
                <th className="px-3 py-2 text-center font-medium">Mapped</th>
              </tr>
            </thead>
            <tbody>
              {tags
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((tag) => (
                  <tr
                    key={tag.id}
                    className={`border-b ${tag.configName == null ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`}
                  >
                    <td className="px-3 py-1.5 font-medium">{tag.name}</td>
                    <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">
                      {tag.kitId}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs">
                      {tag.configName ?? (
                        <span className="text-amber-600">orphaned</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {tag.subscriberCount}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {tag.configName != null ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-600" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-amber-500" />
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
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

function Fraction({ n, total }: { n: number; total: number }) {
  const ok = n === total;
  return (
    <span className={ok ? "text-emerald-600" : "text-red-600"}>
      {n}/{total}
    </span>
  );
}

function BoolStat({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok ? "text-emerald-600" : "text-red-600"}>
      {ok ? "\u2713" : "\u2717"} {label}
    </span>
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

// ---------------------------------------------------------------------------
// Check table — expandable with per-article drill-down for freebie forms
// ---------------------------------------------------------------------------

function CheckTable({
  slugs,
  columns,
  byEntry,
  idPrefix,
  kitMappingSet,
  articlesByCategory,
}: {
  slugs: string[];
  columns: { key: string; label: string }[];
  byEntry: Record<string, EntryValidation>;
  idPrefix: string;
  kitMappingSet?: Set<string> | undefined;
  articlesByCategory?: Record<string, ArticleInfo[]> | null;
}) {
  const hasArticles = !!articlesByCategory;
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());

  const toggleExpand = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const totalCols =
    2 + columns.length + (kitMappingSet ? 1 : 0) + (hasArticles ? 2 : 0);

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
            {kitMappingSet && (
              <th className="px-3 py-1.5 text-center font-medium whitespace-nowrap">
                Kit Form
              </th>
            )}
            {hasArticles && (
              <th className="px-3 py-1.5 text-center font-medium whitespace-nowrap">
                Live
              </th>
            )}
            {hasArticles && <th className="w-8 px-2 py-1.5" />}
          </tr>
        </thead>
        <tbody>
          {slugs.map((slug) => {
            const id = `${idPrefix}${slug}`;
            const ev = byEntry[id];
            const kitFormMissing = kitMappingSet ? !kitMappingSet.has(slug) : false;
            const articles = hasArticles ? (articlesByCategory![slug] ?? null) : null;
            const publishedCount = articles?.filter((a) => a.published).length ?? 0;
            const totalCount = articles?.length ?? 0;
            const missingArticles = hasArticles ? totalCount - publishedCount : 0;
            const checkFailures = articles
              ? articles.filter((a) => a.published && Object.values(a.checks).some((c) => !c.ok)).length
              : 0;
            const deploymentIssues = missingArticles + checkFailures;
            const hasErrors = (ev && ev.errors.length > 0) || kitFormMissing || deploymentIssues > 0;
            const hasWarnings = ev && ev.warnings.length > 0;
            const rowBg = hasErrors
              ? "bg-red-50/50 dark:bg-red-950/10"
              : hasWarnings
                ? "bg-amber-50/30 dark:bg-amber-950/10"
                : "";
            const isExpanded = expandedSlugs.has(slug);

            return (
              <FreebieRow
                key={slug}
                slug={slug}
                ev={ev}
                columns={columns}
                rowBg={rowBg}
                kitMappingSet={kitMappingSet}
                hasArticles={hasArticles}
                articles={articles}
                publishedCount={publishedCount}
                totalCount={totalCount}
                deploymentIssues={deploymentIssues}
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

function FreebieRow({
  slug,
  ev,
  columns,
  rowBg,
  kitMappingSet,
  hasArticles,
  articles,
  publishedCount,
  totalCount,
  deploymentIssues,
  isExpanded,
  onToggle,
  totalCols,
}: {
  slug: string;
  ev?: EntryValidation | undefined;
  columns: { key: string; label: string }[];
  rowBg: string;
  kitMappingSet?: Set<string> | undefined;
  hasArticles: boolean;
  articles: ArticleInfo[] | null;
  publishedCount: number;
  totalCount: number;
  deploymentIssues: number;
  isExpanded: boolean;
  onToggle: () => void;
  totalCols: number;
}) {
  const hasErrors = (ev && ev.errors.length > 0) || deploymentIssues > 0;
  const hasWarnings = ev && ev.warnings.length > 0;

  return (
    <>
      <tr
        className={`border-b ${isExpanded ? "border-b-transparent" : ""} ${rowBg} ${hasArticles ? "cursor-pointer hover:bg-muted/30" : ""}`}
        onClick={hasArticles ? onToggle : undefined}
      >
        <td className="px-2 py-1.5 text-center">
          {hasErrors ? (
            <XCircle className="h-4 w-4 text-red-600" />
          ) : hasWarnings ? (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          ) : (
            <Check className="h-4 w-4 text-emerald-600" />
          )}
        </td>
        <td className="px-3 py-1.5">
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono whitespace-nowrap">{slug}</span>
        </td>
        {columns.map((col) => (
          <td key={col.key} className="px-3 py-1.5 text-center">
            <CellIcon check={ev?.checks[col.key]} dimmed={deploymentIssues > 0} />
          </td>
        ))}
        {kitMappingSet && (
          <td className="px-3 py-1.5 text-center">
            {kitMappingSet.has(slug) ? (
              <Check className="mx-auto h-4 w-4 text-emerald-600" />
            ) : (
              <X className="mx-auto h-4 w-4 text-red-500" />
            )}
          </td>
        )}
        {hasArticles && (
          <td className="px-3 py-1.5 text-center">
            {(() => {
              const ok = publishedCount === totalCount;
              return (
                <span className={`inline-flex items-center gap-1 ${ok ? "text-emerald-600" : "text-red-600"}`}>
                  {ok ? <Check className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  <span className="text-xs font-medium">{publishedCount}/{totalCount}</span>
                </span>
              );
            })()}
          </td>
        )}
        {hasArticles && (
          <td className="px-2 py-1.5 text-center">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </td>
        )}
      </tr>
      {isExpanded && articles && (
        <tr>
          <td colSpan={totalCols} className="p-0">
            <div className="ml-6 mr-2 my-2 border-l-2 border-muted-foreground/25 rounded-r-md overflow-hidden shadow-sm">
              <ArticleListSubTable articles={articles} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const FREEBIE_CHECK_COLUMNS = [
  { key: "eyebrow", label: "Eyebrow" },
  { key: "title", label: "Title" },
  { key: "body", label: "Body" },
  { key: "clean", label: "Clean" },
  { key: "kit_form", label: "Kit" },
  { key: "api_route", label: "API" },
  { key: "frontend", label: "Frontend" },
  { key: "kit_seq", label: "Kit Seq" },
];

function ArticleListSubTable({ articles }: { articles: ArticleInfo[] }) {
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
            {FREEBIE_CHECK_COLUMNS.map((col) => (
              <th key={col.key} className="px-3 py-1 text-center font-medium text-xs whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((article) => {
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
                  {FREEBIE_CHECK_COLUMNS.map((col) => (
                    <td key={col.key} className="px-3 py-1 text-center">
                      <Minus className="mx-auto h-3 w-3 text-red-300" />
                    </td>
                  ))}
                </tr>
              );
            }

            const hasIssue = Object.values(article.checks).some((c) => !c.ok);
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
                {FREEBIE_CHECK_COLUMNS.map((col) => (
                  <td key={col.key} className="px-3 py-1 text-center">
                    <CellIcon check={article.checks[col.key]} />
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

// ---------------------------------------------------------------------------
// Checklist section (expandable integration check groups)
// ---------------------------------------------------------------------------

function ChecklistSection({
  title,
  checks,
}: {
  title: string;
  checks: IntegrationCheck[];
}) {
  const [expanded, setExpanded] = useState(false);
  const allPass = checks.every((c) => c.status === "pass");
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  return (
    <div className="rounded-md border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm cursor-pointer hover:bg-muted/30"
      >
        {allPass ? (
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
        ) : failCount > 0 ? (
          <XCircle className="h-4 w-4 shrink-0 text-red-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
        )}
        <span className="flex-1 font-medium">{title}</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {checks.length} check{checks.length !== 1 ? "s" : ""}
        </span>
        {failCount > 0 && (
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {failCount} fail
          </span>
        )}
        {warnCount > 0 && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {warnCount} warn
          </span>
        )}
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="divide-y border-t">
          {checks.map((check, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-4 py-2.5 text-sm ${
                check.status === "fail"
                  ? "bg-red-50/50 dark:bg-red-950/10"
                  : check.status === "warn"
                    ? "bg-amber-50/50 dark:bg-amber-950/10"
                    : ""
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {check.status === "pass" && (
                  <Check className="h-4 w-4 text-emerald-600" />
                )}
                {check.status === "fail" && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                {check.status === "warn" && (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium">{check.label}</span>
                {check.detail && (
                  <span className="ml-2 text-muted-foreground">
                    {check.detail}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

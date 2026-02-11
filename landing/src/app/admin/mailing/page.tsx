"use client";

import { useEffect, useState } from "react";
import {
  Check,
  X,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
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

interface MailingResponse {
  tags: KitTagRow[];
  integration: IntegrationResult | null;
  mailingByEntry: Record<string, EntryValidation> | null;
  coverage: CoverageData | null;
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

  const { tags, integration, mailingByEntry, coverage } = data;
  const byEntry = mailingByEntry ?? {};

  // Count all errors/warnings from byEntry
  let totalErrors = 0;
  let totalWarnings = 0;
  for (const ev of Object.values(byEntry)) {
    totalErrors += ev.errors.length;
    totalWarnings += ev.warnings.length;
  }

  // Coverage sets for Kit form mapping column
  const blogMappingSet = new Set(coverage?.blogMappings ?? []);
  const waitlistMappingSet = new Set(coverage?.waitlistMappings ?? []);
  const quizMappingSet = new Set(coverage?.quizMappings ?? []);

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
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mailing Forms Validation</h1>
        <p className="text-sm text-muted-foreground">
          {Object.keys(byEntry).length} entries validated &middot; {tags.length} Kit tags synced ({mapped.length} mapped, {orphaned.length} orphaned)
        </p>
      </div>

      {/* Summary banner */}
      <SummaryBanner errors={totalErrors} warnings={totalWarnings} total={Object.keys(byEntry).length} />

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

function CountBadge({ n }: { n: number }) {
  return (
    <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
      {n}
    </span>
  );
}

function CellIcon({ check }: { check?: EntryCheck | undefined }) {
  if (!check) return <span className="text-muted-foreground/40">—</span>;
  if (check.ok) {
    return (
      <span className="flex items-center justify-center gap-1.5 whitespace-nowrap" title={check.detail}>
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
// Check table — generic table with per-check columns + Kit form mapping
// ---------------------------------------------------------------------------

function CheckTable({
  slugs,
  columns,
  byEntry,
  idPrefix,
  kitMappingSet,
}: {
  slugs: string[];
  columns: { key: string; label: string }[];
  byEntry: Record<string, EntryValidation>;
  idPrefix: string;
  kitMappingSet?: Set<string> | undefined;
}) {
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
          </tr>
        </thead>
        <tbody>
          {slugs.map((slug) => {
            const id = `${idPrefix}${slug}`;
            const ev = byEntry[id];
            const kitFormMissing = kitMappingSet ? !kitMappingSet.has(slug) : false;
            const hasErrors = (ev && ev.errors.length > 0) || kitFormMissing;
            const hasWarnings = ev && ev.warnings.length > 0;
            const rowBg = hasErrors
              ? "bg-red-50/50 dark:bg-red-950/10"
              : hasWarnings
                ? "bg-amber-50/30 dark:bg-amber-950/10"
                : "";

            return (
              <tr key={slug} className={`border-b ${rowBg}`}>
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
                    <CellIcon check={ev?.checks[col.key]} />
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

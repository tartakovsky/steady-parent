"use client";

import { useEffect, useState } from "react";
import { Check, X, AlertTriangle, XCircle } from "lucide-react";

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

interface CtaResponse {
  catalog: CtaDefinition[] | null;
  categorySlugs: string[];
  validation: {
    errors: string[];
    warnings: string[];
    groups: CheckGroup[];
    byEntry: Record<string, EntryValidation>;
  } | null;
}

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

  const { catalog, categorySlugs, validation } = data;
  const { errors, warnings, byEntry } = validation;

  const perCatCommunities = catalog.filter(
    (c) => c.type === "community" && c.id !== "community" && !c.id.startsWith("community-quiz-"),
  );
  const quizCommunities = catalog.filter(
    (c) => c.type === "community" && c.id.startsWith("community-quiz-"),
  );
  const courses = catalog.filter((c) => c.type === "course");

  // Community check columns
  const communityColumns = [
    { key: "cta_copy", label: "Copy" },
    { key: "buttonText", label: "Button" },
    { key: "founderLine", label: "Founder" },
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
    { key: "body", label: "Body" },
    { key: "clean", label: "No !/bans" },
  ];

  // Course check columns
  const courseColumns = [
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

      {/* Summary */}
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

function RowStatus({ ev }: { ev?: EntryValidation | undefined }) {
  if (!ev || (ev.errors.length === 0 && ev.warnings.length === 0)) {
    return <Check className="h-4 w-4 text-emerald-600" />;
  }
  if (ev.errors.length > 0) return <XCircle className="h-4 w-4 text-red-600" />;
  return <AlertTriangle className="h-4 w-4 text-amber-500" />;
}

// ---------------------------------------------------------------------------
// Global community (single row, different checks)
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
// Check table — generic table with per-check columns
// ---------------------------------------------------------------------------

function CheckTable({
  slugs,
  columns,
  byEntry,
  idPrefix,
}: {
  slugs: string[];
  columns: { key: string; label: string }[];
  byEntry: Record<string, EntryValidation>;
  idPrefix: string;
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
          </tr>
        </thead>
        <tbody>
          {slugs.map((slug) => {
            const id = `${idPrefix}${slug}`;
            const ev = byEntry[id];
            const hasErrors = ev && ev.errors.length > 0;
            const hasWarnings = ev && ev.warnings.length > 0;
            const rowBg = hasErrors
              ? "bg-red-50/50 dark:bg-red-950/10"
              : hasWarnings
                ? "bg-amber-50/30 dark:bg-amber-950/10"
                : "";

            return (
              <tr key={slug} className={`border-b ${rowBg}`}>
                <td className="px-2 py-1.5 text-center">
                  <RowStatus ev={ev} />
                </td>
                <td className="px-3 py-1.5">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono whitespace-nowrap">{slug}</span>
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-1.5 text-center">
                    <CellIcon check={ev?.checks[col.key]} />
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

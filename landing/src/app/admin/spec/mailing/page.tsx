"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Check,
  X,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Types matching the API response
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

interface CtaCopy {
  eyebrow: string;
  title: string;
  body: string;
  buttonText: string;
}

interface FreebieArticle {
  slug: string;
  title: string;
  entryId: string;
  copy: CtaCopy | null;
  validation: EntryValidation;
  tagMapOk: boolean;
  tagRefsWarning: string | null;
}

interface FreebieCategory {
  categorySlug: string;
  categoryName: string;
  articles: FreebieArticle[];
}

interface WaitlistEntry {
  categorySlug: string;
  categoryName: string;
  courseName: string | null;
  whatItIs: string | null;
  pageUrlPattern: string | null;
  endpoint: string | null;
  tags: string[];
  copy: CtaCopy | null;
  validation: EntryValidation;
  tagMapOk: boolean;
  tagRefsWarning: string | null;
}

interface QuizGateEntry {
  quizSlug: string;
  quizTitle: string;
  pageUrlPattern: string | null;
  endpoint: string | null;
  tags: string[];
  copy: CtaCopy | null;
  copySource: "catalog" | "quiz-json" | null;
  validation: EntryValidation;
  tagMapOk: boolean;
  tagRefsWarning: string | null;
}

interface SpecMailingResponse {
  freebies: FreebieCategory[];
  waitlists: WaitlistEntry[];
  quizGates: QuizGateEntry[];
  totalErrors: number;
  totalWarnings: number;
}

// ---------------------------------------------------------------------------
// Tooltip line helpers — structured "file / field / expected / found"
// ---------------------------------------------------------------------------

interface TipLine {
  label: string;
  value: string;
}

function tipLines(lines: TipLine[]): ReactNode {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
      {lines.map((l, i) => (
        <Fragment key={i}>
          <dt className="font-semibold text-white/70 dark:text-stone-500 whitespace-nowrap">
            {l.label}
          </dt>
          <dd className="text-white dark:text-stone-900">{l.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

import { Fragment } from "react";

// ---------------------------------------------------------------------------
// Check column definitions with rich tooltip builders
// ---------------------------------------------------------------------------

interface CheckDef {
  key: string;
  label: string;
  /** Build tooltip lines from the check result for this entry */
  tip: (check: EntryCheck | undefined, entryId: string) => ReactNode;
}

// -- Freebie checks --

const FREEBIE_CHECKS: CheckDef[] = [
  {
    key: "what_it_is",
    label: "Desc",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "what_it_is" },
        { label: "Expected", value: "A non-empty description string" },
        { label: "Found", value: c ? (c.ok ? "Present" : "Missing or empty") : "N/A" },
      ]),
  },
  {
    key: "urlPattern",
    label: "URL",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "pageUrlPattern" },
        { label: "Expected", value: 'Must start with "/blog/"' },
        { label: "Found", value: c?.detail ?? (c?.ok ? "Valid" : "N/A") },
      ]),
  },
  {
    key: "tags",
    label: "Tags",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "tags[]" },
        { label: "Expected", value: 'Array must include "lead"' },
        { label: "Found", value: c?.detail ?? (c?.ok ? 'Contains "lead"' : "N/A") },
      ]),
  },
  {
    key: "cta_copy",
    label: "Copy",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy" },
        { label: "Expected", value: "Object with eyebrow, title, body, buttonText" },
        { label: "Found", value: c ? (c.ok ? "Present" : c.detail ?? "Missing") : "N/A" },
      ]),
  },
  {
    key: "eyebrow",
    label: "Eyebrow",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.eyebrow" },
        { label: "Expected", value: "2-7 words" },
        { label: "Found", value: c?.detail ?? "N/A" },
      ]),
  },
  {
    key: "title",
    label: "Title",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.title" },
        { label: "Expected", value: "3-10 words" },
        { label: "Found", value: c?.detail ?? "N/A" },
      ]),
  },
  {
    key: "body",
    label: "Body",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.body" },
        { label: "Expected", value: "8-36 words" },
        { label: "Found", value: c?.detail ?? "N/A" },
      ]),
  },
  {
    key: "nameInTitle",
    label: "Name",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.title vs name" },
        { label: "Expected", value: "CTA title must contain the product name" },
        { label: "Found", value: c ? (c.ok ? "Name found in title" : c.detail ?? "Not found") : "N/A" },
      ]),
  },
  {
    key: "clean",
    label: "No !/bans",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy (all fields)" },
        { label: "Expected", value: "No exclamation marks, no forbidden terms" },
        { label: "Found", value: c ? (c.ok ? "Clean" : c.detail ?? "Issues found") : "N/A" },
      ]),
  },
];

// -- Waitlist checks --

const WAITLIST_CHECKS: CheckDef[] = [
  {
    key: "what_it_is",
    label: "Desc",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "what_it_is" },
        { label: "Expected", value: "A non-empty description string" },
        { label: "Found", value: c ? (c.ok ? "Present" : "Missing or empty") : "N/A" },
      ]),
  },
  {
    key: "urlPattern",
    label: "URL",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "pageUrlPattern" },
        { label: "Expected", value: 'Must start with "/course/"' },
        { label: "Found", value: c?.detail ?? (c?.ok ? "Valid" : "N/A") },
      ]),
  },
  {
    key: "tags",
    label: "Tags",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "tags[]" },
        { label: "Expected", value: 'Array must include "lead"' },
        { label: "Found", value: c?.detail ?? (c?.ok ? 'Contains "lead"' : "N/A") },
      ]),
  },
  {
    key: "cta_copy",
    label: "Copy",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy" },
        { label: "Expected", value: "Object with eyebrow, title, body, buttonText" },
        { label: "Found", value: c ? (c.ok ? "Present" : c.detail ?? "Missing") : "N/A" },
      ]),
  },
  {
    key: "buttonText",
    label: "Button",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.buttonText" },
        { label: "Expected", value: '"Reserve your spot"' },
        { label: "Found", value: c?.detail ?? (c?.ok ? '"Reserve your spot"' : "N/A") },
      ]),
  },
  {
    key: "eyebrow",
    label: "Eyebrow",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.eyebrow" },
        { label: "Expected", value: "2-5 words" },
        { label: "Found", value: c?.detail ?? "N/A" },
      ]),
  },
  {
    key: "title",
    label: "Title",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.title" },
        { label: "Expected", value: "5-12 words" },
        { label: "Found", value: c?.detail ?? "N/A" },
      ]),
  },
  {
    key: "body",
    label: "Body",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.body" },
        { label: "Expected", value: "20-30 words" },
        { label: "Found", value: c?.detail ?? "N/A" },
      ]),
  },
  {
    key: "clean",
    label: "No !/bans",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy (all fields)" },
        { label: "Expected", value: "No exclamation marks, no forbidden terms" },
        { label: "Found", value: c ? (c.ok ? "Clean" : c.detail ?? "Issues found") : "N/A" },
      ]),
  },
];

// -- Quiz gate checks --

const QUIZ_GATE_CHECKS: CheckDef[] = [
  {
    key: "urlPattern",
    label: "URL",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "pageUrlPattern" },
        { label: "Expected", value: 'Must start with "/quiz/"' },
        { label: "Found", value: c?.detail ?? (c?.ok ? "Valid" : "N/A") },
      ]),
  },
  {
    key: "tags",
    label: "Tags",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json" },
        { label: "Entry", value: id },
        { label: "Field", value: "tags[]" },
        { label: "Expected", value: 'Array must include "lead"' },
        { label: "Found", value: c?.detail ?? (c?.ok ? 'Contains "lead"' : "N/A") },
      ]),
  },
  {
    key: "cta_copy",
    label: "Copy",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json or quiz JSON" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy (or previewCta in quiz definition)" },
        { label: "Expected", value: "Object with eyebrow, title, body, buttonText" },
        { label: "Found", value: c ? (c.ok ? c.detail ?? "Present" : c.detail ?? "Missing") : "N/A" },
      ]),
  },
  {
    key: "buttonText",
    label: "Button",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json or quiz JSON" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.buttonText" },
        { label: "Expected", value: '"Send my results"' },
        { label: "Found", value: c?.detail ?? (c?.ok ? '"Send my results"' : "N/A") },
      ]),
  },
  {
    key: "eyebrow",
    label: "Eyebrow",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json or quiz JSON" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.eyebrow" },
        { label: "Expected", value: "2-7 words" },
        { label: "Found", value: c?.detail ?? "N/A" },
      ]),
  },
  {
    key: "title",
    label: "Title",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json or quiz JSON" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.title" },
        { label: "Expected", value: "3-10 words" },
        { label: "Found", value: c?.detail ?? "N/A" },
      ]),
  },
  {
    key: "body",
    label: "Body",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json or quiz JSON" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy.body" },
        { label: "Expected", value: "8-36 words" },
        { label: "Found", value: c?.detail ?? "N/A" },
      ]),
  },
  {
    key: "clean",
    label: "No !/bans",
    tip: (c, id) =>
      tipLines([
        { label: "File", value: "mailing_form_catalog.json or quiz JSON" },
        { label: "Entry", value: id },
        { label: "Field", value: "cta_copy (all fields)" },
        { label: "Expected", value: "No exclamation marks, no forbidden terms" },
        { label: "Found", value: c ? (c.ok ? "Clean" : c.detail ?? "Issues found") : "N/A" },
      ]),
  },
];

// -- Tag map / tag ref tooltip builders (used inline, not in CheckDef) --

function tagMapTip(
  formId: string,
  found: boolean,
): ReactNode {
  return tipLines([
    { label: "File", value: "form_tag_mappings.json" },
    { label: "Field", value: "formId" },
    { label: "Looked for", value: `"${formId}"` },
    { label: "Found", value: found ? "Yes — mapping entry exists" : "No — no mapping with this formId" },
  ]);
}

function tagRefsTip(
  formId: string,
  warning: string | null,
): ReactNode {
  return tipLines([
    { label: "File", value: "form_tag_mappings.json + mailing_tags.json" },
    { label: "Mapping", value: `"${formId}"` },
    { label: "Check", value: "Every tagId in the mapping must exist in mailing_tags.json" },
    {
      label: "Found",
      value: warning
        ? `Missing tags: ${warning}`
        : "All tag IDs resolved",
    },
  ]);
}

function missingEntryTip(entryId: string): ReactNode {
  return tipLines([
    { label: "File", value: "mailing_form_catalog.json" },
    { label: "Looked for", value: `Entry with id "${entryId}"` },
    { label: "Found", value: "No entry — this form spec has not been created yet" },
    { label: "Action", value: "Generate per-article freebie entries in the catalog" },
  ]);
}

function copyTip(entryId: string, hasCopy: boolean, source?: string): ReactNode {
  return tipLines([
    { label: "File", value: source ?? "mailing_form_catalog.json" },
    { label: "Entry", value: entryId },
    { label: "Field", value: "cta_copy" },
    { label: "Expected", value: "Object with eyebrow, title, body, buttonText" },
    { label: "Found", value: hasCopy ? "Present — shown in this cell" : "Missing — no cta_copy on this entry" },
  ]);
}

function pageTip(entryId: string, urlField: string, urlValue: string | null): ReactNode {
  return tipLines([
    { label: "File", value: "mailing_form_catalog.json" },
    { label: "Entry", value: entryId },
    { label: "Field", value: urlField },
    { label: "Shows", value: urlValue ?? "No entry in catalog" },
  ]);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SpecMailingPage() {
  const [data, setData] = useState<SpecMailingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/spec/mailing")
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => null);
          throw new Error(body?.detail ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<SpecMailingResponse>;
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-muted-foreground">Loading spec validation...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!data) return <p className="text-muted-foreground">No data.</p>;

  const { freebies, waitlists, quizGates, totalErrors } = data;

  const totalArticles = freebies.reduce(
    (sum, f) => sum + f.articles.length,
    0,
  );
  const allFreebieArticles = freebies.flatMap((f) => f.articles);
  const freebieArticlesPassing = allFreebieArticles.filter(
    (a) => a.validation.errors.length === 0,
  ).length;
  const waitlistsPassing = waitlists.filter(
    (w) => w.validation.errors.length === 0 && !w.tagRefsWarning,
  ).length;
  const quizGatesPassing = quizGates.filter(
    (q) => q.validation.errors.length === 0 && !q.tagRefsWarning,
  ).length;

  return (
    <TooltipProvider delayDuration={500}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Spec: Mailing Forms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Validates spec files only &mdash; no production checks. Each row is a
            page where the form appears.
          </p>
          <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
            <div>
              Blog freebies: {freebies.length} categories,{" "}
              {totalArticles} article pages &mdash;{" "}
              <Fraction n={freebieArticlesPassing} total={totalArticles} /> passing
            </div>
            <div>
              Course waitlists: {waitlists.length} course pages &mdash;{" "}
              <Fraction n={waitlistsPassing} total={waitlists.length} /> passing
            </div>
            <div>
              Quiz gates: {quizGates.length} quiz pages &mdash;{" "}
              <Fraction n={quizGatesPassing} total={quizGates.length} /> passing
            </div>
          </div>
        </div>

        {totalErrors > 0 && (
          <div className="flex items-center gap-3 rounded-lg border bg-red-50 p-3 dark:bg-red-950/20">
            <span className="flex items-center gap-1 text-sm text-red-600">
              <XCircle className="h-4 w-4" /> {totalErrors} error
              {totalErrors !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        {totalErrors === 0 && (
          <div className="flex items-center gap-2 rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950/20">
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 dark:text-emerald-400">
              All spec checks passed
            </span>
          </div>
        )}

        {/* Blog Freebie Forms — accordion per category, table per article */}
        <section>
          <h2 className="mb-2 text-lg font-semibold">
            Blog Freebie Forms{" "}
            <CountBadge n={totalArticles} label="articles" />
          </h2>
          <FreebieAccordion entries={freebies} />
        </section>

        {/* Course Waitlist Forms — one row per course page */}
        <section>
          <h2 className="mb-2 text-lg font-semibold">
            Course Waitlist Forms <CountBadge n={waitlists.length} />
          </h2>
          <CheckTable
            entries={waitlists}
            checks={WAITLIST_CHECKS}
            pageLabel="Course Page"
            renderPage={(e) => (
              <div>
                <div className="font-mono text-xs">
                  /course/{e.categorySlug}/
                </div>
                {e.courseName && (
                  <div className="text-xs text-muted-foreground">
                    {e.courseName}
                  </div>
                )}
              </div>
            )}
            getKey={(e) => e.categorySlug}
            getEntryId={(e) => `waitlist-${e.categorySlug}`}
            tagMapFormId={(e) => `waitlist/${e.categorySlug}`}
          />
        </section>

        {/* Quiz Gate Forms — one row per quiz page */}
        <section>
          <h2 className="mb-2 text-lg font-semibold">
            Quiz Gate Forms <CountBadge n={quizGates.length} />
          </h2>
          <CheckTable
            entries={quizGates}
            checks={QUIZ_GATE_CHECKS}
            pageLabel="Quiz Page"
            renderPage={(e) => (
              <div>
                <div className="font-mono text-xs">/quiz/{e.quizSlug}/</div>
                <div className="text-xs text-muted-foreground">
                  {e.quizTitle}
                </div>
                {e.copySource && (
                  <div className="text-xs text-muted-foreground">
                    copy from: {e.copySource}
                  </div>
                )}
              </div>
            )}
            getKey={(e) => e.quizSlug}
            getEntryId={(e) => `quiz-gate-${e.quizSlug}`}
            tagMapFormId={(e) => `quiz/${e.quizSlug}`}
          />
        </section>
      </div>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Freebie accordion
// ---------------------------------------------------------------------------

function FreebieAccordion({ entries }: { entries: FreebieCategory[] }) {
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());

  const toggle = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {entries.map((entry) => {
        const catHasErrors = entry.articles.some(
          (a) => a.validation.errors.length > 0 || !!a.tagRefsWarning,
        );
        const isExpanded = expandedSlugs.has(entry.categorySlug);
        const passing = entry.articles.filter(
          (a) => a.validation.errors.length === 0 && !a.tagRefsWarning,
        ).length;

        const headerBg = catHasErrors
          ? "bg-red-50/50 dark:bg-red-950/10"
          : "bg-muted/20";

        return (
          <div key={entry.categorySlug} className="rounded-md border">
            <button
              type="button"
              onClick={() => toggle(entry.categorySlug)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-sm ${headerBg} hover:bg-muted/40 rounded-t-md ${isExpanded ? "" : "rounded-b-md"}`}
            >
              {catHasErrors ? (
                <XCircle className="h-4 w-4 shrink-0 text-red-600" />
              ) : (
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              )}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="font-medium">{entry.categoryName}</span>
              <span className="text-muted-foreground">
                <Fraction n={passing} total={entry.articles.length} />
              </span>
            </button>

            {isExpanded && (
              <div className="overflow-x-auto border-t">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="w-8 px-2 py-1.5" />
                      <th className="px-3 py-1.5 text-left font-medium">
                        Article
                      </th>
                      <th className="px-3 py-1.5 text-left font-medium">
                        Copy
                      </th>
                      {FREEBIE_CHECKS.map((c) => (
                        <th
                          key={c.key}
                          className="px-2 py-1.5 text-center font-medium whitespace-nowrap"
                        >
                          {c.label}
                        </th>
                      ))}
                      <th className="px-2 py-1.5 text-center font-medium whitespace-nowrap">
                        Tag Map
                      </th>
                      <th className="px-2 py-1.5 text-center font-medium whitespace-nowrap">
                        Tag Refs
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.articles.map((article) => {
                      const isMissing =
                        article.validation.errors.length > 0 &&
                        article.validation.errors[0]?.startsWith("Missing entry");
                      const artHasErrors =
                        article.validation.errors.length > 0 ||
                        !!article.tagRefsWarning;
                      const artRowBg = artHasErrors
                        ? "bg-red-50/50 dark:bg-red-950/10"
                        : "";
                      const formId = `blog/${entry.categorySlug}/${article.slug}`;

                      return (
                        <tr
                          key={article.slug}
                          className={`border-b last:border-b-0 ${artRowBg}`}
                        >
                          <td className="px-2 py-1.5 text-center">
                            {artHasErrors ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Check className="h-4 w-4 text-emerald-600" />
                            )}
                          </td>
                          <td className="px-3 py-1.5">
                            <TipCell
                              tooltip={pageTip(
                                article.entryId,
                                "pageUrlPattern",
                                isMissing ? null : `/blog/${entry.categorySlug}/${article.slug}`,
                              )}
                            >
                              <div>
                                <div className="font-mono text-xs">
                                  /blog/{entry.categorySlug}/{article.slug}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {article.title}
                                </div>
                              </div>
                            </TipCell>
                          </td>
                          <td className="px-3 py-1.5">
                            <CopyCell
                              copy={article.copy}
                              tooltip={copyTip(article.entryId, !!article.copy)}
                            />
                          </td>
                          {FREEBIE_CHECKS.map((c) => {
                            const mTip = missingEntryTip(article.entryId);
                            return (
                              <td
                                key={c.key}
                                className="px-2 py-1.5 text-center"
                              >
                                {isMissing ? (
                                  <Dash tooltip={mTip} />
                                ) : (
                                  <CheckCell
                                    check={article.validation.checks[c.key]}
                                    tooltip={c.tip(article.validation.checks[c.key], article.entryId)}
                                  />
                                )}
                              </td>
                            );
                          })}
                          <td className="px-2 py-1.5 text-center">
                            {isMissing ? (
                              <Dash tooltip={missingEntryTip(article.entryId)} />
                            ) : (
                              <CheckCell
                                check={
                                  article.tagMapOk
                                    ? { ok: true }
                                    : { ok: false }
                                }
                                tooltip={tagMapTip(formId, article.tagMapOk)}
                              />
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            {isMissing ? (
                              <Dash tooltip={missingEntryTip(article.entryId)} />
                            ) : (
                              <CheckCell
                                check={
                                  article.tagRefsWarning
                                    ? { ok: false }
                                    : { ok: true }
                                }
                                tooltip={tagRefsTip(formId, article.tagRefsWarning)}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic check table — used for waitlists and quiz gates
// ---------------------------------------------------------------------------

interface HasValidation {
  copy: CtaCopy | null;
  validation: EntryValidation;
  tagMapOk: boolean;
  tagRefsWarning: string | null;
}

function CheckTable<T extends HasValidation>({
  entries,
  checks,
  pageLabel,
  renderPage,
  getKey,
  getEntryId,
  tagMapFormId,
}: {
  entries: T[];
  checks: CheckDef[];
  pageLabel: string;
  renderPage: (entry: T) => ReactNode;
  getKey: (entry: T) => string;
  getEntryId: (entry: T) => string;
  tagMapFormId: (entry: T) => string;
}) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-8 px-2 py-1.5" />
            <th className="px-3 py-1.5 text-left font-medium">{pageLabel}</th>
            <th className="px-3 py-1.5 text-left font-medium">Copy</th>
            {checks.map((c) => (
              <th
                key={c.key}
                className="px-2 py-1.5 text-center font-medium whitespace-nowrap"
              >
                {c.label}
              </th>
            ))}
            <th className="px-2 py-1.5 text-center font-medium whitespace-nowrap">
              Tag Map
            </th>
            <th className="px-2 py-1.5 text-center font-medium whitespace-nowrap">
              Tag Refs
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const hasErrors =
              entry.validation.errors.length > 0 || !!entry.tagRefsWarning;
            const rowBg = hasErrors
              ? "bg-red-50/50 dark:bg-red-950/10"
              : "";
            const entryId = getEntryId(entry);
            const formId = tagMapFormId(entry);

            return (
              <tr key={getKey(entry)} className={`border-b ${rowBg}`}>
                <td className="px-2 py-1.5 text-center">
                  {hasErrors ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                </td>
                <td className="px-3 py-1.5">
                  <TipCell tooltip={pageTip(entryId, "pageUrlPattern", entry.validation.checks["urlPattern"]?.detail ?? null)}>
                    {renderPage(entry)}
                  </TipCell>
                </td>
                <td className="px-3 py-1.5">
                  <CopyCell
                    copy={entry.copy}
                    tooltip={copyTip(entryId, !!entry.copy)}
                  />
                </td>
                {checks.map((c) => (
                  <td key={c.key} className="px-2 py-1.5 text-center">
                    <CheckCell
                      check={entry.validation.checks[c.key]}
                      tooltip={c.tip(entry.validation.checks[c.key], entryId)}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center">
                  <CheckCell
                    check={
                      entry.tagMapOk
                        ? { ok: true }
                        : { ok: false }
                    }
                    tooltip={tagMapTip(formId, entry.tagMapOk)}
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <CheckCell
                    check={
                      entry.tagRefsWarning
                        ? { ok: false }
                        : { ok: true }
                    }
                    tooltip={tagRefsTip(formId, entry.tagRefsWarning)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

function CopyCell({
  copy,
  tooltip,
}: {
  copy: CtaCopy | null;
  tooltip: ReactNode;
}) {
  const inner = !copy ? (
    <span className="text-xs text-red-600 dark:text-red-400">No copy</span>
  ) : (
    <div className="text-xs w-[400px] min-w-[400px]">
      <div className="text-muted-foreground">{copy.eyebrow}</div>
      <div className="font-medium">{copy.title}</div>
      <div className="text-muted-foreground">{copy.body}</div>
      <div className="mt-1">
        <span className="inline-block rounded-full bg-stone-800 px-2.5 py-0.5 text-xs font-medium text-white dark:bg-stone-200 dark:text-stone-900">
          {copy.buttonText}
        </span>
      </div>
    </div>
  );
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-default">{inner}</span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="start"
        className="max-w-sm text-left text-xs leading-relaxed"
        sideOffset={6}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/** Wrapper for any cell content that needs a tooltip */
function TipCell({
  tooltip,
  children,
}: {
  tooltip: ReactNode;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-default">{children}</span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="start"
        className="max-w-sm text-left text-xs leading-relaxed"
        sideOffset={6}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function Dash({ tooltip }: { tooltip?: ReactNode }) {
  const dash = <span className="text-muted-foreground/40">&mdash;</span>;
  if (!tooltip) return dash;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-default">{dash}</span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        className="max-w-sm text-left text-xs leading-relaxed"
        sideOffset={6}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * A check cell with Radix tooltip showing rich structured content.
 * The tooltip auto-positions to stay visible (portal + collision detection).
 */
function CheckCell({
  check,
  tooltip,
}: {
  check?: EntryCheck | undefined;
  tooltip: ReactNode;
}) {
  if (!check) return <Dash />;

  const icon = check.ok ? (
    <Check className="h-3.5 w-3.5 text-emerald-600" />
  ) : (
    <X className="h-3.5 w-3.5 text-red-500" />
  );

  const detail = check.detail ? (
    <span
      className={`text-xs ${check.ok ? "text-muted-foreground" : "text-red-600"}`}
    >
      {check.detail}
    </span>
  ) : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-default items-center justify-center gap-1 whitespace-nowrap">
          {icon}
          {detail}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        className="max-w-sm text-left text-xs leading-relaxed"
        sideOffset={6}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
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

function CountBadge({ n, label }: { n: number; label?: string }) {
  return (
    <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
      {n}
      {label ? ` ${label}` : ""}
    </span>
  );
}

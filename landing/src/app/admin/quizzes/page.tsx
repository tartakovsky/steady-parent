"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Minus,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface QuizValidation {
  detectedType: string;
  errors: string[];
  warnings: string[];
}

interface QuizRow {
  slug: string;
  title: string;
  url: string;
  connectsTo: string[];
  isDeployed: boolean;
  validation: QuizValidation | null;
}

export default function QuizzesPage() {
  const [entries, setEntries] = useState<QuizRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "deployed" | "pending">("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/quizzes")
      .then((r) => r.json() as Promise<QuizRow[]>)
      .then((rows) => {
        setEntries(rows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  const deployed = entries.filter((e) => e.isDeployed);
  const pending = entries.filter((e) => !e.isDeployed);

  const withErrors = deployed.filter(
    (e) => e.validation && e.validation.errors.length > 0,
  );
  const withWarnings = deployed.filter(
    (e) =>
      e.validation &&
      e.validation.errors.length === 0 &&
      e.validation.warnings.length > 0,
  );
  const passing = deployed.filter(
    (e) =>
      e.validation &&
      e.validation.errors.length === 0 &&
      e.validation.warnings.length === 0,
  );

  const filtered =
    filter === "all"
      ? entries
      : filter === "deployed"
        ? deployed
        : pending;

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
      <div>
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <p className="text-sm text-muted-foreground">
          {deployed.length} / {entries.length} quizzes deployed
          {deployed.length > 0 && (
            <>
              {" "}
              — {passing.length} passing
              {withWarnings.length > 0 && `, ${withWarnings.length} warnings`}
              {withErrors.length > 0 && `, ${withErrors.length} errors`}
            </>
          )}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "deployed", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "all"
              ? `All (${entries.length})`
              : f === "deployed"
                ? `Deployed (${deployed.length})`
                : `Pending (${pending.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-10 px-3 py-2 text-center font-medium">
                Status
              </th>
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">
                Connected Categories
              </th>
              <th className="w-10 px-3 py-2 text-center font-medium">
                Validation
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((quiz) => {
              const v = quiz.validation;
              const hasErrors = v && v.errors.length > 0;
              const hasWarnings =
                v && v.errors.length === 0 && v.warnings.length > 0;
              const isPass =
                v && v.errors.length === 0 && v.warnings.length === 0;
              const isOpen = expanded.has(quiz.slug);
              const hasDetail =
                v && (v.errors.length > 0 || v.warnings.length > 0);

              return (
                <>
                  <tr
                    key={quiz.slug}
                    className={`border-b hover:bg-muted/30 ${hasDetail ? "cursor-pointer" : ""}`}
                    onClick={() => hasDetail && toggle(quiz.slug)}
                  >
                    <td className="px-3 py-1.5 text-center">
                      {quiz.isDeployed ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-600" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      {quiz.isDeployed ? (
                        <Link
                          href={quiz.url}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {quiz.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">
                          {quiz.title}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      {v ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {v.detectedType}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {quiz.connectsTo.map((cat) => (
                          <span
                            key={cat}
                            className="rounded bg-muted px-1.5 py-0.5 text-xs"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {!quiz.isDeployed ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : hasErrors ? (
                        <div className="flex items-center justify-center gap-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-600">
                            {v.errors.length}
                          </span>
                          {isOpen ? (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      ) : hasWarnings ? (
                        <div className="flex items-center justify-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-xs text-amber-600">
                            {v.warnings.length}
                          </span>
                          {isOpen ? (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      ) : isPass ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-600" />
                      ) : null}
                    </td>
                  </tr>
                  {isOpen && hasDetail && (
                    <tr key={`${quiz.slug}-detail`} className="border-b">
                      <td colSpan={5} className="bg-muted/20 px-6 py-3">
                        {v.errors.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-red-600">
                              Errors:
                            </p>
                            <ul className="mt-0.5 list-inside list-disc text-xs text-red-700 dark:text-red-400">
                              {v.errors.map((e, i) => (
                                <li key={i}>{e}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {v.warnings.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-amber-600">
                              Warnings:
                            </p>
                            <ul className="mt-0.5 list-inside list-disc text-xs text-amber-700 dark:text-amber-400">
                              {v.warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { Fragment, useEffect, useState } from "react";
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
  dataModel: string | null;
  resultDisplay: string | null;
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

  const modelColors: Record<string, string> = {
    likert: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    identity:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    assessment:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  };

  const displayColors: Record<string, string> = {
    profile:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    classification:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    readiness:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    recommendation:
      "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  };

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
              <th className="px-3 py-2 text-left font-medium">Data Model</th>
              <th className="px-3 py-2 text-left font-medium">
                Result Display
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
                <Fragment key={quiz.slug}>
                  <tr
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
                      {quiz.dataModel ? (
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${modelColors[quiz.dataModel] ?? "bg-muted"}`}
                        >
                          {quiz.dataModel}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      {quiz.resultDisplay ? (
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${displayColors[quiz.resultDisplay] ?? "bg-muted"}`}
                        >
                          {quiz.resultDisplay}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
                    <tr className="border-b">
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
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

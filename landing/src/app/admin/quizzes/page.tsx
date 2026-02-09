"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";

interface QuizRow {
  slug: string;
  title: string;
  url: string;
  connectsTo: string[];
  isDeployed: boolean;
}

export default function QuizzesPage() {
  const [entries, setEntries] = useState<QuizRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "deployed" | "pending">("all");

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

  const filtered =
    filter === "all"
      ? entries
      : filter === "deployed"
        ? deployed
        : pending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <p className="text-sm text-muted-foreground">
          {deployed.length} / {entries.length} quizzes deployed (
          {entries.length > 0
            ? Math.round((deployed.length / entries.length) * 100)
            : 0}
          %)
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
              <th className="px-3 py-2 text-left font-medium">Slug</th>
              <th className="px-3 py-2 text-left font-medium">
                Connected Categories
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((quiz) => (
              <tr key={quiz.slug} className="border-b hover:bg-muted/30">
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
                    >
                      {quiz.title}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">{quiz.title}</span>
                  )}
                </td>
                <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">
                  {quiz.slug}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
